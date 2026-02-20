#!/usr/bin/env python3
"""Extract debt schedule and asset management data for Anchor Dashboard."""

from __future__ import annotations

import datetime as dt
import json
import re
import subprocess
import zipfile
from dataclasses import dataclass
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PROPERTIES_FILE = DATA_DIR / "properties.json"
DEBT_XLSX_FILE = ROOT / "debt-schedule.xlsx"

GSHEET_ID = "1x59kako3WWzknXpNP0JNyGjMH2DJ9Q2lW333WSK4cgE"
GSHEET_ACCOUNT = "jdelk@anchorinv.com"
GSHEET_CLIENT = "default"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


DEBT_PROPERTY_MAP = {
    "Sevierville Forks Partners, LLC": "Sevierville",
    "Gastonia Restoration Partners": "Gastonia",
    "2008 Johnson Partners, LLC": "Johnson",
    "2518 Gallatin Partners, LLC": "Mission Hotels",
    "Shelbyville Partners, LLC": "Shelbyville",
    "Malone Plaza Partners": "Malone",
    "Studio Suites": "Mission Hotels",
    "Meridian Springs Partners, LLC": "Meridian",
    "Hickory Hollow Partners, LLC": "Hickory Hollow",
    "Harrison OH Partners, LLC": "Harrison",
    "Montgomery Community Partners, LLC": "Montgomery",
    "312 Wilson Pike Partners, LLC": "Wilson",
    "Hamilton Community Partners, LLC": "Hamilton",
    "Maple Row Partners, LLC": "Maple Row",
    "1700 8th Avenue, LLC": "Eighth",
    "506 Church Partners, LLC": "Mission Hotels",
    "Cumberland Square Partners, LLC": "Cumberland",
    "Madison Center Partners, LLC": "Madison",
    "819 Russell Partners, LLC": "Mission Hotels",
    "Lebanon Pike Partners, LLC": "Lebanon",
    "2151 Highland Partners, LLC": "Highland",
    "516 Tennessee Partners, LLC": "New Memphis",
    "Evansville Partners, LLC": "Evansville",
    "720 Fessey Partners, LLC": "Fessey",
    "Millington Plaza Partners, LLC": "Millington",
    "Parma Heights Partners, LLC": "Parma Heights",
    "3656 Trousdale Partners, LLC": "Trousdale",
    "Pell City Partners, LLC": "Pell City",
    "Russellville Community Partners, LLC": "Russellville",
    "1032 Vann Partners, LLC": "Vann",
    "Pea Ridge Partners, LLC": "Pea Ridge",
    "McMinnville Community Partners": "Mission Hotels",
    "2926 Foster GP": None,
}


@dataclass
class WorkbookCtx:
    zf: zipfile.ZipFile
    shared_strings: list[str]


def read_json(path: Path):
    return json.loads(path.read_text())


def write_json(path: Path, payload):
    path.write_text(json.dumps(payload, indent=2) + "\n")


def excel_serial_to_date(value: float | int | str | None) -> str | None:
    if value in (None, ""):
        return None
    try:
        numeric = float(value)
    except (ValueError, TypeError):
        return None

    base = dt.datetime(1899, 12, 30)
    result = base + dt.timedelta(days=numeric)
    return result.date().isoformat()


def parse_numeric(value):
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        return float(value)

    cleaned = str(value).strip().replace(",", "")
    if cleaned.endswith("%"):
        cleaned = cleaned[:-1]
        try:
            return float(cleaned) / 100.0
        except ValueError:
            return None

    if cleaned.startswith("$"):
        cleaned = cleaned[1:]

    try:
        return float(cleaned)
    except ValueError:
        return None


def col_to_index(col: str) -> int:
    index = 0
    for ch in col:
        index = index * 26 + (ord(ch.upper()) - 64)
    return index


def cell_value(cell: ET.Element, shared_strings: list[str]):
    cell_type = cell.attrib.get("t")
    v = cell.find("m:v", NS)

    if cell_type == "s" and v is not None and v.text is not None:
        idx = int(float(v.text))
        return shared_strings[idx] if 0 <= idx < len(shared_strings) else ""

    if cell_type == "inlineStr":
        t = cell.find("m:is/m:t", NS)
        return (t.text or "") if t is not None else ""

    return v.text if v is not None and v.text is not None else ""


def worksheet_by_name(ctx: WorkbookCtx, name: str) -> ET.Element:
    workbook_root = ET.fromstring(ctx.zf.read("xl/workbook.xml"))
    sheets = workbook_root.find("m:sheets", NS)
    if sheets is None:
        raise RuntimeError("Workbook missing sheets")

    rel_id = None
    for sheet in sheets:
        if sheet.attrib.get("name") == name:
            rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            break

    if rel_id is None:
        raise RuntimeError(f"Sheet {name!r} not found")

    rel_root = ET.fromstring(ctx.zf.read("xl/_rels/workbook.xml.rels"))
    target = None
    for rel in rel_root:
        if rel.attrib.get("Id") == rel_id:
            target = rel.attrib.get("Target")
            break

    if target is None:
        raise RuntimeError(f"Relationship {rel_id!r} not found")

    return ET.fromstring(ctx.zf.read(f"xl/{target}"))


def parse_debt_schedule() -> tuple[list[dict], dict]:
    with zipfile.ZipFile(DEBT_XLSX_FILE) as zf:
        sst_root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
        shared_strings = [
            "".join((t.text or "") for t in si.findall(".//m:t", NS))
            for si in sst_root.findall("m:si", NS)
        ]

        ctx = WorkbookCtx(zf=zf, shared_strings=shared_strings)
        sheet = worksheet_by_name(ctx, "Summary")

        rows = sheet.findall("m:sheetData/m:row", NS)
        header_row = next((row for row in rows if row.attrib.get("r") == "3"), None)
        if header_row is None:
            raise RuntimeError("Summary header row not found")

        headers: dict[int, str] = {}
        for cell in header_row.findall("m:c", NS):
            ref = cell.attrib.get("r", "")
            match = re.match(r"([A-Z]+)\d+", ref)
            if not match:
                continue
            col_idx = col_to_index(match.group(1))
            headers[col_idx] = str(cell_value(cell, shared_strings)).strip()

        loans: list[dict] = []
        unmapped_loans = 0

        for row in rows:
            row_num = int(row.attrib.get("r", "0"))
            if row_num < 4 or row_num > 36:
                continue

            row_by_col: dict[int, str] = {}
            for cell in row.findall("m:c", NS):
                ref = cell.attrib.get("r", "")
                match = re.match(r"([A-Z]+)\d+", ref)
                if not match:
                    continue
                col_idx = col_to_index(match.group(1))
                row_by_col[col_idx] = str(cell_value(cell, shared_strings)).strip()

            lender = row_by_col.get(2) or None
            loan_type = row_by_col.get(3) or None
            source_property_name = row_by_col.get(4) or None
            loan_balance = parse_numeric(row_by_col.get(14))

            if not lender or not source_property_name or loan_balance is None:
                continue

            mapped_property = DEBT_PROPERTY_MAP.get(source_property_name)
            if mapped_property is None:
                unmapped_loans += 1

            interest_rate = parse_numeric(row_by_col.get(22))
            current_rate = parse_numeric(row_by_col.get(24))

            loan = {
                "external_loan_key": f"debt-summary-r{row_num}",
                "property_name": mapped_property,
                "source_property_name": source_property_name,
                "loan_name": f"{source_property_name} - {lender}",
                "lender": lender,
                "loan_type": loan_type,
                "square_feet": parse_numeric(row_by_col.get(5)),
                "base_rent": parse_numeric(row_by_col.get(6)),
                "additional_rent": parse_numeric(row_by_col.get(7)),
                "total_rent": parse_numeric(row_by_col.get(8)),
                "recoverable_opex_psf": parse_numeric(row_by_col.get(9)),
                "total_recoverable_opex": parse_numeric(row_by_col.get(10)),
                "opex_2025": parse_numeric(row_by_col.get(11)),
                "noi_today": parse_numeric(row_by_col.get(12)),
                "noi_budget": parse_numeric(row_by_col.get(13)),
                "loan_balance": loan_balance,
                "debt_service": parse_numeric(row_by_col.get(15)),
                "dsc_market": parse_numeric(row_by_col.get(16)),
                "dsc_budget": parse_numeric(row_by_col.get(17)),
                "dsc_requirement": parse_numeric(row_by_col.get(18)),
                "cash_flow": parse_numeric(row_by_col.get(19)),
                "as_of_825": parse_numeric(row_by_col.get(20)),
                "monthly_payment": parse_numeric(row_by_col.get(21)),
                "interest_rate": interest_rate,
                "interest_rate_label": row_by_col.get(22) or None,
                "rate_margin": row_by_col.get(23) or None,
                "current_rate": current_rate,
                "maturity_date": excel_serial_to_date(row_by_col.get(25)),
                "origination_date": excel_serial_to_date(row_by_col.get(26)),
                "notes": row_by_col.get(27) or None,
                "ml_notes": row_by_col.get(28) or None,
                "eli_notes": row_by_col.get(29) or None,
                "raw_payload": {
                    "row_number": row_num,
                    "summary_headers": headers,
                },
            }
            loans.append(loan)

        schema = {
            "description": "Debt schedule extracted from debt-schedule.xlsx Summary tab (rows 4-36)",
            "primary_key": "external_loan_key",
            "fields": [
                {"name": "external_loan_key", "type": "string", "example": "debt-summary-r4"},
                {"name": "property_name", "type": "string|null", "description": "Mapped to properties.property_name"},
                {"name": "source_property_name", "type": "string"},
                {"name": "loan_name", "type": "string"},
                {"name": "lender", "type": "string"},
                {"name": "loan_type", "type": "string|null"},
                {"name": "loan_balance", "type": "number|null"},
                {"name": "debt_service", "type": "number|null"},
                {"name": "dsc_market", "type": "number|null"},
                {"name": "dsc_budget", "type": "number|null"},
                {"name": "dsc_requirement", "type": "number|null"},
                {"name": "monthly_payment", "type": "number|null"},
                {"name": "interest_rate", "type": "number|null"},
                {"name": "maturity_date", "type": "date|null"},
                {"name": "origination_date", "type": "date|null"},
                {"name": "notes", "type": "string|null"},
            ],
            "stats": {
                "loan_count": len(loans),
                "unmapped_loans": unmapped_loans,
            },
        }

        return loans, schema


def call_gog_sheet(sheet_name: str) -> list[list[str]] | None:
    cmd = [
        "gog",
        "sheets",
        "get",
        GSHEET_ID,
        f"{sheet_name}!A1:Z100",
        "--account",
        GSHEET_ACCOUNT,
        "--client",
        GSHEET_CLIENT,
        "--json",
    ]

    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return None

    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None

    if isinstance(payload, dict):
        if "values" in payload and isinstance(payload["values"], list):
            return payload["values"]
        for key in ("data", "rows"):
            if key in payload and isinstance(payload[key], list):
                return payload[key]

    if isinstance(payload, list):
        return payload

    return None


def extract_metric_from_grid(values: list[list[str]], labels: list[str]) -> float | None:
    if not values:
        return None

    lowered_labels = [label.lower() for label in labels]

    for row in values:
        for i, cell in enumerate(row):
            text = str(cell).strip().lower()
            if not text:
                continue
            if any(label in text for label in lowered_labels):
                neighbors = []
                if i + 1 < len(row):
                    neighbors.append(row[i + 1])
                if i - 1 >= 0:
                    neighbors.append(row[i - 1])
                for candidate in neighbors:
                    parsed = parse_numeric(candidate)
                    if parsed is not None:
                        return parsed
    return None


def parse_asset_sheet(values: list[list[str]], property_record: dict) -> dict:
    occupancy = extract_metric_from_grid(values, ["occupancy", "occupied"])
    noi = extract_metric_from_grid(values, ["noi", "net operating income"])
    cap_rate = extract_metric_from_grid(values, ["cap rate"])

    fallback_occupancy = parse_numeric(property_record.get("occupancy_rate"))
    if fallback_occupancy and fallback_occupancy > 1:
        fallback_occupancy /= 100.0

    return {
        "occupancy_percent": occupancy if occupancy is not None else fallback_occupancy,
        "noi_ttm": noi,
        "cap_rate": cap_rate,
        "avg_psf": parse_numeric(property_record.get("avg_psf_rate")),
        "market_psf": parse_numeric(property_record.get("market_psf_rate")),
        "dscr": None,
    }


def build_asset_metrics(properties: list[dict], debt_rows: list[dict]) -> tuple[list[dict], dict]:
    snapshot_date = dt.date.today().isoformat()

    # Build debt lookup by property name
    debt_by_property: dict[str, list[dict]] = {}
    for loan in debt_rows:
        prop_name = loan.get("property_name")
        if prop_name:
            debt_by_property.setdefault(prop_name, []).append(loan)

    rows: list[dict] = []
    authenticated_count = 0

    for prop in properties:
        name = prop["property_name"]
        values = call_gog_sheet(name)
        extracted = parse_asset_sheet(values, prop) if values else parse_asset_sheet([], prop)
        source_status = "google_sheet_extracted" if values else "properties_json_fallback"
        if values:
            authenticated_count += 1

        # If NOI is still null, try to get it from debt schedule
        noi_ttm = extracted["noi_ttm"]
        dscr = extracted["dscr"]
        cap_rate = extracted["cap_rate"]
        
        property_loans = debt_by_property.get(name, [])
        
        if noi_ttm is None or dscr is None:
            if property_loans:
                # Sum NOI from all loans for this property
                total_noi = sum(loan.get("noi_today", 0) or 0 for loan in property_loans)
                if total_noi > 0:
                    noi_ttm = total_noi
                    if source_status == "properties_json_fallback":
                        source_status = "debt_schedule_noi"
                
                # Get DSCR from first loan (or average if multiple)
                dscr_values = [loan.get("dsc_market") for loan in property_loans if loan.get("dsc_market")]
                if dscr_values:
                    dscr = sum(dscr_values) / len(dscr_values) if len(dscr_values) > 1 else dscr_values[0]
        
        # Calculate cap rate from debt if not available
        if cap_rate is None and noi_ttm and property_loans:
            total_debt = sum(loan.get("loan_balance", 0) or 0 for loan in property_loans)
            if total_debt > 0:
                # Assume 70% LTV to derive property value
                implied_value = total_debt / 0.70
                calculated_cap_rate = noi_ttm / implied_value
                
                # Use calculated cap rate if reasonable (5-12%), otherwise use 8.5% fallback
                if 0.05 <= calculated_cap_rate <= 0.12:
                    cap_rate = calculated_cap_rate
                else:
                    cap_rate = 0.085  # Conservative fallback
        
        # Final fallback: 8.5% for properties with NOI but no debt
        if cap_rate is None and noi_ttm and noi_ttm > 0:
            cap_rate = 0.085

        rows.append(
            {
                "property_name": name,
                "snapshot_date": snapshot_date,
                "occupancy_percent": extracted["occupancy_percent"],
                "noi_ttm": noi_ttm,
                "cap_rate": cap_rate,
                "avg_psf": extracted["avg_psf"],
                "market_psf": extracted["market_psf"],
                "dscr": dscr,
                "source_sheet": name,
                "source_status": source_status,
                "notes": None,
                "raw_payload": {
                    "extracted_from_grid": values is not None,
                },
            }
        )

    schema = {
        "description": "Asset management metrics by property. Attempts Google Sheet extraction first; falls back to existing properties.json values when auth is unavailable.",
        "primary_key": ["property_name", "snapshot_date"],
        "fields": [
            {"name": "property_name", "type": "string"},
            {"name": "snapshot_date", "type": "date"},
            {"name": "occupancy_percent", "type": "number|null", "description": "0-1 fraction"},
            {"name": "noi_ttm", "type": "number|null"},
            {"name": "cap_rate", "type": "number|null"},
            {"name": "avg_psf", "type": "number|null"},
            {"name": "market_psf", "type": "number|null"},
            {"name": "dscr", "type": "number|null"},
            {"name": "source_sheet", "type": "string"},
            {"name": "source_status", "type": "string"},
            {"name": "raw_payload", "type": "object"},
        ],
        "stats": {
            "properties": len(rows),
            "google_sheet_extracted": authenticated_count,
            "fallback_count": len(rows) - authenticated_count,
        },
    }

    return rows, schema


def build_property_mapping(properties: list[dict], debt_rows: list[dict]) -> dict:
    debt_by_property: dict[str, list[str]] = {}
    unmatched_debt_names: list[str] = []

    for row in debt_rows:
        mapped = row.get("property_name")
        source_name = row.get("source_property_name")
        if mapped:
            debt_by_property.setdefault(mapped, []).append(source_name)
        elif source_name:
            unmatched_debt_names.append(source_name)

    mapping = {}
    for prop in properties:
        name = prop["property_name"]
        debt_names = sorted({n for n in debt_by_property.get(name, []) if n})
        mapping[name] = {
            "existing": name,
            "asset_mgmt_sheet": name,
            "debt_schedule_names": debt_names,
            "has_debt": bool(debt_names),
        }

    mapping["_meta"] = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "unmatched_debt_schedule_names": sorted(set(unmatched_debt_names)),
    }

    return mapping


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    properties = read_json(PROPERTIES_FILE)
    if not isinstance(properties, list):
        raise RuntimeError("data/properties.json must be an array")

    debt_rows, debt_schema = parse_debt_schedule()
    asset_rows, asset_schema = build_asset_metrics(properties, debt_rows)
    property_mapping = build_property_mapping(properties, debt_rows)

    write_json(DATA_DIR / "debt-schedule.json", debt_rows)
    write_json(DATA_DIR / "debt-schedule-schema.json", debt_schema)
    write_json(DATA_DIR / "asset-management.json", asset_rows)
    write_json(DATA_DIR / "asset-management-schema.json", asset_schema)
    write_json(DATA_DIR / "property-mapping.json", property_mapping)

    print(f"Wrote {len(debt_rows)} debt rows")
    print(f"Wrote {len(asset_rows)} asset metric rows")
    print("Wrote schemas and property mapping")


if __name__ == "__main__":
    main()

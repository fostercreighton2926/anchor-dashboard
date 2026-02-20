import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

async function seedProperties() {
  const dataPath = path.join(process.cwd(), 'data', 'properties.json')
  const properties = readJson(dataPath)

  if (!Array.isArray(properties)) {
    throw new Error('properties.json must contain an array')
  }

  const validFields = [
    'property_name',
    'date_acquired',
    'original_investment_thesis',
    'owners_intent_10yr',
    'general_notes',
    'occupancy_rate',
    'market_psf_rate',
    'avg_psf_rate',
    'leasing_strategy',
    'vacancies',
    'tenant_mix',
    'renewals',
    'risks',
    'capex_budget',
    'capex_outlook_summary',
    'long_term_items',
  ]

  const cleaned = properties.map((p: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(p).filter(([k]) => validFields.includes(k)))
  )

  console.log(`Seeding ${cleaned.length} properties...`)

  const { error } = await supabase.from('properties').upsert(cleaned, {
    onConflict: 'property_name',
  })

  if (error) {
    throw new Error(`Properties seed failed: ${error.message}`)
  }
}

async function getPropertyIdMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('properties').select('id, property_name')

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`)
  }

  const map = new Map<string, string>()
  for (const row of data ?? []) {
    if (row.property_name && row.id) {
      map.set(row.property_name, row.id)
    }
  }
  return map
}

async function seedAssetMetrics(propertyIdByName: Map<string, string>) {
  const dataPath = path.join(process.cwd(), 'data', 'asset-management.json')
  const metrics = readJson(dataPath)

  if (!Array.isArray(metrics)) {
    throw new Error('asset-management.json must contain an array')
  }

  const rows = metrics
    .map((metric: Record<string, unknown>) => {
      const propertyName = typeof metric.property_name === 'string' ? metric.property_name : ''
      const propertyId = propertyIdByName.get(propertyName)
      if (!propertyId) return null

      return {
        property_id: propertyId,
        snapshot_date: typeof metric.snapshot_date === 'string' ? metric.snapshot_date : null,
        occupancy_percent: nullableNumber(metric.occupancy_percent),
        noi_ttm: nullableNumber(metric.noi_ttm),
        cap_rate: nullableNumber(metric.cap_rate),
        avg_psf: nullableNumber(metric.avg_psf),
        market_psf: nullableNumber(metric.market_psf),
        dscr: nullableNumber(metric.dscr),
        notes: typeof metric.notes === 'string' ? metric.notes : null,
        source_sheet: typeof metric.source_sheet === 'string' ? metric.source_sheet : null,
        source_status: typeof metric.source_status === 'string' ? metric.source_status : 'seeded',
        raw_payload:
          metric.raw_payload && typeof metric.raw_payload === 'object'
            ? metric.raw_payload
            : null,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (!rows.length) {
    console.log('No asset metric rows to seed.')
    return
  }

  console.log(`Seeding ${rows.length} asset metric rows...`)

  const { error } = await supabase.from('asset_metrics').upsert(rows, {
    onConflict: 'property_id',
  })

  if (error) {
    throw new Error(`Asset metrics seed failed: ${error.message}`)
  }
}

async function seedDebtSchedule(propertyIdByName: Map<string, string>) {
  const dataPath = path.join(process.cwd(), 'data', 'debt-schedule.json')
  const loans = readJson(dataPath)

  if (!Array.isArray(loans)) {
    throw new Error('debt-schedule.json must contain an array')
  }

  const rows = loans.map((loan: Record<string, unknown>) => {
    const propertyName = typeof loan.property_name === 'string' ? loan.property_name : null
    const propertyId = propertyName ? propertyIdByName.get(propertyName) ?? null : null

    return {
      property_id: propertyId,
      external_loan_key:
        typeof loan.external_loan_key === 'string'
          ? loan.external_loan_key
          : `debt-${Math.random().toString(36).slice(2)}`,
      source_property_name:
        typeof loan.source_property_name === 'string' ? loan.source_property_name : 'Unknown',
      loan_name: typeof loan.loan_name === 'string' ? loan.loan_name : 'Unknown Loan',
      lender: typeof loan.lender === 'string' ? loan.lender : null,
      loan_type: typeof loan.loan_type === 'string' ? loan.loan_type : null,
      square_feet: nullableNumber(loan.square_feet),
      base_rent: nullableNumber(loan.base_rent),
      additional_rent: nullableNumber(loan.additional_rent),
      total_rent: nullableNumber(loan.total_rent),
      recoverable_opex_psf: nullableNumber(loan.recoverable_opex_psf),
      total_recoverable_opex: nullableNumber(loan.total_recoverable_opex),
      opex_2025: nullableNumber(loan.opex_2025),
      noi_today: nullableNumber(loan.noi_today),
      noi_budget: nullableNumber(loan.noi_budget),
      loan_balance: nullableNumber(loan.loan_balance),
      debt_service: nullableNumber(loan.debt_service),
      dsc_market: nullableNumber(loan.dsc_market),
      dsc_budget: nullableNumber(loan.dsc_budget),
      dsc_requirement: nullableNumber(loan.dsc_requirement),
      cash_flow: nullableNumber(loan.cash_flow),
      as_of_825: nullableNumber(loan.as_of_825),
      monthly_payment: nullableNumber(loan.monthly_payment),
      interest_rate: nullableNumber(loan.interest_rate),
      interest_rate_label: typeof loan.interest_rate_label === 'string' ? loan.interest_rate_label : null,
      rate_margin: typeof loan.rate_margin === 'string' ? loan.rate_margin : null,
      current_rate: nullableNumber(loan.current_rate),
      maturity_date: typeof loan.maturity_date === 'string' ? loan.maturity_date : null,
      origination_date: typeof loan.origination_date === 'string' ? loan.origination_date : null,
      notes: typeof loan.notes === 'string' ? loan.notes : null,
      ml_notes: typeof loan.ml_notes === 'string' ? loan.ml_notes : null,
      eli_notes: typeof loan.eli_notes === 'string' ? loan.eli_notes : null,
      raw_payload: loan.raw_payload && typeof loan.raw_payload === 'object' ? loan.raw_payload : null,
    }
  })

  if (!rows.length) {
    console.log('No debt schedule rows to seed.')
    return
  }

  console.log(`Seeding ${rows.length} debt schedule rows...`)

  const { error } = await supabase.from('debt_schedule').upsert(rows, {
    onConflict: 'external_loan_key',
  })

  if (error) {
    throw new Error(`Debt schedule seed failed: ${error.message}`)
  }
}

async function seed() {
  await seedProperties()
  const propertyIdByName = await getPropertyIdMap()
  await seedAssetMetrics(propertyIdByName)
  await seedDebtSchedule(propertyIdByName)
  console.log('Seed complete.')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})

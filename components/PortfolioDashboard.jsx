"use client";

import { useState, useMemo } from "react";
import { operationalDashboardProperties as properties } from "@/lib/operationalDashboardData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, ReferenceLine } from "recharts";

const statusColors = { Trophy:"#16a34a", WIP:"#eab308", Problem:"#dc2626" };
const statusLabels = { Trophy:"Trophy Asset 🟢", WIP:"Work in Progress 🟡", Problem:"Problem Child 🔴" };

const fmt = (n) => {
  if (n === undefined || n === null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return (n < 0 ? "-" : "") + "$" + (abs / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n < 0 ? "-" : "") + "$" + (abs / 1e3).toFixed(0) + "k";
  return "$" + n.toLocaleString();
};
const fmtFull = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
const pct = (n) => (n * 100).toFixed(0) + "%";

// ─── COMPONENTS ─────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, accent }) => (
  <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.10)", borderRadius:12, padding:"20px 24px", flex:1, minWidth:180, boxShadow:"0 1px 2px rgba(15,23,42,0.04)" }}>
    <div style={{ fontSize:12, fontWeight:500, color:"#94a3b8", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:700, color: accent || "#0f172a", fontFamily:"'DM Sans', sans-serif" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{sub}</div>}
  </div>
);

const StatusBadge = ({ status }) => (
  <span style={{
    display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
    background: status === "Trophy" ? "rgba(22,163,106,0.15)" : status === "WIP" ? "rgba(234,179,8,0.15)" : "rgba(220,38,38,0.15)",
    color: statusColors[status], border:`1px solid ${statusColors[status]}33`
  }}>
    {status === "Trophy" ? "Trophy" : status === "WIP" ? "WIP" : "Problem"}
  </span>
);

const MaturityFlag = ({ maturity }) => {
  const d = new Date(maturity);
  const now = new Date(2026, 1, 18);
  const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  if (months <= 0) return <span style={{ color:"#ef4444", fontWeight:700, fontSize:11 }}>⚠ TODAY</span>;
  if (months <= 6) return <span style={{ color:"#f97316", fontWeight:600, fontSize:11 }}>⚠ {months}mo</span>;
  if (months <= 12) return <span style={{ color:"#eab308", fontSize:11 }}>{months}mo</span>;
  return <span style={{ color:"#64748b", fontSize:11 }}>{months}mo</span>;
};

const valuations = [
  { name:"Trousdale", noi:286219, loan:915025, capRate:7.5, valuation:3816253, ltv:24.0, equity:2901228, group:"Cash Cow (Safe)" },
  { name:"8th Ave", noi:171080, loan:1500000, capRate:3.75, valuation:4562133, ltv:32.9, equity:3062133, group:"Cash Cow (Safe)" },
  { name:"Meridian", noi:129732, loan:755416, capRate:5.77, valuation:2250000, ltv:33.6, equity:1494584, group:"Cash Cow (Safe)" },
  { name:"Maple Row", noi:1165205, loan:5962512, capRate:7.0, valuation:16645786, ltv:35.8, equity:10683273, group:"Cash Cow (Safe)" },
  { name:"Fessey", noi:453841, loan:2960416, capRate:6.25, valuation:7261456, ltv:40.8, equity:4301040, group:"Cash Cow (Safe)" },
  { name:"Hickory Hollow", noi:590764, loan:3375000, capRate:7.25, valuation:8148469, ltv:41.4, equity:4773469, group:"Cash Cow (Safe)" },
  { name:"Cumberland", noi:335000, loan:1782100, capRate:8.25, valuation:4060606, ltv:43.9, equity:2278506, group:"Cash Cow (Safe)" },
  { name:"Millington", noi:740473, loan:4627945, capRate:7.5, valuation:9872976, ltv:46.9, equity:5245031, group:"Cash Cow (Safe)" },
  { name:"McMinnville", noi:167633, loan:3200000, capRate:7.5, valuation:2235107, ltv:143.2, equity:-964893, group:"Watch List" },
  { name:"Studio Suites", noi:470951, loan:3070321, capRate:7.25, valuation:6495876, ltv:47.3, equity:3425554, group:"Cash Cow (Safe)" },
  { name:"Vann", noi:278988, loan:1872000, capRate:7.5, valuation:3719840, ltv:50.3, equity:1847840, group:"Stable Core" },
  { name:"Montgomery", noi:694223, loan:4900000, capRate:7.5, valuation:9256307, ltv:52.9, equity:4356307, group:"Stable Core" },
  { name:"Parma", noi:515637, loan:3329833, capRate:8.25, valuation:6250145, ltv:53.3, equity:2920312, group:"Stable Core" },
  { name:"Johnson", noi:570419, loan:4861637, capRate:6.5, valuation:8775677, ltv:55.4, equity:3914040, group:"Stable Core" },
  { name:"Wilson", noi:185829, loan:1460122, capRate:7.5, valuation:2477720, ltv:58.9, equity:1017598, group:"Stable Core" },
  { name:"Gastonia", noi:819133, loan:6576114, capRate:7.5, valuation:10921773, ltv:60.2, equity:4345659, group:"Stable Core" },
  { name:"Hamilton", noi:452508, loan:3276862, capRate:8.5, valuation:5323624, ltv:61.6, equity:2046761, group:"Stable Core" },
  { name:"Sevierville", noi:906017, loan:7687502, capRate:7.5, valuation:12080227, ltv:63.6, equity:4392724, group:"Stable Core" },
  { name:"Pea Ridge", noi:1087471, loan:9412195, capRate:7.5, valuation:14499613, ltv:64.9, equity:5087418, group:"Stable Core" },
  { name:"Madison", noi:1186093, loan:11707838, capRate:7.0, valuation:16944185, ltv:69.1, equity:5236346, group:"Stable Core" },
  { name:"Foster", noi:99880, loan:959850, capRate:7.5, valuation:1331740, ltv:72.1, equity:371890, group:"Stable Core" },
  { name:"Pell City", noi:824109, loan:7666729, capRate:8.0, valuation:10301362, ltv:74.4, equity:2634634, group:"Stable Core" },
  { name:"Church", noi:330123, loan:3430333, capRate:6.0, valuation:5502050, ltv:62.3, equity:2071717, group:"Stable Core" },
  { name:"Lebanon", noi:147150, loan:1950000, capRate:6.0, valuation:2452500, ltv:79.5, equity:502500, group:"Watch List" },
  { name:"The Russell", noi:394530, loan:4371666, capRate:0, valuation:4262750, ltv:102.6, equity:-108916, group:"Watch List" },
  { name:"Harrison", noi:278442, loan:3279742, capRate:7.5, valuation:3712560, ltv:88.3, equity:432818, group:"Watch List" },
  { name:"Shelbyville", noi:-56640, loan:1777989, capRate:0, valuation:2000000, ltv:88.9, equity:222011, group:"Watch List" },
  { name:"Highland", noi:175241, loan:2160000, capRate:7.5, valuation:2336547, ltv:92.4, equity:176547, group:"Watch List" },
  { name:"Russellville", noi:256891, loan:3462850, capRate:8.75, valuation:2935897, ltv:117.9, equity:-526953, group:"Watch List" },
  { name:"Evansville", noi:61449, loan:3469426, capRate:7.5, valuation:5311085, ltv:65.3, equity:1841659, group:"Stable Core" },
  { name:"Gallatin", noi:57151, loan:7312500, capRate:0, valuation:5230000, ltv:139.8, equity:-2082500, group:"Watch List" },
  { name:"Malone", noi:-174795, loan:3067567, capRate:7.5, valuation:3680000, ltv:83.3, equity:612433, group:"Watch List" },
  { name:"New Memphis", noi:-99182, loan:3465000, capRate:7.5, valuation:2323300, ltv:149.1, equity:-1141700, group:"Watch List" },
];

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────
export default function PortfolioDashboard() {
  const [view, setView] = useState("overview");
  const [selectedProp, setSelectedProp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("cf2026");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let d = statusFilter === "All" ? [...properties] : properties.filter(p => p.status === statusFilter);
    d.sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
    return d;
  }, [statusFilter, sortBy, sortDir]);

  const totals = useMemo(() => {
    const t = properties.reduce((acc, p) => ({
      loanBal: acc.loanBal + p.loanBal,
      debtService: acc.debtService + p.debtService,
      cf2026: acc.cf2026 + p.cf2026,
      distros2025: acc.distros2025 + p.distros2025,
      capex2026: acc.capex2026 + p.capex2026,
      drawAvail: acc.drawAvail + p.drawAvail,
      noi2025: acc.noi2025 + p.noi2025,
    }), { loanBal:0, debtService:0, cf2026:0, distros2025:0, capex2026:0, drawAvail:0, noi2025:0 });
    t.trophy = properties.filter(p => p.status === "Trophy").length;
    t.wip = properties.filter(p => p.status === "WIP").length;
    t.problem = properties.filter(p => p.status === "Problem").length;
    t.avgOcc = (properties.filter(p=>p.occupancy>=0).reduce((s,p)=>s+p.occupancy,0)/properties.filter(p=>p.occupancy>=0).length).toFixed(0);
    t.avgDsc = (properties.filter(p=>p.debtService>0).reduce((s,p)=>s+p.noi2025,0) / properties.filter(p=>p.debtService>0).reduce((s,p)=>s+p.debtService,0)).toFixed(2);
    t.lowestOcc = [...properties].filter(p=>p.occupancy>=0).sort((a,b)=>a.occupancy-b.occupancy).slice(0,4);
    t.drawProps = properties.filter(p=>p.drawAvail>0).sort((a,b)=>b.drawAvail-a.drawAvail);
    return t;
  }, []);

  const pieData = [
    { name:"Trophy Assets", value: totals.trophy, color:"#16a34a" },
    { name:"Work in Progress", value: totals.wip, color:"#eab308" },
    { name:"Problem Children", value: totals.problem, color:"#dc2626" },
  ];

  const cfByStatus = [
    { name:"Trophy", cf: properties.filter(p=>p.status==="Trophy").reduce((s,p)=>s+p.cf2026,0) },
    { name:"WIP", cf: properties.filter(p=>p.status==="WIP").reduce((s,p)=>s+p.cf2026,0) },
    { name:"Problem", cf: properties.filter(p=>p.status==="Problem").reduce((s,p)=>s+p.cf2026,0) },
  ];

  const maturities2026 = properties
    .filter(p => {
      const d = new Date(p.maturity);
      return d.getFullYear() === 2026;
    })
    .sort((a,b) => new Date(a.maturity) - new Date(b.maturity));

  const dscData = [...properties].filter(p=>p.debtService>0).sort((a,b)=>a.dsc-b.dsc).map(p=>({
    name: p.name, dsc: p.dsc,
    fill: p.dsc < 0.5 ? "#dc2626" : p.dsc < 1.0 ? "#f97316" : p.dsc < 1.25 ? "#eab308" : "#16a34a"
  }));

  const refiOpps = properties.filter(p => {
    return (p.rateType === "Fixed" && p.rate >= 5.5 && new Date(p.maturity) <= new Date(2028,0,1)) ||
           (p.rateType === "Floating");
  }).sort((a,b)=>b.rate-a.rate);

  const navItems = [
    { id:"overview", label:"Overview" },
    { id:"properties", label:"Properties" },
    { id:"valuation", label:"Valuation & Leverage" },
    { id:"debt", label:"Debt & Maturities" },
    { id:"cashflow", label:"2026 Cash Flow" },
    { id:"refi", label:"Refi Opportunities" },
  ];

  const prop = selectedProp ? properties.find(p => p.name === selectedProp) : null;

  return (
    <div style={{ background:"#fafafa", minHeight:"100vh", color:"#0f172a", fontFamily:"'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg, #5f786a 0%, #7A9A8A 52%, #9cb4a8 100%)", borderBottom:"1px solid rgba(122,154,138,0.45)", padding:"28px 40px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:32, fontWeight:700, margin:0, fontFamily:"'Playfair Display', serif", color:"#f8fafc" }}>Portfolio Dashboard</h1>
            <div style={{ fontSize:13, color:"#e2e8f0", marginTop:4 }}>2026 Strategic Overview · {properties.length} Properties · As of February 18, 2026</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#e2e8f0" }}>PRIME: 6.75% · SOFR (30D): 3.65%</div>
            <div style={{ fontSize:11, color:"#e2e8f0", marginTop:2 }}>Prepared for CEO Review</div>
          </div>
        </div>

        {/* ── NAV ── */}
        <div style={{ display:"flex", gap:4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setSelectedProp(null); }}
              style={{
                padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                background: view === n.id ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.12)",
                color: "#ffffff",
                transition:"all 0.2s"
              }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"28px 40px" }}>

        {/* ════════════════════ OVERVIEW ════════════════════ */}
        {view === "overview" && !selectedProp && (
          <div>
            {/* KPI Row */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
              <KPICard label="Total Loan Balance" value={fmt(totals.loanBal)} sub={`${properties.length} loans across 20+ lenders`} />
              <KPICard label="Wtd Avg DSCR" value={totals.avgDsc + "x"} accent={parseFloat(totals.avgDsc) < 1.2 ? "#f97316" : "#16a34a"} sub="NOI ÷ Debt Service (portfolio weighted)" />
              <KPICard label="2026 Projected Cash Flow" value={fmtFull(totals.cf2026)} accent={totals.cf2026 > 0 ? "#16a34a" : "#dc2626"} sub="All properties combined" />
              <KPICard label="Avg Occupancy" value={totals.avgOcc + "%"} sub={totals.lowestOcc.map(p => `${p.name} ${p.occupancy}%`).join(" · ")} />
            </div>

            {/* Detail Breakdowns */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
              {/* 2025 Distributions */}
              <div style={{ background:"rgba(165,180,252,0.05)", border:"1px solid rgba(165,180,252,0.12)", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#456255", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>Total 2025 Distributions</div>
                <div style={{ fontSize:26, fontWeight:700, color:"#456255", fontFamily:"'DM Sans', sans-serif", marginBottom:12 }}>$7,942,500</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                  {[...properties].filter(p=>p.distros2025>0).sort((a,b)=>b.distros2025-a.distros2025).map(p => (
                    <div key={p.name} style={{ display:"flex", justifyContent:"space-between", padding:"4px 8px", fontSize:12 }}>
                      <span style={{ color:"#94a3b8" }}>{p.name}</span>
                      <span style={{ color:"#1f2937", fontWeight:600 }}>{fmt(p.distros2025)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Draw Dollars */}
              <div style={{ background:"rgba(34,211,238,0.05)", border:"1px solid rgba(34,211,238,0.12)", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#22d3ee", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>Draw Dollars Available</div>
                <div style={{ fontSize:26, fontWeight:700, color:"#22d3ee", fontFamily:"'DM Sans', sans-serif", marginBottom:12 }}>{fmt(totals.drawAvail)}</div>
                {totals.drawProps.map(p => (
                  <div key={p.name} style={{ display:"flex", justifyContent:"space-between", padding:"6px 8px", borderBottom:"1px solid rgba(15,23,42,0.08)", fontSize:13 }}>
                    <div>
                      <span style={{ color:"#0f172a", fontWeight:600 }}>{p.name}</span>
                      <span style={{ color:"#64748b", fontSize:11, marginLeft:8 }}>{p.city}</span>
                    </div>
                    <span style={{ color:"#22d3ee", fontWeight:700 }}>{fmtFull(p.drawAvail)}</span>
                  </div>
                ))}
                <div style={{ fontSize:11, color:"#64748b", marginTop:8 }}>Note: Draw dollars are part of loan principal balance</div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20, marginBottom:28 }}>
              {/* Pie */}
              <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>Portfolio Composition</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:d.color }} />
                      <span style={{ color:"#94a3b8" }}>{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CF by Status */}
              <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>2026 Cash Flow by Category</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cfByStatus} margin={{ top:10, right:10, left:10, bottom:10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:12 }} axisLine={false} />
                    <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:13 }} formatter={v => fmtFull(v)} />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Bar dataKey="cf" radius={[6,6,0,0]}>
                      {cfByStatus.map((e,i) => <Cell key={i} fill={e.cf >= 0 ? "#16a34a" : "#dc2626"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 2026 Maturities */}
              <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#1f2937" }}>2026 Loan Maturities & Resets</div>
                <div style={{ maxHeight:260, overflow:"auto" }}>
                  {maturities2026.map(p => (
                    <div key={p.name} onClick={() => setSelectedProp(p.name)}
                      style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:8, cursor:"pointer", borderBottom:"1px solid rgba(15,23,42,0.08)", transition:"background 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.background="#f1f5f9"}
                      onMouseOut={e => e.currentTarget.style.background="transparent"}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{p.rateReset}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:12, fontWeight:600 }}>{p.maturity}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{fmt(p.loanBal)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top/Bottom Properties */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div style={{ background:"rgba(22,163,106,0.05)", border:"1px solid rgba(22,163,106,0.15)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#4ade80" }}>Top Performers — 2026 Projected CF</div>
                {[...properties].sort((a,b)=>b.cf2026-a.cf2026).slice(0,7).map(p => (
                  <div key={p.name} onClick={() => setSelectedProp(p.name)}
                    style={{ display:"flex", justifyContent:"space-between", padding:"7px 12px", borderRadius:6, cursor:"pointer", borderBottom:"1px solid rgba(15,23,42,0.06)" }}
                    onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                    onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <StatusBadge status={p.status} />
                      <span style={{ fontSize:13, fontWeight:500 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:"#4ade80" }}>{fmtFull(p.cf2026)}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(220,38,38,0.05)", border:"1px solid rgba(220,38,38,0.15)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#f87171" }}>Biggest Cash Burns — 2026 Projected CF</div>
                {[...properties].sort((a,b)=>a.cf2026-b.cf2026).slice(0,7).map(p => (
                  <div key={p.name} onClick={() => setSelectedProp(p.name)}
                    style={{ display:"flex", justifyContent:"space-between", padding:"7px 12px", borderRadius:6, cursor:"pointer", borderBottom:"1px solid rgba(15,23,42,0.06)" }}
                    onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                    onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <StatusBadge status={p.status} />
                      <span style={{ fontSize:13, fontWeight:500 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>{fmtFull(p.cf2026)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ PROPERTY DETAIL ════════════════════ */}
        {selectedProp && prop && (
          <div>
            <button
              onClick={() => setSelectedProp(null)}
              style={{
                background:"#ffffff",
                color:"#334155",
                border:"1px solid rgba(15,23,42,0.15)",
                borderRadius:8,
                padding:"8px 16px",
                cursor:"pointer",
                fontSize:13,
                fontWeight:600,
                marginBottom:20,
                boxShadow:"0 1px 2px rgba(15,23,42,0.06)",
              }}
            >
              ← Back to {view === "overview" ? "Overview" : view === "properties" ? "Properties" : view === "debt" ? "Debt" : view === "cashflow" ? "Cash Flow" : "Refi"}
            </button>
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.10)", borderRadius:16, padding:24, boxShadow:"0 6px 20px rgba(15,23,42,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
                <h2 style={{ fontSize:28, fontWeight:700, margin:0, fontFamily:"'Playfair Display', serif" }}>{prop.name}</h2>
                <StatusBadge status={prop.status} />
                <span style={{ fontSize:13, color:"#64748b" }}>{prop.city}</span>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14, marginBottom:24 }}>
                <KPICard label="Occupancy" value={prop.occupancy < 0 ? "N/A" : prop.occupancy + "%"} accent={prop.occupancy < 0 ? "#94a3b8" : prop.occupancy < 70 ? "#dc2626" : prop.occupancy < 90 ? "#eab308" : "#16a34a"} />
                <KPICard label="2026 Cash Flow" value={fmtFull(prop.cf2026)} accent={prop.cf2026 >= 0 ? "#16a34a" : "#dc2626"} />
                <KPICard label="DSC" value={prop.dsc.toFixed(2) + "x"} accent={prop.dsc < 1 ? "#dc2626" : prop.dsc < 1.25 ? "#eab308" : "#16a34a"} />
                <KPICard label="Loan Balance" value={fmtFull(prop.loanBal)} sub={`${prop.rate}% ${prop.rateType}`} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14, marginBottom:24 }}>
                <KPICard label="Debt Service" value={fmtFull(prop.debtService)} sub="Annual" />
                <KPICard label="Maturity" value={prop.maturity} sub={<MaturityFlag maturity={prop.maturity} />} />
                <KPICard label="2025 NOI" value={fmtFull(prop.noi2025)} />
                <KPICard label="2025 Distributions" value={fmtFull(prop.distros2025)} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:4 }}>
                <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24, boxShadow:"0 4px 14px rgba(15,23,42,0.05)" }}>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#1f2937" }}>Property Details</div>
                  {[
                    ["Square Footage", prop.sqft > 0 ? prop.sqft.toLocaleString() + " SF" : "N/A"],
                    ["Investors", prop.investors],
                    ["Pref Status", prop.prefStatus],
                    ["Draw $ Available", prop.drawAvail > 0 ? fmtFull(prop.drawAvail) : "None"],
                    ["2026 CapEx Budget", fmtFull(prop.capex2026)],
                    ["Rate Reset", prop.rateReset],
                    ["Key Tenants", prop.tenant],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(15,23,42,0.08)" }}>
                      <span style={{ fontSize:13, color:"#94a3b8" }}>{k}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:"#0f172a", textAlign:"right", maxWidth:"60%" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24, boxShadow:"0 4px 14px rgba(15,23,42,0.05)" }}>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#1f2937" }}>2026 Strategy & Risks</div>
                  <div style={{ fontSize:13, color:"#0f172a", lineHeight:1.7, marginBottom:16 }}>{prop.strategy}</div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:8, color:"#f87171" }}>Key Risks</div>
                  <div style={{ fontSize:13, color:"#fca5a5", lineHeight:1.7 }}>{prop.risks}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ PROPERTIES TABLE ════════════════════ */}
        {view === "properties" && !selectedProp && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:700, margin:0, fontFamily:"'Playfair Display', serif" }}>All Properties</h2>
              <div style={{ display:"flex", gap:8 }}>
                {["All","Trophy","WIP","Problem"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{
                      padding:"6px 16px", borderRadius:8, border:"1px solid", cursor:"pointer", fontSize:12, fontWeight:600,
                      background: statusFilter === s ? "rgba(122,154,138,0.16)" : "transparent",
                      color: statusFilter === s ? "#456255" : "#64748b",
                      borderColor: statusFilter === s ? "rgba(122,154,138,0.34)" : "rgba(15,23,42,0.10)"
                    }}>
                    {s} {s !== "All" && `(${properties.filter(p => p.status === s).length})`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(15,23,42,0.09)" }}>
                    {[
                      {k:"name",l:"Property"},{k:"status",l:"Status"},{k:"occupancy",l:"Occ%"},{k:"cf2026",l:"2026 CF"},{k:"dsc",l:"DSC"},
                      {k:"loanBal",l:"Loan Bal"},{k:"rate",l:"Rate"},{k:"maturity",l:"Maturity"},{k:"drawAvail",l:"Draw $"}
                    ].map(col => (
                      <th key={col.k} onClick={() => { if(sortBy===col.k) setSortDir(d=>d==="desc"?"asc":"desc"); else { setSortBy(col.k); setSortDir("desc"); }}}
                        style={{ padding:"12px 14px", textAlign:"left", color:"#94a3b8", fontWeight:600, cursor:"pointer", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", userSelect:"none" }}>
                        {col.l} {sortBy === col.k && (sortDir === "desc" ? "↓" : "↑")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.name} onClick={() => setSelectedProp(p.name)}
                      style={{ borderBottom:"1px solid rgba(15,23,42,0.06)", cursor:"pointer", transition:"background 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseOut={e => e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"10px 14px", fontWeight:600 }}>{p.name}</td>
                      <td style={{ padding:"10px 14px" }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding:"10px 14px", color: p.occupancy < 0 ? "#94a3b8" : p.occupancy < 70 ? "#dc2626" : p.occupancy < 90 ? "#eab308" : "#16a34a", fontWeight:600 }}>{p.occupancy < 0 ? "N/A" : p.occupancy + "%"}</td>
                      <td style={{ padding:"10px 14px", color: p.cf2026 >= 0 ? "#4ade80" : "#f87171", fontWeight:700 }}>{fmtFull(p.cf2026)}</td>
                      <td style={{ padding:"10px 14px", color: p.dsc < 1 ? "#f87171" : p.dsc < 1.25 ? "#eab308" : "#4ade80", fontWeight:600 }}>{p.dsc.toFixed(2)}x</td>
                      <td style={{ padding:"10px 14px" }}>{fmt(p.loanBal)}</td>
                      <td style={{ padding:"10px 14px" }}>{p.rate}% <span style={{ color:"#64748b", fontSize:11 }}>{p.rateType === "Floating" ? "⟳" : "■"}</span></td>
                      <td style={{ padding:"10px 14px" }}>{p.maturity} <MaturityFlag maturity={p.maturity} /></td>
                      <td style={{ padding:"10px 14px", color: p.drawAvail > 0 ? "#22d3ee" : "#94a3b8" }}>{p.drawAvail > 0 ? fmt(p.drawAvail) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ VALUATION & LEVERAGE ════════════════════ */}
        {view === "valuation" && !selectedProp && (() => {
          const totalAUM = valuations.reduce((s,v) => s + Math.max(v.valuation, 0), 0);
          const totalDebt = valuations.reduce((s,v) => s + v.loan, 0);
          const totalEquity = valuations.reduce((s,v) => s + v.equity, 0);
          const portfolioLTV = ((totalDebt / totalAUM) * 100).toFixed(1);
          const cashCows = valuations.filter(v => v.group === "Cash Cow (Safe)");
          const stableCore = valuations.filter(v => v.group === "Stable Core");
          const watchList = valuations.filter(v => v.group === "Watch List");
          const cashCowEquity = cashCows.reduce((s,v) => s + v.equity, 0);
          const stableCoreEquity = stableCore.reduce((s,v) => s + v.equity, 0);

          // Refi candidates: low LTV, positive equity, could pull cash
          const refiCandidates = valuations
            .filter(v => v.ltv < 70 && v.equity > 500000 && v.ltv > 0)
            .sort((a,b) => a.ltv - b.ltv)
            .map(v => {
              const maxLoan65 = v.valuation * 0.65;
              const cashOut = Math.max(0, maxLoan65 - v.loan);
              return { ...v, maxLoan65, cashOut };
            });

          const totalCashOutPotential = refiCandidates.reduce((s,v) => s + v.cashOut, 0);

          const ltvChartData = valuations
            .filter(v => v.ltv < 200)
            .sort((a,b) => a.ltv - b.ltv)
            .map(v => ({ name: v.name, ltv: v.ltv, fill: v.ltv <= 50 ? "#16a34a" : v.ltv <= 70 ? "#22d3ee" : v.ltv <= 85 ? "#eab308" : "#dc2626" }));

          const equityData = valuations
            .filter(v => v.equity > 0)
            .sort((a,b) => b.equity - a.equity);

          const groupPieData = [
            { name: "Cash Cow (Safe)", value: cashCows.reduce((s,v)=>s+Math.max(v.valuation,0),0), color: "#16a34a" },
            { name: "Stable Core", value: stableCore.reduce((s,v)=>s+Math.max(v.valuation,0),0), color: "#22d3ee" },
            { name: "Watch List", value: watchList.reduce((s,v)=>s+Math.max(v.valuation,0),0), color: "#dc2626" },
          ];

          return (
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 20px", fontFamily:"'Playfair Display', serif" }}>Portfolio Valuation & Leverage</h2>

            {/* KPIs */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
              <KPICard label="Total AUM (Valuation)" value={"$" + (totalAUM/1e6).toFixed(1) + "M"} accent="#456255" sub={valuations.length + " properties"} />
              <KPICard label="Total Debt" value={"$" + (totalDebt/1e6).toFixed(1) + "M"} />
              <KPICard label="Portfolio LTV" value={portfolioLTV + "%"} accent={parseFloat(portfolioLTV) > 70 ? "#f97316" : "#16a34a"} sub="Weighted by valuation" />
              <KPICard label="Total Equity" value={"$" + (totalEquity/1e6).toFixed(1) + "M"} accent="#16a34a" />
              <KPICard label="Cash Out Potential (65% LTV)" value={fmt(totalCashOutPotential)} accent="#22d3ee" sub="From low-leverage properties" />
            </div>

            {/* Valuation by Group + LTV Chart */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20, marginBottom:24 }}>
              {/* Group Breakdown */}
              <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>AUM by Risk Group</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={groupPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {groupPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:12 }} formatter={v => "$" + (v/1e6).toFixed(1) + "M"} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop:8 }}>
                  {[
                    { label:"Cash Cow (Safe)", count: cashCows.length, equity: cashCowEquity, color:"#16a34a" },
                    { label:"Stable Core", count: stableCore.length, equity: stableCoreEquity, color:"#22d3ee" },
                    { label:"Watch List", count: watchList.length, equity: watchList.reduce((s,v)=>s+v.equity,0), color:"#dc2626" },
                  ].map(g => (
                    <div key={g.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid rgba(15,23,42,0.08)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:g.color }} />
                        <span style={{ fontSize:12, color:"#94a3b8" }}>{g.label} ({g.count})</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color: g.equity > 0 ? "#0f172a" : "#f87171" }}>{fmt(g.equity)} equity</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LTV Bar Chart */}
              <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4, color:"#1f2937" }}>Loan-to-Value by Property</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:16 }}>Properties with LTV &gt; 200% excluded for scale. Green ≤50% · Blue ≤70% · Yellow ≤85% · Red &gt;85%</div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={ltvChartData} margin={{ top:10, right:10, left:10, bottom:70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:10 }} angle={-45} textAnchor="end" axisLine={false} interval={0} />
                    <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickFormatter={v => v + "%"} domain={[0, 120]} />
                    <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:13 }} formatter={v => v.toFixed(1) + "%"} />
                    <ReferenceLine y={65} stroke="#22d3ee" strokeDasharray="5 5" label={{ value:"65% Target", fill:"#22d3ee", fontSize:11, position:"right" }} />
                    <Bar dataKey="ltv" radius={[4,4,0,0]}>
                      {ltvChartData.map((e, i) => <Cell key={i} fill={e.fill} opacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Equity Reserves / Refi Candidates */}
            <div style={{ background:"rgba(34,211,238,0.05)", border:"1px solid rgba(34,211,238,0.12)", borderRadius:14, padding:24, marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#22d3ee" }}>Emergency Capital Reserve — Refi Candidates</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Properties with low LTV where we could pull cash out via refinance if capital is needed elsewhere. Modeled at 65% LTV ceiling.</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"#64748b" }}>Total Cash-Out Potential</div>
                  <div style={{ fontSize:22, fontWeight:700, color:"#22d3ee" }}>{fmt(totalCashOutPotential)}</div>
                </div>
              </div>
              <div style={{ marginTop:16 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(15,23,42,0.09)" }}>
                      {["Property","Valuation","Loan Balance","Current LTV","Equity","Max Loan @ 65%","Potential Cash Out","Group"].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#94a3b8", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {refiCandidates.map(v => (
                      <tr key={v.name} onClick={() => setSelectedProp(v.name)}
                        style={{ borderBottom:"1px solid rgba(15,23,42,0.06)", cursor:"pointer" }}
                        onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                        onMouseOut={e => e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"8px 12px", fontWeight:600 }}>{v.name}</td>
                        <td style={{ padding:"8px 12px" }}>{fmt(v.valuation)}</td>
                        <td style={{ padding:"8px 12px" }}>{fmt(v.loan)}</td>
                        <td style={{ padding:"8px 12px", color: v.ltv <= 50 ? "#4ade80" : "#22d3ee", fontWeight:700 }}>{v.ltv.toFixed(1)}%</td>
                        <td style={{ padding:"8px 12px", color:"#4ade80", fontWeight:600 }}>{fmt(v.equity)}</td>
                        <td style={{ padding:"8px 12px", color:"#94a3b8" }}>{fmt(v.maxLoan65)}</td>
                        <td style={{ padding:"8px 12px", color:"#22d3ee", fontWeight:700 }}>{fmt(v.cashOut)}</td>
                        <td style={{ padding:"8px 12px" }}>
                          <span style={{ padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600,
                            background: v.group === "Cash Cow (Safe)" ? "rgba(22,163,106,0.15)" : "rgba(34,211,238,0.15)",
                            color: v.group === "Cash Cow (Safe)" ? "#4ade80" : "#22d3ee" }}>
                            {v.group}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full Valuation Table */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(15,23,42,0.08)" }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#1f2937" }}>Full Portfolio Valuation Schedule</div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(15,23,42,0.09)" }}>
                    {["Property","NOI","Cap Rate","Valuation","Loan Balance","LTV","Equity","Risk Group"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#94a3b8", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {valuations.map(v => (
                    <tr key={v.name} onClick={() => { const p = properties.find(p=>p.name===v.name); if(p) setSelectedProp(v.name); }}
                      style={{ borderBottom:"1px solid rgba(15,23,42,0.06)", cursor:"pointer" }}
                      onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseOut={e => e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"8px 12px", fontWeight:600 }}>{v.name}</td>
                      <td style={{ padding:"8px 12px", color: v.noi < 0 ? "#f87171" : "#0f172a" }}>{fmtFull(v.noi)}</td>
                      <td style={{ padding:"8px 12px" }}>{v.capRate > 0 ? v.capRate.toFixed(2) + "%" : "Override"}</td>
                      <td style={{ padding:"8px 12px", fontWeight:600 }}>{v.valuation > 0 ? fmt(v.valuation) : "$0"}</td>
                      <td style={{ padding:"8px 12px" }}>{fmt(v.loan)}</td>
                      <td style={{ padding:"8px 12px", fontWeight:700,
                        color: v.ltv <= 50 ? "#4ade80" : v.ltv <= 70 ? "#22d3ee" : v.ltv <= 85 ? "#eab308" : v.ltv <= 100 ? "#f97316" : "#dc2626"
                      }}>{v.ltv < 1000 ? v.ltv.toFixed(1) + "%" : "N/M"}</td>
                      <td style={{ padding:"8px 12px", color: v.equity >= 0 ? "#4ade80" : "#f87171", fontWeight:600 }}>{fmtFull(v.equity)}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <span style={{ padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600,
                          background: v.group === "Cash Cow (Safe)" ? "rgba(22,163,106,0.15)" : v.group === "Stable Core" ? "rgba(34,211,238,0.15)" : "rgba(220,38,38,0.15)",
                          color: v.group === "Cash Cow (Safe)" ? "#4ade80" : v.group === "Stable Core" ? "#22d3ee" : "#f87171" }}>
                          {v.group}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ borderTop:"2px solid rgba(15,23,42,0.12)", background:"#ffffff" }}>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:"#0f172a" }}>TOTALS</td>
                    <td style={{ padding:"10px 12px" }}></td>
                    <td style={{ padding:"10px 12px" }}></td>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:"#456255" }}>{fmt(totalAUM)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{fmt(totalDebt)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:"#22d3ee" }}>{portfolioLTV}%</td>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:"#4ade80" }}>{fmt(totalEquity)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          );
        })()}

        {/* ════════════════════ DEBT & MATURITIES ════════════════════ */}
        {view === "debt" && !selectedProp && (
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 20px", fontFamily:"'Playfair Display', serif" }}>Debt Schedule & Maturities</h2>

            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
              <KPICard label="Total Debt" value={fmt(totals.loanBal)} />
              <KPICard label="Annual Debt Service" value={fmt(totals.debtService)} />
              <KPICard label="2026 Maturities" value={maturities2026.length + " loans"} accent="#f97316" sub={fmt(maturities2026.reduce((s,p)=>s+p.loanBal,0)) + " total"} />
              <KPICard label="Draw $ Available" value={fmt(totals.drawAvail)} accent="#22d3ee" />
            </div>

            {/* DSC Chart */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24, marginBottom:24 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>Debt Service Coverage by Property</div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dscData} margin={{ top:10, right:10, left:10, bottom:60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:10 }} angle={-45} textAnchor="end" axisLine={false} interval={0} />
                  <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:13 }} formatter={v => v.toFixed(2) + "x"} />
                  <ReferenceLine y={1} stroke="#eab308" strokeDasharray="5 5" label={{ value:"Breakeven", fill:"#eab308", fontSize:11 }} />
                  <ReferenceLine y={1.25} stroke="#16a34a" strokeDasharray="3 3" label={{ value:"1.25x Target", fill:"#16a34a", fontSize:11 }} />
                  <Bar dataKey="dsc" radius={[4,4,0,0]}>
                    {dscData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Maturity Timeline */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>2026 Maturity & Rate Reset Timeline</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:4, marginBottom:16 }}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
                  <div key={m} style={{ textAlign:"center", fontSize:11, color:"#64748b", fontWeight:600 }}>{m}</div>
                ))}
              </div>
              {maturities2026.map(p => {
                const month = new Date(p.maturity).getMonth();
                return (
                  <div key={p.name} onClick={() => setSelectedProp(p.name)} style={{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:4, marginBottom:6, cursor:"pointer" }}>
                    {Array.from({length:12}).map((_,i) => (
                      <div key={i} style={{
                        height:32, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
                        background: i === month ? (p.dsc < 1 ? "rgba(220,38,38,0.3)" : "rgba(122,154,138,0.22)") : "#ffffff",
                        border: i === month ? `1px solid ${p.dsc < 1 ? "#dc262666" : "#7A9A8A66"}` : "1px solid rgba(15,23,42,0.06)",
                        fontSize:10, fontWeight:600, color: i === month ? "#0f172a" : "transparent"
                      }}>
                        {i === month && p.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════ 2026 CASH FLOW ════════════════════ */}
        {view === "cashflow" && !selectedProp && (() => {
          const capexDetails = [
            { property:"Malone", amount:2101514, items:"Marshalls LL work $1.5M, Shoe Dept LL $150k, TI/HVAC/sewer for vacant suites, drive aisle repave" },
            { property:"Wilson", amount:2281500, items:"Old building redevelopment ($2.25M) — decision pending mid-year" },
            { property:"Gastonia", amount:580693, items:"Laundromat & Gavel Time roofs, sealcoat, plumbing, Suite 2547A & 2579 TI/HVAC, Aaron's renewal commission" },
            { property:"Russellville", amount:514340, items:"Suite 15a TI+HVAC ($202k), Suite 15b TI+HVAC ($68k), WOAT TI ($141k), sealcoat, asbestos, plumbing" },
            { property:"Evansville", amount:490000, items:"Big Lots TI ($300k), Big Lots commissions ($150k), sealcoat & stripe ($40k)" },
            { property:"Pell City", amount:318000, items:"Demising Benders space ($112k), Vapor Thrift commission ($80k), Benders TI ($88k), sealcoat ($40k)" },
            { property:"Cumberland", amount:312793, items:"Ollie's TI ($488k), Ollie's HVAC ($262k), Ollie's asbestos ($63k), sealcoat, plumbing" },
            { property:"Hamilton", amount:293490, items:"Suite 103 TI ($125k), Dutch Bros outparcel commission ($63k), Gold Star renewal, HVAC, AutoZone commission" },
            { property:"Parma", amount:290292, items:"Sakura TI ($100k), CFB commissions ($75k), drive aisle repave, HF TI ($25k), facade roof repairs" },
            { property:"Maple Row", amount:195142, items:"Plumbing liner ($32k), Fox's Pizza TI ($15k), paving repairs, quarterly jetting, Indian restaurant LC" },
            { property:"Shelbyville", amount:190000, items:"Big Lots commissions ($130k), TI allowance, splitting Big Lots space ($100k)" },
            { property:"Sevierville", amount:157391, items:"Harbor Freight TI ($83k), outparcel commissions ($38k), parking lot repairs ($35k), sealcoat ($25k)" },
            { property:"Highland", amount:155000, items:"Mega Deals TI ($120k), commissions ($22k), HVAC ($13k)" },
            { property:"Millington", amount:153400, items:"Sealcoat ($46k), Aaron's HVACs ($65k), Shelby County HVAC ($25k), PL lights, A-Stock commission" },
            { property:"Trousdale", amount:130500, items:"Roof replacement ($113k), Spruce Music LC ($18k)" },
            { property:"Vann", amount:110320, items:"Newbury St TI ($30k), Newbury HVAC ($35k), Uniform Source HVAC ($27k), drive aisle repave ($13k)" },
            { property:"Harrison", amount:100000, items:"Vacant suite HVAC replacement ($100k)" },
            { property:"Meridian", amount:85000, items:"Roof replacement ($70k), soffit repairs ($15k)" },
            { property:"Montgomery", amount:73200, items:"Suite 9 & 15 TI ($30k), Suite 19-21 TI ($50k), Sam's HVAC ($45k), sealcoat ($50k)" },
            { property:"Hickory Hollow", amount:63184, items:"Burlington HVAC repairs ($15k), sealcoat & stripe ($30k), plumbing belly ($25k)" },
            { property:"New Memphis", amount:54500, items:"HVAC install 4 units + controller ($50k), roof maintenance ($4.5k)" },
            { property:"Madison", amount:47500, items:"Parking lot islands ($22.5k), plumbing work ($25k)" },
            { property:"Lebanon", amount:10000, items:"Eagle Nest/R1 roof repairs ($10k)" },
            { property:"Fessey", amount:2500, items:"Waterproofing ($2.5k)" },
          ].sort((a,b)=>b.amount-a.amount);

          const totalCapex = capexDetails.reduce((s,c)=>s+c.amount,0);

          const liquidityEvents = [
            { property:"Maple Row", type:"Refinance", timeline:"Q2-Q3 2026", loanBal:6146616, currentRate:"5.90% (SOFR+2.25%)", notes:"Floating loan matures 10/31/26. Strong NOI ($1.15M). Target fixed rate in low-mid 5% range. Potential to pull cash out given low basis.", estProceeds:"TBD — depends on rate environment", priority:"High — maturity driven" },
            { property:"McMinnville", type:"Refinance", timeline:"Q3-Q4 2026", loanBal:3200000, currentRate:"6.50%", notes:"Studio loan matures 11/15/27 but I/O payments only. Roof planned. Refi to lock in better long-term rate and begin amortizing.", estProceeds:"TBD", priority:"Medium — planning ahead" },
            { property:"Montgomery", type:"Sale", timeline:"Q1-Q3 2026", loanBal:4900000, currentRate:"6.50% (Prime-0.25%)", notes:"28 investors. Sale pipeline active. I/O expires 9/13/26 which triggers amortization. $2.3M distributed in 2025 from insurance. B&B, MK Wings, O'Reilly now open — property is stabilized for sale.", estProceeds:"Significant investor return expected", priority:"High — active sale process" },
            { property:"Pea Ridge", type:"Partial Sale", timeline:"2026", loanBal:9412195, currentRate:"5.75% (SOFR+1.85%, at cap)", notes:"½ sale pipeline. $401k in DSR to be released. Strong cash flow ($335k). Floating rate at cap. Could sell portion or outparcel.", estProceeds:"TBD — partial disposition", priority:"Medium" },
            { property:"Vann", type:"Sale", timeline:"Q2-Q3 2026", loanBal:1880000, currentRate:"5.50%", notes:"6 investors, first waterfall hit. 100% occupied. Broker hired in 2025. Renew remaining tenants then take to market. CDFI loan at favorable rate.", estProceeds:"Strong return — low basis, Nashville location", priority:"High — broker engaged" },
            { property:"Johnson", type:"Sale (Wildcard Purchase)", timeline:"April 2026", loanBal:4877684, currentRate:"7.50%", notes:"Wildcard has option to purchase by 4/30/26 — loses $150k earnest if they don't close. Owner says they will close. 8 investors, waterfall hit. Rate resets Oct 2026 if not sold.", estProceeds:"Set purchase price per option agreement", priority:"Very High — contract deadline" },
            { property:"8th Ave", type:"Refinance", timeline:"Q3-Q4 2026", loanBal:1506000, currentRate:"2.35%", notes:"CDFI loan matures 11/5/26. Enterprise ground lease — simple, stable cash flow. Will need to refi at higher rate. 4 investors. DSC currently 1.60.", estProceeds:"No cash out — rate will increase from 2.35%", priority:"High — maturity driven" },
            { property:"Hickory Hollow", type:"Refinance (Rate Reset)", timeline:"August 2026", loanBal:3390000, currentRate:"2.00%", notes:"Rate resets 8/19/26 from 2% to Prime-2% (floor 2%). At current Prime of 6.75%, new rate would be 4.75%. Cash machine ($308k CF). Deal is flipped. May want to explore options.", estProceeds:"No refi needed — rate reset is automatic", priority:"Monitor — auto reset" },
          ];

          return (
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 20px", fontFamily:"'Playfair Display', serif" }}>2026 Cash Flow Analysis</h2>

            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
              <KPICard label="Total 2026 Projected CF" value={fmtFull(totals.cf2026)} accent={totals.cf2026>0?"#16a34a":"#dc2626"} />
              <KPICard label="Trophy CF" value={fmtFull(cfByStatus[0].cf)} accent="#16a34a" />
              <KPICard label="WIP CF" value={fmtFull(cfByStatus[1].cf)} accent={cfByStatus[1].cf>0?"#16a34a":"#eab308"} />
              <KPICard label="Problem CF" value={fmtFull(cfByStatus[2].cf)} accent="#dc2626" />
              <KPICard label="2026 CapEx Budget" value={fmtFull(totalCapex)} accent="#f97316" sub={`Across ${capexDetails.length} properties`} />
            </div>

            {/* CF Chart */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24, marginBottom:24 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#1f2937" }}>2026 Projected Cash Flow by Property</div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[...properties].sort((a,b)=>b.cf2026-a.cf2026)} margin={{ top:10, right:10, left:10, bottom:80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:10 }} angle={-45} textAnchor="end" axisLine={false} interval={0} />
                  <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, fontSize:13 }} formatter={v => fmtFull(v)} />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                  <Bar dataKey="cf2026" radius={[4,4,0,0]}>
                    {[...properties].sort((a,b)=>b.cf2026-a.cf2026).map((p, i) => (
                      <Cell key={i} fill={p.cf2026 >= 0 ? statusColors[p.status] : "#dc2626"} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CapEx Budget Chart */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24, marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#1f2937" }}>2026 Capital Expenditure Budget</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Hover over bars for detailed breakdown · Total: {fmtFull(totalCapex)}</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={capexDetails} margin={{ top:10, right:10, left:10, bottom:80 }} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="property" tick={{ fill:"#64748b", fontSize:10 }} angle={-45} textAnchor="end" axisLine={false} interval={0} />
                  <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip
                    contentStyle={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:10, fontSize:12, maxWidth:360 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:10, padding:14, maxWidth:360, boxShadow:"0 4px 12px rgba(15,23,42,0.08)" }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:6 }}>{d.property}</div>
                          <div style={{ fontSize:18, fontWeight:700, color:"#f97316", marginBottom:8 }}>{fmtFull(d.amount)}</div>
                          <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>{d.items}</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="amount" radius={[4,4,0,0]} fill="#f97316" opacity={0.8}>
                    {capexDetails.map((c, i) => (
                      <Cell key={i} fill={c.amount > 500000 ? "#dc2626" : c.amount > 200000 ? "#f97316" : c.amount > 100000 ? "#eab308" : "#16a34a"} opacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
                {[
                  { label:"> $500k", color:"#dc2626" },
                  { label:"$200k–$500k", color:"#f97316" },
                  { label:"$100k–$200k", color:"#eab308" },
                  { label:"< $100k", color:"#16a34a" },
                ].map(l => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#94a3b8" }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:l.color, opacity:0.75 }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Liquidity Events */}
            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, padding:24 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:4, color:"#1f2937" }}>2026 Liquidity Event Projections</div>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:20 }}>Refinances, dispositions, and capital events on the horizon</div>

              <div style={{ display:"grid", gap:12 }}>
                {liquidityEvents.map(e => {
                  const isSale = e.type.toLowerCase().includes("sale");
                  const accentColor = isSale ? "#a78bfa" : "#38bdf8";
                  return (
                    <div key={e.property} onClick={() => setSelectedProp(e.property)}
                      style={{ background:"#ffffff", border:`1px solid ${accentColor}22`, borderRadius:12, padding:20, cursor:"pointer", transition:"all 0.2s", borderLeft:`4px solid ${accentColor}` }}
                      onMouseOver={ev => { ev.currentTarget.style.background="#f8fafc"; ev.currentTarget.style.borderColor=accentColor+"55"; }}
                      onMouseOut={ev => { ev.currentTarget.style.background="#ffffff"; ev.currentTarget.style.borderColor=accentColor+"22"; }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{e.property}</span>
                          <span style={{
                            display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                            background: isSale ? "rgba(167,139,250,0.15)" : "rgba(56,189,248,0.15)",
                            color: accentColor, border:`1px solid ${accentColor}33`
                          }}>
                            {e.type}
                          </span>
                          <span style={{
                            display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                            background: e.priority.startsWith("Very") ? "rgba(220,38,38,0.15)" : e.priority.startsWith("High") ? "rgba(249,115,22,0.15)" : "rgba(234,179,8,0.1)",
                            color: e.priority.startsWith("Very") ? "#f87171" : e.priority.startsWith("High") ? "#fb923c" : "#eab308",
                          }}>
                            {e.priority}
                          </span>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:13, fontWeight:700, color:accentColor }}>{e.timeline}</div>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:11, color:"#64748b", marginBottom:2 }}>Loan Balance</div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>{fmtFull(e.loanBal)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:11, color:"#64748b", marginBottom:2 }}>Current Rate</div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>{e.currentRate}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:11, color:"#64748b", marginBottom:2 }}>Est. Proceeds</div>
                          <div style={{ fontSize:14, fontWeight:600, color:accentColor }}>{e.estProceeds}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>{e.notes}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ════════════════════ REFI OPPORTUNITIES ════════════════════ */}
        {view === "refi" && !selectedProp && (
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 8px", fontFamily:"'Playfair Display', serif" }}>Refinance Opportunities</h2>
            <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Properties with above-market rates or floating exposure that may benefit from refinancing. Current Prime: 6.75% · SOFR: 3.65%</p>

            <div style={{ background:"#ffffff", border:"1px solid rgba(15,23,42,0.08)", borderRadius:14, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(15,23,42,0.09)" }}>
                    {["Property","Current Rate","Type","Loan Balance","DSC","Maturity","Rate Reset","Opportunity"].map(h => (
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#94a3b8", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refiOpps.map(p => (
                    <tr key={p.name} onClick={() => setSelectedProp(p.name)}
                      style={{ borderBottom:"1px solid rgba(15,23,42,0.06)", cursor:"pointer" }}
                      onMouseOver={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseOut={e => e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"10px 14px", fontWeight:600 }}>{p.name}</td>
                      <td style={{ padding:"10px 14px", color: p.rate >= 6 ? "#f87171" : p.rate >= 5 ? "#eab308" : "#4ade80", fontWeight:700 }}>{p.rate}%</td>
                      <td style={{ padding:"10px 14px" }}>{p.rateType === "Floating" ? <span style={{ color:"#f97316" }}>⟳ Floating</span> : "Fixed"}</td>
                      <td style={{ padding:"10px 14px" }}>{fmt(p.loanBal)}</td>
                      <td style={{ padding:"10px 14px", color: p.dsc < 1 ? "#f87171" : "#4ade80" }}>{p.dsc.toFixed(2)}x</td>
                      <td style={{ padding:"10px 14px" }}>{p.maturity} <MaturityFlag maturity={p.maturity} /></td>
                      <td style={{ padding:"10px 14px", fontSize:11, color:"#94a3b8" }}>{p.rateReset}</td>
                      <td style={{ padding:"10px 14px", fontSize:11 }}>
                        {p.rateType === "Floating" ? <span style={{ color:"#f97316" }}>Lock in fixed rate</span> :
                         p.rate >= 6.5 ? <span style={{ color:"#dc2626" }}>High priority — rate well above market</span> :
                         <span style={{ color:"#eab308" }}>Evaluate at maturity</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop:24, background:"rgba(122,154,138,0.08)", border:"1px solid rgba(122,154,138,0.24)", borderRadius:14, padding:24 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:8, color:"#456255" }}>Rate Reset Watch — 2026</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {properties.filter(p => p.rateReset && p.rateReset !== "None" && p.rateReset !== "None (life ins. loan)" && p.rateReset !== "None (CMBS)").map(p => (
                  <div key={p.name} onClick={() => setSelectedProp(p.name)}
                    style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"#ffffff", borderRadius:8, cursor:"pointer" }}
                    onMouseOver={e => e.currentTarget.style.background="#f1f5f9"}
                    onMouseOut={e => e.currentTarget.style.background="#ffffff"}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>Currently {p.rate}% {p.rateType}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:12, color:"#f97316", fontWeight:600 }}>{p.rateReset}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

# Anchor Dashboard Redesign - Visual Portfolio Management

## Mission
Transform the bland number-grid dashboard into a visually compelling, interactive portfolio management tool. Think: executive dashboard meets modern SaaS UI. Don't be afraid of color, emojis, or charts.

## Core Principles
1. **Visual First** - Charts, gauges, color-coding > plain numbers
2. **Health at a Glance** - Red/yellow/green indicators everywhere
3. **Interactive** - Click, filter, sort, drill down
4. **Mobile-Friendly** - Works on phone/tablet
5. **Action-Oriented** - Surface what needs attention NOW

## Color System (Strict)
- 🟢 **Green** (#10b981) = Healthy (DSCR >1.5, occupancy >95%, on budget)
- 🟡 **Yellow** (#f59e0b) = Watch (DSCR 1.25-1.5, occupancy 85-95%, slight over budget)
- 🔴 **Red** (#ef4444) = Concern (DSCR <1.25, occupancy <85%, over budget)
- 🔵 **Blue** (#3b82f6) = Neutral info
- **Dark slate** background (existing theme)

## Emoji System
- 🏢 Portfolio/Property
- 💰 Money/NOI/Revenue
- 🏦 Debt/Loans
- 📊 Metrics/Analytics
- 📈 Growth/Positive trend
- 📉 Decline/Negative trend
- ⚠️ Warning
- 🚨 Urgent/Critical
- ✅ Good/Complete
- ⏰ Time-sensitive
- 🔧 CapEx/Maintenance
- 👥 Occupancy/Tenants
- 📅 Schedule/Timeline

---

## Page 1: Executive Overview (Home `/`)

### Hero Stats (Top Row - 4 Cards)
Each card: large number, trend indicator, emoji, color-coded border

1. **🏢 Portfolio Value**
   - Total estimated value across all 28 properties
   - Show YoY change if available
   - Neutral blue

2. **💰 Total Annual NOI**
   - Sum of all NOI
   - Trend: ↑ if growing, ↓ if declining
   - Green if positive, yellow if flat, red if negative

3. **🏦 Total Debt Exposure**
   - Sum of all loan balances
   - Show weighted avg DSCR
   - Color-code by DSCR: 🔴 <1.25, 🟡 1.25-1.5, 🟢 >1.5

4. **👥 Portfolio Occupancy**
   - Weighted average occupancy
   - Color-code: 🔴 <85%, 🟡 85-95%, 🟢 >95%

### Alert Banners (Conditional - Show if applicable)
- 🚨 **Red Banner**: Debt maturing in <6 months (list properties)
- ⚠️ **Yellow Banner**: Properties with DSCR <1.3 (list properties)
- 🔧 **Blue Banner**: Major CapEx (>$100k) due in next 90 days (list items)

### Charts Section (2 columns)

**Left Column:**
1. **NOI by Property** (Horizontal Bar Chart)
   - All 28 properties
   - Bars color-coded by DSCR health
   - Sortable (click header to toggle: alphabetical, highest NOI, lowest DSCR)
   - Click bar → go to property detail page

2. **Debt by Lender** (Pie Chart)
   - Show concentration risk
   - Hover shows: lender name, total exposure, % of portfolio
   - Click slice → filter properties by that lender

**Right Column:**
1. **Portfolio Composition** (Pie Chart)
   - By property value or square footage (toggle)
   - Click slice → go to property detail

2. **Occupancy Distribution** (Donut Chart)
   - Green slice: >95% occupied properties
   - Yellow slice: 85-95% occupied
   - Red slice: <85% occupied
   - Center shows: avg occupancy %

### Quick Actions (Bottom)
- Button: "View Debt Maturity Timeline" → `/debt`
- Button: "View CapEx Schedule" → `/capex`
- Button: "Financial Metrics Dashboard" → `/financial-metrics`

---

## Page 2: Debt Overview (`/debt`)

### Debt Maturity Timeline (Visual Gantt)
- Horizontal timeline: current date → 10 years out
- Each loan as a horizontal bar
- Bar length = time to maturity
- Bar color = DSCR health (🔴🟡🟢)
- Bar height = loan size (bigger loans = thicker bars)
- Hover shows: property, lender, balance, maturity date, DSCR
- Click bar → expand details panel
- Vertical line at "today" for reference
- Shaded regions: <6mo (red zone), 6-12mo (yellow zone), >12mo (green zone)

### Refinancing Priority Queue (Table)
Auto-sorted by urgency score (function of: maturity date + DSCR + loan size)

Columns:
- 🏢 Property
- 🏦 Lender
- 💰 Balance
- 📅 Maturity (with countdown: "5 months")
- 📊 DSCR (color-coded badge)
- ⚠️ Action (auto-suggest: "Refinance now", "Monitor", "On track")

### Summary Cards (Top)
- Total debt
- Avg interest rate
- Next maturity date
- Properties with debt

### Filters (Sidebar)
- By property
- By lender
- By maturity year
- By DSCR range
- Show only: "due in 12mo", "troubled (DSCR <1.3)", "all"

---

## Page 3: CapEx Schedule (`/capex` - NEW PAGE)

### Multi-Year Timeline (Gantt-Style)
- Rows = properties
- Columns = months/quarters (next 3 years visible)
- Each CapEx project as a colored block
- Color by category:
  - 🔴 Critical/Structural (roof, foundation)
  - 🟡 Major (HVAC, parking lot)
  - 🟢 Routine (paint, minor repairs)
  - 🔵 Tenant Improvements
- Hover shows: project name, budget, category, status
- Click block → expand details

### CapEx Dashboard (Top Cards)
1. **Current Year Budget**
   - Total budgeted vs actual spend
   - Progress bar with color coding
   - Over budget = red

2. **Next 90 Days**
   - Total CapEx due
   - Count of projects
   - Largest upcoming project highlighted

3. **By Category** (Pie Chart)
   - Roof, HVAC, Parking, TI, etc.
   - Show budget allocation

### Upcoming Major Projects (Table)
Filter: projects >$50k or flagged as critical

Columns:
- 🏢 Property
- 🔧 Project
- 💰 Budget
- 📅 Planned Date
- Status (Planning, In Progress, Complete)
- Priority (color-coded)

### Filters
- By property
- By category
- By year
- By budget range
- Show only: "critical", "overdue", "upcoming 90d", "all"

---

## Page 4: Financial Metrics (`/financial-metrics`)

### Portfolio Performance Grid
Each metric as a card with:
- Large number
- Sparkline (mini trend chart if historical data available)
- Color indicator

Metrics:
- Total NOI
- Avg Cap Rate
- Avg DSCR
- Total Debt Service
- Portfolio Cash Flow
- Avg Occupancy
- Total Recoverable OpEx

### Property Comparison Table
Sortable, filterable table:

Columns:
- 🏢 Property (with mini occupancy gauge)
- 💰 NOI
- 📊 Cap Rate
- 🏦 DSCR (color badge)
- 👥 Occupancy (color badge)
- 📈 Cash Flow
- Action: "View Details" button

### Charts
1. **NOI vs Debt Service** (Scatter Plot)
   - X-axis: Debt Service
   - Y-axis: NOI
   - Each dot = property
   - Color = DSCR health
   - Diagonal line = break-even (DSCR = 1.0)

2. **Occupancy Trend** (Line Chart)
   - If we have historical occupancy data
   - Otherwise: current snapshot bar chart

---

## Page 5: Property Detail (`/properties/[slug]`)

### Property Header (Enhanced)
- 📸 Property photo (if available, else placeholder with emoji)
- Property name (large)
- Address
- Quick stats row:
  - Occupancy gauge (circular, color-coded)
  - DSCR badge (large, color-coded)
  - Debt maturity countdown (⏰ X months)
  - Next CapEx item (🔧 project name)

### Tabs
1. **Overview** (existing info + visual enhancements)
2. **Debt Schedule** (table, already exists - add color coding)
3. **CapEx Timeline** (property-specific Gantt)
4. **Tenants** (if we have tenant data)
5. **Financials** (NOI breakdown, OpEx, etc.)

### Visual Enhancements
- Investment thesis: display in a nice card with 📝 emoji
- Owner's intent: timeline visual (10-year plan)
- Risks: color-coded list (🔴 high, 🟡 medium, 🟢 low)
- Market rates: comparison chart (property avg vs market)

---

## Component Library (Build These)

### 1. Stat Card
- Large number display
- Label
- Trend indicator (↑↓)
- Color-coded border
- Emoji icon

### 2. Health Badge
- Small pill with emoji + text
- Color-coded background
- Used for: DSCR, occupancy, status

### 3. Gauge Chart
- Circular or semi-circular
- Color-coded zones
- Used for: occupancy, budget utilization

### 4. Timeline/Gantt Component
- Reusable for debt & CapEx
- Horizontal bars
- Zoom/pan controls
- Color coding
- Hover details

### 5. Alert Banner
- Dismissible
- Icon + message
- Color-coded (red/yellow/blue)

### 6. Property Card (Grid View)
- Photo or emoji placeholder
- Name
- Quick stats
- Color-coded health indicators
- Click to detail page

### 7. Sortable/Filterable Table
- Column headers clickable
- Filter chips
- Export to CSV button

---

## Technical Stack

### Charts Library
Use **Recharts** (already popular in Next.js ecosystem):
```bash
npm install recharts
```

Chart types needed:
- BarChart (horizontal & vertical)
- PieChart
- DonutChart (PieChart with inner radius)
- LineChart
- ScatterChart
- AreaChart (for trends)
- RadialBarChart (for gauges)

### UI Components
- Use existing Tailwind setup
- Add **@headlessui/react** for modals, dropdowns, tabs
- Add **heroicons** for icons (supplement emojis)

```bash
npm install @headlessui/react @heroicons/react
```

### Gauge/Progress Components
- Custom with SVG or use **react-circular-progressbar**

```bash
npm install react-circular-progressbar
```

### Responsive Design
- Mobile-first approach
- Grid → Stack on mobile
- Swipeable cards on mobile (use **swiper** or native CSS)

---

## Data Requirements

### Additional Fields Needed (if not already captured)
1. **Property photos** (placeholder for now, add later)
2. **Historical occupancy** (for trends - placeholder if unavailable)
3. **CapEx data** - extract from business plans:
   - Project name
   - Category (roof, HVAC, etc.)
   - Budget
   - Planned date
   - Status
4. **Property value estimates** (for portfolio composition chart)

### Data Transformations
Create utility functions:
- `calculatePortfolioStats()` - aggregate metrics
- `getDebtHealth(dscr)` - return color code
- `getOccupancyHealth(rate)` - return color code
- `sortByUrgency(loans)` - prioritize refinancing
- `getUpcomingCapEx(days)` - filter by timeframe

---

## Mobile Optimizations
- Collapsible sections
- Bottom sheet modals (instead of sidebars)
- Swipeable property cards
- Simplified charts (fewer data points on small screens)
- Sticky headers for tables
- Touch-friendly tap targets (min 44px)

---

## Accessibility
- ARIA labels for charts
- Keyboard navigation
- Color not the only indicator (use icons + text too)
- High contrast mode support
- Screen reader friendly

---

## Deployment Checklist
1. Install dependencies (recharts, headlessui, heroicons, circular-progressbar)
2. Build all new chart components
3. Build gauge/badge components
4. Build timeline/Gantt components
5. Create CapEx data extraction script (from business plans)
6. Rebuild home page with executive dashboard
7. Rebuild debt page with timeline
8. Create new CapEx page
9. Enhance financial metrics page
10. Enhance property detail pages
11. Add filters/sorting UI
12. Test on mobile (responsive)
13. Seed CapEx data (if available)
14. Build + test
15. Deploy to Vercel

---

## Notes
- Keep existing dark slate theme
- Emojis are encouraged (but supplement with icons for accessibility)
- Every number should have context (trend, comparison, health indicator)
- Click-to-detail everywhere possible
- Export/print options for executive reports
- Consider adding a "Print Portfolio Report" button (formatted PDF view)

## Success Criteria
When done, Jacob should be able to:
1. See portfolio health in <5 seconds (home page glance)
2. Identify troubled properties immediately (color coding)
3. Know what needs attention this week (alerts)
4. Plan refinancing strategy (debt timeline)
5. Budget CapEx for next year (CapEx schedule)
6. Share dashboard with investors (visual appeal + export options)

---

**Build this with energy. Make it look like a modern SaaS product, not a spreadsheet.**

# Complete Application Recreation Prompt

## PROJECT OVERVIEW

You are tasked with recreating **NestQuest** — a comprehensive Next.js 14 application that helps first-time homebuyers, repeat buyers, and refinancers understand the true costs of homeownership and avoid overpaying.

**Core Mission**: Reveal hidden costs, provide accurate affordability analysis, and help users save thousands through negotiation strategies and informed decision-making.

**Key Differentiator**: No affiliate relationships, no lead generation - pure transparency and user advocacy.

---

## TECHNICAL STACK

### Framework & Core
- **Next.js 14.0.4** (App Router)
- **React 18.2.0**
- **TypeScript 5.3.3**
- **Tailwind CSS 3.4.0**

### Key Libraries
- **react-hook-form 7.69.0** - Form management
- **zod 4.2.1** - Schema validation
- **@hookform/resolvers 5.2.2** - Form validation integration
- **framer-motion 12.23.26** - Animations
- **lucide-react 0.303.0** - Icons
- **recharts 3.6.0** - Data visualization

### Development
- **ESLint** with Next.js config
- **PostCSS** & **Autoprefixer**

---

## PROJECT STRUCTURE

```
prototype/
├── app/
│   ├── layout.tsx                    # Root layout with Inter font
│   ├── page.tsx                      # Main landing page (multi-product)
│   ├── globals.css                    # Global Tailwind styles
│   ├── homebuyer/
│   │   └── page.tsx                   # Landing page with stats & CTAs
│   ├── quiz/
│   │   ├── page.tsx                   # Main quiz flow
│   │   └── question-configs.tsx       # Question definitions
│   ├── results/
│   │   └── page.tsx                   # Results display page
│   ├── marketplace/
│   │   └── page.tsx                   # Marketplace page
│   └── professional/
│       └── page.tsx                   # Professional page
├── components/
│   ├── AIChatBot.tsx                  # Tier-aware AI chat component
│   ├── JourneyMapView.tsx             # Gamified journey visualization
│   ├── PricingTiers.tsx               # Monetization tiers display
│   ├── RefinanceResults.tsx          # Refinance analysis results
│   ├── RepeatBuyerResults.tsx         # Repeat buyer analysis results
│   └── UnifiedResultsView.tsx         # Combined journey + financial view
└── lib/
    ├── calculations.ts                 # Core affordability calculations
    ├── calculations-repeat-buyer.ts    # Repeat buyer logic
    ├── calculations-refinance.ts       # Refinance analysis
    ├── freddie-mac-rates.ts           # Real-time mortgage rate fetching
    ├── tiers.ts                       # Monetization tier system
    ├── gamification.ts                # Gamification logic
    ├── metro-zip-data.ts              # Metro/zip code data management
    ├── hosa-utils.ts                  # HOSA algorithm utilities
    └── algorithm/
        ├── hosa-core.ts               # HOSA optimization algorithm
        └── refinance-timing-engine.ts # Refinance timing intelligence
```

---

## CORE FEATURES

### 1. TRANSACTION TYPE SUPPORT
The app supports three distinct user journeys:
- **First-Time Homebuyer**: Full affordability analysis, readiness scoring, cost breakdown
- **Repeat Buyer**: Equity analysis, sale proceeds, timing strategy, capital gains
- **Refinance**: Break-even analysis, rate comparison, lifetime savings, timing optimization

### 2. QUIZ SYSTEM (`/app/quiz/page.tsx`)
- Dynamic question flow based on transaction type
- Question 0: Transaction type selection (first-time, repeat-buyer, refinance)
- Conditional questions based on selection
- Form validation with Zod schemas
- Progress tracking
- Input types: `currency`, `number`, `rate` (percentage), `radio`, `checkbox`, `income`, `slider`
- Real-time validation and error display

### 3. RESULTS PAGE (`/app/results/page.tsx`)
- Two view modes: "Standard" (detailed financial) and "Journey Map" (gamified)
- Toggle between views
- Transaction-specific results rendering
- Editable purchase price and down payment (first-time buyers)
- Real-time recalculation on input changes
- Comprehensive cost breakdowns
- Savings opportunities identification
- Action items generation
- HOSA algorithm integration (deferred execution)

### 4. CALCULATION ENGINE (`/lib/calculations.ts`)

#### Key Functions:
- `calculateAffordability(quizData)`: 
  - Uses 28/36 rule for realistic max
  - Lender max at 43% DTI
  - Iterative price calculation from payment
  - Accounts for PMI, taxes, insurance
  - **Critical**: Does NOT cap by city priceMax - allows calculated affordability to exceed city limits

- `calculateReadinessScore(quizData, affordability)`:
  - 0-100 score based on:
    - Credit score (max 30 points)
    - DTI ratio (max 25 points)
    - Down payment (max 25 points)
    - Timeline (max 10 points)
    - Savings buffer (max 10 points)

- `calculateCostBreakdown(affordability, city, downPayment, zipCode?)`:
  - Closing costs breakdown (5 categories)
  - Monthly payment components
  - Lifetime costs (30-year projection)
  - Per-month calculations (total / 360)

- `identifySavingsOpportunities(quizData, costs, affordability)`:
  - Lender shopping
  - Closing cost negotiation
  - Title insurance shopping
  - Credit improvement
  - PMI avoidance
  - Loan term optimization

- `generateActionItems(quizData, affordability, readiness)`:
  - Prioritized action items
  - Impact assessment
  - Timeframe estimates

#### Tax & Insurance Rate:
- `taxAndInsuranceRate = 0.00125` (1.5% annually / 12 months)
- **Critical**: Was previously 0.0125 (10x too high) - must be 0.00125

### 5. REPEAT BUYER CALCULATIONS (`/lib/calculations-repeat-buyer.ts`)
- Equity position analysis
- Sale proceeds calculation (net after all costs)
- Capital gains tax calculation
- Bridge loan cost estimation
- Old vs. new home comparison
- Timing strategy recommendations

### 6. REFINANCE CALCULATIONS (`/lib/calculations-refinance.ts`)
- Current situation analysis
- Market rate comparison (uses Freddie Mac PMMS data)
- Break-even analysis
- Lifetime cost comparison
- Multiple refinance options:
  - Rate and term
  - 15-year shorter term
  - Lower payment (extend term)
  - Cash-out refinance
- Recommendation engine

### 7. FREDDIE MAC RATE INTEGRATION (`/lib/freddie-mac-rates.ts`)
- Fetches real-time 30-year and 15-year fixed mortgage rates
- Uses FRED API (Federal Reserve Economic Data)
- Series: `MORTGAGE30US` and `MORTGAGE15US`
- Fallback rates (update weekly when PMMS publishes):
  - 30-year: 6.15% (as of 12/31/2025)
  - 15-year: 5.44% (as of 12/31/2025)
- 24-hour caching
- Credit score adjustments
- Refinance/investment/cash-out/LTV adjustments

### 8. MONETIZATION TIERS (`/lib/tiers.ts`)
Four tiers:
- **Explorer** (free): Basic affordability, limited features
- **Strategist**: Full cost breakdown, savings opportunities
- **Power Buyer**: Advanced analysis, negotiation scripts
- **Elite**: Everything + priority support

### 9. GAMIFICATION (`/components/JourneyMapView.tsx`)
- Visual journey map with milestones
- Progress tracking
- Achievements system
- Quest cards
- Power-ups (savings opportunities)
- Stats dashboard
- Tier-gated features

### 10. AI CHAT BOT (`/components/AIChatBot.tsx`)
- Tier-aware (5 questions free, unlimited for Strategist+)
- Floating chat button
- Keyword-based responses (ready for API integration)
- Upgrade prompts

---

## KEY DATA STRUCTURES

### QuizData (First-Time Buyer)
```typescript
{
  income: number
  monthlyDebt: number
  downPayment: number
  city: string (can be zip code - 5 digits)
  timeline: '3-months' | '6-months' | '1-year' | 'exploring'
  creditScore: 'under-600' | '600-650' | '650-700' | '700-750' | '750+'
  agentStatus: 'have-agent' | 'interviewing' | 'not-yet' | 'solo'
  concern: 'affording' | 'hidden-costs' | 'ripped-off' | 'wrong-choice' | 'timing' | 'other'
}
```

### RefinanceData
```typescript
{
  transactionType: 'refinance'
  currentHomeValue: number
  currentMortgageBalance: number
  currentRate: number
  currentMonthlyPayment: number
  yearsRemaining: number
  refinanceGoals: string[] // array of selected goals
  cashoutAmount?: number
  creditScore: CreditScoreRange
  propertyType: 'primary' | 'second-home' | 'investment'
  previousRefinances: 'never' | 'once' | 'multiple' | 'recent'
  concern: string
}
```

### RepeatBuyerData
```typescript
{
  transactionType: 'repeat-buyer'
  currentHomeValue: number
  currentMortgageBalance: number
  yearsOwned: number
  originalPurchasePrice: number
  agentCommission: number (as percentage, e.g., 6 for 6%)
  // ... other fields
}
```

---

## QUESTION CONFIGURATIONS

### Transaction Type Question (Question 0)
- Type: `transaction-type`
- Options: First-Time Homebuyer, Repeat Buyer, Refinance
- Always shown first

### First-Time Buyer Questions (9 questions after type selection)
1. Annual household income (`income`) - type: `income`, min: 30000, max: 1000000
2. Monthly debt payments (`monthlyDebt`) - type: `currency`, no quick insight
3. Down payment/savings (`downPayment`) - type: `currency`
4. City or zip code (`city`) - type: `text`
5. Timeline (`timeline`) - type: `radio`
6. Credit score (`creditScore`) - type: `radio`
7. Agent status (`agentStatus`) - type: `radio`
8. Biggest concern (`concern`) - type: `radio`
9. Purchase price (optional) - type: `currency`

### Repeat Buyer Questions (12 questions)
1. Current home value - type: `slider` or `currency`
2. Current mortgage balance - type: `currency`, min: 20000
3. Years owned - type: `number`
4. Original purchase price - type: `currency`
5. Agent commission - type: `rate` (percentage), placeholder: "6"
6. ... (see question-configs.tsx for full list)

### Refinance Questions (12 questions)
1. Current home value - type: `slider`
2. Current mortgage balance - type: `currency`, placeholder: "$200,000"
3. Current interest rate - type: `rate`, placeholder: "6.5"
4. Current monthly payment - type: `currency`
5. Years remaining - type: `number`
6. Refinance goals - type: `checkbox` (multiple selection)
7. Cash-out amount (if applicable) - type: `currency`, min: 0, max: 500000
8. Credit score - type: `radio`
9. Property type - type: `radio`
10. Previous refinances - type: `radio`
11. Biggest concern - type: `radio`
12. (Additional questions as needed)

**Important**: 
- Q2 (monthlyDebt) for first-time buyers: `getInsight: undefined` (no quick insight)
- Q1 (income) for first-time buyers: `getInsight: undefined` (no quick insight)
- Q2 for repeat buyers: `getInsight: undefined`
- Q2 for refinance: `getInsight: undefined`

---

## STYLING & DESIGN

### Color Scheme
- Background: `#0a0a0a` (near black)
- Text: `#f5f5f5` (off-white)
- Primary accent: `#06b6d4` (cyan)
- CTA: `#f97316` (orange)
- Success: `#10b981` (green)
- Error: `red-400`
- Gray scale: `gray-400`, `gray-500`, `gray-800`, `gray-900`

### Typography
- Font: Inter (from Google Fonts)
- Headings: Bold, large (text-3xl to text-7xl)
- Body: text-base to text-lg
- Responsive: md: and lg: breakpoints

### Animations
- Framer Motion for all animations
- Stagger animations for lists
- Scroll-triggered animations (useInView)
- Hover effects on interactive elements

### Responsive Design
- Mobile-first approach
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Font sizes scale: `text-sm md:text-base lg:text-lg`
- Padding: `px-4 sm:px-6 lg:px-8`

---

## ROUTING STRUCTURE

- `/` - Main landing (multi-product)
- `/homebuyer` - Homebuyer landing page with stats and CTAs
- `/quiz` - Quiz flow (transaction type selection + questions)
- `/results` - Results page (with view mode toggle)
- `/marketplace` - Marketplace page
- `/professional` - Professional page

### URL Parameters (Results Page)
- `transactionType`: 'first-time' | 'repeat-buyer' | 'refinance'
- All quiz answers passed as URL params
- Arrays JSON-stringified (e.g., `refinanceGoals`)

---

## KEY ALGORITHMS

### 1. Affordability Calculation
**File**: `lib/calculations.ts` - `calculateAffordability()`

**Logic**:
1. Calculate monthly income: `income / 12`
2. Apply 28/36 rule:
   - Front-end max: 28% of income
   - Back-end max: 36% of income - existing debt
   - Realistic max: `min(frontEndMax, backEndMax)`
3. Lender max: 43% DTI - existing debt
4. Use `calculateMaxPriceFromPayment()` to convert payment to home price:
   - Iterative approach (20 iterations)
   - Accounts for down payment as percentage
   - Includes PMI calculation
   - Tax/insurance rate: 0.00125 (1.5% annually / 12)
5. **Critical**: Do NOT cap by `cityData.priceMax` - use `cityData.priceMin` as floor only

### 2. Max Price from Payment
**File**: `lib/calculations.ts` - `calculateMaxPriceFromPayment()`

**Logic**:
- Iterative binary search
- Start at $200,000, step = $100,000
- For each price:
  - Calculate loan amount = price - downPayment
  - Calculate P&I using mortgage formula
  - Calculate taxes/insurance = price * 0.00125
  - Calculate PMI if LTV > 80%
  - Total payment = P&I + taxes + insurance + PMI
  - Compare to target payment
  - Adjust price and reduce step
- Return best match

### 3. HOSA Algorithm
**File**: `lib/algorithm/hosa-core.ts`

- Homebuyer Optimization & Strategy Algorithm
- Deferred execution (useEffect with requestIdleCallback)
- Optimizes multiple variables simultaneously
- Returns optimization recommendations

### 4. Refinance Timing Engine
**File**: `lib/algorithm/refinance-timing-engine.ts`

- Monitors 23 variables
- Determines optimal refinance timing
- Break-even analysis
- Market timing intelligence
- Historical context
- Action plan generation

---

## CRITICAL IMPLEMENTATION DETAILS

### 1. Form Handling (Quiz Page)
- Use `react-hook-form` with Zod resolver
- For currency inputs: `valueAsNumber: true` in register options
- Dynamic question list based on transaction type
- Progress calculation: `(currentQuestion + 1) / totalQuestions`
- Validation errors displayed inline
- "Show Me The Truth" button on last question

### 2. Results Page State Management
- Use `useSearchParams()` for URL params
- **Critical**: Serialize `searchParams` to string for `useMemo` dependencies to prevent infinite loops
- Memoize all expensive calculations
- Defer HOSA algorithm execution
- Separate state for editable values (purchase price, down payment)

### 3. Currency Formatting
- Use `formatCurrency()` function from calculations.ts
- Always round to whole dollars: `Math.round(value)`
- Include commas: `value.toLocaleString()`
- Format: `$123,456`

### 4. Per-Month Calculations
- Total per-month = `totalCost / 360` (30 years * 12 months)
- Individual category per-month = `categoryTotal / 360`
- Round appropriately for display

### 5. Journey Map View
- Font sizes: Use responsive classes (text-sm, text-base, text-lg, text-xl, text-2xl)
- Icon sizes: 16px, 20px, 24px (not 32px)
- Popup overlap prevention: Alternate label positions, z-index management
- Container height: `min-h-[600px]` (not 500px)

### 6. Freddie Mac Rate Fetching
- Primary: FRED API with `MORTGAGE30US` and `MORTGAGE15US` series
- Requires `NEXT_PUBLIC_FRED_API_KEY` environment variable
- Fallback: Hardcoded current PMMS rates (update weekly)
- Cache duration: 24 hours
- Credit score adjustments applied to base rate

### 7. Error Handling
- Try-catch blocks around async operations
- Fallback UI for missing data
- Console logging for debugging (prefixed with `[ComponentName]`)
- Graceful degradation

---

## VALIDATION RULES

### Zod Schemas
- Transaction-specific schemas using discriminated unions
- Required fields validated
- Numeric ranges enforced
- Arrays handled for checkbox inputs
- Optional fields properly typed

### Input Validation
- Currency: Must be positive number
- Rate: 0-20% range
- Credit score: Enum of valid ranges
- City: Non-empty string (can be zip code)

---

## PERFORMANCE OPTIMIZATIONS

1. **Memoization**: All expensive calculations wrapped in `useMemo`
2. **Deferred Execution**: HOSA algorithm runs in `useEffect` with `requestIdleCallback`
3. **Stable Dependencies**: Serialize objects to strings for `useMemo` dependencies
4. **Lazy Loading**: Components loaded as needed
5. **Caching**: Freddie Mac rates cached for 24 hours

---

## MONETIZATION INTEGRATION

### Tier System
- Default tier: 'free' (Explorer)
- Features gated by `hasFeature(tier, featureName)`
- Upgrade modal triggered by `onUpgrade` callback
- Pricing tiers component shows feature comparison

### Tier Features
- Explorer: Basic affordability, limited savings opportunities
- Strategist: Full breakdown, all savings opportunities, unlimited AI chat
- Power Buyer: + Negotiation scripts, advanced analysis
- Elite: + Priority support, exclusive features

---

## TESTING CHECKLIST

When recreating, verify:
1. ✅ All three transaction types work (first-time, repeat-buyer, refinance)
2. ✅ Quiz flow completes without errors
3. ✅ Results page displays correctly for each type
4. ✅ View toggle works (Standard ↔ Journey Map)
5. ✅ Editable purchase price recalculates costs
6. ✅ Per-month amounts tie to totals
7. ✅ Currency formatting includes commas
8. ✅ Freddie Mac rates fetch correctly (or use fallback)
9. ✅ All stats display on landing page
10. ✅ CTAs link to quiz correctly
11. ✅ Responsive design works on mobile
12. ✅ No infinite re-render loops
13. ✅ Form validation works
14. ✅ Error states display properly

---

## ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_FRED_API_KEY=your_fred_api_key_here
```

Get free API key from: https://fred.stlouisfed.org/docs/api/api_key.html

---

## CRITICAL BUGS TO AVOID

1. **Tax/Insurance Rate**: Must be `0.00125` NOT `0.0125`
2. **Affordability Capping**: Don't cap by `cityData.priceMax` - use as reference only
3. **useSearchParams Dependencies**: Serialize to string to prevent infinite loops
4. **Currency Parsing**: Use `valueAsNumber: true` for currency inputs
5. **Per-Month Calculations**: Divide by 360, not 12
6. **Down Payment**: Calculate as percentage of price in iterations, not fixed amount
7. **PMI Calculation**: Only if LTV > 80%, rate = 0.75% annually

---

## ADDITIONAL NOTES

- All dollar amounts rounded to whole dollars
- Placeholders include commas (e.g., "250,000")
- Quick insights removed from Q1 and Q2 for first-time buyers
- Quick insights removed from Q2 for repeat buyers and refinance
- Agent commission input is percentage (type: `rate`), not dollar amount
- Current mortgage balance min: $20,000 for repeat buyers
- Refinance Q2 (currentMortgageBalance) is currency input, not slider
- Cash-out amount is currency input with min: 0, max: 500000

---

## STARTING POINTS

1. **Setup**: `npm install` with dependencies listed
2. **Landing Page**: Start with `/app/homebuyer/page.tsx` - has all stats and CTAs
3. **Quiz Flow**: Build `/app/quiz/page.tsx` with transaction type selection first
4. **Calculations**: Implement core affordability logic in `/lib/calculations.ts`
5. **Results**: Build results page with both view modes
6. **Components**: Create reusable components as needed

---

## SUCCESS CRITERIA

The recreated app should:
- ✅ Handle all three transaction types seamlessly
- ✅ Provide accurate financial calculations
- ✅ Display beautiful, responsive UI
- ✅ Guide users through complete journey
- ✅ Show real-time mortgage rates
- ✅ Identify savings opportunities
- ✅ Provide actionable insights
- ✅ Work without errors or infinite loops
- ✅ Match the design aesthetic (dark theme, cyan accents)
- ✅ Be performant and optimized

---

**END OF PROMPT**

This prompt contains all information needed to recreate NestQuest from scratch. Follow the structure, implement the calculations accurately, and ensure all features work as described.


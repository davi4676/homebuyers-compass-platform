# AI & Marketplace Implementation Plan

## Table of Contents
1. [Compass Copilot - Conversational AI](#compass-copilot---conversational-ai)
2. [Financial Health Analyzer](#financial-health-analyzer)
3. [Localized Closing Cost Marketplace](#localized-closing-cost-marketplace)
4. [Data Sourcing Strategy](#data-sourcing-strategy)
5. [User Stories & Data Flows](#user-stories--data-flows)

---

## Compass Copilot - Conversational AI

### Overview

The Compass Copilot is a central, conversational AI interface accessible on every page of the B2C platform. It understands complex, natural language queries about the homebuying process, properties, and finances, and can execute commands like filtering listings based on nuanced criteria.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query (Natural Language)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Intent Recognition & Context Gathering          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Intent     │  │   Entity     │  │   Context    │      │
│  │   Classifier │  │   Extractor  │  │   Builder    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Tool Selection & Action Execution               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Property   │  │   Financial  │  │   Action     │      │
│  │   Search     │  │   Analysis   │  │   Plan       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lender     │  │   Professional│  │   Marketplace│      │
│  │   Finder     │  │   Matching   │  │   Search     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM Response Generation (GPT-4)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Response   │  │   Follow-up  │  │   Proactive  │      │
│  │   Formatter  │  │   Questions  │  │   Suggestions│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Core Capabilities

#### 1. Natural Language Property Search

**Example Queries:**
- "Show me 3-bedroom houses under $400k in good school districts near downtown"
- "Find properties that are within 30 minutes of my work address"
- "What's the cheapest house I could buy with my current credit score?"
- "Show me homes that increased in value the most in the last year"

**Implementation:**
```typescript
interface CopilotPropertyQuery {
  intent: 'property_search' | 'property_info' | 'comparison';
  criteria: {
    bedrooms?: number;
    bathrooms?: number;
    priceRange?: { min: number; max: number };
    location?: {
      type: 'zip' | 'city' | 'radius' | 'neighborhood';
      value: string;
    };
    features?: string[];
    schools?: { rating?: number };
  };
  userContext: {
    readinessScore: number;
    budget: number;
    savedProperties: string[];
  };
}
```

#### 2. Financial Guidance

**Example Queries:**
- "How much can I afford with my current income?"
- "What would my monthly payment be on a $350k house with 5% down?"
- "How much should I save before buying?"
- "Compare renting vs buying for me"

**Implementation:**
```typescript
interface CopilotFinancialQuery {
  intent: 'affordability' | 'payment_calc' | 'comparison' | 'advice';
  userFinancialData: {
    income: number;
    expenses: number;
    creditScore: number;
    savings: number;
    debt: number;
  };
  propertyContext?: {
    price: number;
    downPayment: number;
    interestRate: number;
  };
}
```

#### 3. Process Guidance

**Example Queries:**
- "What's my next step in the homebuying process?"
- "Do I need to get pre-approved before looking at houses?"
- "What documents do I need for a mortgage application?"
- "Explain closing costs to me"

### Technical Implementation

#### Prompt Engineering Strategy

```typescript
const SYSTEM_PROMPT = `
You are the Compass Copilot, an AI assistant helping first-time homebuyers 
navigate their journey. You are knowledgeable, empathetic, and proactive.

Your capabilities include:
1. Searching and filtering properties based on natural language queries
2. Providing financial analysis and calculations
3. Guiding users through the homebuying process
4. Matching users with professionals (agents, lenders) when appropriate
5. Answering questions about mortgages, down payments, closing costs, etc.

Always:
- Provide specific, actionable advice
- Reference the user's current progress in their action plan
- Suggest next steps when relevant
- Be conversational but professional
- When you need to execute actions, use the provided tools
`;

const CONTEXT_BUILDER = {
  getUserProgress: async (userId: string) => {
    // Fetch user's current milestone, readiness score, saved properties
  },
  getFinancialSnapshot: async (userId: string) => {
    // Fetch current financial health data
  },
  getRecentActivity: async (userId: string) => {
    // Fetch recent searches, interactions, saved items
  }
};
```

#### Function Calling (Tool Use)

The Copilot uses OpenAI's function calling feature to execute actions:

```typescript
const COPILOT_TOOLS = [
  {
    name: 'search_properties',
    description: 'Search for properties based on criteria',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        priceRange: { type: 'object' },
        bedrooms: { type: 'number' },
        // ... other filters
      }
    }
  },
  {
    name: 'calculate_monthly_payment',
    description: 'Calculate mortgage monthly payment',
    parameters: {
      type: 'object',
      properties: {
        homePrice: { type: 'number' },
        downPayment: { type: 'number' },
        interestRate: { type: 'number' },
        loanTerm: { type: 'number' }
      }
    }
  },
  {
    name: 'get_readiness_score',
    description: 'Get user\'s current financial readiness score',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'suggest_professional',
    description: 'Suggest matching real estate agents or lenders',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['agent', 'lender'] },
        criteria: { type: 'object' }
      }
    }
  }
];
```

### Conversation Context Management

```typescript
interface ConversationContext {
  userId: string;
  conversationId: string;
  messages: Message[];
  currentIntent: string;
  entities: Record<string, any>;
  userState: {
    currentMilestone: string;
    readinessScore: number;
    savedProperties: string[];
    budget: number;
  };
}

// Context is maintained across conversation turns
// Vector embeddings stored for semantic search of conversation history
```

---

## Financial Health Analyzer

### Overview

The Financial Health Analyzer integrates with financial data APIs (e.g., Plaid) to analyze a user's connected accounts, generate a personalized "Readiness Score," and create a dynamic, tailored action plan with specific, data-driven recommendations.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Financial Data Aggregation                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Plaid      │  │   Manual     │  │   Credit     │      │
│  │   Integration│  │   Entry      │  │   Check      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Processing & Analysis                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Account    │  │   Income     │  │   Debt       │      │
│  │   Aggregation│  │   Analysis   │  │   Analysis   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Readiness Score Calculation                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Credit     │  │   Savings    │  │   Income     │      │
│  │   Score (30%)│  │   Score (25%)│  │   Score (25%)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Debt       │  │   Stability  │                        │
│  │   Score (10%)│  │   Score (10%)│                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Personalized Action Plan Generation             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Weakness   │  │   Specific   │  │   Priority   │      │
│  │   Detection  │  │   Actions    │  │   Ranking    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Readiness Score Algorithm

```typescript
interface ReadinessScoreComponents {
  creditScore: number;      // 0-100 (30% weight)
  savingsScore: number;     // 0-100 (25% weight)
  incomeScore: number;      // 0-100 (25% weight)
  debtScore: number;        // 0-100 (10% weight)
  stabilityScore: number;   // 0-100 (10% weight)
}

function calculateReadinessScore(components: ReadinessScoreComponents): number {
  const weights = {
    credit: 0.30,
    savings: 0.25,
    income: 0.25,
    debt: 0.10,
    stability: 0.10
  };
  
  return Math.round(
    components.creditScore * weights.credit +
    components.savingsScore * weights.savings +
    components.incomeScore * weights.income +
    components.debtScore * weights.debt +
    components.stabilityScore * weights.stability
  );
}

function calculateCreditScore(creditScore: number): number {
  if (creditScore >= 740) return 100;
  if (creditScore >= 720) return 90;
  if (creditScore >= 700) return 75;
  if (creditScore >= 680) return 60;
  if (creditScore >= 660) return 45;
  return Math.max(0, (creditScore / 660) * 40);
}

function calculateSavingsScore(
  monthlyIncome: number,
  savings: number,
  targetHomePrice: number
): number {
  const downPaymentTarget = targetHomePrice * 0.20; // 20% down
  const closingCosts = targetHomePrice * 0.03; // ~3% closing costs
  const totalNeeded = downPaymentTarget + closingCosts + (monthlyIncome * 3); // 3mo emergency
  
  const percentageSaved = Math.min(100, (savings / totalNeeded) * 100);
  return Math.round(percentageSaved);
}
```

### Action Plan Generation

```typescript
interface ActionPlanRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  specificAction: string;
  targetValue?: number;
  currentValue?: number;
  estimatedTimeframe: string;
  relatedMilestone?: string;
}

function generateRecommendations(
  userFinancialData: FinancialData,
  readinessScore: ReadinessScoreComponents
): ActionPlanRecommendation[] {
  const recommendations: ActionPlanRecommendation[] = [];
  
  // Credit Score Improvement
  if (readinessScore.creditScore < 75) {
    const pointsNeeded = 740 - userFinancialData.creditScore;
    recommendations.push({
      id: 'credit-improvement',
      title: 'Improve Credit Score',
      description: `Your credit score of ${userFinancialData.creditScore} is below the ideal range.`,
      priority: 'high',
      estimatedImpact: `Raising your score to 720+ could save $150-300/month on mortgage payments.`,
      specificAction: `Pay down credit card balances to below 30% utilization. Focus on ${userFinancialData.highestBalanceCard}.`,
      targetValue: 720,
      currentValue: userFinancialData.creditScore,
      estimatedTimeframe: '3-6 months'
    });
  }
  
  // Savings Gap
  if (readinessScore.savingsScore < 60) {
    const monthlySavingsTarget = calculateMonthlySavingsGoal(userFinancialData);
    recommendations.push({
      id: 'increase-savings',
      title: 'Increase Savings Rate',
      description: `You need to save more for your down payment and closing costs.`,
      priority: 'high',
      estimatedImpact: `Saving $${monthlySavingsTarget}/month for 12 months will get you ready.`,
      specificAction: `Set up automatic transfer of $${monthlySavingsTarget} to a dedicated savings account each month.`,
      targetValue: monthlySavingsTarget * 12,
      currentValue: userFinancialData.savings,
      estimatedTimeframe: '12 months'
    });
  }
  
  // Debt Reduction
  if (readinessScore.debtScore < 70) {
    recommendations.push({
      id: 'reduce-debt',
      title: 'Reduce Debt-to-Income Ratio',
      description: `Your DTI ratio is ${userFinancialData.debtToIncome}%, which may limit loan options.`,
      priority: 'medium',
      estimatedImpact: `Getting DTI below 36% will improve loan terms and increase buying power.`,
      specificAction: `Focus on paying off ${userFinancialData.highestInterestDebt} first using the avalanche method.`,
      estimatedTimeframe: '6-12 months'
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
```

### Plaid Integration Flow

```typescript
// 1. Initialize Plaid Link
const plaidLink = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: 'Homebuyer\'s Compass',
  products: ['transactions', 'auth'],
  country_codes: ['US'],
  language: 'en'
});

// 2. User connects accounts via Plaid Link UI
// 3. Exchange public token for access token
const { access_token } = await plaidClient.itemPublicTokenExchange({
  public_token: publicToken
});

// 4. Fetch account data
const accounts = await plaidClient.accountsGet({ access_token });
const transactions = await plaidClient.transactionsGet({
  access_token,
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});

// 5. Analyze and calculate financial health
const financialData = analyzeFinancialData(accounts, transactions);
const readinessScore = calculateReadinessScore(financialData);
```

---

## Localized Closing Cost Marketplace

### UI/UX Specification

#### Landing Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Homebuyer's Compass              [User Menu]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Closing Cost Marketplace                                    │
│  Compare prices and book services for your home purchase    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Property Information                               │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Address:     │  │ Purchase     │               │    │
│  │  │ [_______]    │  │ Price:       │               │    │
│  │  └──────────────┘  │ [$______]    │               │    │
│  │                     └──────────────┘               │    │
│  │  [Calculate Estimates]                             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### Service Comparison Tab Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Service Tabs: [Title Insurance] [Home Insurance] [Warranty]│
│              [Inspections] [Attorney]                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Title Insurance Services                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Provider Comparison Table                          │    │
│  ├──────────┬──────────┬──────────┬──────────┬───────┤    │
│  │ Provider │ Base     │ Enhanced │ Service  │ [Book]│    │
│  │          │ Policy   │ Policy   │ Call Fee │       │    │
│  ├──────────┼──────────┼──────────┼──────────┼───────┤    │
│  │ ⭐ ABC   │ $850     │ $1,250   │ $0       │ [Book]│    │
│  │ Title    │          │          │          │       │    │
│  ├──────────┼──────────┼──────────┼──────────┼───────┤    │
│  │ DEF Title│ $900     │ $1,300   │ $0       │ [Book]│    │
│  ├──────────┼──────────┼──────────┼──────────┼───────┤    │
│  │ GHI Title│ $800     │ $1,200   │ $50      │ [Book]│    │
│  └──────────┴──────────┴──────────┴──────────┴───────┘    │
│                                                              │
│  [View Detailed Comparison]  [Filter by Rating]             │
└─────────────────────────────────────────────────────────────┘
```

#### Detailed Service View

```
┌─────────────────────────────────────────────────────────────┐
│  ABC Title Company                        [Back] [Book Now]  │
├─────────────────────────────────────────────────────────────┤
│  ⭐⭐⭐⭐⭐ (4.8) | 245 reviews | Licensed in CA              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Pricing Breakdown                                  │    │
│  │ Base Title Insurance:        $850                  │    │
│  │ Enhanced Coverage (opt):     +$400                 │    │
│  │ ─────────────────────────────────                  │    │
│  │ Estimated Total:             $850-$1,250           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  What's Included:                                           │
│  • Title search and examination                            │
│  • Owner's title insurance policy                          │
│  • Lender's title insurance                                │
│  • Closing coordination                                    │
│                                                              │
│  Compass Guarantee: 5% cashback on closing                 │
│                                                              │
│  [Read Reviews]  [View License]  [Compare with Others]      │
└─────────────────────────────────────────────────────────────┘
```

### Service Categories & Data Structure

#### 1. Title Insurance

```typescript
interface TitleInsuranceQuote {
  providerId: string;
  providerName: string;
  basePolicyPrice: number;        // Owner's title insurance
  lenderPolicyPrice: number;      // Lender's title insurance
  enhancedPolicyPrice?: number;   // Extended coverage
  serviceCallFee: number;
  estimatedTotal: {
    min: number;
    max: number;
  };
  coverageDetails: {
    baseCoverage: string[];
    enhancedCoverage?: string[];
  };
  ratings: {
    overall: number;
    reviews: number;
    customerSatisfaction: number;
  };
  specialOffers?: {
    compassCashback: number;      // Percentage
    firstTimeBuyerDiscount?: number;
  };
}
```

#### 2. Homeowners Insurance

```typescript
interface HomeInsuranceQuote {
  providerId: string;
  providerName: string;
  annualPremium: number;
  monthlyPremium: number;
  deductible: number;
  coverageAmount: number;
  coverageTypes: {
    dwelling: boolean;
    personalProperty: boolean;
    liability: boolean;
    additionalLivingExpenses: boolean;
  };
  discounts: string[];            // e.g., ["Bundle", "Security System"]
  zipCodeAverage: number;         // Average for this ZIP
  ratings: {
    overall: number;
    claimsSatisfaction: number;
    financialStrength: string;    // AM Best rating
  };
}
```

#### 3. Home Warranty Plans

```typescript
interface HomeWarrantyQuote {
  providerId: string;
  providerName: string;
  planName: string;
  annualCost: number;
  monthlyCost: number;
  serviceCallFee: number;
  coverage: {
    appliances: string[];
    systems: string[];            // HVAC, plumbing, electrical
    optionalAddOns?: string[];
  };
  coverageLimits: {
    perItem: number;
    perYear: number;
  };
  ratings: {
    overall: number;
    serviceResponseTime: string;
    customerSatisfaction: number;
  };
}
```

#### 4. Inspection Services

```typescript
interface InspectionServiceQuote {
  providerId: string;
  providerName: string;
  inspectorName: string;
  services: {
    standard: {
      price: number;
      duration: string;
      includes: string[];
    };
    radon?: {
      price: number;
      addOnPrice: number;
    };
    sewer?: {
      price: number;
      addOnPrice: number;
    };
    pest?: {
      price: number;
      addOnPrice: number;
    };
  };
  totalPrice: {
    standardOnly: number;
    withAllAddOns: number;
  };
  availability: {
    nextAvailableDate: Date;
    bookingLeadTime: string;
  };
  ratings: {
    overall: number;
    thoroughness: number;
    reportQuality: number;
  };
  certifications: string[];
}
```

#### 5. Attorney Fees

```typescript
interface AttorneyFeeQuote {
  providerId: string;
  providerName: string;
  feeStructure: 'flat' | 'hourly' | 'percentage';
  flatFee?: number;
  hourlyRate?: number;
  percentageRate?: number;
  estimatedTotal: number;
  includes: string[];
  additionalServices?: {
    name: string;
    price: number;
  }[];
  typicalTimeframe: string;
  ratings: {
    overall: number;
    responsiveness: number;
    expertise: number;
  };
}
```

---

## Data Sourcing Strategy

### Strategy Overview

The marketplace uses a **hybrid approach** combining API integrations, manual curation, and provider-submitted data.

### 1. API-Driven Services (Real-Time Pricing)

#### Homeowners Insurance
- **Primary API**: The Zebra API or PolicyGenius API
- **Fallback**: Manual curation from major carriers' websites
- **Update Frequency**: Real-time for quotes, monthly for average ZIP code data
- **Coverage**: Top 5-10 carriers per market (State Farm, Allstate, Progressive, etc.)

```typescript
async function fetchInsuranceQuotes(
  propertyAddress: string,
  zipCode: string,
  homeValue: number
): Promise<HomeInsuranceQuote[]> {
  // Call The Zebra API
  const response = await zebraAPI.getQuotes({
    address: propertyAddress,
    homeValue,
    coverageType: 'homeowners'
  });
  
  // Transform API response to our data model
  return response.quotes.map(quote => ({
    providerId: quote.carrier_id,
    providerName: quote.carrier_name,
    annualPremium: quote.annual_premium,
    monthlyPremium: quote.monthly_premium,
    // ... map other fields
  }));
}
```

### 2. Provider-Submitted Data (Service Provider Portal)

#### Title Companies, Inspectors, Attorneys
- **Data Source**: Service providers manage their own listings and pricing in the B2B portal
- **Verification**: Manual verification of licenses before activation
- **Update Frequency**: Providers can update pricing in real-time
- **Quality Control**: Regular audits and user reviews

```typescript
// Service Provider Portal - Price Management
interface ServiceProviderPricingInterface {
  // Provider can set base prices and ranges
  updateBasePrice(serviceCategoryId: string, price: number): void;
  
  // Provider can set location-based pricing
  updateLocalPricing(
    zipCode: string,
    basePrice: number,
    priceRange: { min: number; max: number }
  ): void;
  
  // Provider can set special offers
  setSpecialOffer(
    offer: {
      type: 'cashback' | 'discount';
      amount: number;
      validUntil: Date;
    }
  ): void;
}
```

### 3. Manual Curation & Aggregation

#### Initial Data Load
- **Title Insurance**: Research top 3-5 title companies per major market, input baseline pricing
- **Home Warranty**: Curate data from top 5 national providers (American Home Shield, Choice, etc.)
- **Attorney Fees**: Research state/county-specific average flat fees for real estate closings

#### Ongoing Maintenance
- **Crowdsourced Updates**: Allow users to submit pricing corrections (with verification)
- **Professional Updates**: B2B professionals can suggest updates
- **Market Research**: Quarterly research updates for baseline comparisons

### Data Quality & Validation

```typescript
interface PricingDataValidation {
  // Validate price ranges are reasonable
  validatePriceRange(price: number, category: string, location: string): boolean;
  
  // Check for outdated pricing
  checkDataFreshness(lastUpdated: Date): boolean;
  
  // Verify provider licenses
  verifyProviderLicense(providerId: string, licenseNumbers: string[]): Promise<boolean>;
  
  // Flag suspicious pricing
  detectAnomalies(newPrice: number, historicalPrices: number[]): boolean;
}
```

---

## User Stories & Data Flows

### User Story 1: Compass Copilot Property Search

**As a** first-time homebuyer  
**I want to** search for properties using natural language  
**So that** I can find homes that match my vague, evolving criteria  

**Flow:**
```
1. User types: "Show me houses under $400k with good schools"
   ↓
2. Copilot processes query:
   - Intent: property_search
   - Entities: { priceMax: 400000, schoolRating: "good" }
   - Context: User's saved location preferences
   ↓
3. Copilot calls search_properties tool:
   - Filters: price < 400000, schoolRating >= 8/10
   - Location: User's preferred areas (from profile)
   ↓
4. Property service returns matching properties
   ↓
5. Copilot formats response:
   "I found 12 homes under $400k in areas with highly-rated schools. 
    Here are the top 3 matches based on your preferences..."
   ↓
6. User can refine: "Make sure they have at least 2 bathrooms"
   ↓
7. Copilot updates search filters and returns refined results
```

**Data Flow:**
```
User Input → Copilot API → Intent Classification → 
Tool Selection → Property Service → Database Query → 
Results → LLM Formatting → User Response
```

### User Story 2: Financial Health Analysis & Action Plan

**As a** homebuyer  
**I want to** understand my financial readiness and get specific steps to improve  
**So that** I can make informed decisions about when I'm ready to buy  

**Flow:**
```
1. User connects bank accounts via Plaid
   ↓
2. System aggregates:
   - Account balances
   - Transaction history (6 months)
   - Income patterns
   - Spending patterns
   ↓
3. Financial Health Analyzer calculates:
   - Credit score (from credit check API)
   - Debt-to-income ratio
   - Savings rate
   - Emergency fund adequacy
   ↓
4. Readiness Score calculated (0-100)
   ↓
5. Weakness analysis identifies gaps:
   - Credit score: 680 (target: 720)
   - Savings: $15k (need: $45k for $300k home)
   - DTI: 42% (target: <36%)
   ↓
6. Action Plan Generator creates recommendations:
   - "Improve credit score to 720 to save $150/month"
   - "Save $2,500/month for 12 months"
   - "Pay down $5k in credit card debt"
   ↓
7. Recommendations linked to milestones in action plan
   ↓
8. User sees personalized dashboard with progress tracking
```

**Data Flow:**
```
Plaid Webhook → Account Data → Financial Aggregation Service →
Credit Check API → Readiness Score Calculator → 
Recommendation Engine → Action Plan Service → 
Database (User Profile, Milestones) → Frontend Dashboard
```

### User Story 3: Closing Cost Marketplace Comparison

**As a** homebuyer who just had an offer accepted  
**I want to** compare and book closing cost services  
**So that** I can save money and streamline the process  

**Flow:**
```
1. User navigates to Closing Cost Marketplace
   ↓
2. User enters property address and purchase price
   ↓
3. System determines ZIP code and property characteristics
   ↓
4. Marketplace Service fetches quotes:
   - Title Insurance: API calls + provider-submitted data
   - Home Insurance: The Zebra API
   - Inspections: Provider-submitted data (filtered by ZIP)
   - Home Warranty: Curated data (national providers)
   - Attorney Fees: Manual curation (state/county averages)
   ↓
5. Results displayed in comparison table
   ↓
6. User can:
   - Filter by rating, price, features
   - View detailed provider profiles
   - See "Compass Guarantee" cashback offers
   ↓
7. User clicks "Book" on a service
   ↓
8. System:
   - Creates service request
   - Sends notification to provider (if provider-submitted)
   - For API services (insurance), redirects to carrier's site
   - Schedules inspection (if applicable)
   ↓
9. User receives confirmation and tracking
```

**Data Flow:**
```
User Input (Address/Price) → Location Service → ZIP Code →
Marketplace Service → [API Calls | Database Query | Manual Data] →
Quote Aggregation → Comparison Engine → 
Frontend Display → Booking Action → 
Service Booking Service → Provider Notification
```

---

## Implementation Timeline

### Phase 2A: Compass Copilot (Weeks 1-4)
- Week 1-2: OpenAI integration, basic prompt engineering
- Week 3: Function calling implementation (property search, calculations)
- Week 4: Conversation context management, UI integration

### Phase 2B: Financial Health Analyzer (Weeks 5-8)
- Week 5: Plaid integration setup
- Week 6: Data aggregation and analysis algorithms
- Week 7: Readiness score calculation
- Week 8: Action plan generation and UI

### Phase 2C: Closing Cost Marketplace (Weeks 9-12)
- Week 9: Service provider portal for data entry
- Week 10: API integrations (The Zebra, initial manual curation)
- Week 11: Comparison UI and booking flow
- Week 12: Testing and refinements

---

*This document serves as the technical specification for AI and marketplace features. Implementation details and API contracts will be documented separately in the development repository.*


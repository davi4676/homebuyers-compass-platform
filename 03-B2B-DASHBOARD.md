# B2B Dashboard Wireframe & Feature Specs

## Table of Contents
1. [Compass Pro Dashboard Overview](#compass-pro-dashboard-overview)
2. [Professional Portal & Onboarding](#professional-portal--onboarding)
3. [Service Provider Portal](#service-provider-portal)
4. [Lead Management System](#lead-management-system)
5. [CRM Lite Features](#crm-lite-features)
6. [Co-Branded Client Portals](#co-branded-client-portals)
7. [Detailed Wireframes](#detailed-wireframes)

---

## Compass Pro Dashboard Overview

### Purpose

The Compass Pro Dashboard is a comprehensive business operating system (BOS) that empowers real estate and mortgage professionals to:
- Acquire and manage qualified leads
- Track client journeys from initial contact to closing
- Communicate effectively with prospects and clients
- Analyze performance and optimize conversions
- Manage their marketplace listings (for service providers)

### User Types

1. **Real Estate Agents**
2. **Mortgage Lenders**
3. **Service Providers** (Title Companies, Inspectors, etc.)

---

## Professional Portal & Onboarding

### Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Account Creation                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Email: [_____________]                             │    │
│  │ Password: [_____________]                          │    │
│  │ Confirm: [_____________]                           │    │
│  │                                                     │    │
│  │ I am a: ( ) Real Estate Agent                      │    │
│  │          ( ) Mortgage Lender                       │    │
│  │          ( ) Service Provider                      │    │
│  │                                                     │    │
│  │ [Continue]                                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Professional Information                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ First Name: [_____________]                        │    │
│  │ Last Name: [_____________]                         │    │
│  │ Company Name: [_____________]                      │    │
│  │ Phone: [_____________]                             │    │
│  │                                                     │    │
│  │ [Continue]                                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: License Verification                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ License Number: [_____________]                    │    │
│  │ State: [Dropdown: Select State]                    │    │
│  │                                                     │    │
│  │ Upload License Document:                           │    │
│  │ [Choose File] license.pdf                          │    │
│  │                                                     │    │
│  │ ⚠️ Verification can take 2-3 business days         │    │
│  │                                                     │    │
│  │ [Submit for Verification]                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Profile Completion                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Specializations:                                   │    │
│  │ ☑ First-Time Buyers                                │    │
│  │ ☑ Luxury Homes                                     │    │
│  │ ☐ Investment Properties                            │    │
│  │                                                     │    │
│  │ Coverage Areas (ZIP codes):                        │    │
│  │ [90210] [90211] [90212] [Add ZIP]                  │    │
│  │                                                     │    │
│  │ Languages:                                         │    │
│  │ ☑ English  ☑ Spanish  ☐ Mandarin                  │    │
│  │                                                     │    │
│  │ Bio:                                               │    │
│  │ [Text Area - 500 chars max]                        │    │
│  │                                                     │    │
│  │ Profile Photo: [Upload]                            │    │
│  │                                                     │    │
│  │ [Complete Profile]                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Subscription Selection                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Choose Your Plan:                                  │    │
│  │                                                     │    │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │ │ Starter  │  │   Pro    │  │Enterprise│         │    │
│  │ │ $99/mo   │  │ $299/mo  │  │ $799/mo  │         │    │
│  │ │          │  │          │  │          │         │    │
│  │ │ 5 leads  │  │ 20 leads │  │ Unlimited│         │    │
│  │ │ /month   │  │ /month   │  │ leads    │         │    │
│  │ │          │  │          │  │          │         │    │
│  │ │ [Select] │  │ [Select] │  │ [Select] │         │    │
│  │ └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                     │    │
│  │ [Start Free Trial] (14 days)                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### License Verification Process

```typescript
interface LicenseVerification {
  professionalId: string;
  licenseNumber: string;
  licenseState: string;
  uploadedDocument: string; // S3 URL
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  rejectionReason?: string;
  verificationMethod: 'manual' | 'api';
}

// Automated verification (where API available)
async function verifyLicense(
  licenseNumber: string,
  state: string,
  professionalType: 'agent' | 'lender'
): Promise<VerificationResult> {
  // Attempt API verification first
  if (hasAPIVerification(state, professionalType)) {
    const result = await licenseAPI.verify({
      licenseNumber,
      state,
      type: professionalType
    });
    return result;
  }
  
  // Fallback to manual verification
  return {
    status: 'pending',
    method: 'manual',
    estimatedDays: 2
  };
}
```

---

## Service Provider Portal

### Overview

The Service Provider Portal allows closing cost service providers (title companies, inspectors, attorneys, etc.) to:
- Manage their marketplace listings
- Set and update pricing by location
- Respond to service requests
- Track bookings and revenue
- Manage special offers (cashback, discounts)

### Portal Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Compass Pro - Service Provider Portal  [Settings]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard Overview                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ New Requests │  │ Active       │  │ Monthly      │     │
│  │      12      │  │ Bookings     │  │ Revenue      │     │
│  │  [View All]  │  │      8       │  │   $4,250     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Recent Service Requests                            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ [Address] [Service] [Price] [Status] [Action]     │    │
│  │ 123 Main St  Title    $850  Pending  [Respond]    │    │
│  │ 456 Oak Ave  Inspect  $450  Booked   [View]       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Pricing Management Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Manage Pricing & Services                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Service Categories                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Title Insurance              [Edit Pricing]        │    │
│  │   Base Policy: $850                               │    │
│  │   Enhanced Policy: $1,250                          │    │
│  │   Service Call Fee: $0                             │    │
│  │                                                     │    │
│  │ Location-Based Pricing:                            │    │
│  │   ZIP Code: [90210] Base: [$850] [+ Add ZIP]      │    │
│  │   [90210] $850  [90211] $875  [90212] $850       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Inspections                  [Edit Pricing]        │    │
│  │   Standard Inspection: $400                        │    │
│  │   Radon Test: +$150                                │    │
│  │   Sewer Scope: +$200                               │    │
│  │   Pest Inspection: +$125                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Special Offers                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ☑ Compass Cashback Program                        │    │
│  │   Offer: 5% cashback on all bookings              │    │
│  │   Valid Until: [12/31/2024]                       │    │
│  │                                                     │    │
│  │ [Add New Offer]                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Save Changes]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Service Request Response Flow

```typescript
interface ServiceRequest {
  id: string;
  userId: string;
  propertyAddress: string;
  propertyPrice: number;
  zipCode: string;
  requestedServices: string[];
  requestedDate?: Date;
  status: 'pending' | 'responded' | 'booked' | 'cancelled';
  createdAt: Date;
}

// Provider responds to request
async function respondToRequest(
  requestId: string,
  providerId: string,
  quote: {
    serviceCategory: string;
    basePrice: number;
    totalPrice: number;
    availability: Date[];
    notes?: string;
  }
): Promise<void> {
  // Create quote response
  const quoteResponse = await createQuote({
    serviceRequestId: requestId,
    serviceProviderId: providerId,
    ...quote
  });
  
  // Notify user
  await notificationService.send({
    userId: request.userId,
    type: 'service_quote_received',
    data: { requestId, quoteResponse }
  });
}
```

---

## Lead Management System

### Intelligent Lead Inbox

```
┌─────────────────────────────────────────────────────────────┐
│  Lead Inbox                          [Filters] [Export]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Sort by: [Score ▼] [Date] [Status]                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟢 High Priority                                    │    │
│  │ ⭐⭐⭐⭐⭐ Score: 92                                  │    │
│  │                                                     │    │
│  │ Sarah Johnson                                       │    │
│  │ sarah.j@email.com | (555) 123-4567                 │    │
│  │                                                     │    │
│  │ 📍 Looking in: Los Angeles, CA (90210, 90211)      │    │
│  │ 💰 Budget: $400,000 - $500,000                      │    │
│  │ ⏰ Timeline: 3-6 months                             │    │
│  │ ✅ Pre-approved                                    │    │
│  │                                                     │    │
│  │ Progress: ████████████░░ 85% Ready                  │    │
│  │                                                     │    │
│  │ Saved 12 properties | Active on platform 2 weeks   │    │
│  │                                                     │    │
│  │ [View Full Profile] [Connect] [Dismiss]            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟡 Medium Priority                                 │    │
│  │ ⭐⭐⭐⭐ Score: 68                                   │    │
│  │                                                     │    │
│  │ Michael Chen                                       │    │
│  │ mchen@email.com | (555) 987-6543                   │    │
│  │                                                     │    │
│  │ 📍 Looking in: San Francisco, CA                    │    │
│  │ 💰 Budget: $600,000 - $800,000                      │    │
│  │ ⏰ Timeline: 6-12 months                            │    │
│  │ ⚠️ Needs credit improvement                        │    │
│  │                                                     │    │
│  │ Progress: ██████░░░░░░ 42% Ready                    │    │
│  │                                                     │    │
│  │ [View Full Profile] [Connect] [Dismiss]            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Lead Scoring Algorithm

```typescript
interface LeadScoreFactors {
  // Financial Readiness (40% weight)
  preApproved: boolean;              // +30 points
  readinessScore: number;            // 0-30 points (score / 3.33)
  hasConnectedAccounts: boolean;     // +10 points
  
  // Engagement Level (30% weight)
  daysActive: number;                // Up to 15 points (max 30 days)
  propertiesSaved: number;           // Up to 10 points (max 20)
  messagesSent: number;              // Up to 5 points
  
  // Profile Completeness (20% weight)
  profileComplete: boolean;          // +10 points
  hasTimeline: boolean;              // +5 points
  hasBudgetRange: boolean;           // +5 points
  
  // Behavior Signals (10% weight)
  recentActivity: boolean;           // +5 points (active in last 7 days)
  savedSearchActive: boolean;        // +5 points
}

function calculateLeadScore(factors: LeadScoreFactors): number {
  let score = 0;
  
  // Financial Readiness (40%)
  if (factors.preApproved) score += 30;
  score += Math.min(30, factors.readinessScore / 3.33);
  if (factors.hasConnectedAccounts) score += 10;
  
  // Engagement Level (30%)
  score += Math.min(15, (factors.daysActive / 30) * 15);
  score += Math.min(10, (factors.propertiesSaved / 20) * 10);
  score += Math.min(5, factors.messagesSent);
  
  // Profile Completeness (20%)
  if (factors.profileComplete) score += 10;
  if (factors.hasTimeline) score += 5;
  if (factors.hasBudgetRange) score += 5;
  
  // Behavior Signals (10%)
  if (factors.recentActivity) score += 5;
  if (factors.savedSearchActive) score += 5;
  
  return Math.min(100, Math.round(score));
}
```

### Detailed Lead Profile View

```
┌─────────────────────────────────────────────────────────────┐
│  Lead Profile: Sarah Johnson         [Connect] [Archive]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Overview                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Contact Info                                       │    │
│  │ Email: sarah.j@email.com                          │    │
│  │ Phone: (555) 123-4567                             │    │
│  │ Preferred Contact: Email                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Financial Readiness                                │    │
│  │ Overall Score: 85/100 ████████████░░              │    │
│  │ Credit Score: 735                                  │    │
│  │ ✅ Pre-approved for $475,000                       │    │
│  │ Savings: $48,000                                   │    │
│  │ DTI Ratio: 32%                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Home Search Preferences                            │    │
│  │ Budget: $400,000 - $500,000                        │    │
│  │ Location: Los Angeles, CA                          │    │
│  │   • 90210 (Beverly Hills)                          │    │
│  │   • 90211 (West Hollywood)                         │    │
│  │ Desired: 3+ beds, 2+ baths, good schools          │    │
│  │ Timeline: 3-6 months                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Activity & Engagement                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Saved 12 properties                              │    │
│  │ • Active on platform for 2 weeks                   │    │
│  │ • Last active: 2 hours ago                         │    │
│  │ • Saved search: "Beverly Hills 3BR under $500k"    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Action Plan Progress                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ Get pre-approved                                │    │
│  │ ✅ Research neighborhoods                          │    │
│  │ 🔄 Visit open houses (in progress)                 │    │
│  │ ⏳ Make an offer                                   │    │
│  │ ⏳ Complete inspection                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Communication History                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [New Message] [Send Email Template]                │    │
│  │                                                     │    │
│  │ No messages yet. Start a conversation!             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## CRM Lite Features

### Deal Flow Tracking

```
┌─────────────────────────────────────────────────────────────┐
│  My Clients - Deal Pipeline                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pipeline Stages:                                           │
│  [New Lead (3)] [Qualified (2)] [Showings (1)] [Offer (1)] │
│  [Under Contract (0)] [Closed (5)]                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Qualified Leads (2)                                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Sarah Johnson                           ⭐⭐⭐⭐⭐ 92 │    │
│  │ $400k - $500k | Beverly Hills | Timeline: 3-6mo   │    │
│  │ Last contact: 3 days ago                            │    │
│  │ [View Details] [Log Activity]                       │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Michael Chen                             ⭐⭐⭐⭐ 68 │    │
│  │ $600k - $800k | San Francisco | Timeline: 6-12mo  │    │
│  │ Last contact: 1 week ago                            │    │
│  │ [View Details] [Log Activity]                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Active Showings (1)                                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Sarah Johnson                                       │    │
│  │ Viewing: 123 Main St, Beverly Hills - $475,000     │    │
│  │ Showing scheduled: Tomorrow 2:00 PM                 │    │
│  │ [View Property] [Add Note]                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Activity Logging

```typescript
interface ClientActivity {
  id: string;
  leadId: string;
  professionalId: string;
  activityType: 
    | 'call'
    | 'email'
    | 'meeting'
    | 'showing'
    | 'note'
    | 'offer_submitted'
    | 'offer_accepted'
    | 'offer_rejected'
    | 'inspection'
    | 'closing';
  title: string;
  description?: string;
  metadata: {
    duration?: number;      // For calls/meetings
    location?: string;      // For meetings/showings
    attachments?: string[]; // File URLs
    propertyId?: string;    // If related to a property
  };
  createdAt: Date;
  createdBy: string;
}

// Activity logging interface
function logActivity(
  leadId: string,
  activity: Omit<ClientActivity, 'id' | 'createdAt' | 'createdBy'>
): Promise<ClientActivity> {
  // Create activity record
  // Update lead status if needed
  // Send notifications if required
}
```

### Email Templates & Automation

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // e.g., ['firstName', 'propertyAddress']
  category: 'introduction' | 'follow_up' | 'showing' | 'offer' | 'closing';
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'intro',
    name: 'Welcome & Introduction',
    subject: 'Hi {{firstName}}, I\'d love to help you find your dream home',
    body: `
      Hi {{firstName}},
      
      I noticed you're searching for homes in {{neighborhood}}...
      [Rest of template]
    `,
    variables: ['firstName', 'neighborhood'],
    category: 'introduction'
  },
  {
    id: 'showing_followup',
    name: 'Post-Showing Follow-up',
    subject: 'Thoughts on {{propertyAddress}}?',
    body: `
      Hi {{firstName}},
      
      I wanted to follow up on your viewing of {{propertyAddress}}...
    `,
    variables: ['firstName', 'propertyAddress'],
    category: 'follow_up'
  }
];
```

---

## Co-Branded Client Portals

### Overview

Professionals can offer a white-labeled version of the homebuyer dashboard to all their clients, embedding them deeper into the platform.

### Portal Configuration

```
┌─────────────────────────────────────────────────────────────┐
│  Co-Branded Portal Settings                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Portal Status: ✅ Active                                   │
│  Portal URL: compass.yourname.com/client                    │
│                                                              │
│  Branding                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Logo: [Upload Logo] [Current Logo Preview]         │    │
│  │ Primary Color: [Color Picker] #1a73e8             │    │
│  │ Company Name: Your Realty Group                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Welcome Message                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [Text Editor]                                      │    │
│  │ Welcome to your personalized homebuying dashboard! │    │
│  │ ...                                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Enabled Features                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ☑ Property Search & Saved Properties              │    │
│  │ ☑ Action Plan & Milestones                        │    │
│  │ ☑ Financial Health Dashboard                      │    │
│  │ ☑ Direct Messaging with You                       │    │
│  │ ☐ Community Forums (disable for white-label)      │    │
│  │ ☑ Closing Cost Marketplace                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Save Settings]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Client Portal Experience

```
┌─────────────────────────────────────────────────────────────┐
│  [Your Logo] Your Realty Group       [Sarah's Dashboard]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome back, Sarah!                                        │
│                                                              │
│  Your Homebuying Journey                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Overall Progress: ████████████░░ 85%               │    │
│  │                                                     │    │
│  │ ✅ Get Pre-approved                                │    │
│  │ ✅ Research Neighborhoods                          │    │
│  │ 🔄 Visit Open Houses                               │    │
│  │   → Viewing 123 Main St tomorrow at 2 PM          │    │
│  │ ⏳ Make an Offer                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Properties You're Considering (12)                          │
│  [View All Properties]                                       │
│                                                              │
│  Messages from Your Agent                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [New] Showing confirmed for tomorrow...            │    │
│  │ [View Message]                                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Analytics

### Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Performance Analytics                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Overview (Last 30 Days)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ New Leads    │  │ Connections  │  │ Conversion   │     │
│  │     24       │  │     18       │  │    42%       │     │
│  │ ↑ 12% vs     │  │ ↑ 5% vs last │  │ ↑ 8% vs last │     │
│  │ last month   │  │ month        │  │ month        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Lead Sources                                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Property Search: 45%                               │    │
│  │ Action Plan Milestone: 30%                         │    │
│  │ Professional Directory: 15%                        │    │
│  │ Referral: 10%                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Conversion Funnel                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ New Leads: 24                                      │    │
│  │   ↓ 75%                                            │    │
│  │ Viewed: 18                                         │    │
│  │   ↓ 56%                                            │    │
│  │ Connected: 10                                      │    │
│  │   ↓ 40%                                            │    │
│  │ Active Clients: 4                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Lead Quality by Score                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ High (80+): ████████████ 12 leads | 83% connect  │    │
│  │ Medium (50-79): ████████ 8 leads | 50% connect   │    │
│  │ Low (<50): ████ 4 leads | 25% connect            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integrations

### Supported Integrations

1. **MLS Integration**
   - Connect to primary MLS system
   - Sync listings automatically
   - Share listings directly with clients

2. **Calendly Integration**
   - Sync calendar availability
   - Enable clients to book showings directly

3. **DocuSign Integration**
   - Send documents for e-signature
   - Track document status

4. **CRM Integration (Zapier/Make)**
   - Export leads to external CRM
   - Sync activities bidirectionally

### Integration Setup UI

```
┌─────────────────────────────────────────────────────────────┐
│  API Integrations                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ MLS Integration                      [Connect]     │    │
│  │ Connect your primary MLS to sync listings          │    │
│  │ automatically and share with clients.              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Calendly                          ✅ Connected     │    │
│  │ Your calendar is synced. Clients can book          │    │
│  │ showings directly. [Manage] [Disconnect]           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ DocuSign                            [Connect]     │    │
│  │ Send documents for e-signature from the platform. │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

*This document provides comprehensive specifications for the B2B dashboard. Detailed API contracts and component specifications will be documented in the development repository.*


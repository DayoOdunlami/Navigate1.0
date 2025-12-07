# NAVIGATE Demo User Profile Guide

## Overview

This document outlines demo user profile concepts for NAVIGATE, equivalent to the Atlas user profiles. NAVIGATE focuses on the **zero emission aviation ecosystem**, helping stakeholders make evidence-based decisions about policy, investment, and R&D prioritization.

---

## Recommended Demo User Profile: **Policy & Strategy Analyst**

### Profile Concept

**Name:** Dr. Emma Thompson  
**Role:** Senior Policy Analyst - Zero Emission Aviation  
**Organization:** Department for Transport (DfT)  
**Profile Type:** Policy & Strategy Analyst

### Why This Profile Works Best for Demo

1. **Showcases Core NAVIGATE Features:**
   - **Knowledge Graph Exploration** - Navigating stakeholder networks
   - **Funding Intelligence** - Understanding investment flows and gaps
   - **Scenario Modeling** - "What if we increase public funding by 50%?"
   - **AI Insights** - Asking natural language questions about the ecosystem
   - **Technology Maturity Tracking** - TRL assessment and gaps

2. **Realistic Use Case:**
   - Policy makers need to understand the ecosystem before making decisions
   - They need to identify funding gaps, technology readiness, and key players
   - They must justify policy recommendations with data

3. **Demonstrates Value:**
   - Replaces hours of reading reports with interactive exploration
   - Shows evidence-based decision making
   - Highlights cross-sector connections (aviation, energy, infrastructure)

---

## Demo Profile Structure

### Header Section
- **Avatar:** DfT logo or professional photo
- **Name:** Dr. Emma Thompson
- **Title:** Senior Policy Analyst - Zero Emission Aviation
- **Organization:** Department for Transport
- **Badge:** 🏛️ Policy & Strategy Profile

### Key Metrics Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  My Ecosystem Overview                                   │
├─────────────────────────────────────────────────────────┤
│  📊 287 Organizations   │  💰 £340M Total Funding      │
│  🔬 45 Technologies     │  🎯 12 Active Projects        │
│  📈 8 Funding Gaps      │  ⚠️  3 TRL Bottlenecks       │
└─────────────────────────────────────────────────────────┘
```

### Quick Actions
- **Explore Knowledge Graph** - "Show me the stakeholder network"
- **Funding Analysis** - "Analyze public vs private investment"
- **Scenario Builder** - "Model increased government funding"
- **AI Assistant** - "Ask questions about the ecosystem"

### Focus Areas
- **Technology Categories:** H2Production, H2Storage, FuelCells, Aircraft
- **Stakeholder Types:** Government, Industry, Research, Intermediary
- **Key Regions:** UK (Scotland, South East, London)
- **Funding Programs:** ATI, Innovate UK, DfT schemes

### Saved Scenarios
1. **"Baseline 2024"** - Current state of the ecosystem
2. **"50% Public Funding Increase"** - Optimistic funding scenario
3. **"TRL 6-7 Gap Analysis"** - Technologies needing support
4. **"Scotland Focus"** - Regional analysis

### Recent Activity
- "Explored ZeroAvia's funding network - found 5 connections"
- "Identified 3 technologies at TRL 6 that need £15M funding"
- "Compared Scotland vs London funding distribution"
- "Asked AI: 'What are the main barriers to hydrogen aircraft adoption?'"

### AI Conversation Examples
```
User: "Show me which technologies are underfunded relative to their TRL"

AI: "I found 5 technologies where funding is below expected levels:
     1. Advanced H2 Storage (TRL 7) - Needs £8M, has £2M
     2. Fuel Cell Stack (TRL 6) - Needs £12M, has £5M
     ... [highlights in graph]"
```

---

## Three Key User Types for NAVIGATE

### 1. Policy Maker / Government Official

**Example:** Dr. Emma Thompson (DfT Policy Analyst)

**Role Characteristics:**
- Needs to understand the entire ecosystem before making policy recommendations
- Must justify decisions with evidence and data
- Interested in funding gaps, technology readiness, and stakeholder influence
- Needs to communicate findings to senior officials

**Use Cases:**
- "Which technologies need government support to reach commercial viability?"
- "What's the funding gap between public and private investment?"
- "Which regions are leading in zero emission aviation innovation?"
- "How would a 50% increase in public funding affect the ecosystem?"
- "What are the risks if we don't fund hydrogen storage technologies?"

**Key Features They Use:**
- ✅ Knowledge Graph (explore stakeholder networks)
- ✅ Funding Sankey (understand investment flows)
- ✅ Scenario Modeling (test policy impact)
- ✅ AI Insights (ask natural language questions)
- ✅ TRL Analysis (identify technology readiness gaps)

**Typical Workflow:**
1. Opens NAVIGATE to explore current ecosystem state
2. Asks AI: "What are the main barriers to zero emission aviation?"
3. Explores funding flows to identify gaps
4. Runs scenario: "What if we increase public funding by 50%?"
5. Exports insights for policy briefing

---

### 2. Investment Manager / Fund Coordinator

**Example:** Marcus Chen (ATI Funding Manager)

**Role Characteristics:**
- Manages funding programs and investment portfolios
- Needs to identify promising technologies and companies
- Must assess risk and prioritize investments
- Interested in funding patterns and co-investment opportunities

**Use Cases:**
- "Which technologies at TRL 6-7 need funding to reach TRL 9?"
- "Show me all companies working on hydrogen fuel cells"
- "What's the funding history of ZeroAvia?"
- "Which projects have successfully leveraged public-private partnerships?"
- "Where are the investment gaps in the hydrogen infrastructure space?"

**Key Features They Use:**
- ✅ Technology Filtering (by TRL, category, funding level)
- ✅ Funding Sankey (track investment flows)
- ✅ Stakeholder Profiles (assess companies/organizations)
- ✅ Scenario Modeling (model portfolio impact)
- ✅ Knowledge Base (understand company strategies)

**Typical Workflow:**
1. Filters technologies by TRL (looking for 6-7)
2. Explores funding history of promising companies
3. Reviews knowledge base entries for strategic context
4. Uses scenario modeling to assess portfolio impact
5. Identifies co-investment opportunities

---

### 3. Research Lead / Innovation Strategist

**Example:** Prof. James Mitchell (Cranfield University - Aerospace Research)

**Role Characteristics:**
- Leads research programs and collaborates with industry
- Needs to understand the competitive landscape
- Must identify collaboration opportunities
- Interested in technology trends and research gaps

**Use Cases:**
- "Who else is researching hydrogen storage at TRL 5-6?"
- "What are the collaboration opportunities with ZeroAvia?"
- "Show me all government-funded research projects on fuel cells"
- "What technologies are universities working on vs industry?"
- "Which research gaps exist in the hydrogen aircraft space?"

**Key Features They Use:**
- ✅ Knowledge Graph (explore research networks)
- ✅ Stakeholder Filtering (Research organizations, Industry partners)
- ✅ Project Tracking (active research projects)
- ✅ Technology Matrix (compare research vs commercial focus)
- ✅ AI Assistant (find collaboration opportunities)

**Typical Workflow:**
1. Explores knowledge graph to see research network
2. Filters to Research organizations to see competitors
3. Reviews technology profiles to understand current state
4. Uses AI: "Find potential collaboration partners for hydrogen storage research"
5. Tracks active projects in their area of interest

---

## Profile Page Sections (Detailed)

### 1. Header & Identity
```typescript
{
  name: "Dr. Emma Thompson",
  role: "Senior Policy Analyst - Zero Emission Aviation",
  organization: "Department for Transport",
  avatar: "DfT logo",
  profileType: "Policy & Strategy",
  location: "London, UK",
  joinedDate: "2024-01-15"
}
```

### 2. Ecosystem Overview Metrics
- **Total Organizations Tracked:** 287
- **Total Funding:** £340M
- **Active Technologies:** 45
- **Active Projects:** 12
- **Funding Gaps Identified:** 8
- **TRL Bottlenecks:** 3

### 3. Focus Areas & Filters
- **Technology Categories:** H2Production, H2Storage, FuelCells, Aircraft
- **Stakeholder Types:** Government, Industry, Research, Intermediary
- **Regions:** Scotland, South East, London
- **TRL Range:** 4-8 (focus on development stage)
- **Funding Types:** Public, Private, Mixed

### 4. Saved Scenarios
- **Baseline 2024** - Current ecosystem state
- **50% Public Funding Increase** - Optimistic scenario
- **TRL 6-7 Gap Analysis** - Technologies needing support
- **Scotland Focus** - Regional analysis
- **Hydrogen Infrastructure** - Specific technology focus

### 5. Recent Explorations
- Timeline of recent graph explorations
- AI queries asked
- Entities viewed
- Scenarios run
- Exports/downloads

### 6. AI Conversation History
- Recent questions and answers
- Insights generated
- Visualizations triggered
- Quick access to common queries

### 7. Quick Actions Panel
- **Explore Knowledge Graph** - Jump to network view
- **Analyze Funding** - Open Sankey diagram
- **Run Scenario** - Quick scenario builder
- **Ask AI** - Open chat interface
- **Export Report** - Generate summary

---

## Comparison: Atlas vs NAVIGATE Profiles

| Aspect | Atlas (Old) | NAVIGATE (New) |
|--------|-------------|----------------|
| **Domain** | Cross-sector innovation matching | Zero emission aviation ecosystem |
| **User Types** | Innovator (SME) / Buyer (Public Sector) | Policy Analyst / Investment Manager / Research Lead |
| **Key Metrics** | Challenge matches, evidence packages | Organizations tracked, funding flows, TRL gaps |
| **Main Features** | Opportunity discovery, evidence reuse | Knowledge graph, scenario modeling, AI insights |
| **Profile Focus** | Matching & connections | Ecosystem intelligence & decision support |
| **Interactions** | Find opportunities, share evidence | Explore network, model scenarios, ask AI |

---

## Implementation Notes

### Profile Page Components Needed

1. **ProfileHeader** - Name, role, organization, avatar
2. **MetricsDashboard** - Key ecosystem metrics
3. **QuickActionsPanel** - Jump to main features
4. **FocusAreasSection** - Saved filters and preferences
5. **SavedScenariosList** - Quick access to scenarios
6. **RecentActivityFeed** - Timeline of explorations
7. **AIConversationPanel** - Recent queries and insights
8. **ProfileSettings** - Edit preferences, export data

### Data Needed for Demo Profile

- User preferences (focus areas, filters)
- Saved scenarios (slider configurations)
- Recent activity (explorations, queries)
- AI conversation history
- Metrics calculated from ecosystem data

---

## Next Steps

1. **Design Profile Page Layout** - Mockup the profile page UI
2. **Create Demo User Data** - Generate realistic profile data
3. **Build Profile Components** - Implement the profile page
4. **Populate Demo Content** - Add realistic scenarios and activities
5. **Test User Workflows** - Ensure profile serves as good entry point

---

**Recommendation:** Start with the **Policy & Strategy Analyst** profile (Dr. Emma Thompson) as it best demonstrates NAVIGATE's core value proposition and use cases.



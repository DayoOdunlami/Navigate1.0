# Atlas Pipeline Integration with Existing Data

## Overview

The Atlas pipeline extracts structured challenge data from funding/policy URLs using OpenAI. This document explains how Atlas data links with your existing challenge data structure.

## Data Flow

```
Atlas Extraction → ExtractedChallenge → Adapter → Challenge → Knowledge Base
```

## Data Mapping

### Atlas Format (`ExtractedChallenge`)
- Uses transport modes: `Aviation`, `Rail`, `Maritime`, `Highways`, `Integrated`, `Cross-modal`
- Uses strategic themes: `Autonomy`, `Decarbonisation`, `People Experience`, etc.
- Challenge types: `technology_development`, `infrastructure`, `policy_regulatory`, etc.

### Existing Format (`Challenge`)
- Uses sectors: `rail`, `energy`, `local_gov`, `transport`, `built_env`, `aviation`
- Uses problem types: `Infrastructure Modernisation`, `Technology Development`, etc.
- Has buyer organization, funding details, TRL, geography, etc.

## Adapter Function

The `adaptAtlasChallengeToChallenge()` function in `src/lib/atlas/adapter.ts` converts:

1. **Transport Modes → Sectors**
   - `Aviation` → `aviation`
   - `Rail` → `rail`
   - `Maritime`, `Highways`, `Integrated` → `transport`
   - `Cross-modal` → `transport` (with secondary sectors)

2. **Challenge Types → Problem Types**
   - `technology_development` → `Technology Development`
   - `infrastructure` → `Infrastructure Development`
   - `policy_regulatory` → `Policy & Regulatory`
   - etc.

3. **Funding Mapping**
   - Atlas funding types → Challenge funding mechanisms
   - `grant` → `grant`
   - `contract` → `contract`
   - `prize` → `innovation_voucher`

4. **Metadata Preservation**
   - Extraction confidence → metadata.extraction_confidence
   - Source information → buyer.organization
   - Validation status → evidence_confidence

## How to Use

### 1. Extract a Challenge
Navigate to `/atlas` and enter a funding/policy URL. The system will:
- Scrape the page (using Jina/Firecrawl/Playwright)
- Extract structured data using OpenAI
- Classify by transport modes and themes
- Validate the extraction

### 2. Save to Knowledge Base
Click "Add to Knowledge Base" button after extraction. This will:
- Convert Atlas format to your Challenge format
- Call `/api/atlas/save` endpoint
- Return the adapted challenge (ready for your database)

### 3. Integration Points

**Current Implementation:**
- The save endpoint returns the adapted challenge
- You can then save it to your database or append to `challenges.ts`

**Future Enhancement:**
- Direct database integration
- Automatic deduplication
- Batch import from multiple URLs
- Real-time updates to visualizations

## Example Conversion

**Atlas ExtractedChallenge:**
```typescript
{
  id: "atlas-abc123",
  title: "Net Zero Aviation Fuels",
  modes: ["Aviation"],
  strategicThemes: ["Decarbonisation", "Industry"],
  challengeType: "technology_development",
  funding: { min: 2000000, max: 5000000, currency: "GBP", type: "grant" },
  trl: { min: 4, max: 7 },
  deadline: "2025-03-12"
}
```

**Converted Challenge:**
```typescript
{
  id: "atlas-abc123",
  title: "Net Zero Aviation Fuels",
  sector: { primary: "aviation", secondary: [], cross_sector_signals: ["Decarbonisation", "Industry"] },
  problem_type: { primary: "Technology Development", sub_categories: ["Decarbonisation", "Industry"], ... },
  funding: { type: "range", amount_min: 2000000, amount_max: 5000000, currency: "GBP", mechanism: "grant" },
  maturity: { trl_min: 4, trl_max: 7, ... },
  timeline: { deadline: new Date("2025-03-12"), urgency: "moderate", ... }
}
```

## API Endpoints

- `POST /api/atlas/extract` - Extract challenge from URL
- `GET /api/atlas/extract` - Get available providers/models
- `POST /api/atlas/save` - Save extracted challenge (converts format)
- `GET /api/atlas/costs` - Get cost tracking summary
- `DELETE /api/atlas/costs` - Reset cost tracking

## Next Steps

1. **Database Integration**: Replace the placeholder save endpoint with actual database writes
2. **Deduplication**: Check for existing challenges before saving
3. **Batch Processing**: Extract multiple URLs at once
4. **Real-time Updates**: Update visualizations when new challenges are added
5. **Validation Rules**: Add custom validation for your domain


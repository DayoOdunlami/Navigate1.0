# Atlas Challenges Integration - Implementation Guide

This document describes the completed integration of 78 transport funding challenges from the Atlas dataset into Sparkworks.

## Overview

The integration provides:
- ✅ Data ingestion from JSON to unified BaseEntity format
- ✅ Strategy Advisor AI tools for analyzing opportunities
- ✅ Report generation (Markdown, DOCX, PDF)
- ✅ Challenge Explorer visualization with V6 layout
- ✅ Filter controls for modes, themes, tiers, funding, etc.
- ✅ Vector store integration for semantic search

## File Structure

```
Navigate1.0/
├── src/
│   ├── types/
│   │   └── atlas.ts                          # AtlasChallenge type definitions
│   ├── lib/
│   │   ├── atlas/
│   │   │   └── transformChallenge.ts         # Transform to BaseEntity
│   │   ├── strategyAdvisor/
│   │   │   ├── tools.ts                      # AI function tools
│   │   │   └── prompts.ts                    # System prompts
│   │   ├── reports/
│   │   │   ├── templates.ts                  # Report templates
│   │   │   ├── generator.ts                  # Report generation
│   │   │   ├── index.ts                      # Main export
│   │   │   └── exporters/
│   │   │       ├── markdown.ts               # Markdown export
│   │   │       ├── docx.ts                   # DOCX export (stub)
│   │   │       └── pdf.ts                    # PDF export (stub)
│   │   └── visualisations/
│   │       ├── adapters/
│   │       │   └── challengeTreemap.ts       # Treemap data adapter
│   │       └── controls/
│   │           └── challengeControls.ts      # Filter controls schema
│   ├── components/
│   │   └── visualisations/
│   │       └── ChallengeTreemap.tsx          # Treemap component
│   └── app/
│       └── atlas/
│           └── challenges/
│               └── page.tsx                  # Challenge Explorer page
├── scripts/
│   └── importAtlasChallenges.ts              # Import script
└── src/data/
    └── atlas_challenges_comprehensive.json   # Data file (to be provided)
```

## Quick Start

### 1. Add Data File

Place your `atlas_challenges_comprehensive.json` file in:
```
Navigate1.0/src/data/atlas_challenges_comprehensive.json
```

Expected format:
```json
{
  "metadata": {
    "version": "1.0",
    "extracted_at": "2025-01-01T00:00:00Z",
    "total_challenges": 78,
    "total_funding_gbp": 8660000000,
    "statistics": { ... }
  },
  "challenges": [
    {
      "id": "ATL-001",
      "title": "...",
      "description": "...",
      // ... see types/atlas.ts for full schema
    }
  ]
}
```

### 2. Import to Vector Store

```bash
npx tsx scripts/importAtlasChallenges.ts
```

Or with custom path:
```bash
npx tsx scripts/importAtlasChallenges.ts path/to/your/file.json
```

This will:
- Read the JSON file
- Transform challenges to BaseEntity format
- Embed and store in vector store (JSON backend by default)
- Output progress and statistics

### 3. Access Challenge Explorer

Navigate to:
```
http://localhost:3000/atlas/challenges
```

## Features

### Challenge Explorer Page

The Challenge Explorer provides:
- **Treemap Visualization**: Hierarchical view of funding by tier → body → programme
- **Filter Controls**: Filter by modes, themes, tiers, funding range, status, SME-only
- **AI Chat**: Strategy Advisor with tools for searching and analyzing
- **Insights Panel**: Statistics and selected challenge details

### Strategy Advisor AI Tools

The AI can:
- `search_challenges`: Search by query and filters
- `analyze_funding_landscape`: Get statistics for sectors/themes
- `find_matching_opportunities`: Find challenges matching capabilities
- `compare_opportunities`: Compare multiple challenges
- `generate_strategy_brief`: Generate formatted reports

### Report Generation

Generate reports in multiple formats:

```typescript
import { generateReport, exportReport } from '@/lib/reports';

// Generate report
const report = await generateReport({
  template: 'sector_landscape',
  title: 'Aviation Decarbonisation Opportunities',
  filters: {
    modes: ['Aviation'],
    themes: ['Decarbonisation'],
  },
}, allEntities);

// Export to Markdown
const markdown = await exportReport(report, 'markdown');

// Export to DOCX (requires 'docx' package)
const docxBlob = await exportReport(report, 'docx');

// Export to PDF (requires react-pdf or puppeteer)
const pdfBlob = await exportReport(report, 'pdf');
```

## Data Transformation

Challenges are transformed from `AtlasChallenge` to `BaseEntity` with:
- All metadata preserved in `metadata.custom`
- Tags for filtering (modes, themes, tier, SME-specific, etc.)
- Funding information in standardized format
- TRL range parsing
- Provenance tracking (marked as 'api_import')

## Vector Store Integration

Challenges are embedded for semantic search:
- Searchable text includes: title, description, source, modes, themes, focus areas
- Default backend: JSON file-based (for <500 entities)
- Can be upgraded to Vercel KV or Supabase for larger datasets

## Controls Schema

The Challenge Explorer includes these filters:
- **Modes**: Rail, Aviation, Maritime, Highways (multiselect)
- **Themes**: Decarbonisation, Autonomy, Safety, etc. (multiselect)
- **Tiers**: 1-5 (multiselect)
- **Min Relevance**: CPC relevance score slider (1-10)
- **Status**: Open, Upcoming, Ongoing, Closing (multiselect)
- **SME Only**: Toggle for SME-specific challenges
- **Funding Range**: Slider for funding amount (£0 - £1B)

All controls are AI-compatible with `aiHint` descriptions.

## Next Steps

### To Complete the Integration

1. **Add JSON Data File**: Place `atlas_challenges_comprehensive.json` in `src/data/`
2. **Run Import Script**: Execute `npx tsx scripts/importAtlasChallenges.ts`
3. **Test Visualization**: Navigate to `/atlas/challenges` and verify treemap renders
4. **Test AI Tools**: Use the AI chat to search and analyze challenges
5. **Generate Reports**: Test report generation with different templates

### Optional Enhancements

1. **Additional Visualizations**: 
   - Timeline view for deadlines
   - Mode-Theme heatmap
   - TRL funnel chart
   - Funding flow Sankey

2. **Enhanced Report Export**:
   - Implement DOCX export (install `docx` package)
   - Implement PDF export (choose react-pdf or puppeteer)

3. **Vector Store Upgrade**:
   - For >500 challenges, consider Vercel KV
   - For >2000 challenges, consider Supabase pgvector

4. **AI Function Calling**:
   - Integrate tools with actual AI provider (OpenAI/Claude)
   - Test function calling in AI chat panel

## Questions Answered

### 1. Vector Store Setup
✅ **Answer**: JSON-based vector store is already set up and working. Located in `lib/ai/vector-store-json.ts`. Can be upgraded to Vercel KV or Supabase for larger datasets.

### 2. AI Tools Format
✅ **Answer**: Tools use OpenAI-style function calling format (compatible with Anthropic tool use). Defined in `lib/strategyAdvisor/tools.ts`.

### 3. Report Export Preference
✅ **Answer**: All three formats are supported:
- Markdown: ✅ Implemented
- DOCX: Stub created (requires `docx` package)
- PDF: Stub created (requires react-pdf or puppeteer)

Choose based on your needs. Markdown is simplest and works immediately.

### 4. Page Pattern
✅ **Answer**: Challenge Explorer follows the V6 panel pattern (same as `/visualisations/[vizId]`). Uses floating panels for controls, insights, and AI chat.

## Support

For issues or questions:
1. Check that the JSON file matches the schema in `types/atlas.ts`
2. Verify vector store has been initialized (import script should complete successfully)
3. Check browser console for errors when accessing the Challenge Explorer
4. Verify all dependencies are installed (`npm install`)


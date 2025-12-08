# Atlas Extraction Pipeline v2

**Multi-provider AI pipeline for UK transport innovation challenges**

Now supports **OpenAI (default)** and **Anthropic**, with built-in **cost tracking** and **Playwright for interactive pages**.

---

## What's New in v2

| Feature | v1 | v2 |
|---------|----|----|
| AI Provider | Anthropic only | **OpenAI (default)** + Anthropic |
| Cost Tracking | ❌ | **✅ Built-in** |
| Provider Switching | ❌ | **✅ Runtime switch** |
| Model Selection | Fixed | **✅ Choose any model** |
| Cost Widget | ❌ | **✅ React component** |
| Playwright (interactive pages) | ❌ | **✅ Dropdowns, tabs, accordions** |

---

## Scraping Methods

| Method | Cost | Best For | Handles |
|--------|------|----------|---------|
| **Jina** | Free | Simple static pages | ✅ Basic HTML |
| **Firecrawl** | $16/mo | JS-rendered pages | ✅ SPAs, dynamic content |
| **Playwright** | Free | Interactive pages | ✅ Dropdowns, tabs, accordions, pagination |

### When to Use Each

```
Simple blog/doc page         → Jina (free, fast)
IUK funding portal           → Firecrawl (needs JS rendering)
Gov.uk with accordions       → Playwright (needs clicks to expand)
Site with "Load More" button → Playwright (needs interaction)
Crawl multiple pages         → Playwright or Firecrawl
```

---

## Quick Start

### 1. Copy files to your Sparkworks project

```
src/
  lib/
    atlas/
      ai-provider.ts    ← Provider abstraction + costs
      types.ts          ← Updated with Playwright types
      scraper.ts        ← Now includes Playwright
      extractor.ts
      validator.ts
  ...
```

### 2. Install dependencies

```bash
npm install openai playwright

# Install browser binaries for Playwright
npx playwright install chromium
```

### 3. Set environment variables

```bash
# Required (you already have this)
OPENAI_API_KEY=sk-...

# Optional
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...
```

### 4. Use it

```typescript
import { extractChallenge } from '@/lib/atlas/extractor';

// Uses OpenAI by default
const result = await extractChallenge(url);

// Or specify provider
const result = await extractChallenge(url, {
  provider: 'openai',
  model: 'gpt-4o-mini',  // Cheaper option
});

console.log(`Cost: $${result.totalCost.toFixed(4)}`);
```

---

## Playwright Usage

### Basic (auto-expand accordions)

```typescript
import { scrapeWithPlaywright } from '@/lib/atlas/scraper';

const result = await scrapeWithPlaywright(url, {
  expandAll: true,  // Auto-clicks common "show more" patterns
});
```

### Custom Interactions

```typescript
const result = await scrapeWithPlaywright(url, {
  interactions: [
    // Click a dropdown
    { action: 'click', selector: '#category-dropdown' },
    // Select an option
    { action: 'select', selector: '#category-dropdown', value: 'aviation' },
    // Wait for content
    { action: 'wait', selector: '.results-loaded' },
    // Click through tabs
    { action: 'click', selector: '[data-tab="details"]' },
  ],
  scrollToBottom: true,  // Load lazy content
});
```

### Crawl Multiple Pages

```typescript
import { crawlWithPlaywright } from '@/lib/atlas/scraper';

const result = await crawlWithPlaywright(startUrl, {
  maxPages: 10,
  linkSelector: 'a.competition-link',  // Only follow these links
  config: {
    expandAll: true,
  },
});

// result.pages = [{ url, content }, ...]
```

### Source Configs with Playwright

```typescript
// Already configured for gov.uk, KTN, Horizon Europe
const SOURCE_CONFIGS = {
  'dft': {
    method: 'playwright',
    playwright: {
      expandAll: true,  // Auto-expand gov.uk accordions
    },
  },
  'horizon-europe': {
    method: 'playwright',
    playwright: {
      expandAll: true,
      waitForSelector: '.topic-content',
      interactions: [
        { action: 'click', selector: '[data-toggle="tab"]' },
      ],
    },
  },
};
```

---

## Provider Options

### OpenAI (Default)

| Model | Cost (input/output per 1M tokens) | Best For |
|-------|-----------------------------------|----------|
| `gpt-4o` | $2.50 / $10.00 | Best quality |
| `gpt-4o-mini` | $0.15 / $0.60 | **Best value** |
| `gpt-4-turbo` | $10.00 / $30.00 | Legacy |

### Anthropic (Optional)

| Model | Cost (input/output per 1M tokens) | Best For |
|-------|-----------------------------------|----------|
| `claude-sonnet-4-20250514` | $3.00 / $15.00 | Best quality |
| `claude-3-haiku-20240307` | $0.25 / $1.25 | Fast & cheap |

---

## Cost Tracking

### In Your Component

```tsx
import { CostTracker, CostBadge } from '@/components/atlas/CostTracker';

// Full widget
<CostTracker showHistory />

// Compact badge (for headers)
<CostTracker compact />

// Inline cost display
<CostBadge cost={0.0123} tokens={1500} />
```

### Programmatic Access

```typescript
import { getAIClient } from '@/lib/atlas/ai-provider';

const client = getAIClient();

// Get summary
const summary = client.getCostSummary();
// { totalCost: 0.05, totalCalls: 10, ... }

// Get cost by operation type
const byOp = client.getCostByOperation();
// { extraction: { cost: 0.02, calls: 5 }, classification: { cost: 0.01, calls: 5 } }

// Get today's cost
const today = client.getTodayCost();

// Reset tracking
client.resetCostTracking();
```

---

## Typical Costs Per Extraction

| Model | Per Challenge | 100 Challenges |
|-------|---------------|----------------|
| `gpt-4o-mini` | ~$0.002 | ~$0.20 |
| `gpt-4o` | ~$0.02 | ~$2.00 |
| `claude-sonnet-4-20250514` | ~$0.03 | ~$3.00 |

**Recommendation:** Use `gpt-4o-mini` for bulk extraction, `gpt-4o` for important/complex challenges.

---

## API Routes

### POST /api/atlas/extract

```typescript
// Request
{
  "url": "https://...",
  "provider": "openai",      // optional, default: openai
  "model": "gpt-4o",         // optional
  "skipEnrichment": false    // optional, faster if true
}

// Response
{
  "challenge": { ... },
  "review": { "needed": false, "reasons": [] },
  "duration": 3500,
  "cost": {
    "total": 0.0234,
    "stages": [
      { "stage": "extraction", "duration": 1200, "cost": 0.012 },
      { "stage": "classification", "duration": 800, "cost": 0.008 },
      { "stage": "enrichment", "duration": 900, "cost": 0.003 }
    ],
    "provider": "openai",
    "model": "gpt-4o"
  }
}
```

### GET /api/atlas/extract

Returns available providers and models.

### GET /api/atlas/costs

Returns cost tracking summary.

### DELETE /api/atlas/costs

Resets cost tracking.

---

## Switching Providers at Runtime

```typescript
import { getAIClient } from '@/lib/atlas/ai-provider';

const client = getAIClient();

// Switch to cheaper model for bulk operations
client.setProvider('openai', 'gpt-4o-mini');

// Switch to Anthropic
client.setProvider('anthropic', 'claude-3-haiku-20240307');
```

---

## Files Structure

```
atlas-pipeline-v2/
├── lib/
│   ├── ai-provider.ts     ← Provider abstraction + cost tracking
│   ├── types.ts           ← Type definitions
│   ├── scraper.ts         ← Web scraping (Jina/Firecrawl)
│   ├── extractor.ts       ← Multi-stage extraction
│   └── validator.ts       ← Validation rules
├── data/
│   └── few-shot-examples.json
├── components/
│   ├── CostTracker.tsx    ← Cost tracking widget
│   └── ExtractChallengeForm.tsx
├── api-routes/
│   ├── extract-route.ts   ← Copy to app/api/atlas/extract/route.ts
│   └── costs-route.ts     ← Copy to app/api/atlas/costs/route.ts
└── README.md
```

---

## For Cursor

Copy this prompt:

```
Integrate Atlas pipeline v2 into my Sparkworks project.

Key features:
1. Uses OpenAI by default (I already have OPENAI_API_KEY)
2. Has cost tracking built in
3. Provider can be switched at runtime
4. Includes Playwright for interactive pages (dropdowns, accordions)

Please:
1. Copy lib files to src/lib/atlas/
2. Copy data files to src/data/atlas/
3. Copy components to src/components/atlas/
4. Create API routes at src/app/api/atlas/extract/route.ts and costs/route.ts
5. Create a test page at src/app/atlas/page.tsx
6. Install dependencies: npm install openai playwright
7. Run: npx playwright install chromium

I want to be able to:
- Extract challenges from funding URLs
- See costs in real-time
- Switch between gpt-4o and gpt-4o-mini
- Scrape pages with dropdowns/accordions using Playwright
```

---

## Migration from v1

If you had v1 installed:

1. Replace `lib/extractor.ts` with new version
2. Add `lib/ai-provider.ts`
3. Add `components/CostTracker.tsx`
4. Update `ExtractChallengeForm.tsx`
5. Add `/api/atlas/costs` route
6. Remove `@anthropic-ai/sdk` from dependencies (unless you want both)

No changes needed to:
- `types.ts`
- `scraper.ts`
- `validator.ts`
- `few-shot-examples.json`

# Integrating Crawl4AI as Fallback Scraper

## Problem
Playwright is failing in Next.js serverless environment for gov.uk URLs, causing "Internal Server Error".

## Solution
Add Crawl4AI as a fallback scraper that activates when Playwright fails.

## Implementation Plan

### Step 1: Install Crawl4AI
```bash
npm install crawl4ai
```

### Step 2: Add Crawl4AI Scraper Function
Add to `src/lib/atlas/scraper.ts`:

```typescript
import { Crawler } from 'crawl4ai';

export async function scrapeWithCrawl4AI(url: string): Promise<ScrapeResult> {
  const crawler = new Crawler();
  
  try {
    const result = await crawler.arun({
      url,
      word_count_threshold: 10,
      remove_overlay_elements: true,
      screenshot: false,
    });
    
    if (!result.success || !result.markdown) {
      throw new Error('Crawl4AI failed to extract content');
    }
    
    const content = result.markdown;
    const hash = crypto.createHash('md5').update(content).digest('hex');
    
    // Extract title from markdown or HTML
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : result.metadata?.title;
    
    return {
      content,
      title,
      hash,
      method: 'crawl4ai',
    };
  } catch (error) {
    throw new Error(`Crawl4AI scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### Step 3: Update Scraper Selection Logic
Modify `scrape()` function to use Crawl4AI as fallback:

```typescript
export async function scrape(
  url: string,
  config?: Partial<ScrapingConfig>,
  options?: ScrapeOptions | string
): Promise<ScrapeResult> {
  const opts: ScrapeOptions = typeof options === 'string' 
    ? { firecrawlApiKey: options }
    : options || {};
    
  const method = opts.method || config?.method || 'jina';
  
  // Try primary method first
  try {
    if (method === 'playwright' || playwrightDomains.some(d => url.includes(d))) {
      return await scrapeWithPlaywright(url, opts.playwright);
    }
    // ... other methods
  } catch (error) {
    // If Playwright fails, try Crawl4AI as fallback
    console.warn(`[Atlas] Primary scraper failed, trying Crawl4AI fallback:`, error);
    try {
      return await scrapeWithCrawl4AI(url);
    } catch (fallbackError) {
      throw new Error(`All scrapers failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
    }
  }
}
```

### Step 4: Update Types
```typescript
export type ScrapingMethod = 'jina' | 'firecrawl' | 'playwright' | 'crawl4ai';
```

## Benefits
- ✅ Works in serverless environments
- ✅ Better error handling
- ✅ Fallback when Playwright fails
- ✅ No breaking changes to existing code
- ✅ Automatic fallback for gov.uk URLs

## Testing
After integration, test with:
- `https://www.gov.uk/government/publications/jet-zero-strategy`
- Other gov.uk URLs that were failing


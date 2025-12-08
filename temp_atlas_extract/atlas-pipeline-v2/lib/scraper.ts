// ============================================================================
// ATLAS SCRAPER v2 - With Playwright for interactive pages
// ============================================================================
// Methods:
// - Jina (free): Simple static pages
// - Firecrawl ($16/mo): JS-rendered pages
// - Playwright (free): Interactive pages (dropdowns, tabs, pagination)

import crypto from 'crypto';
import type { ScrapingConfig, SourceInfo } from './types';

// ============================================================================
// TYPES
// ============================================================================

export type ScrapingMethod = 'jina' | 'firecrawl' | 'playwright';

export interface Interaction {
  action: 'click' | 'wait' | 'scroll' | 'select' | 'type' | 'hover';
  selector: string;
  value?: string;           // For 'select' or 'type'
  timeout?: number;         // Wait timeout in ms
  waitAfter?: number;       // Pause after action in ms
}

export interface PlaywrightConfig {
  interactions?: Interaction[];
  waitForSelector?: string;
  waitForTimeout?: number;
  scrollToBottom?: boolean;
  expandAll?: boolean;      // Auto-click common "show more" patterns
}

export interface ScrapeResult {
  content: string;
  title?: string;
  hash: string;
  method: ScrapingMethod;
  metadata?: Record<string, unknown>;
  pages?: { url: string; content: string }[];  // For crawl mode
}

// ============================================================================
// JINA READER (Free, simple static pages)
// ============================================================================

export async function scrapeWithJina(url: string): Promise<ScrapeResult> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  
  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/markdown',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Jina Reader failed: ${response.status} ${response.statusText}`);
  }
  
  const content = await response.text();
  const hash = crypto.createHash('md5').update(content).digest('hex');
  
  // Extract title from markdown (first # heading)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : undefined;
  
  return { content, title, hash, method: 'jina' };
}

// ============================================================================
// FIRECRAWL (Paid, JS-rendered pages)
// ============================================================================

export async function scrapeWithFirecrawl(
  url: string,
  apiKey: string
): Promise<ScrapeResult> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl failed: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  const content = data.data?.markdown || '';
  const hash = crypto.createHash('md5').update(content).digest('hex');
  
  return {
    content,
    title: data.data?.metadata?.title,
    hash,
    method: 'firecrawl',
    metadata: data.data?.metadata,
  };
}

// Firecrawl crawl mode (multiple pages)
export async function crawlWithFirecrawl(
  url: string,
  apiKey: string,
  options?: { maxPages?: number; includes?: string[]; excludes?: string[] }
): Promise<ScrapeResult> {
  const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      limit: options?.maxPages || 10,
      includePaths: options?.includes,
      excludePaths: options?.excludes,
      formats: ['markdown'],
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl crawl failed: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  const pages = data.data?.map((page: any) => ({
    url: page.metadata?.sourceURL || page.url,
    content: page.markdown || '',
  })) || [];
  
  const allContent = pages.map((p: any) => p.content).join('\n\n---\n\n');
  const hash = crypto.createHash('md5').update(allContent).digest('hex');
  
  return {
    content: allContent,
    hash,
    method: 'firecrawl',
    pages,
  };
}

// ============================================================================
// PLAYWRIGHT (Interactive pages - dropdowns, tabs, pagination)
// ============================================================================

export async function scrapeWithPlaywright(
  url: string,
  config?: PlaywrightConfig
): Promise<ScrapeResult> {
  // Dynamic import - only loads if Playwright is actually used
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    
    const page = await context.newPage();
    
    // Navigate to page
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    // Wait for specific selector if configured
    if (config?.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, {
        timeout: config.waitForTimeout || 10000,
      });
    }
    
    // Auto-expand common patterns if enabled
    if (config?.expandAll) {
      await autoExpandContent(page);
    }
    
    // Execute custom interactions
    if (config?.interactions) {
      for (const interaction of config.interactions) {
        await executeInteraction(page, interaction);
      }
    }
    
    // Scroll to bottom if configured (loads lazy content)
    if (config?.scrollToBottom) {
      await autoScroll(page);
    }
    
    // Extract content
    const title = await page.title();
    
    // Get main content as text (cleaner than full HTML)
    const content = await page.evaluate(() => {
      // Try to find main content area
      const main = document.querySelector('main, article, [role="main"], .content, #content');
      if (main) {
        return (main as HTMLElement).innerText;
      }
      // Fallback to body, excluding nav/footer
      const body = document.body.cloneNode(true) as HTMLElement;
      body.querySelectorAll('nav, footer, header, script, style').forEach(el => el.remove());
      return body.innerText;
    });
    
    const hash = crypto.createHash('md5').update(content).digest('hex');
    
    return {
      content,
      title,
      hash,
      method: 'playwright',
    };
  } finally {
    await browser.close();
  }
}

// Execute a single interaction
async function executeInteraction(page: any, interaction: Interaction): Promise<void> {
  const { action, selector, value, timeout = 5000, waitAfter = 500 } = interaction;
  
  try {
    switch (action) {
      case 'click':
        await page.click(selector, { timeout });
        break;
        
      case 'hover':
        await page.hover(selector, { timeout });
        break;
        
      case 'wait':
        await page.waitForSelector(selector, { timeout });
        break;
        
      case 'scroll':
        await page.locator(selector).scrollIntoViewIfNeeded();
        break;
        
      case 'select':
        if (value) {
          await page.selectOption(selector, value);
        }
        break;
        
      case 'type':
        if (value) {
          await page.fill(selector, value);
        }
        break;
    }
    
    // Wait after action for content to load
    if (waitAfter > 0) {
      await page.waitForTimeout(waitAfter);
    }
  } catch (error) {
    console.warn(`Interaction failed: ${action} on ${selector}`, error);
    // Continue anyway - some interactions may be optional
  }
}

// Auto-expand common accordion/dropdown patterns
async function autoExpandContent(page: any): Promise<void> {
  const expandSelectors = [
    // Accordions
    '[aria-expanded="false"]',
    '.accordion-header:not(.expanded)',
    '.collapsible-header',
    'button[data-toggle="collapse"]',
    '.expandable:not(.expanded)',
    
    // "Show more" buttons
    'button:has-text("Show more")',
    'button:has-text("Show all")',
    'button:has-text("Read more")',
    'button:has-text("View more")',
    'a:has-text("Show more")',
    
    // Details/Summary
    'details:not([open]) > summary',
    
    // Gov.uk specific
    '.govuk-accordion__section-button',
    '.gem-c-accordion__section-button',
  ];
  
  for (const selector of expandSelectors) {
    try {
      const elements = await page.$$(selector);
      for (const el of elements.slice(0, 20)) { // Limit to first 20
        await el.click().catch(() => {});
        await page.waitForTimeout(200);
      }
    } catch {
      // Ignore - selector may not exist
    }
  }
  
  // Wait for any animations
  await page.waitForTimeout(500);
}

// Auto-scroll to load lazy content
async function autoScroll(page: any): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0); // Back to top
          resolve();
        }
      }, 100);
      
      // Safety timeout
      setTimeout(() => {
        clearInterval(timer);
        resolve();
      }, 10000);
    });
  });
}

// Crawl multiple pages with Playwright
export async function crawlWithPlaywright(
  startUrl: string,
  options?: {
    maxPages?: number;
    linkSelector?: string;
    config?: PlaywrightConfig;
  }
): Promise<ScrapeResult> {
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({ headless: true });
  const visited = new Set<string>();
  const pages: { url: string; content: string }[] = [];
  const maxPages = options?.maxPages || 10;
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Start with first page
    await page.goto(startUrl, { waitUntil: 'networkidle' });
    
    // Find all links matching selector (or all links)
    const linkSelector = options?.linkSelector || 'a[href]';
    const links = await page.$$eval(linkSelector, (els: HTMLAnchorElement[]) => 
      els.map(el => el.href).filter(href => href.startsWith('http'))
    );
    
    // Filter to same domain
    const baseUrl = new URL(startUrl);
    const sameDomainLinks = links.filter(link => {
      try {
        return new URL(link).hostname === baseUrl.hostname;
      } catch {
        return false;
      }
    });
    
    // Scrape each page
    for (const link of [startUrl, ...sameDomainLinks].slice(0, maxPages)) {
      if (visited.has(link)) continue;
      visited.add(link);
      
      try {
        await page.goto(link, { waitUntil: 'networkidle', timeout: 15000 });
        
        if (options?.config?.expandAll) {
          await autoExpandContent(page);
        }
        
        const content = await page.evaluate(() => {
          const main = document.querySelector('main, article, [role="main"]');
          return (main as HTMLElement || document.body).innerText;
        });
        
        pages.push({ url: link, content });
      } catch (error) {
        console.warn(`Failed to scrape ${link}:`, error);
      }
    }
    
    const allContent = pages.map(p => `## ${p.url}\n\n${p.content}`).join('\n\n---\n\n');
    const hash = crypto.createHash('md5').update(allContent).digest('hex');
    
    return {
      content: allContent,
      hash,
      method: 'playwright',
      pages,
    };
  } finally {
    await browser.close();
  }
}

// ============================================================================
// SMART SCRAPER (Chooses method based on config)
// ============================================================================

export interface ScrapeOptions {
  method?: ScrapingMethod;
  firecrawlApiKey?: string;
  playwright?: PlaywrightConfig;
  crawl?: boolean;
  crawlOptions?: {
    maxPages?: number;
    includes?: string[];
    excludes?: string[];
    linkSelector?: string;
  };
}

export async function scrape(
  url: string,
  config?: Partial<ScrapingConfig>,
  options?: ScrapeOptions | string  // string for backward compat (firecrawlApiKey)
): Promise<ScrapeResult> {
  // Backward compatibility: if options is a string, it's the firecrawl API key
  const opts: ScrapeOptions = typeof options === 'string' 
    ? { firecrawlApiKey: options }
    : options || {};
    
  const method = opts.method || config?.method || 'jina';
  
  // Domains that need specific methods
  const playwrightDomains = [
    'gov.uk',  // Has accordions
    'ktn-uk.org',  // Has filters
  ];
  
  const firecrawlDomains = [
    'apply-for-innovation-funding.service.gov.uk', // IUK - has JS
    'ec.europa.eu', // Horizon - complex structure
  ];
  
  // Auto-detect method if not specified
  let selectedMethod = method;
  if (method === 'jina') {
    if (playwrightDomains.some(d => url.includes(d))) {
      selectedMethod = 'playwright';
    } else if (firecrawlDomains.some(d => url.includes(d))) {
      selectedMethod = opts.firecrawlApiKey ? 'firecrawl' : 'jina';
    }
  }
  
  // Crawl mode
  if (opts.crawl) {
    if (selectedMethod === 'firecrawl' && opts.firecrawlApiKey) {
      return crawlWithFirecrawl(url, opts.firecrawlApiKey, opts.crawlOptions);
    } else {
      return crawlWithPlaywright(url, {
        maxPages: opts.crawlOptions?.maxPages,
        linkSelector: opts.crawlOptions?.linkSelector,
        config: opts.playwright,
      });
    }
  }
  
  // Single page scrape
  switch (selectedMethod) {
    case 'playwright':
      return scrapeWithPlaywright(url, opts.playwright || config?.playwright);
      
    case 'firecrawl':
      if (!opts.firecrawlApiKey) {
        console.warn('Firecrawl API key not provided, falling back to Jina');
        return scrapeWithJina(url);
      }
      return scrapeWithFirecrawl(url, opts.firecrawlApiKey);
      
    case 'jina':
    default:
      return scrapeWithJina(url);
  }
}

// ============================================================================
// BUILD SOURCE INFO
// ============================================================================

export function buildSourceInfo(
  url: string,
  config: ScrapingConfig,
  contentHash: string,
  existingSource?: SourceInfo
): SourceInfo {
  const now = new Date().toISOString();
  const id = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
  
  if (existingSource) {
    const hasChanged = existingSource.contentHash !== contentHash;
    
    return {
      ...existingSource,
      lastSeen: now,
      contentHash,
      previousVersions: hasChanged
        ? [
            ...(existingSource.previousVersions || []),
            {
              scrapedAt: existingSource.lastSeen,
              contentHash: existingSource.contentHash,
            },
          ].slice(-10)
        : existingSource.previousVersions,
    };
  }
  
  return {
    id,
    name: config.name,
    type: config.type,
    url,
    reliability: config.reliability,
    firstSeen: now,
    lastSeen: now,
    contentHash,
  };
}

// ============================================================================
// PREDEFINED SOURCE CONFIGS (Updated with Playwright configs)
// ============================================================================

export const SOURCE_CONFIGS: Record<string, ScrapingConfig> = {
  'innovate-uk': {
    name: 'Innovate UK',
    baseUrl: 'https://apply-for-innovation-funding.service.gov.uk',
    type: 'funding',
    reliability: 'official',
    method: 'firecrawl',
    refreshFrequency: 'weekly',
    extractionHints: `
      IUK-SPECIFIC PATTERNS:
      - Look for: "Competition opens", "Competition closes", "Funding available"
      - Funding format: "Share of up to £X million" or "£X to £Y per project"
      - TRL usually stated explicitly as "TRL X-Y"
      - Eligibility mentions: "UK registered business", "SME", "consortium"
    `,
  },
  
  'ukri': {
    name: 'UKRI',
    baseUrl: 'https://www.ukri.org/opportunity',
    type: 'funding',
    reliability: 'official',
    method: 'jina',
    refreshFrequency: 'weekly',
    extractionHints: `
      UKRI-SPECIFIC PATTERNS:
      - Multiple research councils: EPSRC, NERC, Innovate UK, etc.
      - Look for "Opportunity status", "Closing date", "Funding available"
    `,
  },
  
  'horizon-europe': {
    name: 'Horizon Europe',
    baseUrl: 'https://ec.europa.eu/info/funding-tenders',
    type: 'funding',
    reliability: 'official',
    method: 'playwright',
    refreshFrequency: 'monthly',
    playwright: {
      expandAll: true,
      waitForSelector: '.topic-content',
      interactions: [
        { action: 'click', selector: '[data-toggle="tab"]', waitAfter: 1000 },
      ],
    },
    extractionHints: `
      HORIZON-SPECIFIC PATTERNS:
      - Topic format: "HORIZON-CL5-2025-D5-01"
      - Budget in EUR
      - "Type of Action": RIA, IA, CSA
    `,
  },
  
  'dft': {
    name: 'Department for Transport',
    baseUrl: 'https://www.gov.uk/government/organisations/department-for-transport',
    type: 'policy',
    reliability: 'official',
    method: 'playwright',
    playwright: {
      expandAll: true,
    },
    refreshFrequency: 'weekly',
    extractionHints: `
      DFT-SPECIFIC PATTERNS:
      - These are often POLICY documents, not funding calls
      - Extract: policy intent, target outcomes, mentioned programmes
    `,
  },
  
  'sbri': {
    name: 'SBRI',
    baseUrl: 'https://www.gov.uk/government/collections/sbri',
    type: 'funding',
    reliability: 'official',
    method: 'playwright',
    playwright: {
      expandAll: true,
    },
    refreshFrequency: 'monthly',
    extractionHints: `
      SBRI-SPECIFIC PATTERNS:
      - Government procurement challenges
      - Usually two phases: Phase 1 (feasibility), Phase 2 (development)
    `,
  },
  
  'ati': {
    name: 'Aerospace Technology Institute',
    baseUrl: 'https://www.ati.org.uk',
    type: 'strategy',
    reliability: 'industry',
    method: 'jina',
    refreshFrequency: 'monthly',
    extractionHints: `
      ATI-SPECIFIC PATTERNS:
      - Aviation-focused by definition
      - Technology roadmaps and priorities
    `,
  },
  
  'network-rail': {
    name: 'Network Rail Innovation',
    baseUrl: 'https://www.networkrail.co.uk/industry-and-commercial/innovation',
    type: 'funding',
    reliability: 'official',
    method: 'jina',
    refreshFrequency: 'monthly',
    extractionHints: `
      NETWORK RAIL-SPECIFIC PATTERNS:
      - Rail-focused by definition
      - Supplier innovation portal
    `,
  },
  
  'national-highways': {
    name: 'National Highways',
    baseUrl: 'https://nationalhighways.co.uk/suppliers',
    type: 'funding',
    reliability: 'official',
    method: 'jina',
    refreshFrequency: 'monthly',
    extractionHints: `
      NATIONAL HIGHWAYS-SPECIFIC PATTERNS:
      - Highways-focused by definition
      - Designated Funds innovation programme
    `,
  },
  
  'ktn': {
    name: 'KTN Opportunities',
    baseUrl: 'https://ktn-uk.org/opportunities',
    type: 'funding',
    reliability: 'aggregator',
    method: 'playwright',
    playwright: {
      expandAll: true,
      scrollToBottom: true,
    },
    refreshFrequency: 'weekly',
    extractionHints: `
      KTN-SPECIFIC PATTERNS:
      - AGGREGATOR: May duplicate IUK, UKRI, etc.
      - Cross-check source URL to avoid duplicates
    `,
  },
  
  'maritime-uk': {
    name: 'Maritime UK',
    baseUrl: 'https://www.maritimeuk.org',
    type: 'strategy',
    reliability: 'industry',
    method: 'jina',
    refreshFrequency: 'monthly',
    extractionHints: `
      MARITIME UK-SPECIFIC PATTERNS:
      - Maritime-focused by definition
      - Clean Maritime Plan references
    `,
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function detectSourceConfig(url: string): ScrapingConfig | undefined {
  for (const [, config] of Object.entries(SOURCE_CONFIGS)) {
    if (url.includes(new URL(config.baseUrl).hostname)) {
      return config;
    }
  }
  
  // Default config for unknown sources
  if (url.includes('gov.uk')) {
    return {
      name: 'GOV.UK',
      baseUrl: 'https://www.gov.uk',
      type: 'policy',
      reliability: 'official',
      method: 'playwright',
      playwright: {
        expandAll: true,
      },
      refreshFrequency: 'weekly',
    };
  }
  
  return undefined;
}

// Get available scraping methods
export function getAvailableMethods(): { method: ScrapingMethod; available: boolean; reason?: string }[] {
  return [
    { method: 'jina', available: true },
    { method: 'firecrawl', available: !!process.env.FIRECRAWL_API_KEY, reason: 'FIRECRAWL_API_KEY not set' },
    { method: 'playwright', available: true },
  ];
}

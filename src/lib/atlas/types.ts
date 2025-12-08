// ============================================================================
// ATLAS EXTRACTION PIPELINE - TYPE DEFINITIONS
// ============================================================================

// === TRANSPORT MODES (Your Taxonomy) ===
export type TransportMode = 
  | 'Aviation'
  | 'Maritime'
  | 'Rail'
  | 'Highways'
  | 'Integrated'
  | 'Cross-modal';

// === STRATEGIC THEMES (CPC Taxonomy) ===
export type StrategicTheme =
  | 'Autonomy'
  | 'Decarbonisation'
  | 'People Experience'
  | 'Hubs and Clusters'
  | 'Planning and Operation'
  | 'Industry';

// === CHALLENGE TYPES ===
export type ChallengeType =
  | 'technology_development'
  | 'infrastructure'
  | 'policy_regulatory'
  | 'skills_workforce'
  | 'market_commercial'
  | 'integration_interoperability'
  | 'safety_security'
  | 'sustainability'
  | 'data_digital';

// === SOURCE TYPES ===
export type SourceType = 'funding' | 'policy' | 'strategy' | 'announcement' | 'report';
export type SourceReliability = 'official' | 'aggregator' | 'industry' | 'news';
export type FundingType = 'grant' | 'contract' | 'investment' | 'prize' | 'procurement';

// === SOURCE INFORMATION ===
export interface SourceInfo {
  id: string;
  name: string;                    // "Innovate UK", "DfT", "Horizon Europe"
  type: SourceType;
  url: string;
  reliability: SourceReliability;
  
  // History tracking
  firstSeen: string;
  lastSeen: string;
  lastModified?: string;
  contentHash: string;
  
  // Version history
  previousVersions?: {
    scrapedAt: string;
    contentHash: string;
    changes?: string[];
  }[];
}

// === EXTRACTION METADATA ===
export interface ExtractionMeta {
  confidence: number;              // 0-1 overall confidence
  model: string;                   // "claude-sonnet-4-20250514"
  extractedAt: string;
  stages: {
    stage: string;
    confidence: number;
    duration: number;              // ms
  }[];
  rawText: string;                 // Original for verification
  rawTextHash: string;
}

// === CLASSIFICATION WITH CONFIDENCE ===
export interface ClassificationResult<T> {
  value: T;
  confidence: number;
  reasoning?: string;
}

// === FUNDING INFORMATION ===
export interface FundingInfo {
  min?: number;
  max?: number;
  currency: 'GBP' | 'EUR' | 'USD';
  type: FundingType;
  totalPot?: number;               // Total competition pot
  projectRange?: string;           // "£500k - £2m per project"
}

// === CONTEXT ENRICHMENT ===
export interface ChallengeContext {
  marketContext?: string;          // Why this matters now
  policyDrivers?: string[];        // Related policies/strategies
  technologyLandscape?: string;    // Current state of tech
  barriers?: string[];             // What's blocking progress
  relatedChallenges?: string[];    // Similar challenges we've seen
}

// === MAIN CHALLENGE ENTITY ===
export interface ExtractedChallenge {
  // === IDENTITY ===
  id: string;
  source: SourceInfo;
  
  // === CORE CONTENT ===
  title: string;
  description: string;
  summary: string;                 // AI-generated 2-3 sentences
  problemStatement: string;        // Core problem being addressed
  
  // === CLASSIFICATION (Primary) ===
  modes: TransportMode[];
  strategicThemes: StrategicTheme[];
  challengeType: ChallengeType;
  sectors?: string[];              // Broader sector tags
  
  // === CLASSIFICATION (With Confidence) ===
  classification: {
    modes: ClassificationResult<TransportMode>[];
    themes: ClassificationResult<StrategicTheme>[];
    challengeType: ClassificationResult<ChallengeType>;
  };
  
  // === RELATED (Secondary mentions) ===
  relatedModes?: TransportMode[];
  relatedThemes?: StrategicTheme[];
  
  // === MATURITY ===
  trl?: { min: number; max: number };
  stage?: 'research' | 'development' | 'demonstration' | 'deployment';
  
  // === FUNDING ===
  funding?: FundingInfo;
  
  // === TIMING ===
  deadline?: string;
  publishedDate?: string;
  duration?: string;
  
  // === ENTITIES ===
  keyEntities: string[];           // Orgs, technologies, places mentioned
  eligibility?: string[];
  deliverables?: string[];
  
  // === ENRICHMENT ===
  context: ChallengeContext;
  
  // === FOR VECTOR SEARCH ===
  embeddingText: string;
  
  // === PROVENANCE ===
  extraction: ExtractionMeta;
  
  // === VALIDATION ===
  validation: {
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
}

// === SCRAPING CONFIGURATION ===
export interface ScrapingConfig {
  name: string;
  baseUrl: string;
  type: SourceType;
  reliability: SourceReliability;
  method: 'jina' | 'firecrawl' | 'apify' | 'direct' | 'playwright';
  refreshFrequency: 'daily' | 'weekly' | 'monthly';
  selectors?: {
    title?: string;
    description?: string;
    deadline?: string;
    funding?: string;
  };
  extractionHints?: string;        // Source-specific prompt additions
  playwright?: {
    interactions?: Array<{
      action: 'click' | 'wait' | 'scroll' | 'select' | 'type' | 'hover';
      selector: string;
      value?: string;
      timeout?: number;
      waitAfter?: number;
    }>;
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    expandAll?: boolean;
  };
}

// === PIPELINE RESULT ===
export interface ExtractionResult {
  success: boolean;
  challenge?: ExtractedChallenge;
  error?: string;
  duration: number;
}

// === BATCH RESULT ===
export interface BatchExtractionResult {
  total: number;
  successful: number;
  failed: number;
  challenges: ExtractedChallenge[];
  errors: { url: string; error: string }[];
}


// ============================================================================
// ATLAS EXTRACTOR V2 - Uses provider abstraction (OpenAI default)
// ============================================================================

import crypto from 'crypto';
import { AIClient, getAIClient, AIProvider } from './ai-provider';
import type {
  ExtractedChallenge,
  ExtractionResult,
  TransportMode,
  StrategicTheme,
  ChallengeType,
  ClassificationResult,
  SourceInfo,
  ScrapingConfig,
} from './types';
import { scrape, buildSourceInfo, detectSourceConfig } from './scraper';
import { validateChallenge } from './validator';

// ============================================================================
// EXTRACTION OPTIONS
// ============================================================================

export interface ExtractionOptions {
  provider?: AIProvider;
  model?: string;
  firecrawlApiKey?: string;
  existingSource?: SourceInfo;
  skipEnrichment?: boolean;
  onStageComplete?: (stage: string, duration: number, cost: number) => void;
}

// ============================================================================
// TOOL DEFINITIONS (Same for both providers)
// ============================================================================

const EXTRACT_CORE_TOOL = {
  name: 'extract_core_fields',
  description: 'Extract core structured fields from a challenge/opportunity document',
  parameters: {
    type: 'object',
    properties: {
      title: { 
        type: 'string', 
        description: 'The title or name of the challenge/competition/opportunity' 
      },
      description: { 
        type: 'string', 
        description: 'Full description text (can be long)' 
      },
      fundingMin: { 
        type: 'number', 
        description: 'Minimum funding amount per project in base currency units' 
      },
      fundingMax: { 
        type: 'number', 
        description: 'Maximum funding amount per project in base currency units' 
      },
      fundingCurrency: { 
        type: 'string', 
        enum: ['GBP', 'EUR', 'USD'],
        description: 'Currency of funding amounts' 
      },
      fundingType: { 
        type: 'string', 
        enum: ['grant', 'contract', 'investment', 'prize'],
        description: 'Type of funding mechanism' 
      },
      totalPot: { 
        type: 'number', 
        description: 'Total funding pot available for the whole competition' 
      },
      deadline: { 
        type: 'string', 
        description: 'Submission deadline in YYYY-MM-DD format' 
      },
      publishedDate: { 
        type: 'string', 
        description: 'Publication or opening date in YYYY-MM-DD format' 
      },
      duration: { 
        type: 'string', 
        description: 'Project duration if specified (e.g., "18 months", "3 years")' 
      },
      trlMin: { 
        type: 'number', 
        description: 'Minimum TRL level required (1-9)' 
      },
      trlMax: { 
        type: 'number', 
        description: 'Maximum TRL level expected (1-9)' 
      },
      eligibility: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'List of eligibility criteria' 
      },
      keyEntitiesMentioned: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Organizations, technologies, places, programmes explicitly mentioned' 
      },
    },
    required: ['title', 'description'],
  },
};

const ENRICH_TOOL = {
  name: 'enrich_challenge',
  description: 'Add summary, problem statement, and context to a challenge',
  parameters: {
    type: 'object',
    properties: {
      summary: { 
        type: 'string', 
        description: '2-3 sentence summary of the challenge/opportunity' 
      },
      problemStatement: { 
        type: 'string', 
        description: 'The core problem being addressed (1-2 sentences)' 
      },
      marketContext: { 
        type: 'string', 
        description: 'Why this challenge matters now, market drivers' 
      },
      policyDrivers: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Relevant UK/EU policies and strategies' 
      },
      barriers: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Typical barriers to progress on this type of challenge' 
      },
    },
    required: ['summary', 'problemStatement'],
  },
};

// ============================================================================
// STAGE 1: CORE EXTRACTION
// ============================================================================

interface Stage1Output {
  title: string;
  description: string;
  fundingMin?: number;
  fundingMax?: number;
  fundingCurrency?: 'GBP' | 'EUR' | 'USD';
  fundingType?: 'grant' | 'contract' | 'investment' | 'prize';
  totalPot?: number;
  deadline?: string;
  publishedDate?: string;
  duration?: string;
  trlMin?: number;
  trlMax?: number;
  eligibility?: string[];
  keyEntitiesMentioned?: string[];
}

async function extractCoreFields(
  client: AIClient,
  rawText: string,
  sourceHints?: string
): Promise<{ output: Stage1Output; duration: number; cost: number; confidence: number }> {
  const startTime = Date.now();
  
  const systemPrompt = `You are a precise data extraction assistant. Extract structured information from funding calls, policy documents, and innovation challenges.

RULES:
- Extract ONLY information explicitly stated in the text
- If a field is not mentioned, return null
- For dates, use ISO format (YYYY-MM-DD)
- For currency, infer from context (£ = GBP, € = EUR, $ = USD)
- For funding amounts, convert to numbers (e.g., "£5 million" = 5000000)

${sourceHints || ''}`;

  const response = await client.call(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract structured data from this document:\n\n${rawText.slice(0, 15000)}` },
    ],
    {
      tools: [EXTRACT_CORE_TOOL],
      toolChoice: 'extract_core_fields',
      operation: 'extraction',
    }
  );

  if (!response.toolCalls || response.toolCalls.length === 0) {
    throw new Error('Stage 1: No tool response');
  }

  const output = response.toolCalls[0].arguments as Stage1Output;
  const duration = Date.now() - startTime;
  
  // Calculate confidence
  const optionalFields = ['fundingMin', 'fundingMax', 'deadline', 'trlMin', 'eligibility'];
  const extractedOptional = optionalFields.filter(f => output[f as keyof Stage1Output] != null);
  const confidence = 0.5 + (extractedOptional.length / optionalFields.length) * 0.5;

  return { output, duration, cost: response.cost, confidence };
}

// ============================================================================
// STAGE 2: CLASSIFICATION
// ============================================================================

interface Stage2Output {
  modes: ClassificationResult<TransportMode>[];
  themes: ClassificationResult<StrategicTheme>[];
  challengeType: ClassificationResult<ChallengeType>;
  sectors?: string[];
}

// Few-shot examples (abbreviated - full version in data/few-shot-examples.json)
const CLASSIFICATION_EXAMPLES = `
EXAMPLE 1:
Title: "Net Zero Aviation Fuels"
Description: "Innovate UK competition for SAF development..."
Output: modes: ["Aviation"], themes: ["Decarbonisation", "Industry"], type: "technology_development"

EXAMPLE 2:
Title: "Clean Maritime Plan 2025"
Description: "DfT strategy for zero-emission vessels..."
Output: modes: ["Maritime"], themes: ["Decarbonisation", "Policy"], type: "policy_regulatory"

EXAMPLE 3:
Title: "Hydrogen Transport Innovation"
Description: "Cross-modal hydrogen infrastructure..."
Output: modes: ["Cross-modal", "Highways", "Maritime", "Rail"], themes: ["Decarbonisation", "Hubs and Clusters"], type: "infrastructure"
`;

async function classifyChallenge(
  client: AIClient,
  coreFields: Stage1Output
): Promise<{ output: Stage2Output; duration: number; cost: number; confidence: number }> {
  const startTime = Date.now();

  const systemPrompt = `You are an expert at classifying UK transport innovation challenges.

## TAXONOMY

### Transport Modes:
- Aviation: aircraft, airports, airspace, drones, eVTOL, SAF, airlines
- Maritime: ships, ports, shipping, coastal, offshore, vessels
- Rail: trains, railways, stations, rolling stock, signalling, Network Rail
- Highways: roads, vehicles, traffic, EVs, motorways, HGVs
- Integrated: multi-modal, MaaS, ticketing, journey planning
- Cross-modal: applies to 3+ modes OR mode-agnostic

### Strategic Themes:
- Autonomy: autonomous systems, AI operations, automation
- Decarbonisation: emissions, clean fuels, electrification, hydrogen
- People Experience: passengers, accessibility, safety, workforce
- Hubs and Clusters: infrastructure integration, depots
- Planning and Operation: efficiency, maintenance, logistics
- Industry: supply chain, manufacturing, commercialisation

### Challenge Types:
- technology_development, infrastructure, policy_regulatory, skills_workforce,
- market_commercial, integration_interoperability, safety_security, sustainability, data_digital

## EXAMPLES
${CLASSIFICATION_EXAMPLES}

## OUTPUT FORMAT
Return JSON:
{
  "modes": [{ "value": "MODE", "confidence": 0.X, "reasoning": "..." }],
  "themes": [{ "value": "THEME", "confidence": 0.X, "reasoning": "..." }],
  "challengeType": { "value": "TYPE", "confidence": 0.X, "reasoning": "..." }
}`;

  const response = await client.call(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Classify:\nTitle: ${coreFields.title}\nDescription: ${coreFields.description.slice(0, 3000)}` },
    ],
    { operation: 'classification' }
  );

  // Parse JSON from response
  if (!response.content) {
    throw new Error('Stage 2: Empty response from AI');
  }
  
  // Try to find JSON in response (might be wrapped in markdown code blocks or have extra text)
  let jsonMatch = response.content.match(/\{[\s\S]*\}/);
  
  // If no match, try to find JSON in code blocks
  if (!jsonMatch) {
    const codeBlockMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonMatch = [codeBlockMatch[1]];
    }
  }
  
  if (!jsonMatch) {
    console.error('Stage 2: No JSON found in response:', response.content.substring(0, 500));
    throw new Error(`Stage 2: No valid JSON in AI response. Response preview: ${response.content.substring(0, 200)}`);
  }

  let output: Stage2Output;
  try {
    output = JSON.parse(jsonMatch[0]) as Stage2Output;
  } catch (parseError) {
    console.error('Stage 2: JSON parse error:', parseError);
    console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
    throw new Error(`Stage 2: Failed to parse JSON from AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
  }
  const duration = Date.now() - startTime;
  
  const confidence = (
    (output.modes[0]?.confidence || 0) +
    (output.themes[0]?.confidence || 0) +
    output.challengeType.confidence
  ) / 3;

  return { output, duration, cost: response.cost, confidence };
}

// ============================================================================
// STAGE 3: ENRICHMENT
// ============================================================================

interface Stage3Output {
  summary: string;
  problemStatement: string;
  context: {
    marketContext?: string;
    policyDrivers?: string[];
    barriers?: string[];
  };
}

async function enrichChallenge(
  client: AIClient,
  coreFields: Stage1Output,
  classification: Stage2Output
): Promise<{ output: Stage3Output; duration: number; cost: number; confidence: number }> {
  const startTime = Date.now();

  const systemPrompt = `You are an expert in UK transport innovation.

RULES:
1. SUMMARY: 2-3 sentences capturing the key opportunity
2. PROBLEM STATEMENT: The core PROBLEM being addressed (not the solution)
   - WRONG: "Develop sustainable aviation fuels"
   - RIGHT: "Aviation contributes 2.5% of global CO2 with no scalable fuel alternative"
3. CONTEXT: Add relevant background from your knowledge`;

  const response = await client.call(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Enrich this challenge:
Title: ${coreFields.title}
Description: ${coreFields.description.slice(0, 2000)}
Modes: ${classification.modes.map(m => m.value).join(', ')}
Themes: ${classification.themes.map(t => t.value).join(', ')}` },
    ],
    {
      tools: [ENRICH_TOOL],
      toolChoice: 'enrich_challenge',
      operation: 'enrichment',
    }
  );

  if (!response.toolCalls || response.toolCalls.length === 0) {
    throw new Error('Stage 3: No tool response');
  }

  const input = response.toolCalls[0].arguments as {
    summary: string;
    problemStatement: string;
    marketContext?: string;
    policyDrivers?: string[];
    barriers?: string[];
  };

  const output: Stage3Output = {
    summary: input.summary,
    problemStatement: input.problemStatement,
    context: {
      marketContext: input.marketContext,
      policyDrivers: input.policyDrivers,
      barriers: input.barriers,
    },
  };

  return { output, duration: Date.now() - startTime, cost: response.cost, confidence: 0.8 };
}

// ============================================================================
// EMBEDDING TEXT BUILDER
// ============================================================================

function buildEmbeddingText(challenge: Partial<ExtractedChallenge>): string {
  return [
    challenge.title,
    challenge.problemStatement,
    challenge.modes?.join(', '),
    challenge.strategicThemes?.join(', '),
    challenge.keyEntities?.join(', '),
    challenge.context?.barriers?.join(', '),
    challenge.summary,
  ].filter(Boolean).join('. ');
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

export async function extractChallenge(
  url: string,
  options?: ExtractionOptions
): Promise<ExtractionResult & { totalCost: number }> {
  const startTime = Date.now();
  let totalCost = 0;

  try {
    // Get or create AI client with specified provider
    const client = getAIClient({
      provider: options?.provider || 'openai',
      model: options?.model,
    });

    // Detect source configuration
    const sourceConfig = detectSourceConfig(url) || {
      name: 'Unknown',
      baseUrl: url,
      type: 'funding' as const,
      reliability: 'aggregator' as const,
      method: 'jina' as const,
      refreshFrequency: 'weekly' as const,
    };

    // SCRAPE
    console.log(`[Atlas] Scraping ${url}...`);
    const { content, hash } = await scrape(url, sourceConfig, options?.firecrawlApiKey);
    const source = buildSourceInfo(url, sourceConfig, hash, options?.existingSource);

    // STAGE 1: Extract
    console.log('[Atlas] Stage 1: Extracting...');
    const stage1 = await extractCoreFields(client, content, sourceConfig.extractionHints);
    totalCost += stage1.cost;
    options?.onStageComplete?.('extraction', stage1.duration, stage1.cost);

    // STAGE 2: Classify
    console.log('[Atlas] Stage 2: Classifying...');
    const stage2 = await classifyChallenge(client, stage1.output);
    totalCost += stage2.cost;
    options?.onStageComplete?.('classification', stage2.duration, stage2.cost);

    // STAGE 3: Enrich
    let stage3: { output: Stage3Output; duration: number; cost: number; confidence: number };
    if (options?.skipEnrichment) {
      stage3 = {
        output: {
          summary: stage1.output.description.slice(0, 200) + '...',
          problemStatement: '',
          context: {},
        },
        duration: 0,
        cost: 0,
        confidence: 0.5,
      };
    } else {
      console.log('[Atlas] Stage 3: Enriching...');
      stage3 = await enrichChallenge(client, stage1.output, stage2.output);
      totalCost += stage3.cost;
      options?.onStageComplete?.('enrichment', stage3.duration, stage3.cost);
    }

    // Build challenge
    const challenge: ExtractedChallenge = {
      id: `atlas-${hash.slice(0, 8)}`,
      source,
      title: stage1.output.title,
      description: stage1.output.description,
      summary: stage3.output.summary,
      problemStatement: stage3.output.problemStatement,
      modes: stage2.output.modes.map(m => m.value),
      strategicThemes: stage2.output.themes.map(t => t.value),
      challengeType: stage2.output.challengeType.value,
      classification: {
        modes: stage2.output.modes,
        themes: stage2.output.themes,
        challengeType: stage2.output.challengeType,
      },
      sectors: stage2.output.sectors,
      trl: stage1.output.trlMin
        ? { min: stage1.output.trlMin, max: stage1.output.trlMax || stage1.output.trlMin }
        : undefined,
      funding: stage1.output.fundingMax
        ? {
            min: stage1.output.fundingMin,
            max: stage1.output.fundingMax,
            currency: stage1.output.fundingCurrency || 'GBP',
            type: stage1.output.fundingType || 'grant',
            totalPot: stage1.output.totalPot,
          }
        : undefined,
      deadline: stage1.output.deadline,
      publishedDate: stage1.output.publishedDate,
      duration: stage1.output.duration,
      keyEntities: stage1.output.keyEntitiesMentioned || [],
      eligibility: stage1.output.eligibility,
      context: stage3.output.context,
      embeddingText: '',
      extraction: {
        confidence: (stage1.confidence + stage2.confidence + stage3.confidence) / 3,
        model: client.getConfig().model,
        extractedAt: new Date().toISOString(),
        stages: [
          { stage: 'extraction', confidence: stage1.confidence, duration: stage1.duration },
          { stage: 'classification', confidence: stage2.confidence, duration: stage2.duration },
          { stage: 'enrichment', confidence: stage3.confidence, duration: stage3.duration },
        ],
        rawText: content,
        rawTextHash: hash,
      },
      validation: { passed: false, warnings: [], errors: [] },
    };

    // Validate
    console.log('[Atlas] Stage 4: Validating...');
    challenge.validation = validateChallenge(challenge, content);
    challenge.embeddingText = buildEmbeddingText(challenge);

    const totalDuration = Date.now() - startTime;
    console.log(`[Atlas] Complete in ${totalDuration}ms, cost: $${totalCost.toFixed(4)}`);

    return {
      success: true,
      challenge,
      duration: totalDuration,
      totalCost,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Atlas] Extraction failed:', {
      url,
      error: errorMessage,
      stack: errorStack,
      duration: Date.now() - startTime,
      totalCost,
    });
    
    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
      totalCost,
    };
  }
}

// ============================================================================
// GET COST SUMMARY
// ============================================================================

export function getExtractionCostSummary() {
  const client = getAIClient();
  return client.getCostSummary();
}

export function getExtractionCostHistory() {
  const client = getAIClient();
  return client.getCostHistory();
}

export function getCostByOperation() {
  const client = getAIClient();
  return client.getCostByOperation();
}

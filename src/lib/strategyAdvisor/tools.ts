/**
 * Strategy Advisor Tools
 * 
 * AI function tools for the Strategy Advisor feature.
 * These enable the AI to search, analyze, and generate insights about funding challenges.
 */

import type { AtlasChallenge } from '@/types/atlas';
import type { BaseEntity } from '@/lib/base-entity-enhanced';
import type { TransportMode, StrategicTheme } from '@/types/atlas';

/**
 * Tool definitions for AI function calling
 * Compatible with OpenAI function calling format
 */
export const strategyAdvisorTools = [
  {
    name: 'search_challenges',
    description: 'Search funding challenges by semantic query and filters. Returns matching challenges with relevance scores.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Semantic search query (e.g., "hydrogen aviation opportunities")',
        },
        modes: {
          type: 'array',
          items: { type: 'string', enum: ['Rail', 'Aviation', 'Maritime', 'Highways'] },
          description: 'Filter by transport mode',
        },
        themes: {
          type: 'array',
          items: { 
            type: 'string', 
            enum: ['Decarbonisation', 'Autonomy', 'Safety', 'People Experience', 'Supply Chain'] 
          },
          description: 'Filter by strategic theme',
        },
        minFunding: {
          type: 'number',
          description: 'Minimum funding amount in GBP',
        },
        maxTrl: {
          type: 'number',
          description: 'Maximum TRL (Technology Readiness Level)',
        },
        smeOnly: {
          type: 'boolean',
          description: 'Show only SME-specific challenges',
        },
        deadlineBefore: {
          type: 'string',
          description: 'ISO date string - filter challenges with deadlines before this date',
        },
        status: {
          type: 'array',
          items: { 
            type: 'string', 
            enum: ['open', 'upcoming', 'ongoing', 'closing'] 
          },
          description: 'Filter by challenge status',
        },
        minRelevance: {
          type: 'number',
          description: 'Minimum CPC relevance score (1-10)',
        },
      },
    },
  },
  {
    name: 'analyze_funding_landscape',
    description: 'Get summary statistics and analysis for a sector or theme. Provides funding totals, counts, and key insights.',
    parameters: {
      type: 'object',
      properties: {
        modes: {
          type: 'array',
          items: { type: 'string', enum: ['Rail', 'Aviation', 'Maritime', 'Highways'] },
          description: 'Filter by transport mode',
        },
        themes: {
          type: 'array',
          items: { 
            type: 'string', 
            enum: ['Decarbonisation', 'Autonomy', 'Safety', 'People Experience', 'Supply Chain'] 
          },
          description: 'Filter by strategic theme',
        },
        tiers: {
          type: 'array',
          items: { type: 'number', enum: [1, 2, 3, 4, 5] },
          description: 'Filter by source tier',
        },
      },
    },
  },
  {
    name: 'find_matching_opportunities',
    description: 'Find challenges matching a specific capability, technology, or TRL range. Useful for finding opportunities that match CPC capabilities.',
    parameters: {
      type: 'object',
      properties: {
        capability: {
          type: 'string',
          description: 'Capability or technology description (e.g., "hydrogen storage", "autonomous navigation")',
        },
        trlRange: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2,
          description: 'TRL range [min, max]',
        },
        minFunding: {
          type: 'number',
          description: 'Minimum funding amount',
        },
      },
    },
  },
  {
    name: 'compare_opportunities',
    description: 'Compare multiple challenges side by side. Returns detailed comparison of funding, eligibility, timelines, and relevance.',
    parameters: {
      type: 'object',
      properties: {
        challengeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of challenge IDs to compare',
        },
      },
    },
  },
  {
    name: 'generate_strategy_brief',
    description: 'Generate a strategic brief document based on analysis. Creates formatted text suitable for reports.',
    parameters: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          description: 'Focus area or topic for the brief (e.g., "aviation decarbonisation opportunities")',
        },
        includeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific challenge IDs to include in the brief',
        },
        format: {
          type: 'string',
          enum: ['summary', 'detailed'],
          description: 'Brief format - summary (1-2 pages) or detailed (comprehensive)',
        },
      },
    },
  },
];

/**
 * Tool execution handlers
 * These functions implement the actual logic for each tool
 */

export interface SearchChallengesParams {
  query?: string;
  modes?: TransportMode[];
  themes?: StrategicTheme[];
  minFunding?: number;
  maxTrl?: number;
  smeOnly?: boolean;
  deadlineBefore?: string;
  status?: string[];
  minRelevance?: number;
}

export interface SearchChallengesResult {
  challenges: Array<{
    id: string;
    title: string;
    fundingAmount: number;
    deadline: string;
    relevanceScore: number;
    modes: TransportMode[];
    themes: StrategicTheme[];
  }>;
  total: number;
  totalFunding: number;
}

/**
 * Execute search_challenges tool
 * Note: This is a stub - actual implementation would query the vector store
 */
export async function executeSearchChallenges(
  params: SearchChallengesParams,
  entities: BaseEntity[]
): Promise<SearchChallengesResult> {
  // Filter entities by criteria
  let filtered = entities.filter(e => 
    e.domain === 'atlas' && 
    e.entityType === 'challenge'
  );

  // Apply filters
  if (params.modes && params.modes.length > 0) {
    filtered = filtered.filter(e => {
      const custom = e.metadata.custom as any;
      const entityModes = custom?.modes || [];
      return params.modes!.some(mode => entityModes.includes(mode));
    });
  }

  if (params.themes && params.themes.length > 0) {
    filtered = filtered.filter(e => {
      const custom = e.metadata.custom as any;
      const entityThemes = custom?.strategicThemes || [];
      return params.themes!.some(theme => entityThemes.includes(theme));
    });
  }

  if (params.minFunding) {
    filtered = filtered.filter(e => {
      const funding = e.metadata.funding?.amount || 0;
      return funding >= params.minFunding!;
    });
  }

  if (params.smeOnly) {
    filtered = filtered.filter(e => {
      const custom = e.metadata.custom as any;
      return custom?.eligibility?.sme_specific === true;
    });
  }

  if (params.status && params.status.length > 0) {
    filtered = filtered.filter(e => {
      return params.status!.includes(e.metadata.status || '');
    });
  }

  if (params.minRelevance) {
    filtered = filtered.filter(e => {
      const custom = e.metadata.custom as any;
      return (custom?.cpcRelevance?.score || 0) >= params.minRelevance!;
    });
  }

  // TODO: Semantic search if query provided (would use vector store)
  // For now, simple keyword matching
  if (params.query) {
    const queryLower = params.query.toLowerCase();
    filtered = filtered.filter(e => {
      const searchable = [
        e.name,
        e.description,
        ...(e.metadata.tags || []),
      ].join(' ').toLowerCase();
      return searchable.includes(queryLower);
    });
  }

  // Sort by relevance score
  filtered.sort((a, b) => {
    const aScore = (a.metadata.custom as any)?.cpcRelevance?.score || 0;
    const bScore = (b.metadata.custom as any)?.cpcRelevance?.score || 0;
    return bScore - aScore;
  });

  // Format results
  const challenges = filtered.map(e => {
    const custom = e.metadata.custom as any;
    return {
      id: e.id,
      title: e.name,
      fundingAmount: e.metadata.funding?.amount || 0,
      deadline: custom?.eligibility?.deadline || '',
      relevanceScore: custom?.cpcRelevance?.score || 0,
      modes: custom?.modes || [],
      themes: custom?.strategicThemes || [],
    };
  });

  const totalFunding = challenges.reduce((sum, c) => sum + c.fundingAmount, 0);

  return {
    challenges,
    total: challenges.length,
    totalFunding,
  };
}


/**
 * Transform Atlas Challenge to BaseEntity
 * 
 * Converts AtlasChallenge format to the unified BaseEntity schema
 * for use across all visualizations and AI features.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import type { EntityType, Domain } from '@/lib/base-entity';
import type { AtlasChallenge } from '@/types/atlas';
import { createDefaultProvenance } from '@/lib/base-entity-enhanced';

/**
 * Transform a single AtlasChallenge to BaseEntity
 */
export function transformChallengeToEntity(challenge: AtlasChallenge): BaseEntity {
  const now = new Date().toISOString();
  
  // Build searchable text for embeddings
  const searchableText = [
    challenge.title,
    challenge.description,
    challenge.source,
    challenge.funding_body,
    challenge.programme,
    ...challenge.focus_areas,
    ...challenge.modes,
    ...challenge.strategic_themes,
  ].filter(Boolean).join(' ');

  // Build tags for filtering/faceting
  const tags = [
    ...challenge.modes,
    ...challenge.strategic_themes,
    ...challenge.focus_areas,
    `tier-${challenge.source_tier}`,
    challenge.eligibility.sme_specific ? 'sme-specific' : null,
    challenge.eligibility.collaboration_required ? 'collaboration-required' : null,
    `status-${challenge.status}`,
    `deadline-${challenge.deadline_type}`,
    challenge.cpc_relevance.score >= 7 ? 'high-priority' : null,
  ].filter(Boolean) as string[];

  // Parse TRL range if available
  let trlValue: { min: number; max: number } | undefined;
  if (challenge.trl_range) {
    const trlMatch = challenge.trl_range.match(/(\d+)\s*-\s*(\d+)/);
    if (trlMatch) {
      trlValue = {
        min: parseInt(trlMatch[1], 10),
        max: parseInt(trlMatch[2], 10),
      };
    } else {
      // Single TRL value
      const singleTrl = parseInt(challenge.trl_range, 10);
      if (!isNaN(singleTrl)) {
        trlValue = { min: singleTrl, max: singleTrl };
      }
    }
  }

  // Create BaseEntity
  const entity: BaseEntity = {
    _version: '1.0',
    id: challenge.id,
    name: challenge.title,
    description: challenge.description,
    entityType: 'challenge' as EntityType,
    domain: 'atlas' as Domain,
    
    // Metadata with all challenge-specific data
    metadata: {
      sector: challenge.modes,
      tags,
      category: challenge.programme,
      
      // TRL
      trl: trlValue ? {
        current: trlValue.min,
        min: trlValue.min,
        max: trlValue.max,
      } : undefined,
      
      // Status
      status: challenge.status,
      
      // Funding
      funding: {
        amount: challenge.funding_amount_gbp,
        currency: 'GBP',
        source: challenge.funding_body,
        type: 'grant', // Default, can be enhanced if funding_type field exists
      },
      
      // Dates
      dates: {
        end: challenge.deadline ? new Date(challenge.deadline).toISOString() : undefined,
      },
      
      // Location
      location: {
        country: challenge.eligibility.geographic === 'UK' ? 'UK' : undefined,
        region: challenge.eligibility.geographic !== 'UK' ? challenge.eligibility.geographic : undefined,
      },
      
      // Custom Atlas-specific fields
      custom: {
        source: challenge.source,
        sourceTier: challenge.source_tier,
        fundingBody: challenge.funding_body,
        programme: challenge.programme,
        url: challenge.url,
        fundingRange: challenge.funding_range,
        grantRate: challenge.grant_rate_percent,
        deadlineType: challenge.deadline_type,
        modes: challenge.modes,
        strategicThemes: challenge.strategic_themes,
        focusAreas: challenge.focus_areas,
        trlRange: challenge.trl_range,
        eligibility: challenge.eligibility,
        cpcRelevance: challenge.cpc_relevance,
      },
    },
    
    // Relationships will be computed separately if needed
    relationships: [],
    
    // Visualization hints
    visualizationHints: {
      color: getColorForTier(challenge.source_tier),
      size: Math.log10(challenge.funding_amount_gbp + 1) * 10, // Log scale for size
      priority: challenge.cpc_relevance.score,
    },
    
    // Provenance - mark as imported from Atlas dataset
    provenance: createDefaultProvenance({
      type: 'api_import',
      name: 'Atlas Challenges Dataset',
      reference: challenge.url,
      ingestedBy: 'atlas-import-script',
    }),
    
    // Searchable text for embeddings
    searchableText,
  };

  return entity;
}

/**
 * Get color for tier (for visualization)
 */
function getColorForTier(tier: 1 | 2 | 3 | 4 | 5): string {
  const colors: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: '#0066CC', // Core Transport - Blue
    2: '#00A86B', // Government - Green
    3: '#FF6B35', // International - Orange
    4: '#9B59B6', // Regional - Purple
    5: '#E74C3C', // Industry - Red
  };
  return colors[tier] || '#666666';
}

/**
 * Batch transform multiple challenges
 */
export function transformChallengesToEntities(challenges: AtlasChallenge[]): BaseEntity[] {
  return challenges.map(transformChallengeToEntity);
}


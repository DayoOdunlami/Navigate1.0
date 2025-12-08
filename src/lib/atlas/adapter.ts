// ============================================================================
// ATLAS TO CHALLENGE ADAPTER
// Converts Atlas ExtractedChallenge to the existing Challenge format
// ============================================================================

import type { ExtractedChallenge } from './types';
import type { Challenge, Sector } from '../types';

// Map Atlas transport modes to existing sectors
function mapModeToSector(mode: string): Sector {
  const modeLower = mode.toLowerCase();
  
  if (modeLower.includes('aviation') || modeLower.includes('air')) {
    return 'aviation';
  }
  if (modeLower.includes('rail') || modeLower.includes('train')) {
    return 'rail';
  }
  if (modeLower.includes('maritime') || modeLower.includes('ship') || modeLower.includes('port')) {
    return 'transport'; // Maritime falls under transport
  }
  if (modeLower.includes('highway') || modeLower.includes('road') || modeLower.includes('vehicle')) {
    return 'transport';
  }
  if (modeLower.includes('integrated') || modeLower.includes('cross-modal')) {
    return 'transport';
  }
  
  // Default fallback
  return 'transport';
}

// Map Atlas challenge types to problem types
function mapChallengeTypeToProblemType(challengeType: string): string {
  const typeMap: Record<string, string> = {
    'technology_development': 'Technology Development',
    'infrastructure': 'Infrastructure Development',
    'policy_regulatory': 'Policy & Regulatory',
    'skills_workforce': 'Skills & Workforce',
    'market_commercial': 'Market & Commercial',
    'integration_interoperability': 'Integration & Interoperability',
    'safety_security': 'Safety & Security',
    'sustainability': 'Sustainability',
    'data_digital': 'Data & Digital',
  };
  
  return typeMap[challengeType] || 'General Innovation';
}

// Map funding type
function mapFundingType(fundingType: string): Challenge['funding']['mechanism'] {
  const typeMap: Record<string, Challenge['funding']['mechanism']> = {
    'grant': 'grant',
    'contract': 'contract',
    'investment': 'partnership',
    'prize': 'innovation_voucher',
    'procurement': 'contract',
  };
  
  return typeMap[fundingType] || 'grant';
}

// Determine urgency from deadline
function determineUrgency(deadline?: string): 'critical' | 'moderate' | 'flexible' {
  if (!deadline) return 'flexible';
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 30) return 'critical';
  if (daysUntil < 90) return 'moderate';
  return 'flexible';
}

// Determine funding type
function determineFundingType(funding?: { min?: number; max?: number }): Challenge['funding']['type'] {
  if (!funding) return 'unknown';
  if (funding.min && funding.max && funding.min === funding.max) return 'fixed';
  if (funding.min || funding.max) return 'range';
  return 'unknown';
}

// Extract organization from source
function extractOrganization(sourceName: string): { organization: string; org_type: Challenge['buyer']['org_type'] } {
  const orgTypeMap: Record<string, Challenge['buyer']['org_type']> = {
    'Innovate UK': 'government',
    'UKRI': 'government',
    'Department for Transport': 'government',
    'DfT': 'government',
    'Horizon Europe': 'government',
    'SBRI': 'government',
    'Network Rail': 'national_infrastructure',
    'National Highways': 'national_infrastructure',
    'Aerospace Technology Institute': 'government',
    'ATI': 'government',
    'KTN': 'regulator',
    'Maritime UK': 'private',
  };
  
  return {
    organization: sourceName,
    org_type: orgTypeMap[sourceName] || 'government',
  };
}

// Main adapter function
export function adaptAtlasChallengeToChallenge(atlasChallenge: ExtractedChallenge): Challenge {
  const primarySector = mapModeToSector(atlasChallenge.modes[0] || 'transport');
  const secondarySectors = atlasChallenge.modes.slice(1).map(mapModeToSector).filter(s => s !== primarySector);
  
  // Build keywords from various fields
  const keywords = [
    ...atlasChallenge.modes,
    ...atlasChallenge.strategicThemes,
    ...atlasChallenge.keyEntities,
    ...(atlasChallenge.context?.barriers || []),
  ].filter(Boolean);
  
  // Extract technology domains from themes and challenge type
  const technologyDomains = [
    ...atlasChallenge.strategicThemes,
    atlasChallenge.challengeType.replace('_', ' '),
  ];
  
  const buyer = extractOrganization(atlasChallenge.source.name);
  
  return {
    id: atlasChallenge.id,
    title: atlasChallenge.title,
    description: atlasChallenge.description,
    source_url: atlasChallenge.source.url,
    
    sector: {
      primary: primarySector,
      secondary: [...new Set(secondarySectors)] as Sector[],
      cross_sector_signals: atlasChallenge.strategicThemes,
    },
    
    problem_type: {
      primary: mapChallengeTypeToProblemType(atlasChallenge.challengeType),
      sub_categories: atlasChallenge.strategicThemes,
      technology_domains,
    },
    
    keywords: [...new Set(keywords)],
    
    buyer: {
      ...buyer,
      contact_info: undefined, // Atlas doesn't extract this
    },
    
    timeline: {
      deadline: atlasChallenge.deadline ? new Date(atlasChallenge.deadline) : undefined,
      urgency: determineUrgency(atlasChallenge.deadline),
      expected_duration: atlasChallenge.duration,
    },
    
    funding: {
      type: determineFundingType(atlasChallenge.funding),
      amount_min: atlasChallenge.funding?.min,
      amount_max: atlasChallenge.funding?.max,
      currency: atlasChallenge.funding?.currency || 'GBP',
      mechanism: mapFundingType(atlasChallenge.funding?.type || 'grant'),
      co_funding_available: undefined,
    },
    
    maturity: {
      trl_min: atlasChallenge.trl?.min,
      trl_max: atlasChallenge.trl?.max,
      deployment_ready: (atlasChallenge.trl?.max || 0) >= 7,
      trial_expected: (atlasChallenge.trl?.min || 0) >= 4,
      evidence_required: atlasChallenge.eligibility || [],
      evidence_confidence: atlasChallenge.validation.passed ? 'stated' : 'inferred',
    },
    
    geography: {
      scope: 'UK-wide', // Default - could be enhanced with location extraction
      specific_locations: atlasChallenge.keyEntities.filter(e => 
        e.includes('London') || e.includes('Manchester') || e.includes('Birmingham') || e.includes('Scotland')
      ),
    },
    
    metadata: {
      scraped_date: new Date(atlasChallenge.extraction.extractedAt),
      source_portal: atlasChallenge.source.name,
      extraction_confidence: {
        tier1_complete: atlasChallenge.validation.passed,
        tier2_complete: Math.round(atlasChallenge.extraction.confidence * 100),
        tier3_inferred: !atlasChallenge.validation.passed,
      },
    },
  };
}


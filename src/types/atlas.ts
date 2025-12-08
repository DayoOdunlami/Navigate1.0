/**
 * Atlas Challenge Types
 * 
 * Type definitions for transport funding challenges from the Atlas dataset.
 * Based on the comprehensive JSON schema with 78 challenges across 5 tiers.
 */

export type TransportMode = 'Rail' | 'Aviation' | 'Maritime' | 'Highways';

export type StrategicTheme = 
  | 'Decarbonisation' 
  | 'Autonomy' 
  | 'Safety' 
  | 'People Experience' 
  | 'Supply Chain';

export type DeadlineType = 
  | 'competition' 
  | 'rolling' 
  | 'rolling_monthly' 
  | 'ongoing' 
  | 'auction' 
  | 'programme' 
  | 'upcoming';

export type ChallengeStatus = 'open' | 'upcoming' | 'ongoing' | 'closing' | 'closed';

export type SourceTier = 1 | 2 | 3 | 4 | 5;

/**
 * Main Atlas Challenge interface
 * Matches the comprehensive JSON schema
 */
export interface AtlasChallenge {
  // Identity
  id: string;                    // "ATL-001"
  title: string;
  description: string;
  
  // Source & Programme
  source: string;                // "Aerospace Technology Institute"
  source_tier: SourceTier;       // 1-5
  funding_body: string;          // "ATI"
  programme: string;             // "Strategic Batch"
  url: string;
  
  // Funding
  funding_amount_gbp: number;    // 50000000
  funding_range: string;         // "£2m-£20m per project"
  grant_rate_percent: number;    // 60
  
  // Timeline
  deadline: string;              // "2025-07-31" (ISO date)
  deadline_type: DeadlineType;
  status: ChallengeStatus;
  
  // Classification
  modes: TransportMode[];        // ["Aviation", "Rail"]
  strategic_themes: StrategicTheme[];  // ["Decarbonisation", "Autonomy"]
  focus_areas: string[];         // ["Zero-carbon propulsion", "Hydrogen aviation"]
  trl_range: string;             // "4-7"
  
  // Eligibility
  eligibility: {
    organisation_types: string[];  // ["Business", "Research Organisation", "SME"]
    geographic: string;            // "UK", "Scotland", "EU/Associated"
    collaboration_required: boolean;
    sme_specific: boolean;
  };
  
  // CPC Relevance
  cpc_relevance: {
    score: number;               // 1-10
    rationale: string;
  };
}

/**
 * Atlas Challenges Dataset
 * Root structure for the JSON file
 */
export interface AtlasChallengesDataset {
  metadata: {
    version: string;
    extracted_at: string;
    total_challenges: number;
    total_funding_gbp: number;
    statistics: {
      by_tier: Record<string, number>;
      by_mode: Record<TransportMode, number>;
      by_theme: Record<StrategicTheme, number>;
      high_priority: number; // Score 7+
      sme_specific: number;
    };
  };
  challenges: AtlasChallenge[];
}


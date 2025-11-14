// NAVIGATE Platform - Core Data Types
// Enhanced data structure supporting all visualizations, interactions, and AI features

// ============================================================================
// Core Entity Types
// ============================================================================

export type StakeholderType = 'Government' | 'Research' | 'Industry' | 'Intermediary';
export type TechnologyCategory = 'H2Production' | 'H2Storage' | 'FuelCells' | 'Aircraft' | 'Infrastructure';
export type FundingType = 'Public' | 'Private' | 'Mixed';
export type ProjectStatus = 'Active' | 'Completed' | 'Planned';
export type RelationshipType = 'funds' | 'researches' | 'collaborates_with' | 'advances' | 'participates_in' | 'owns' | 'supplies';
export type TRLColor = 'red' | 'amber' | 'green';
export type DataConfidence = 'verified' | 'estimated' | 'placeholder';
export type KBConfidence = 'verified' | 'unverified' | 'speculative';

// ============================================================================
// Knowledge Base (Shared across entities)
// ============================================================================

export interface KnowledgeBase {
  content: string; // Markdown
  sources: Array<{
    title: string;
    url: string;
    date: string;
    type: 'report' | 'news' | 'interview' | 'internal_doc';
  }>;
  last_updated: string;
  contributors: string[];
  tags: string[];
  confidence: KBConfidence;
}

// ============================================================================
// Data Quality (Shared across entities)
// ============================================================================

export interface DataQuality {
  confidence: DataConfidence;
  last_verified: string;
  verified_by?: string;
  notes?: string;
}

// ============================================================================
// Stakeholder (Organization)
// ============================================================================

export interface Stakeholder {
  // Core Identity
  id: string; // e.g., "org-dft-001"
  name: string;
  type: StakeholderType;
  sector: string; // Transport, Energy, Aerospace
  
  // Financial (calculated from funding events)
  funding_capacity: 'High' | 'Medium' | 'Low';
  total_funding_received?: number; // Calculated
  total_funding_provided?: number; // Calculated
  
  // Location & Contact
  location: {
    city?: string;
    region: string; // Scotland, South East, London, etc.
    country: string; // UK, International
  };
  contact: {
    email?: string;
    website?: string;
    contact_person?: string;
  };
  
  // Classification
  description: string;
  tags: string[]; // #hydrogen, #infrastructure, #TRL-6
  
  // Relationships (calculated)
  relationship_count?: number;
  influence_score?: number; // Based on connections
  
  // Knowledge Base (CORE FEATURE)
  knowledge_base?: KnowledgeBase;
  
  // Metadata
  data_quality: DataQuality;
  
  // Scenario Modeling
  capacity_scenarios?: {
    optimistic: number;
    conservative: number;
    current: number;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Technology
// ============================================================================

export interface Technology {
  // Core Identity
  id: string; // e.g., "tech-h2-storage-001"
  name: string;
  category: TechnologyCategory;
  
  // TRL (Technology Readiness Level)
  trl_current: number; // 1-9
  trl_color: TRLColor; // Computed: 1-3=red, 4-6=amber, 7-9=green
  trl_projected_2030?: number; // For scenario modeling
  trl_projected_2050?: number;
  
  // Maturity
  maturity_risk: string; // "Proven elsewhere / Airport barriers / Scalability issues"
  deployment_ready: boolean;
  
  // Financial (calculated from funding events)
  total_funding?: number;
  funding_by_type?: {
    public: number;
    private: number;
    mixed: number;
  };
  
  // Relationships (calculated)
  stakeholder_count?: number; // How many orgs work on this
  project_count?: number; // How many projects use this
  
  // Classification
  description: string;
  tags: string[];
  
  // Regional
  regional_availability?: string[]; // Scotland, South East, etc.
  
  // Knowledge Base
  knowledge_base?: KnowledgeBase;
  
  // Metadata
  data_quality: DataQuality;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Funding Event
// ============================================================================

export interface FundingEvent {
  id: string; // e.g., "fund-001"
  
  // Financial
  amount: number; // £
  currency: 'GBP';
  funding_type: FundingType;
  
  // Participants
  source_id: string; // Stakeholder ID (funder)
  recipient_id: string; // Stakeholder or Project ID
  recipient_type: 'stakeholder' | 'project';
  
  // Program Details
  program: string; // "ATI Programme - Round 3"
  program_type?: 'grant' | 'contract' | 'SBRI' | 'innovation_voucher' | 'partnership';
  
  // Timeline
  date: string; // ISO date
  start_date?: string;
  end_date?: string;
  status: 'Active' | 'Completed' | 'Planned';
  
  // Impact
  impact_description: string;
  technologies_supported?: string[]; // Technology IDs
  trl_impact?: {
    before: number;
    after: number;
  };
  
  // Metadata
  data_quality: DataQuality;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Project
// ============================================================================

export interface Project {
  id: string; // e.g., "proj-zeroavia-h2-001"
  name: string;
  status: ProjectStatus;
  
  // Timeline
  start_date: string;
  end_date?: string;
  duration_months?: number; // Calculated
  
  // Participants
  participants: string[]; // Stakeholder IDs
  lead_organization?: string; // Stakeholder ID
  
  // Technologies
  technologies: string[]; // Technology IDs
  primary_technology?: string; // Technology ID
  
  // Financial
  total_budget?: number; // £
  funding_events?: string[]; // Funding Event IDs
  
  // Classification
  description: string;
  objectives: string[];
  tags: string[];
  
  // Outcomes
  outcomes?: {
    trl_advancement?: number; // TRL levels advanced
    publications?: number;
    patents?: number;
    commercial_impact?: string;
  };
  
  // Knowledge Base
  knowledge_base?: KnowledgeBase;
  
  // Metadata
  data_quality: DataQuality;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Relationship
// ============================================================================

export interface Relationship {
  id: string; // e.g., "rel-dft-ati-001"
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  
  // Strength
  weight: number; // 0-1 or amount in £
  strength: 'strong' | 'medium' | 'weak'; // Computed from weight
  
  // Context
  metadata: {
    start_date?: string;
    end_date?: string;
    amount?: number; // For funding relationships
    description?: string;
    program?: string; // For funding relationships
    project_id?: string; // If relationship is through a project
  };
  
  // Bidirectional
  bidirectional: boolean; // e.g., collaborates_with is bidirectional
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Graph Data Structures (for visualizations)
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  type: 'stakeholder' | 'technology' | 'project';
  entity_type?: StakeholderType | TechnologyCategory;
  value: number; // For node sizing (funding, connections, etc.)
  color: string; // For node coloring
  x?: number; // Position (calculated by force graph)
  y?: number;
  // Additional visualization properties
  size?: number;
  opacity?: number;
}

export interface GraphLink {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: RelationshipType;
  weight: number; // For edge thickness
  value?: number; // Alternative to weight
  color?: string;
  // Additional visualization properties
  opacity?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ============================================================================
// Complete Dataset
// ============================================================================

export interface NavigateDataset {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  funding_events: FundingEvent[];
  projects: Project[];
  relationships: Relationship[];
  metadata: {
    version: string;
    created_at: string;
    updated_at: string;
    total_entities: number;
    total_relationships: number;
  };
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface FilterState {
  stakeholder_types?: StakeholderType[];
  technology_categories?: TechnologyCategory[];
  trl_range?: [number, number];
  funding_range?: [number, number];
  funding_type?: FundingType[];
  regions?: string[];
  tags?: string[];
  date_range?: [string, string];
  search_query?: string;
}

export interface ScenarioState {
  government_funding_multiplier: number; // 0-200% (default 100)
  private_funding_multiplier: number; // 0-200% (default 100)
  trl_advancement: number; // -2 to +2 (default 0)
  time_horizon: number; // 2024-2030 (default 2024)
  include_international: boolean;
  active_projects_only: boolean;
  highlight_trl_bottlenecks: boolean;
}

// ============================================================================
// Insight Types (for AI-generated insights)
// ============================================================================

export interface Insight {
  id: string;
  type: 'gap' | 'bottleneck' | 'opportunity' | 'risk' | 'pattern';
  title: string;
  description: string;
  evidence: {
    entities: string[]; // Entity IDs
    metrics: Record<string, number>;
    sources?: string[];
  };
  recommendations?: string[];
  confidence: number; // 0-1
  created_at: string;
}

// ============================================================================
// Utility Functions Types
// ============================================================================

export type Entity = Stakeholder | Technology | Project;
export type EntityType = 'stakeholder' | 'technology' | 'project';

// Helper to compute TRL color
export function computeTRLColor(trl: number): TRLColor {
  if (trl >= 7) return 'green';
  if (trl >= 4) return 'amber';
  return 'red';
}

// Helper to get entity by ID
export function getEntityById(
  dataset: NavigateDataset,
  id: string
): Entity | null {
  const stakeholder = dataset.stakeholders.find(s => s.id === id);
  if (stakeholder) return stakeholder;
  
  const technology = dataset.technologies.find(t => t.id === id);
  if (technology) return technology;
  
  const project = dataset.projects.find(p => p.id === id);
  if (project) return project;
  
  return null;
}


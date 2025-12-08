/**
 * Report Templates
 * 
 * Defines report templates for generating strategy documents
 */

export type ReportSection = 
  | 'executive_summary'
  | 'challenge_details'
  | 'eligibility_analysis'
  | 'cpc_alignment'
  | 'recommended_actions'
  | 'funding_overview'
  | 'opportunity_matrix'
  | 'timeline_view'
  | 'gap_analysis'
  | 'recommendations'
  | 'market_context'
  | 'opportunity_mapping'
  | 'capability_gaps'
  | 'partnership_opportunities'
  | 'action_plan';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
}

export const reportTemplates: Record<string, ReportTemplate> = {
  opportunity_brief: {
    id: 'opportunity_brief',
    name: 'Opportunity Brief',
    description: 'Single challenge deep-dive',
    sections: [
      'executive_summary',
      'challenge_details',
      'eligibility_analysis',
      'cpc_alignment',
      'recommended_actions',
    ],
  },
  
  sector_landscape: {
    id: 'sector_landscape',
    name: 'Sector Landscape',
    description: 'Overview of opportunities in a sector',
    sections: [
      'executive_summary',
      'funding_overview',
      'opportunity_matrix',
      'timeline_view',
      'gap_analysis',
      'recommendations',
    ],
  },
  
  strategic_assessment: {
    id: 'strategic_assessment',
    name: 'Strategic Assessment',
    description: 'Cross-sector strategic analysis',
    sections: [
      'executive_summary',
      'market_context',
      'opportunity_mapping',
      'capability_gaps',
      'partnership_opportunities',
      'action_plan',
    ],
  },
};

/**
 * Section descriptions for AI generation
 */
export const sectionDescriptions: Record<ReportSection, string> = {
  executive_summary: 'High-level overview (2-3 paragraphs) highlighting key opportunities, funding totals, and strategic priorities.',
  challenge_details: 'Detailed information about specific challenges including funding amounts, deadlines, eligibility, and requirements.',
  eligibility_analysis: 'Analysis of eligibility criteria, geographic restrictions, collaboration requirements, and SME opportunities.',
  cpc_alignment: 'Assessment of how challenges align with CPC capabilities, expertise, and strategic objectives.',
  recommended_actions: 'Concrete next steps including recommended challenges to pursue, partnerships to form, and resources needed.',
  funding_overview: 'Statistical overview of funding landscape including totals by sector, theme, and tier.',
  opportunity_matrix: 'Matrix or table comparing opportunities across multiple dimensions (mode, theme, funding, deadline).',
  timeline_view: 'Chronological view of deadlines and key dates for opportunities.',
  gap_analysis: 'Identification of funding gaps, underserved areas, and unmet needs in the landscape.',
  recommendations: 'Strategic recommendations based on analysis of opportunities and gaps.',
  market_context: 'Broader market and policy context explaining why these opportunities matter.',
  opportunity_mapping: 'Visual mapping of opportunities across transport modes and strategic themes.',
  capability_gaps: 'Analysis of capability gaps that CPC would need to address to pursue opportunities.',
  partnership_opportunities: 'Identification of potential partnerships and collaboration opportunities.',
  action_plan: 'Detailed action plan with timelines, responsibilities, and milestones.',
};


/**
 * Report Generator
 * 
 * Generates strategy reports from challenge data
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import type { AtlasChallenge } from '@/types/atlas';
import { reportTemplates, type ReportSection, sectionDescriptions } from './templates';

export interface ReportConfig {
  template: keyof typeof reportTemplates;
  title: string;
  challengeIds?: string[];
  filters?: {
    modes?: string[];
    themes?: string[];
    tiers?: number[];
  };
  customSections?: ReportSection[];
}

export interface ReportOutput {
  title: string;
  generatedAt: string;
  template: string;
  sections: Array<{
    id: ReportSection;
    title: string;
    content: string;
  }>;
  data: {
    challenges: BaseEntity[];
    stats: {
      total: number;
      totalFunding: number;
      byMode: Record<string, number>;
      byTheme: Record<string, number>;
      byTier: Record<string, number>;
    };
  };
}

/**
 * Generate a report from configuration
 */
export async function generateReport(
  config: ReportConfig,
  allEntities: BaseEntity[]
): Promise<ReportOutput> {
  // 1. Gather data
  const challenges = getChallenges(config.challengeIds, config.filters, allEntities);
  const stats = calculateStats(challenges);

  // 2. Get template
  const template = reportTemplates[config.template];
  const sectionsToGenerate = config.customSections || template.sections;

  // 3. Generate sections (stub - would use AI in production)
  const sections = await Promise.all(
    sectionsToGenerate.map(sectionId =>
      generateSection(sectionId, challenges, stats)
    )
  );

  // 4. Compile report
  return {
    title: config.title,
    generatedAt: new Date().toISOString(),
    template: template.id,
    sections,
    data: {
      challenges,
      stats,
    },
  };
}

/**
 * Get challenges based on filters
 */
function getChallenges(
  challengeIds: string[] | undefined,
  filters: ReportConfig['filters'],
  allEntities: BaseEntity[]
): BaseEntity[] {
  let filtered = allEntities.filter(
    e => e.domain === 'atlas' && e.entityType === 'challenge'
  );

  // Filter by IDs if provided
  if (challengeIds && challengeIds.length > 0) {
    filtered = filtered.filter(e => challengeIds.includes(e.id));
  }

  // Apply filters
  if (filters) {
    if (filters.modes && filters.modes.length > 0) {
      filtered = filtered.filter(e => {
        const custom = e.metadata.custom as any;
        const entityModes = custom?.modes || [];
        return filters.modes!.some(mode => entityModes.includes(mode));
      });
    }

    if (filters.themes && filters.themes.length > 0) {
      filtered = filtered.filter(e => {
        const custom = e.metadata.custom as any;
        const entityThemes = custom?.strategicThemes || [];
        return filters.themes!.some(theme => entityThemes.includes(theme));
      });
    }

    if (filters.tiers && filters.tiers.length > 0) {
      filtered = filtered.filter(e => {
        const custom = e.metadata.custom as any;
        return filters.tiers!.includes(custom?.sourceTier);
      });
    }
  }

  return filtered;
}

/**
 * Calculate statistics from challenges
 */
function calculateStats(challenges: BaseEntity[]): ReportOutput['data']['stats'] {
  const stats = {
    total: challenges.length,
    totalFunding: 0,
    byMode: {} as Record<string, number>,
    byTheme: {} as Record<string, number>,
    byTier: {} as Record<string, number>,
  };

  challenges.forEach(challenge => {
    // Total funding
    const funding = challenge.metadata.funding?.amount || 0;
    stats.totalFunding += funding;

    // By mode
    const custom = challenge.metadata.custom as any;
    const modes = custom?.modes || [];
    modes.forEach((mode: string) => {
      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
    });

    // By theme
    const themes = custom?.strategicThemes || [];
    themes.forEach((theme: string) => {
      stats.byTheme[theme] = (stats.byTheme[theme] || 0) + 1;
    });

    // By tier
    const tier = custom?.sourceTier;
    if (tier) {
      stats.byTier[`Tier ${tier}`] = (stats.byTier[`Tier ${tier}`] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Generate a single section (stub - would use AI in production)
 */
async function generateSection(
  sectionId: ReportSection,
  challenges: BaseEntity[],
  stats: ReportOutput['data']['stats']
): Promise<{ id: ReportSection; title: string; content: string }> {
  // This is a stub - in production, would use AI to generate content
  const description = sectionDescriptions[sectionId];
  const title = sectionId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Basic content generation (AI would do better)
  let content = `# ${title}\n\n${description}\n\n`;

  switch (sectionId) {
    case 'executive_summary':
      content += `This analysis covers ${stats.total} funding opportunities with a total value of £${stats.totalFunding.toLocaleString()}.\n\n`;
      content += `The opportunities span multiple transport modes including ${Object.keys(stats.byMode).join(', ')}.\n\n`;
      content += `Key strategic themes include ${Object.keys(stats.byTheme).join(', ')}.`;
      break;

    case 'funding_overview':
      content += `## Total Funding: £${stats.totalFunding.toLocaleString()}\n\n`;
      content += `## Opportunities by Mode\n\n`;
      Object.entries(stats.byMode).forEach(([mode, count]) => {
        content += `- **${mode}**: ${count} opportunities\n`;
      });
      break;

    default:
      content += `Content for this section would be generated using AI analysis of ${challenges.length} challenges.`;
  }

  return {
    id: sectionId,
    title,
    content,
  };
}


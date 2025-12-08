/**
 * Markdown Report Exporter
 */

import type { ReportOutput } from '../generator';

/**
 * Export report as Markdown
 */
export function exportMarkdown(report: ReportOutput): string {
  let markdown = `# ${report.title}\n\n`;
  markdown += `*Generated: ${new Date(report.generatedAt).toLocaleDateString()}*\n\n`;
  markdown += `---\n\n`;

  // Add table of contents
  markdown += `## Table of Contents\n\n`;
  report.sections.forEach((section, index) => {
    markdown += `${index + 1}. [${section.title}](#${section.id})\n`;
  });
  markdown += `\n---\n\n`;

  // Add sections
  report.sections.forEach(section => {
    markdown += `${section.content}\n\n---\n\n`;
  });

  // Add data appendix
  markdown += `## Data Appendix\n\n`;
  markdown += `### Statistics\n\n`;
  markdown += `- Total Opportunities: ${report.data.stats.total}\n`;
  markdown += `- Total Funding: £${report.data.stats.totalFunding.toLocaleString()}\n\n`;

  markdown += `### Challenges Included\n\n`;
  report.data.challenges.forEach(challenge => {
    const custom = challenge.metadata.custom as any;
    markdown += `- **${challenge.name}** (${challenge.id})\n`;
    markdown += `  - Funding: £${(challenge.metadata.funding?.amount || 0).toLocaleString()}\n`;
    markdown += `  - Modes: ${(custom?.modes || []).join(', ')}\n`;
    markdown += `  - Themes: ${(custom?.strategicThemes || []).join(', ')}\n\n`;
  });

  return markdown;
}


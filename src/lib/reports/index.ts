/**
 * Report Generation Module
 * 
 * Main entry point for report generation and export
 */

export * from './templates';
export * from './generator';
export * from './exporters/markdown';
export * from './exporters/docx';
export * from './exporters/pdf';

/**
 * Export report in specified format
 */
export async function exportReport(
  report: Awaited<ReturnType<typeof import('./generator').generateReport>>,
  format: 'markdown' | 'docx' | 'pdf'
): Promise<Blob | string> {
  switch (format) {
    case 'markdown': {
      const { exportMarkdown } = await import('./exporters/markdown');
      return exportMarkdown(report);
    }
    case 'docx': {
      const { exportDocx } = await import('./exporters/docx');
      return await exportDocx(report);
    }
    case 'pdf': {
      const { exportPdf } = await import('./exporters/pdf');
      return await exportPdf(report);
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}


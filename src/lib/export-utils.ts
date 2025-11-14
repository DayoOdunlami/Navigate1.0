/**
 * Export Utilities for NAVIGATE Platform
 * 
 * Functions to export data in various formats (CSV, JSON, PNG, SVG)
 */

import { Stakeholder, Technology, FundingEvent, Project, Relationship } from './navigate-types';
import { GraphData } from './data-utils';

// ============================================================================
// CSV Export
// ============================================================================

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// JSON Export
// ============================================================================

export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// Image Export (PNG/SVG)
// ============================================================================

export function exportGraphAsPNG(canvasElement: HTMLCanvasElement, filename: string) {
  if (!canvasElement) {
    alert('No graph to export');
    return;
  }

  canvasElement.toBlob((blob) => {
    if (!blob) {
      alert('Failed to export image');
      return;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.png`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function exportGraphAsSVG(svgElement: SVGElement, filename: string) {
  if (!svgElement) {
    alert('No graph to export');
    return;
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.svg`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Specific Export Functions
// ============================================================================

export function exportStakeholders(stakeholders: Stakeholder[]) {
  exportToCSV(stakeholders, 'navigate-stakeholders');
}

export function exportTechnologies(technologies: Technology[]) {
  exportToCSV(technologies, 'navigate-technologies');
}

export function exportFundingEvents(events: FundingEvent[]) {
  exportToCSV(events, 'navigate-funding-events');
}

export function exportProjects(projects: Project[]) {
  exportToCSV(projects, 'navigate-projects');
}

export function exportRelationships(relationships: Relationship[]) {
  exportToCSV(relationships, 'navigate-relationships');
}

export function exportScenario(data: {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  fundingEvents: FundingEvent[];
  projects: Project[];
  relationships: Relationship[];
  filters: any;
  metadata?: any;
}) {
  exportToJSON(data, 'navigate-scenario');
}


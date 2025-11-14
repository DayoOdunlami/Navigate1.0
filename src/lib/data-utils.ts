/**
 * Data Transformation Utilities for NAVIGATE Platform
 * 
 * Functions to transform NAVIGATE data types into visualization formats
 */

import { Stakeholder, Technology, Relationship, StakeholderType, TechnologyCategory } from './navigate-types';

// ============================================================================
// Graph Data Types
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  type: 'stakeholder' | 'technology' | 'project';
  value: number; // Node size
  color: string;
  x?: number;
  y?: number;
  opacity?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength?: number;
  width?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ============================================================================
// Color Mapping
// ============================================================================

export function getStakeholderTypeColor(type: StakeholderType): string {
  const colors: Record<StakeholderType, string> = {
    Government: '#3b82f6',      // blue
    Research: '#22c55e',        // green
    Industry: '#f59e0b',        // orange
    Intermediary: '#a855f7',    // purple
  };
  return colors[type] || '#6b7280';
}

export function getTechnologyCategoryColor(category: TechnologyCategory): string {
  const colors: Record<TechnologyCategory, string> = {
    H2Production: '#06b6d4',    // cyan
    H2Storage: '#8b5cf6',        // violet
    FuelCells: '#10b981',        // emerald
    Aircraft: '#f59e0b',          // amber
    Infrastructure: '#ef4444',   // red
  };
  return colors[category] || '#6b7280';
}

// ============================================================================
// Graph Data Transformation
// ============================================================================

/**
 * Transform NAVIGATE data into graph format for react-force-graph-2d
 */
export function toNetworkGraphData(
  stakeholders: Stakeholder[],
  technologies: Technology[],
  relationships: Relationship[]
): GraphData {
  // Create nodes from stakeholders
  const stakeholderNodes: GraphNode[] = stakeholders.map(stakeholder => ({
    id: stakeholder.id,
    label: stakeholder.name,
    type: 'stakeholder',
    value: Math.max(3, Math.min(15, (stakeholder.total_funding_provided || 0) / 1000000 + 3)),
    color: getStakeholderTypeColor(stakeholder.type),
  }));

  // Create nodes from technologies
  const technologyNodes: GraphNode[] = technologies.map(tech => ({
    id: tech.id,
    label: tech.name,
    type: 'technology',
    value: Math.max(2, Math.min(12, (tech.total_funding || 0) / 5000000 + 2)),
    color: getTechnologyCategoryColor(tech.category),
  }));

  // Combine all nodes
  const nodes = [...stakeholderNodes, ...technologyNodes];

  // Create links from relationships
  const links: GraphLink[] = relationships.map(rel => {
    // Default strength based on relationship type
    const defaultStrength = rel.type === 'funds' ? 0.8 : rel.type === 'collaborates_with' ? 0.6 : 0.5;
    const strength = (rel.metadata as any)?.strength || defaultStrength;
    return {
      source: rel.source,
      target: rel.target,
      type: rel.type,
      strength,
      width: strength * 2,
    };
  });

  return { nodes, links };
}

/**
 * Filter graph data by selected entities
 */
export function filterGraphData(
  graphData: GraphData,
  selectedIds: string[]
): GraphData {
  if (selectedIds.length === 0) {
    return graphData;
  }

  const selectedSet = new Set(selectedIds);
  
  // Filter nodes
  const filteredNodes = graphData.nodes.filter(node => selectedSet.has(node.id));
  
  // Filter links to only include connections between selected nodes
  const filteredLinks = graphData.links.filter(
    link => selectedSet.has(link.source as string) && selectedSet.has(link.target as string)
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

/**
 * Calculate node centrality (simple degree centrality)
 */
export function calculateNodeCentrality(
  nodeId: string,
  links: GraphLink[]
): number {
  return links.filter(
    link => link.source === nodeId || link.target === nodeId
  ).length;
}

/**
 * Get related entities for a given entity ID
 */
export function getRelatedEntities(
  entityId: string,
  relationships: Relationship[]
): string[] {
  const related: Set<string> = new Set();
  
  relationships.forEach(rel => {
    if (rel.source === entityId) {
      related.add(rel.target);
    } else if (rel.target === entityId) {
      related.add(rel.source);
    }
  });
  
  return Array.from(related);
}


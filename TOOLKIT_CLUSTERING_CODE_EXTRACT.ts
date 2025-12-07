/**
 * Toolkit Clustering Logic - Complete Code Extract
 * 
 * This is the exact clustering implementation from D3NetworkGraphView.tsx
 * Adapted for easy copying and reuse.
 */

import * as d3 from 'd3';

// Type definitions for this code extract
interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  group?: string;
  type?: string;
  [key: string]: unknown;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────
// STEP 1: Initial Grid Positioning
// ─────────────────────────────────────────────────────────────

/**
 * Position nodes in a grid layout within their group areas
 * Groups are arranged in a circle around the center
 */
function initialGridPositioning(
  nodes: GraphNode[],
  groupingMode: 'entity_type' | 'stakeholder_category' | 'random',
  centerX: number,
  centerY: number
) {
  if (groupingMode === 'random') {
    // Random positioning
    nodes.forEach((node) => {
      node.x = centerX + (Math.random() - 0.5) * 200;
      node.y = centerY + (Math.random() - 0.5) * 200;
    });
    return;
  }

  // Group nodes by key
  const groups = new Map<string, typeof nodes>();
  nodes.forEach((node) => {
    const key = groupingMode === 'entity_type' ? node.group : node.type;
    // Skip nodes without a valid key
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(node);
  });

  // Position each group in a circle
  const groupKeys = Array.from(groups.keys());
  const radius = 300; // Distance from center

  groupKeys.forEach((key, index) => {
    const groupNodes = groups.get(key)!;
    
    // Calculate group center position (arranged in circle)
    const angle = (2 * Math.PI * index) / Math.max(groupKeys.length, 1);
    const centerX_offset = Math.cos(angle) * radius;
    const centerY_offset = Math.sin(angle) * radius;

    // Position nodes in grid within group area
    groupNodes.forEach((node, i) => {
      const cols = Math.max(1, Math.ceil(Math.sqrt(groupNodes.length)));
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Grid spacing: 80px between nodes
      node.x = centerX + centerX_offset + (col - cols / 2) * 80;
      node.y = centerY + centerY_offset + (row - cols / 2) * 80;
    });
  });
}

// ─────────────────────────────────────────────────────────────
// STEP 2: Dynamic Group Centroid Force
// ─────────────────────────────────────────────────────────────

/**
 * Creates a custom force that pulls nodes toward their group's centroid
 * This is the CORE clustering logic - runs on every simulation tick
 */
function createGroupCentroidForce(
  nodes: GraphNode[],
  groupingMode: 'entity_type' | 'stakeholder_category' | 'random'
) {
  if (groupingMode === 'random') return null;
  
  const force = (alpha: number) => {
    // 1. Group nodes by key
    const groups = new Map<string, { nodes: GraphNode[]; cx: number; cy: number }>();
    
    nodes.forEach((node) => {
      const key = groupingMode === 'entity_type' ? node.group : node.type;
      // Skip nodes without a valid key
      if (!key) return;
      if (!groups.has(key)) {
        groups.set(key, { nodes: [], cx: 0, cy: 0 });
      }
      groups.get(key)!.nodes.push(node);
    });

    // 2. Calculate centroid (average position) for each group
    groups.forEach((group) => {
      if (group.nodes.length === 0) return;
      const cx = d3.mean(group.nodes, (n) => n.x!) ?? 0;
      const cy = d3.mean(group.nodes, (n) => n.y!) ?? 0;
      group.cx = cx;
      group.cy = cy;
    });

    // 3. Pull nodes toward their group centroid
    const groupStrength = 0.2; // KEY PARAMETER: Controls clustering strength
    
    nodes.forEach((node) => {
      const key = groupingMode === 'entity_type' ? node.group : node.type;
      // Skip nodes without a valid key
      if (!key) return;
      const group = groups.get(key);
      if (!group || group.nodes.length <= 1) return;
      
      // Calculate distance from node to centroid
      const dx = group.cx - (node.x ?? 0);
      const dy = group.cy - (node.y ?? 0);
      const distance = Math.hypot(dx, dy);
      
      if (distance > 0) {
        // Apply force proportional to:
        // - distance from centroid (further = stronger pull)
        // - simulation alpha (weaker as simulation cools down)
        // - groupStrength constant
        const force = distance * groupStrength * alpha;
        node.vx = (typeof node.vx === 'number' ? node.vx : 0) + (dx / distance) * force;
        node.vy = (typeof node.vy === 'number' ? node.vy : 0) + (dy / distance) * force;
      }
    });
  };
  
  return force;
}

// ─────────────────────────────────────────────────────────────
// STEP 3: Weaken Inter-Group Links
// ─────────────────────────────────────────────────────────────

/**
 * Calculate link strength based on whether nodes are in same group
 * Weaken links between different groups to allow separation
 */
function calculateLinkStrength(
  link: GraphLink,
  nodes: GraphNode[],
  groupingMode: 'entity_type' | 'stakeholder_category' | 'random'
): number {
  if (groupingMode === 'random') return 0.5;
  
  const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
  const targetId = typeof link.target === 'object' ? link.target.id : link.target;
  const sourceNode = typeof link.source === 'object' ? link.source : nodes.find((n) => n.id === sourceId);
  const targetNode = typeof link.target === 'object' ? link.target : nodes.find((n) => n.id === targetId);
  
  if (!sourceNode || !targetNode) return 0.5;
  
  if (groupingMode === 'entity_type') {
    // Same group: strong link (0.8)
    // Different groups: weak link (0.15)
    return sourceNode.group === targetNode.group ? 0.8 : 0.15;
  } else if (groupingMode === 'stakeholder_category') {
    // Same type: stronger link (0.7)
    // Different types: weaker link (0.2)
    return sourceNode.type === targetNode.type ? 0.7 : 0.2;
  }
  
  return 0.5;
}

// ─────────────────────────────────────────────────────────────
// STEP 4: Complete Force Simulation Setup
// ─────────────────────────────────────────────────────────────

/**
 * Complete D3 force simulation with clustering
 */
function setupClusteredSimulation(
  nodes: GraphNode[],
  links: GraphLink[],
  groupingMode: 'entity_type' | 'stakeholder_category' | 'random',
  centerX: number,
  centerY: number,
  forceRepulsion: number = 600,
  edgeLength: number = 250
) {
  // 1. Initial positioning
  initialGridPositioning(nodes, groupingMode, centerX, centerY);
  
  // 2. Create force simulation
  const simulation = d3
    .forceSimulation<GraphNode>(nodes)
    .force(
      'link',
      d3
        .forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(edgeLength)
        .strength((d) => calculateLinkStrength(d, nodes, groupingMode))
    )
    .force('charge', d3.forceManyBody<GraphNode>().strength(-forceRepulsion))
    .force('center', d3.forceCenter(centerX, centerY))
    .force('collision', d3.forceCollide<GraphNode>().radius((d) => (d.symbolSize || 20) + 5));

  // 3. Create group centroid force
  const applyGroupCentroidForce = createGroupCentroidForce(nodes, groupingMode);

  // 4. Apply group centroid force in tick handler
  simulation.on('tick', () => {
    // Apply group centroid force on each tick
    if (applyGroupCentroidForce) {
      applyGroupCentroidForce(simulation.alpha());
    }
    
    // Update node/link positions (handled by D3 selection updates)
    // node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
    // link.attr('x1', ...).attr('y1', ...).attr('x2', ...).attr('y2', ...);
  });

  return simulation;
}

// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLE
// ─────────────────────────────────────────────────────────────

/**
 * Example: How to use this clustering logic
 */
function exampleUsage() {
  const nodes: GraphNode[] = [/* your nodes */];
  const links: GraphLink[] = [/* your links */];
  const groupingMode: 'entity_type' | 'stakeholder_category' | 'random' = 'entity_type';
  
  const centerX = 400; // Canvas center X
  const centerY = 350; // Canvas center Y
  
  const simulation = setupClusteredSimulation(
    nodes,
    links,
    groupingMode,
    centerX,
    centerY,
    600, // forceRepulsion
    250  // edgeLength
  );
  
  // Simulation will automatically cluster nodes by entity type
  // Groups will form distinct clusters/islands
}

// ─────────────────────────────────────────────────────────────
// ADAPTATION FOR UNIFIED SCHEMA
// ─────────────────────────────────────────────────────────────

/**
 * To adapt this for BaseEntity[] data:
 */
function adaptForUnifiedSchema(
  entities: BaseEntity[],
  relationships: UniversalRelationship[]
) {
  // Convert entities to GraphNode format
  const nodes: GraphNode[] = entities.map((entity) => ({
    id: entity.id,
    name: entity.name,
    // Use entityType for grouping
    group: entity.entityType, // 'challenge', 'stakeholder', 'technology', etc.
    type: entity.entityType,
    symbolSize: 20, // or calculate from entity data
    // ... other properties
  }));
  
  // Convert relationships to GraphLink format
  const links: GraphLink[] = relationships.map((rel) => ({
    source: rel.source,
    target: rel.target,
    // ... other properties
  }));
  
  // Use 'entity_type' grouping mode
  const simulation = setupClusteredSimulation(
    nodes,
    links,
    'entity_type', // This will use node.group for clustering
    centerX,
    centerY
  );
  
  return simulation;
}

// ─────────────────────────────────────────────────────────────
// KEY PARAMETERS TO ADJUST
// ─────────────────────────────────────────────────────────────

/**
 * Tuning Parameters:
 * 
 * 1. groupStrength (line 305): 0.2
 *    - Higher (0.3-0.5) = tighter clusters, less movement
 *    - Lower (0.1-0.15) = looser clusters, more movement
 * 
 * 2. radius (line 254): 300
 *    - Larger = more separation between groups
 *    - Smaller = groups closer together
 * 
 * 3. Grid spacing (line 265): 80px
 *    - Adjust based on node sizes
 *    - Larger nodes need more spacing
 * 
 * 4. Link strength ratio (lines 351-354):
 *    - Same group: 0.8
 *    - Different groups: 0.15
 *    - Ratio: 5.3x difference
 *    - Increase ratio for more separation
 *    - Decrease ratio for more mixing
 * 
 * 5. forceRepulsion: 600
 *    - Higher = nodes push apart more
 *    - Lower = nodes can get closer
 * 
 * 6. edgeLength: 250
 *    - Preferred link length
 *    - Longer = more spread out
 *    - Shorter = more compact
 */


/**
 * NetworkGraphNavigate
 * 
 * NAVIGATE version of NetworkGraph using Stakeholder, Technology, Project, and Relationship entities
 * Uses REAL relationships instead of calculated similarity!
 */

'use client';

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Stakeholder, Technology, Project, Relationship } from '@/lib/navigate-types';
import { NetworkNode, NetworkLink } from '@/lib/types';
import { toNetworkGraphFromNavigate } from '@/lib/navigate-adapters';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading graph...</div>
});

type RelationshipFilterState = {
  funds: boolean;
  collaborates_with: boolean;
  researches: boolean;
  advances: boolean;
  participates_in: boolean;
};

const RELATIONSHIP_KEYS = ['funds', 'collaborates_with', 'researches', 'advances', 'participates_in'] as const;
type RelationshipKey = typeof RELATIONSHIP_KEYS[number];

interface NetworkGraphNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  relationships: Relationship[];
  selectedEntityId?: string | null;
  onEntitySelect?: (entityId: string) => void;
  className?: string;
  showControls?: boolean;
  relationshipFilters?: RelationshipFilterState;
  onRelationshipFiltersChange?: (filters: RelationshipFilterState) => void;
  hideIsolatedNodes?: boolean;
  onHideIsolatedNodesChange?: (value: boolean) => void;
  nodeSpacing?: number;
  onNodeSpacingChange?: (value: number) => void;
  showSpacingControl?: boolean;
  onShowSpacingControlChange?: (value: boolean) => void;
}

// Store relationships for link rendering
let globalRelationships: Relationship[] = [];

export function NetworkGraphNavigate({ 
  stakeholders,
  technologies,
  projects,
  relationships,
  selectedEntityId,
  onEntitySelect,
  className = '',
  showControls = true,
  relationshipFilters: controlledRelationshipFilters,
  onRelationshipFiltersChange,
  hideIsolatedNodes: controlledHideIsolatedNodes,
  onHideIsolatedNodesChange,
  nodeSpacing: controlledNodeSpacing,
  onNodeSpacingChange,
  showSpacingControl: controlledShowSpacingControl,
  onShowSpacingControlChange,
}: NetworkGraphNavigateProps) {
  
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[], links: NetworkLink[] }>(() => ({ nodes: [], links: [] }));
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [clickedNode, setClickedNode] = useState<NetworkNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [internalIsOrbiting, setInternalIsOrbiting] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [internalRelationshipFilters, setInternalRelationshipFilters] = useState<RelationshipFilterState>({
    funds: true,
    collaborates_with: true,
    researches: true,
    advances: true,
    participates_in: true,
  });
  const relationshipFilters = controlledRelationshipFilters ?? internalRelationshipFilters;
  const updateRelationshipFilters = (next: RelationshipFilterState) => {
    if (onRelationshipFiltersChange) onRelationshipFiltersChange(next);
    else setInternalRelationshipFilters(next);
  };
  const [spacingDebug, setSpacingDebug] = useState<string | null>(null);
  
  const [internalHideIsolatedNodes, setInternalHideIsolatedNodes] = useState(false);
  const hideIsolatedNodes = controlledHideIsolatedNodes ?? internalHideIsolatedNodes;
  const updateHideIsolatedNodes = (value: boolean) => {
    if (onHideIsolatedNodesChange) onHideIsolatedNodesChange(value);
    else setInternalHideIsolatedNodes(value);
  };
  
  const [internalNodeSpacing, setInternalNodeSpacing] = useState(0.5);
  const nodeSpacing = controlledNodeSpacing ?? internalNodeSpacing;
  const updateNodeSpacing = (value: number) => {
    if (onNodeSpacingChange) onNodeSpacingChange(value);
    else setInternalNodeSpacing(value);
  };
  
  const [internalShowSpacingControl, setInternalShowSpacingControl] = useState(true);
  const showSpacingControl = controlledShowSpacingControl ?? internalShowSpacingControl;
  const updateShowSpacingControl = (value: boolean) => {
    if (onShowSpacingControlChange) onShowSpacingControlChange(value);
    else setInternalShowSpacingControl(value);
  };
  
  // Animation state for links
  const [animationFrame, setAnimationFrame] = useState(0);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Responsive dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height || 500
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Store relationships globally for link rendering
  useEffect(() => {
    globalRelationships = relationships;
  }, [relationships]);

  // Transform NAVIGATE data to graph format
  const graphDataMemo = useMemo(() => {
    if (stakeholders.length === 0 && technologies.length === 0 && projects.length === 0) {
      return { nodes: [], links: [] };
    }

    try {
      return toNetworkGraphFromNavigate(stakeholders, technologies, projects, relationships);
    } catch (error) {
      console.error('Error transforming NAVIGATE data:', error);
      return { nodes: [], links: [] };
    }
  }, [stakeholders, technologies, projects, relationships]);

  // Filter links based on relationship type filters
  const filteredGraphData = useMemo(() => {
    const filteredLinks = graphDataMemo.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const relationship = globalRelationships.find(r => 
        (r.source === sourceId && r.target === targetId) ||
        (r.source === targetId && r.target === sourceId)
      );
      
      if (!relationship) return true; // Keep links without relationship data
      
      // Map relationship type to filter key
      const filterKey = relationship.type === 'collaborates_with' ? 'collaborates_with' :
                        relationship.type === 'participates_in' ? 'participates_in' :
                        relationship.type;
      
      return relationshipFilters[filterKey as keyof typeof relationshipFilters] ?? true;
    });
    
    // Filter out isolated nodes if option is enabled
    let filteredNodes = graphDataMemo.nodes;
    if (hideIsolatedNodes) {
      const connectedNodeIds = new Set<string>();
      filteredLinks.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        connectedNodeIds.add(sourceId);
        connectedNodeIds.add(targetId);
      });
      filteredNodes = graphDataMemo.nodes.filter(node => connectedNodeIds.has(node.id));
    }
    
    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [graphDataMemo, relationshipFilters, hideIsolatedNodes]);

  // Update graph data
  useEffect(() => {
    setIsLoading(true);
    setGraphData(filteredGraphData);
    setIsLoading(false);
  }, [filteredGraphData]);
  
  // Apply spacing on initial load and when spacing changes
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Apply link distance - ensure it's set before simulation starts
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance((link: any) => {
          const strength = link.similarity || 0.5;
          const baseDistance = 480 + (1 - strength) * 800; // Base: 480-1280px
          return baseDistance * nodeSpacing;
        });
        // Initialize with current data
        linkForce.initialize(graphData.nodes, graphData.links);
      }
      
      // Apply charge force
      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce.strength(-800 * nodeSpacing);
        chargeForce.initialize(graphData.nodes);
      } else {
        // Add charge force if it doesn't exist
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const d3Force = require('d3-force');
          const engine = fgRef.current.d3Force();
          if (engine) {
            const newCharge = d3Force.forceManyBody().strength(-800 * nodeSpacing);
            engine.force('charge', newCharge);
            newCharge.initialize(graphData.nodes);
          }
        } catch (e) {
          // d3-force not available
        }
      }
      
      // Log for verification and update debug display
      const minDist = Math.round(480 * nodeSpacing);
      const maxDist = Math.round(1280 * nodeSpacing);
      const chargeStr = Math.round(-800 * nodeSpacing);
      console.log(`[SPACING] Applied: ${nodeSpacing}x | Link: ${minDist}-${maxDist}px | Charge: ${chargeStr}`);
      setSpacingDebug(`Link: ${minDist}-${maxDist}px | Charge: ${chargeStr}`);
    }
  }, [nodeSpacing, graphData.nodes.length, graphData.links.length]);
  
  // Animation loop for link particles
  useEffect(() => {
    if (!hoveredNode && !clickedNode) return;
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 100);
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, [hoveredNode, clickedNode]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const nodeObj = typeof node === 'string' 
      ? graphData.nodes.find(n => n.id === node)
      : node;
    
    if (!nodeObj) return;
    
    // Toggle clicked node (click again to deselect)
    if (clickedNode?.id === nodeObj.id) {
      setClickedNode(null);
    } else {
      setClickedNode(nodeObj);
    }
    
    if (onEntitySelect) {
      onEntitySelect(nodeObj.id);
    }
    
    // Center camera on clicked node
    if (fgRef.current && nodeObj.x && nodeObj.y) {
      fgRef.current.centerAt(nodeObj.x, nodeObj.y, 1000);
    }
  }, [onEntitySelect, graphData.nodes, clickedNode]);

  // Handle node hover
  const handleNodeHover = useCallback((node: NetworkNode | null) => {
    setHoveredNode(node);
  }, []);

  // Custom node rendering
  const nodeCanvasObject = useCallback((node: NetworkNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    // Increase node size - make them more visible
    const nodeRadius = Math.sqrt(node.value) * 3; // Increased from * 2 to * 3

    const isSelected = selectedEntityId === node.id || clickedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    
    // Dim nodes that aren't connected to active node (when one is clicked)
    const isDimmed = clickedNode && clickedNode.id !== node.id && 
      !graphData.links.some(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return (sourceId === clickedNode.id && targetId === node.id) ||
               (targetId === clickedNode.id && sourceId === node.id);
      });

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isDimmed ? node.color.replace(')', ', 0.3)').replace('rgb', 'rgba') : node.color;
    ctx.fill();

    // Draw border for selected/hovered nodes
    if (isSelected) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
    } else if (isHovered) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw label if zoomed in enough or node is selected/hovered
    // Only show labels when zoomed in enough to avoid overlap
    const minZoomForLabels = 1.5; // Require more zoom before showing labels
    if (globalScale > minZoomForLabels || isSelected || isHovered) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDimmed ? 'rgba(51, 51, 51, 0.5)' : '#333';
      ctx.font = `${fontSize}px Arial`;

      const maxLength = 35; // Slightly longer labels since we have more space
      const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;

      // Position label further from node to avoid overlap with connections
      // Increase offset based on spacing multiplier and zoom level
      const baseOffset = fontSize + 4;
      const spacingOffset = nodeSpacing > 1.5 ? 6 : 0;
      const zoomOffset = globalScale > 2.0 ? 2 : 0; // Extra space when very zoomed
      const labelOffset = baseOffset + spacingOffset + zoomOffset;
      ctx.fillText(displayLabel, node.x || 0, (node.y || 0) + nodeRadius + labelOffset);
    }
  }, [selectedEntityId, hoveredNode, clickedNode, graphData.links, nodeSpacing]);

  // Custom link rendering with filtering, opacity, and animation
  const linkCanvasObject = useCallback((link: NetworkLink, ctx: CanvasRenderingContext2D) => {
    const start = typeof link.source === 'string' 
      ? graphData.nodes.find(n => n.id === link.source) 
      : link.source as NetworkNode;
    const end = typeof link.target === 'string'
      ? graphData.nodes.find(n => n.id === link.target)
      : link.target as NetworkNode;

    if (!start || !end || !start.x || !start.y || !end.x || !end.y) return;

    const similarity = link.similarity || 0.5;
    
    // Get relationship type from original relationship data
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const relationship = globalRelationships.find(r => 
      (r.source === sourceId && r.target === targetId) ||
      (r.source === targetId && r.target === sourceId)
    );
    
    // Check if this link is connected to hovered/clicked node
    const isConnectedToActive = (hoveredNode && (start.id === hoveredNode.id || end.id === hoveredNode.id)) ||
                                (clickedNode && (start.id === clickedNode.id || end.id === clickedNode.id));
    
    // Color code by relationship type
    const getLinkColor = (type?: string, isActive = false, isFaint = false) => {
      const baseOpacity = isFaint ? 0.15 : (isActive ? 0.9 : 0.7);
      
      switch (type) {
        case 'funds': return `rgba(0, 110, 81, ${baseOpacity})`;
        case 'collaborates_with': return `rgba(74, 144, 226, ${baseOpacity})`;
        case 'researches': return `rgba(245, 166, 35, ${baseOpacity})`;
        case 'advances': return `rgba(236, 72, 153, ${baseOpacity})`;
        case 'participates_in': return `rgba(139, 92, 246, ${baseOpacity})`;
        default: return `rgba(100, 100, 100, ${Math.max(0.2, similarity * baseOpacity)})`;
      }
    };
    
    // Determine if this is a "faint" connection (other connections from clicked node, not the main ones)
    // Show faint lines for connections FROM the clicked node that aren't the primary highlighted ones
    const isFaintConnection = clickedNode && 
      (start.id === clickedNode.id || end.id === clickedNode.id) &&
      !isConnectedToActive; // Not the main connection being hovered/selected
    
    const linkColor = getLinkColor(relationship?.type, isConnectedToActive, isFaintConnection);
    const linkWidth = isFaintConnection ? 1 : Math.max(2, link.width || 2.5);
    
    // Draw link line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = linkColor;
    ctx.lineWidth = linkWidth;
    ctx.stroke();
    
    // Animated particles on active links (instead of arrows)
    if (isConnectedToActive && relationship && !relationship.bidirectional) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const progress = (animationFrame / 100) % 1; // 0 to 1
      
      // Particle position along the link
      const particleX = start.x + dx * progress;
      const particleY = start.y + dy * progress;
      
      // Draw animated particle
      ctx.beginPath();
      ctx.arc(particleX, particleY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = linkColor.replace('0.9', '1.0').replace('0.7', '1.0'); // Brighter for particle
      ctx.fill();
    }
  }, [graphData.nodes, relationships, hoveredNode, clickedNode, animationFrame]);

  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading NAVIGATE network visualization...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No NAVIGATE data available to display</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Network Graph</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Showing {graphData.nodes.length} entities with {graphData.links.length} relationships
          </p>
          <NetworkRelationshipControls
            relationshipFilters={relationshipFilters}
            onRelationshipFiltersChange={updateRelationshipFilters}
            hideIsolatedNodes={hideIsolatedNodes}
            onHideIsolatedNodesChange={updateHideIsolatedNodes}
            nodeSpacing={nodeSpacing}
            onNodeSpacingChange={updateNodeSpacing}
            showSpacingControl={showSpacingControl}
            onShowSpacingControlChange={updateShowSpacingControl}
            totalNodes={graphDataMemo.nodes.length}
            filteredNodes={filteredGraphData.nodes.length}
            filteredLinks={filteredGraphData.links.length}
            totalLinks={graphDataMemo.links.length}
          />
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden h-[500px] min-h-[400px]"
          >
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeId="id"
              nodeLabel="label"
              nodeColor="color"
              nodeVal="value"
              linkSource="source"
              linkTarget="target"
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#fafafa"
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              cooldownTicks={200} // More ticks for larger spacing to settle
              d3AlphaDecay={0.012} // Slower decay for better spreading with larger distances
              d3VelocityDecay={0.25} // Lower velocity decay for smoother movement
              d3Force="link"
              d3ForceParam={(link: any) => {
                const strength = link.similarity || 0.5;
                // DOUBLED base spacing: 480-1280px (was 240-640px)
                // Multiplied by user-controlled spacing factor
                const baseDistance = 480 + (1 - strength) * 800;
                const finalDistance = baseDistance * nodeSpacing;
                return finalDistance;
              }}
              onEngineTick={() => {
                // Add/update charge force to push nodes apart
                if (fgRef.current) {
                  const engine = fgRef.current.d3Force();
                  if (engine) {
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-require-imports
                      const d3Force = require('d3-force');
                      if (!engine.force('charge')) {
                        // Add charge force if not present
                        engine.force('charge', d3Force.forceManyBody().strength(-800 * nodeSpacing));
                      } else {
                        // Update existing charge force
                        engine.force('charge').strength(-800 * nodeSpacing);
                      }
                    } catch (e) {
                      // d3-force not available, link distance should still work
                    }
                  }
                }
              }}
              onEngineStop={() => {
                if (fgRef.current && graphData.nodes.length > 0) {
                  setTimeout(() => {
                    // Adjust padding based on spacing - more spacing needs more padding
                    const padding = 400 * Math.max(1, nodeSpacing * 0.5);
                    fgRef.current?.zoomToFit(padding, 0);
                  }, 100);
                }
              }}
            />
            
            {/* Hover tooltip */}
            {hoveredNode && (
              <div 
                className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg z-10 max-w-xs"
                style={{ pointerEvents: 'none' }}
              >
                <div className="font-semibold text-gray-900">{hoveredNode.label}</div>
                <div className="text-sm text-gray-600 mt-1">Sector: {hoveredNode.sector}</div>
                <div className="text-xs text-gray-500 mt-1">Click to select</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export interface NetworkRelationshipControlsProps {
  relationshipFilters: RelationshipFilterState;
  onRelationshipFiltersChange: (filters: RelationshipFilterState) => void;
  hideIsolatedNodes: boolean;
  onHideIsolatedNodesChange: (value: boolean) => void;
  nodeSpacing: number;
  onNodeSpacingChange: (value: number) => void;
  showSpacingControl: boolean;
  onShowSpacingControlChange: (value: boolean) => void;
  totalNodes?: number;
  filteredNodes?: number;
  totalLinks?: number;
  filteredLinks?: number;
}

export function NetworkRelationshipControls({
  relationshipFilters,
  onRelationshipFiltersChange,
  hideIsolatedNodes,
  onHideIsolatedNodesChange,
  nodeSpacing,
  onNodeSpacingChange,
  showSpacingControl,
  onShowSpacingControlChange,
  totalNodes,
  filteredNodes,
  totalLinks,
  filteredLinks,
}: NetworkRelationshipControlsProps) {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-gray-700 mb-2">Filter Relationship Types:</div>
      <div className="flex flex-wrap gap-3 text-xs">
        {RELATIONSHIP_KEYS.map((key) => {
          const colorMap: Record<RelationshipKey, string> = {
            funds: '#006E51',
            collaborates_with: '#4A90E2',
            researches: '#F5A623',
            advances: '#EC4899',
            participates_in: '#8B5CF6',
          };
          const labels: Record<RelationshipKey, string> = {
            funds: 'Funds',
            collaborates_with: 'Collaborates',
            researches: 'Researches',
            advances: 'Advances',
            participates_in: 'Participates',
          };
          return (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={relationshipFilters[key]}
                onChange={(e) =>
                  onRelationshipFiltersChange({
                    ...relationshipFilters,
                    [key]: e.target.checked,
                  })
                }
                className="w-3 h-3 rounded focus:ring-[#006E51]"
                style={{ accentColor: colorMap[key] }}
              />
              <div className="w-4 h-0.5" style={{ background: colorMap[key] }}></div>
              <span className="text-gray-600">{labels[key]}</span>
            </label>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() =>
            onRelationshipFiltersChange({
              funds: true,
              collaborates_with: true,
              researches: true,
              advances: true,
              participates_in: true,
            })
          }
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
        >
          Show All
        </button>
        <button
          onClick={() =>
            onRelationshipFiltersChange({
              funds: false,
              collaborates_with: false,
              researches: false,
              advances: false,
              participates_in: false,
            })
          }
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
        >
          Hide All
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hideIsolatedNodes}
            onChange={(e) => onHideIsolatedNodesChange(e.target.checked)}
            className="w-3 h-3 text-[#006E51] rounded focus:ring-[#006E51]"
          />
          <span className="text-xs text-gray-700">Hide isolated nodes (no connections)</span>
        </label>
        {typeof totalNodes === 'number' && typeof filteredNodes === 'number' && (
          <p className="text-xs text-gray-500 mt-1 ml-5">
            {hideIsolatedNodes
              ? `Showing ${filteredNodes} connected nodes`
              : `Showing all ${totalNodes} nodes (${totalNodes - filteredNodes} isolated)`}
          </p>
        )}
        {typeof totalLinks === 'number' && typeof filteredLinks === 'number' && (
          <p className="text-xs text-gray-400 ml-5">
            {filteredLinks} / {totalLinks} links visible
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSpacingControl}
              onChange={(e) => onShowSpacingControlChange(e.target.checked)}
              className="w-3 h-3 text-[#006E51] rounded focus:ring-[#006E51]"
            />
            <span className="text-xs text-gray-700">Show spacing control</span>
          </label>
        </div>
        {showSpacingControl && (
          <div className="ml-5 space-y-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600 min-w-[80px]">
                Spacing: {nodeSpacing.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={nodeSpacing}
                onChange={(e) => onNodeSpacingChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNodeSpacingChange(1.0)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                1x
              </button>
              <button
                onClick={() => onNodeSpacingChange(0.5)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Default (0.5x)
              </button>
              <button
                onClick={() => onNodeSpacingChange(2.0)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Double (2x)
              </button>
              <button
                onClick={() => onNodeSpacingChange(3.0)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Triple (3x)
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Current distance: ~{Math.round((480 + 400) * nodeSpacing)}-{Math.round((480 + 800) * nodeSpacing)}px
            </p>
            <p className="text-xs text-gray-400 mt-1 italic">
              {nodeSpacing !== 0.5 ? `⚠️ Adjusting spacing...` : '✓ Default (0.5x)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

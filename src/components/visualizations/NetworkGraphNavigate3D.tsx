/**
 * NetworkGraphNavigate3D
 * 
 * 3D version of NetworkGraphNavigate using react-force-graph-3d
 * NAVIGATE version using Stakeholder, Technology, Project, and Relationship entities
 * Uses REAL relationships instead of calculated similarity!
 * 
 * This is a direct 3D port of NetworkGraphNavigate with all the same features.
 */

'use client';

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Stakeholder, Technology, Project, Relationship } from '@/lib/navigate-types';
import { NetworkNode, NetworkLink } from '@/lib/types';
import { toNetworkGraphFromNavigate } from '@/lib/navigate-adapters';
import { NetworkRelationshipControls } from './NetworkGraphNavigate';
import * as THREE from 'three';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading 3D graph...</div>
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

interface NetworkGraphNavigate3DProps {
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

export function NetworkGraphNavigate3D({ 
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
}: NetworkGraphNavigate3DProps) {
  
  const fgRef = useRef<any>(null);
  const hasZoomedRef = useRef(false);
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[], links: NetworkLink[] }>(() => ({ nodes: [], links: [] }));
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [clickedNode, setClickedNode] = useState<NetworkNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
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
      const source = (link as any).source;
      const target = (link as any).target;
      const sourceId = typeof source === 'string' ? source : source?.id;
      const targetId = typeof target === 'string' ? target : target?.id;
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
        const source = (link as any).source;
        const target = (link as any).target;
        const sourceId = typeof source === 'string' ? source : source?.id;
        const targetId = typeof target === 'string' ? target : target?.id;
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
    hasZoomedRef.current = false;
  }, [filteredGraphData]);
  useEffect(() => {
    hasZoomedRef.current = false;
  }, [nodeSpacing]);
  
  // Apply spacing on initial load and when spacing changes
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Apply link distance
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance((link: any) => {
          const strength = link.similarity || 0.5;
          const baseDistance = 480 + (1 - strength) * 800;
          return baseDistance * nodeSpacing;
        });
        linkForce.initialize(graphData.nodes, graphData.links);
      }
      
      // Apply charge force
      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce.strength(-800 * nodeSpacing);
        chargeForce.initialize(graphData.nodes);
      }
    }
  }, [nodeSpacing, graphData.nodes.length, graphData.links.length]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const nodeObj = typeof node === 'string' 
      ? graphData.nodes.find(n => n.id === node)
      : node;
    
    if (!nodeObj) return;
    
    // Toggle clicked node
    if (clickedNode?.id === nodeObj.id) {
      setClickedNode(null);
    } else {
      setClickedNode(nodeObj);
    }
    
    if (onEntitySelect) {
      onEntitySelect(nodeObj.id);
    }
    
    // Center camera on clicked node
    if (fgRef.current && nodeObj.x !== undefined && nodeObj.y !== undefined && nodeObj.z !== undefined) {
      const distance = 200;
      const distRatio = 1 + distance / Math.hypot(nodeObj.x, nodeObj.y, nodeObj.z);
      fgRef.current.cameraPosition(
        { x: nodeObj.x * distRatio, y: nodeObj.y * distRatio, z: nodeObj.z * distRatio },
        nodeObj,
        3000
      );
    }
  }, [onEntitySelect, graphData.nodes, clickedNode]);

  // Handle node hover
  const handleNodeHover = useCallback((node: NetworkNode | null) => {
    setHoveredNode(node);
  }, []);

  // Custom node rendering with Three.js
  const nodeThreeObject = useCallback((node: NetworkNode) => {
    const nodeRadius = Math.sqrt(node.value) * 3;
    
    const isSelected = selectedEntityId === node.id || clickedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    
    // Dim nodes that aren't connected to active node
    const isDimmed = Boolean(
      clickedNode &&
      clickedNode.id !== node.id &&
      !graphData.links.some(link => {
        const source = (link as any).source;
        const target = (link as any).target;
        const sourceId = typeof source === 'string' ? source : source?.id;
        const targetId = typeof target === 'string' ? target : target?.id;
        return (sourceId === clickedNode.id && targetId === node.id) ||
               (targetId === clickedNode.id && sourceId === node.id);
      })
    );

    // Parse color
    const color = new THREE.Color(node.color);
    if (isDimmed) {
      color.multiplyScalar(0.3);
    }

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(nodeRadius, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: isSelected ? new THREE.Color(0x000000) : new THREE.Color(0x000000),
      emissiveIntensity: isSelected ? 0.3 : (isHovered ? 0.1 : 0),
      metalness: 0.3,
      roughness: 0.4,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    
    // Add border/outline for selected/hovered nodes
    if (isSelected || isHovered) {
      const outlineGeometry = new THREE.SphereGeometry(nodeRadius + 2, 16, 16);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x000000 : 0x666666,
        side: THREE.BackSide
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      sphere.add(outline);
    }
    
    return sphere;
  }, [selectedEntityId, hoveredNode, clickedNode, graphData.links]);

  // Link color function - matches 2D version
  const linkColor = useCallback((link: NetworkLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const relationship = globalRelationships.find(r => 
      (r.source === sourceId && r.target === targetId) ||
      (r.source === targetId && r.target === sourceId)
    );
    
    const isConnectedToActive = (hoveredNode && (sourceId === hoveredNode.id || targetId === hoveredNode.id)) ||
                                (clickedNode && (sourceId === clickedNode.id || targetId === clickedNode.id));
    
    const isFaintConnection = clickedNode && 
      (sourceId === clickedNode.id || targetId === clickedNode.id) &&
      !isConnectedToActive;
    
    const baseOpacity = isFaintConnection ? 0.15 : (isConnectedToActive ? 0.9 : 0.7);
    
    switch (relationship?.type) {
      case 'funds': return `rgba(0, 110, 81, ${baseOpacity})`;
      case 'collaborates_with': return `rgba(74, 144, 226, ${baseOpacity})`;
      case 'researches': return `rgba(245, 166, 35, ${baseOpacity})`;
      case 'advances': return `rgba(236, 72, 153, ${baseOpacity})`;
      case 'participates_in': return `rgba(139, 92, 246, ${baseOpacity})`;
      default: {
        const similarity = link.similarity || 0.5;
        return `rgba(100, 100, 100, ${Math.max(0.2, similarity * baseOpacity)})`;
      }
    }
  }, [hoveredNode, clickedNode]);

  // Link width function
  const linkWidth = useCallback((link: NetworkLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const isConnectedToActive = (hoveredNode && (sourceId === hoveredNode.id || targetId === hoveredNode.id)) ||
                                (clickedNode && (sourceId === clickedNode.id || targetId === clickedNode.id));
    const isFaintConnection = clickedNode && 
      (sourceId === clickedNode.id || targetId === clickedNode.id) &&
      !isConnectedToActive;
    
    return isFaintConnection ? 1 : Math.max(2, link.width || 2.5);
  }, [hoveredNode, clickedNode]);

  // Link particles for directional links
  const linkDirectionalParticles = useCallback((link: NetworkLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const relationship = globalRelationships.find(r => 
      (r.source === sourceId && r.target === targetId) ||
      (r.source === targetId && r.target === sourceId)
    );
    const isConnectedToActive = (hoveredNode && (sourceId === hoveredNode.id || targetId === hoveredNode.id)) ||
                                (clickedNode && (sourceId === clickedNode.id || targetId === clickedNode.id));
    return isConnectedToActive && relationship && !relationship.bidirectional ? 1 : 0;
  }, [hoveredNode, clickedNode]);

  // Node label rendering
  const nodeLabel = useCallback((node: NetworkNode) => {
    const isSelected = selectedEntityId === node.id || clickedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    
    if (isSelected || isHovered) {
      const maxLength = 35;
      const displayLabel = node.label.length > maxLength ? node.label.substring(0, maxLength) + '...' : node.label;
      return displayLabel;
    }
    return '';
  }, [selectedEntityId, hoveredNode, clickedNode]);

  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Network Graph (3D)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading NAVIGATE 3D network visualization...</p>
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
          <CardTitle>NAVIGATE Network Graph (3D)</CardTitle>
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
          <CardTitle>NAVIGATE Network Graph (3D)</CardTitle>
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
            <ForceGraph3D
              ref={fgRef}
              graphData={graphData}
              nodeId="id"
              nodeLabel={nodeLabel}
              nodeColor="color"
              nodeVal="value"
              linkSource="source"
              linkTarget="target"
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              nodeThreeObject={nodeThreeObject}
              linkColor={linkColor}
              linkWidth={linkWidth}
              linkDirectionalParticles={linkDirectionalParticles}
              linkDirectionalParticleSpeed={0.01}
              linkDirectionalParticleWidth={4}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#fafafa"
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              controlType="trackball"
              cooldownTicks={200}
              d3AlphaDecay={0.012}
              d3VelocityDecay={0.25}
              d3Force="link"
              d3ForceParam={(link: any) => {
                const strength = link.similarity || 0.5;
                const baseDistance = 480 + (1 - strength) * 800;
                const finalDistance = baseDistance * nodeSpacing;
                return finalDistance;
              }}
              onEngineTick={() => {
                if (fgRef.current) {
                  const engine = fgRef.current.d3Force();
                  if (engine) {
                    const chargeForce = engine.force('charge');
                    if (chargeForce) {
                      chargeForce.strength(-800 * nodeSpacing);
                    }
                  }
                }
              }}
              onEngineStop={() => {
                if (fgRef.current && graphData.nodes.length > 0) {
                  if (!hasZoomedRef.current) {
                    hasZoomedRef.current = true;
                    setTimeout(() => {
                      const padding = 400 * Math.max(1, nodeSpacing * 0.5);
                      fgRef.current?.zoomToFit(padding, 0);
                    }, 100);
                  }
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
                <div className="text-xs text-gray-500 mt-1">Click to select | Drag to rotate</div>
              </div>
            )}
            
            {/* 3D Controls Help */}
            <div 
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-lg z-10 text-xs text-gray-600"
            >
              <div className="font-semibold mb-1">3D Controls:</div>
              <div>• Left-click + drag: Rotate</div>
              <div>• Right-click + drag: Pan</div>
              <div>• Scroll: Zoom</div>
              <div>• Click node: Focus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Re-export the controls component props type for convenience
export type { NetworkRelationshipControlsProps } from './NetworkGraphNavigate';

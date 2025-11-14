"use client"

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigateStore } from '@/stores/navigate-store';
import { toNetworkGraphData, GraphNode, GraphLink } from '@/lib/data-utils';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading graph...</div>
});

interface ForceGraphProps {
  className?: string;
  height?: number;
}

export function ForceGraph({ className = '', height = 600 }: ForceGraphProps) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const containerRef = useRef<HTMLDivElement>(null);

  // Get data from store
  const stakeholders = useNavigateStore((state) => state.getFilteredStakeholders());
  const technologies = useNavigateStore((state) => state.getFilteredTechnologies());
  const relationships = useNavigateStore((state) => state.getFilteredRelationships());
  const selectedEntities = useNavigateStore((state) => state.selectedEntities);
  const highlightedEntities = useNavigateStore((state) => state.highlightedEntities);
  const setSelectedEntities = useNavigateStore((state) => state.setSelectedEntities);
  const setActiveEntity = useNavigateStore((state) => state.setActiveEntity);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Responsive dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Transform data to graph format
  const transformedData = useMemo(() => {
    if (stakeholders.length === 0 && technologies.length === 0) {
      return { nodes: [], links: [] };
    }

    try {
      return toNetworkGraphData(stakeholders, technologies, relationships);
    } catch (error) {
      console.error('Error transforming data:', error);
      return { nodes: [], links: [] };
    }
  }, [stakeholders, technologies, relationships]);

  // Update graph data
  useEffect(() => {
    setIsLoading(true);
    setGraphData(transformedData);
    setIsLoading(false);
  }, [transformedData]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const nodeId = typeof node === 'string' ? node : node.id;
    setActiveEntity(nodeId);
    
    if (selectedEntities.includes(nodeId)) {
      setSelectedEntities(selectedEntities.filter(id => id !== nodeId));
    } else {
      setSelectedEntities([...selectedEntities, nodeId]);
    }
  }, [selectedEntities, setSelectedEntities, setActiveEntity]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node || null);
  }, []);

  // Custom node rendering
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || node.id;
    const fontSize = 12 / globalScale;
    const nodeRadius = Math.sqrt(node.value || 5) * 2;
    
    const isSelected = selectedEntities.includes(node.id);
    const isHovered = hoveredNode?.id === node.id;
    const isHighlighted = highlightedEntities.includes(node.id);
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI);
    
    // Set fill color
    ctx.fillStyle = node.color || '#6b7280';
    if (isHighlighted) {
      ctx.fillStyle = node.color + 'CC'; // More opaque when highlighted
    }
    
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
    } else if (isHighlighted) {
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw label if zoomed in enough or node is selected/hovered
    if (globalScale > 1.5 || isSelected || isHovered || isHighlighted) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.font = `${fontSize}px Arial`;
      
      // Truncate long labels
      const maxLength = 30;
      const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
      
      ctx.fillText(displayLabel, node.x || 0, (node.y || 0) + nodeRadius + fontSize);
    }
  }, [selectedEntities, hoveredNode, highlightedEntities]);

  // Custom link rendering
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = typeof link.source === 'string' 
      ? graphData.nodes.find(n => n.id === link.source) 
      : link.source;
    const end = typeof link.target === 'string' 
      ? graphData.nodes.find(n => n.id === link.target) 
      : link.target;
    
    if (!start?.x || !start?.y || !end?.x || !end?.y) return;

    // Draw link
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = `rgba(100, 100, 100, ${(link.strength || 0.5) * 0.6})`;
    ctx.lineWidth = link.width || 1;
    ctx.stroke();
  }, [graphData.nodes]);

  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading network visualization...</p>
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
          <CardTitle>Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No data available to display</p>
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
          <CardTitle>Stakeholder & Technology Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="w-full" style={{ height: `${height}px` }}>
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(node: any) => `${node.label}\nType: ${node.type}`}
              nodeColor={(node: any) => node.color || '#6b7280'}
              nodeVal={(node: any) => node.value || 5}
              linkColor={() => 'rgba(100, 100, 100, 0.3)'}
              linkWidth={(link: any) => link.width || 1}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              width={dimensions.width}
              height={dimensions.height}
              cooldownTicks={100}
              onEngineStop={() => fgRef.current?.zoomToFit(400)}
            />
          </div>
          
          {hoveredNode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-4 p-2 bg-slate-100 rounded text-sm">
                  <strong>{hoveredNode.label}</strong> ({hoveredNode.type})
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to select</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}


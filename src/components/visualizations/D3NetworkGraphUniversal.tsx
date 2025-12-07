/**
 * Universal D3 Network Graph - Works with BaseEntity[]
 * 
 * This is the new universal version that accepts any entity type
 * (Challenges, Stakeholders, Technologies, Projects, etc.)
 */

'use client';

import { useEffect, useRef, useState, useMemo, useCallback, ReactNode } from 'react';
import * as d3 from 'd3';
import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';
import { buildNetworkFromBaseEntities, NetworkNode, NetworkLink } from '@/lib/toolkit/buildNetworkFromBaseEntities';
import { StakeholderInsightPanel } from '@/components/toolkit/StakeholderInsightPanel';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';

type D3NetworkGraphUniversalProps = {
  entities: BaseEntity[];
  relationships?: UniversalRelationship[];
  selectedEntityId?: string | null;
  onEntitySelect?: (entityId: string | null) => void;
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: ((renderControls: (() => ReactNode) | null) => void) | null;
  onControlsVisibilityChange?: (visible: boolean) => void;
  onInsightsVisibilityChange?: (visible: boolean) => void;
  insightsToggleEnabled?: boolean;
  className?: string;
};

const TYPE_COLORS: Record<string, string> = {
  government: '#006E51',
  intermediary: '#2d8f6f',
  academia: '#7b2cbf',
  industry: '#e76f51',
  project: '#f4a261',
  working_group: '#264653',
  challenge: '#8b5cf6',
  technology: '#10b981',
  stakeholder: '#4A90E2',
};

type GraphNode = NetworkNode & d3.SimulationNodeDatum & { key: string };
type GraphLink = Omit<NetworkLink, 'source' | 'target'> & d3.SimulationLinkDatum<GraphNode>;

const resolveNodeId = (value: GraphNode | string | number) =>
  typeof value === 'object' ? value.id : String(value);

export function D3NetworkGraphUniversal({
  entities,
  relationships = [],
  selectedEntityId = null,
  onEntitySelect,
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender = null,
  onControlsVisibilityChange,
  onInsightsVisibilityChange,
  insightsToggleEnabled = true,
  className = '',
}: D3NetworkGraphUniversalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const particlesRef = useRef<Map<string, { progress: number; link: GraphLink }>>(new Map());
  const lastSearchZoomRef = useRef<string>('');
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });
  const [groupingMode, setGroupingMode] = useState<'entity_type' | 'stakeholder_category' | 'random'>('entity_type');
  const [forceRepulsion, setForceRepulsion] = useState(600);
  const [edgeLength, setEdgeLength] = useState(250);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupPods, setShowGroupPods] = useState(false);
  const [showLinkDirection, setShowLinkDirection] = useState(true);
  const [animatePaths, setAnimatePaths] = useState(true);
  const [animateLinkFlow, setAnimateLinkFlow] = useState(false);
  const [highlightSearchResults, setHighlightSearchResults] = useState(true);
  const [searchFiltersResults, setSearchFiltersResults] = useState(false);
  const [zoomToSearchResults, setZoomToSearchResults] = useState(true);

  // Build network from BaseEntity[]
  const baseNetwork = useMemo(() => {
    return buildNetworkFromBaseEntities(entities, relationships);
  }, [entities, relationships]);

  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(baseNetwork.categories.map((category) => category.key))
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredNetwork = useMemo(() => {
    let nodes = baseNetwork.nodes;

    if (normalizedSearchQuery && searchFiltersResults) {
      nodes = nodes.filter((node) => {
        const name = node.name.toLowerCase();
        const description = node.fullData.description?.toLowerCase() || '';
        return name.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery);
      });
    }

    if (activeCategories.size === 0) {
      nodes = [];
    } else if (activeCategories.size !== baseNetwork.categories.length) {
      nodes = nodes.filter((node) => activeCategories.has(node.type));
    }

    const allowedIds = new Set(nodes.map((node) => node.id));
    const links = baseNetwork.links.filter(
      (link) => allowedIds.has(link.source) && allowedIds.has(link.target)
    );

    return { nodes, links };
  }, [baseNetwork, normalizedSearchQuery, searchFiltersResults, activeCategories]);

  const searchMatchedIds = useMemo(() => {
    if (!normalizedSearchQuery) return new Set<string>();
    const matches = new Set<string>();
    baseNetwork.nodes.forEach((node) => {
      const name = node.name.toLowerCase();
      const description = node.fullData.description?.toLowerCase() || '';
      if (name.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery)) {
        matches.add(node.id);
      }
    });
    return matches;
  }, [baseNetwork, normalizedSearchQuery]);

  // Get selected entity and related entities
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find(e => e.id === selectedEntityId) || null;
  }, [selectedEntityId, entities]);

  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = new Set<string>();
    
    // Find relationships where this entity is source or target
    relationships.forEach(rel => {
      if (rel.source === selectedEntityId) relatedIds.add(rel.target);
      if (rel.target === selectedEntityId) relatedIds.add(rel.source);
    });
    
    // Also check entity.relationships
    selectedEntity?.relationships?.forEach(rel => {
      relatedIds.add(rel.targetId);
    });
    
    return Array.from(relatedIds)
      .map(id => entities.find(e => e.id === id))
      .filter((e): e is BaseEntity => e !== undefined);
  }, [selectedEntityId, entities, relationships, selectedEntity]);

  // Convert BaseEntity to CirclePackingNode format for StakeholderInsightPanel
  const selectedNodeForPanel = useMemo((): CirclePackingNode | null => {
    if (!selectedEntity) return null;
    
    // Convert BaseEntity to CirclePackingNode format
    return {
      id: selectedEntity.id,
      name: selectedEntity.name,
      type: selectedEntity.metadata.category || selectedEntity.entityType,
      description: selectedEntity.description,
      ...selectedEntity.metadata.custom as Partial<CirclePackingNode>,
    } as CirclePackingNode;
  }, [selectedEntity]);

  const relatedEntitiesForPanel = useMemo((): CirclePackingNode[] => {
    return relatedEntities.map(entity => ({
      id: entity.id,
      name: entity.name,
      type: entity.metadata.category || entity.entityType,
      description: entity.description,
      ...entity.metadata.custom as Partial<CirclePackingNode>,
    })) as CirclePackingNode[];
  }, [relatedEntities]);

  const highlightedIds = useMemo(() => {
    if (!selectedEntityId) return null;
    const ids = new Set<string>([selectedEntityId]);
    relatedEntities.forEach(e => ids.add(e.id));
    return ids;
  }, [selectedEntityId, relatedEntities]);

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 700,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render controls callback
  const renderControls = useCallback(() => (
    <>
      <div className="flex flex-wrap gap-4 px-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs text-slate-600 whitespace-nowrap">Group by:</label>
          <select
            value={groupingMode}
            onChange={(e) => setGroupingMode(e.target.value as typeof groupingMode)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="entity_type">Entity Type</option>
            <option value="stakeholder_category">Stakeholder Category</option>
            <option value="random">Random</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showGroupPods}
            onChange={(e) => setShowGroupPods(e.target.checked)}
            className="rounded"
          />
          Show Group Pods
        </label>
      </div>

      <div className="px-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 whitespace-nowrap">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="px-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchFiltersResults}
            onChange={(e) => setSearchFiltersResults(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Filter graph when searching</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={zoomToSearchResults}
            onChange={(e) => {
              setZoomToSearchResults(e.target.checked);
              if (!e.target.checked) {
                lastSearchZoomRef.current = '';
              }
            }}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Zoom to search results</span>
        </label>
      </div>

      <div className="px-4 flex flex-wrap gap-2 text-sm">
        {baseNetwork.categories.map((category) => {
          const active = activeCategories.has(category.key);
          const color = TYPE_COLORS[category.key] || '#64748b';
          return (
            <label
              key={category.key}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition ${
                active
                  ? 'border-blue-500 bg-blue-50 text-slate-800'
                  : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() =>
                  setActiveCategories((prev) => {
                    const next = new Set(prev);
                    if (next.has(category.key)) {
                      next.delete(category.key);
                    } else {
                      next.add(category.key);
                    }
                    return next;
                  })
                }
                className="hidden"
              />
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium">{category.label}</span>
            </label>
          );
        })}
      </div>

      <div className="px-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Repulsion:</label>
          <input
            type="range"
            min="200"
            max="900"
            step="50"
            value={forceRepulsion}
            onChange={(e) => setForceRepulsion(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{forceRepulsion}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Edge Length:</label>
          <input
            type="range"
            min="50"
            max="300"
            step="25"
            value={edgeLength}
            onChange={(e) => setEdgeLength(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{edgeLength}</span>
        </div>
      </div>

      <div className="px-4 flex flex-wrap gap-4 text-sm border-t border-slate-200 pt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLinkDirection}
            onChange={(e) => setShowLinkDirection(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Show Link Direction</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={animatePaths}
            onChange={(e) => setAnimatePaths(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Animate Paths</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={animateLinkFlow}
            onChange={(e) => setAnimateLinkFlow(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Animate Link Flow</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightSearchResults}
            onChange={(e) => setHighlightSearchResults(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Highlight Search Results</span>
        </label>
      </div>
    </>
  ), [
    groupingMode,
    showGroupPods,
    searchQuery,
    searchFiltersResults,
    zoomToSearchResults,
    activeCategories,
    baseNetwork.categories,
    forceRepulsion,
    edgeLength,
    showLinkDirection,
    animatePaths,
    animateLinkFlow,
    highlightSearchResults,
  ]);

  useEffect(() => {
    onControlsRender?.(renderControls);
    return () => onControlsRender?.(null);
  }, [renderControls, onControlsRender]);

  // Main D3 rendering (simplified - you'll need to port the full rendering logic from D3NetworkGraphView)
  useEffect(() => {
    if (!svgRef.current || !filteredNetwork.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const { width, height } = dimensions;
    svg.attr('width', width).attr('height', height);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create groups for layers
    const zoomContainer = svg.append('g').attr('class', 'zoom-container');
    const podGroup = zoomContainer.append('g').attr('class', 'pods');
    const linkGroup = zoomContainer.append('g').attr('class', 'links');
    const nodeGroup = zoomContainer.append('g').attr('class', 'nodes');

    // Setup zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
      });
    
    const initialZoom = d3.zoomIdentity.scale(0.65).translate(width * 0.15, height * 0.15);
    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, initialZoom);
    zoomRef.current = zoomBehavior;

    // Prepare nodes
    const nodes: GraphNode[] = filteredNetwork.nodes.map((node) => {
      const key = groupingMode === 'entity_type' ? node.type : node.group;
      return {
        ...node,
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        fx: undefined,
        fy: undefined,
        key,
      };
    });

    // Group nodes by key for initial positioning
    if (groupingMode !== 'random') {
      const groups = new Map<string, typeof nodes>();
      nodes.forEach((node) => {
        if (!groups.has(node.key)) groups.set(node.key, []);
        groups.get(node.key)!.push(node);
      });

      const groupKeys = Array.from(groups.keys());
      const radius = 300;
      groupKeys.forEach((key, index) => {
        const groupNodes = groups.get(key)!;
        const angle = (2 * Math.PI * index) / Math.max(groupKeys.length, 1);
        const centerX_offset = Math.cos(angle) * radius;
        const centerY_offset = Math.sin(angle) * radius;

        groupNodes.forEach((node, i) => {
          const cols = Math.max(1, Math.ceil(Math.sqrt(groupNodes.length)));
          const row = Math.floor(i / cols);
          const col = i % cols;
          node.x = centerX + centerX_offset + (col - cols / 2) * 80;
          node.y = centerY + centerY_offset + (row - cols / 2) * 80;
        });
      });
    }

    // Create links
    const links: GraphLink[] = filteredNetwork.links.map((link) => ({
      ...link,
      source: nodes.find((n) => n.id === link.source) || link.source,
      target: nodes.find((n) => n.id === link.target) || link.target,
    }));

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const link = filteredNetwork.links.find(
              (l) => l.source === resolveNodeId(d.source) && l.target === resolveNodeId(d.target)
            );
            return link ? edgeLength * (link.value || 1) : edgeLength;
          })
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(-forceRepulsion))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => (d.symbolSize || 20) + 5));

    simulationRef.current = simulation;

    // Create arrow markers
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(148,163,184,0.6)');

    const glowFilter = defs
      .append('filter')
      .attr('id', 'selected-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', 6).attr('result', 'blur');
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const shouldHighlightSearch = highlightSearchResults && normalizedSearchQuery.length > 0;

    // Draw links
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.lineStyle?.color || 'rgba(148,163,184,0.6)')
      .attr('stroke-width', (d) => d.lineStyle?.width || 1.5)
      .attr('marker-end', showLinkDirection ? 'url(#arrowhead)' : null)
      .attr('opacity', (d) => {
        const baseOpacity = d.lineStyle?.opacity ?? 0.65;
        if (!selectedEntityId || !highlightedIds || highlightedIds.size === 0) return baseOpacity;
        const sourceId = resolveNodeId(d.source);
        const targetId = resolveNodeId(d.target);
        const isHighlighted = highlightedIds.has(sourceId) && highlightedIds.has(targetId);
        if (animatePaths && selectedEntityId) {
          const isFromSelected = sourceId === selectedEntityId || targetId === selectedEntityId;
          return isHighlighted ? Math.min(1, baseOpacity + 0.35) : isFromSelected ? 0.55 : 0.15;
        }
        return isHighlighted ? Math.min(1, baseOpacity + 0.25) : 0.2;
      })
      .on('click', (event) => {
        event.stopPropagation();
      });

    // Draw nodes
    const node = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.symbolSize || 20)
      .attr('fill', (d) => d.itemStyle.color)
      .attr('stroke', (d) => {
        if (d.id === selectedEntityId) return '#fbbf24';
        if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return '#10b981';
        return highlightedIds?.has(d.id) ? '#6366f1' : '#ffffff';
      })
      .attr('stroke-width', (d) => {
        if (d.id === selectedEntityId) return 4;
        if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return 2.5;
        return highlightedIds?.has(d.id) ? 2 : 1;
      })
      .attr('filter', (d) => (d.id === selectedEntityId ? 'url(#selected-glow)' : null))
      .attr('opacity', (d) => {
        if (!selectedEntityId || !highlightedIds) {
          if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return 1;
          return 1;
        }
        return highlightedIds.has(d.id) ? 1 : 0.25;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEntitySelect?.(d.id === selectedEntityId ? null : d.id);
      });

    // Drag behaviour
    const dragBehaviour = d3
      .drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });
    node.call(dragBehaviour);

    // Add labels
    const label = nodeGroup
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.symbolSize || 20) + 15)
      .attr('font-size', '10px')
      .attr('fill', '#334155')
      .text((d) => d.name)
      .attr('opacity', (d) => {
        if (!selectedEntityId || !highlightedIds) return 1;
        return highlightedIds.has(d.id) ? 1 : 0.25;
      });

    svg.on('click', () => {
      onEntitySelect?.(null);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (typeof d.source === 'object' ? d.source.x! : 0))
        .attr('y1', (d) => (typeof d.source === 'object' ? d.source.y! : 0))
        .attr('x2', (d) => (typeof d.target === 'object' ? d.target.x! : 0))
        .attr('y2', (d) => (typeof d.target === 'object' ? d.target.y! : 0));

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    // Cleanup
    return () => {
      svg.on('click', null);
      simulation.stop();
    };
  }, [
    filteredNetwork,
    dimensions,
    groupingMode,
    forceRepulsion,
    edgeLength,
    selectedEntityId,
    highlightedIds,
    showGroupPods,
    showLinkDirection,
    animatePaths,
    highlightSearchResults,
    searchMatchedIds,
    zoomToSearchResults,
    normalizedSearchQuery,
    onEntitySelect,
  ]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {showEmbeddedControls ? (
        <div className="relative">
          {insightsToggleEnabled && (
            <button
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/80 hover:bg-white border border-slate-300 z-10"
              onClick={() => onControlsVisibilityChange?.(false)}
            >
              Hide inline controls
            </button>
          )}
          {renderControls()}
        </div>
      ) : (
        insightsToggleEnabled && (
          <div className="flex justify-end px-4 -mb-2">
            <button
              className="text-xs px-2 py-1 rounded bg-white/80 hover:bg-white border border-slate-300"
              onClick={() => onControlsVisibilityChange?.(true)}
            >
              Show inline controls
            </button>
          </div>
        )
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div
          ref={containerRef}
          className="flex-1 bg-white rounded-xl shadow border border-slate-200"
          style={{ height: '700px' }}
        >
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
        {showEmbeddedInsights ? (
          <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
            {insightsToggleEnabled && (
              <button
                className="mb-2 text-xs px-2 py-1 rounded bg-white/80 hover:bg-white border border-slate-300"
                onClick={() => onInsightsVisibilityChange?.(false)}
              >
                Hide
              </button>
            )}
            <StakeholderInsightPanel
              selectedNode={selectedNodeForPanel}
              relatedEntities={relatedEntitiesForPanel}
              onSelectNodeAction={(id) => onEntitySelect?.(id)}
              emptyState="Click any node in the graph to view its details, connections, and related entities."
            />
          </div>
        ) : (
          insightsToggleEnabled && (
            <div className="flex justify-end px-4">
              <button
                className="text-xs px-2 py-1 rounded bg-white/80 hover:bg-white border border-slate-300"
                onClick={() => onInsightsVisibilityChange?.(true)}
              >
                Show inline insights
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}




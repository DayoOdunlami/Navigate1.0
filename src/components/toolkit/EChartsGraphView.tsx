'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';
import { StakeholderInsightPanel } from './StakeholderInsightPanel';
import {
  buildNetworkFromCircleData,
  NetworkLink,
  NetworkNode,
} from '@/lib/toolkit/buildNetworkFromCircleData';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([TooltipComponent, LegendComponent, GraphChart, CanvasRenderer]);

type LayoutMode = 'entity_type' | 'stakeholder_category' | 'random';

type EChartsGraphViewProps = {
  selectedId: string | null;
  highlightedIds: Set<string> | null;
  selectedNode: CirclePackingNode | null;
  relatedEntities: CirclePackingNode[];
  onSelectNodeAction: (id: string | null) => void;
};

type PositionedNode = NetworkNode & { x?: number; y?: number; fixed?: boolean };

type PodShape = {
  key: string;
  points: Array<[number, number]>;
  color: string;
  borderColor: string;
};

const CLUSTER_SHADOWS = ['#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#e0e7ff', '#fde68a'];

const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  if (value.length !== 6) {
    return `rgba(148,163,184,${alpha})`;
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const applyGrouping = (nodes: NetworkNode[], mode: LayoutMode): PositionedNode[] => {
  if (mode === 'random') {
    return nodes.map((node) => ({ ...node }));
  }

  const selector =
    mode === 'entity_type' ? (node: NetworkNode) => node.group : (node: NetworkNode) => node.type;
  const grouped = new Map<string, PositionedNode[]>();

  nodes.forEach((node) => {
    const key = selector(node);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({ ...node });
  });

  const groupKeys = Array.from(grouped.keys());
  const baseRadius = mode === 'entity_type' ? 520 : 420;
  const spacing = mode === 'entity_type' ? 140 : 110;
  const entityTypeAnchors: Record<string, { x: number; y: number }> = {
    stakeholder: { x: -520, y: 0 },
    project: { x: 0, y: 420 },
    working_group: { x: 520, y: 0 },
  };

  groupKeys.forEach((key, index) => {
    const members = grouped.get(key)!;
    const cols = Math.max(1, Math.ceil(Math.sqrt(members.length)));
    const center =
      mode === 'entity_type'
        ? entityTypeAnchors[key] ?? { x: 0, y: 0 }
        : {
            x: Math.cos((2 * Math.PI * index) / Math.max(groupKeys.length, 1)) * baseRadius,
            y: Math.sin((2 * Math.PI * index) / Math.max(groupKeys.length, 1)) * baseRadius,
          };

    members.forEach((node, position) => {
      const row = Math.floor(position / cols);
      const col = position % cols;
      const jitterX = (Math.random() - 0.5) * spacing * 0.15;
      const jitterY = (Math.random() - 0.5) * spacing * 0.15;
      node.x = center.x + (col - cols / 2) * spacing + jitterX;
      node.y = center.y + (row - cols / 2) * spacing + jitterY;
      node.fixed = false;
    });
  });

  return groupKeys.flatMap((key) => grouped.get(key)!);
};

const buildCirclePoints = (
  cx: number,
  cy: number,
  radius: number,
  segments = 24
): Array<[number, number]> =>
  Array.from({ length: segments }, (_, i) => {
    const angle = (2 * Math.PI * i) / segments;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });

const computeHull = (points: Array<[number, number]>) => {
  if (points.length <= 1) return points.slice();

  const sorted = [...points].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: Array<[number, number]> = [];
  sorted.forEach((p) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  });

  const upper: Array<[number, number]> = [];
  sorted
    .slice()
    .reverse()
    .forEach((p) => {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    });

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
};

const computeClusters = (nodes: PositionedNode[], links: NetworkLink[]) => {
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((node) => adjacency.set(node.id, new Set()));
  links.forEach((link) => {
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  });

  const clusters = new Map<string, number>();
  const visited = new Set<string>();
  let clusterId = 0;

  const dfs = (nodeId: string, id: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    clusters.set(nodeId, id);

    adjacency.get(nodeId)?.forEach((neighborId) => {
      const link = links.find(
        (l) =>
          (l.source === nodeId && l.target === neighborId) ||
          (l.source === neighborId && l.target === nodeId)
      );
      if (link && (link.value || 1) >= 1.5) {
        dfs(neighborId, id);
      }
    });
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) dfs(node.id, clusterId++);
  });

  return clusters;
};

export function EChartsGraphView({
  selectedId,
  highlightedIds,
  selectedNode,
  relatedEntities,
  onSelectNodeAction,
}: EChartsGraphViewProps) {
  const [groupingMode, setGroupingMode] = useState<LayoutMode>('entity_type');
  const [forceRepulsion, setForceRepulsion] = useState(600);
  const [edgeLength, setEdgeLength] = useState(250);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLinkStrength, setShowLinkStrength] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [showPods, setShowPods] = useState(true);

  const baseNetwork = useMemo(() => buildNetworkFromCircleData(), []);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const [podShapes, setPodShapes] = useState<PodShape[]>([]);

  const filteredNetwork = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let nodes = baseNetwork.nodes;

    if (query) {
      nodes = nodes.filter((node) => {
        const name = node.name.toLowerCase();
        const description = node.fullData.description?.toLowerCase() || '';
        return name.includes(query) || description.includes(query);
      });
    }

    if (selectedCategory) {
      nodes = nodes.filter((node) => node.type === selectedCategory);
    }

    const allowedIds = new Set(nodes.map((node) => node.id));
    const links = baseNetwork.links.filter(
      (link) => allowedIds.has(link.source) && allowedIds.has(link.target)
    );

    return {
      nodes: applyGrouping(nodes, groupingMode),
      links,
    };
  }, [baseNetwork, searchQuery, selectedCategory, groupingMode]);

  const detectedClusters = useMemo(() => {
    if (!showClusters) return new Map<string, number>();
    return computeClusters(filteredNetwork.nodes, filteredNetwork.links);
  }, [filteredNetwork, showClusters]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, number>();
    baseNetwork.categories.forEach((category, index) => map.set(category.key, index));
    return map;
  }, [baseNetwork.categories]);

  const highlightActive = Boolean(selectedId && highlightedIds && highlightedIds.size > 0);

  useEffect(() => {
    if (!showPods || !chartRef.current) {
      setPodShapes([]);
      return;
    }

    const chart = chartRef.current;
    const computePods = () => {
      // Accessing internal ECharts API - using type assertion to bypass private method check
      const series = chart ? (chart as any).getModel().getSeriesByIndex(0) : undefined;
      if (!series) return;
      const data = series.getData();
      const podsMap = new Map<string, { points: Array<[number, number]>; color: string }>();

      data.each((idx: number) => {
        const layout = data.getItemLayout(idx) as number[] | undefined;
        if (!layout) return;
        const raw = data.getRawDataItem(idx) as NetworkNode | undefined;
        if (!raw) return;
        const groupKey = groupingMode === 'entity_type' ? raw.group || raw.type : raw.type;
        if (!groupKey) return;
        if (!podsMap.has(groupKey)) {
          podsMap.set(groupKey, {
            points: [],
            color: raw.itemStyle?.color || '#cbd5f5',
          });
        }
        podsMap.get(groupKey)!.points.push([layout[0], layout[1]]);
      });

      const pods: PodShape[] = [];
      podsMap.forEach((info, key) => {
        if (!info.points.length) return;
        let hull: Array<[number, number]>;
        if (info.points.length >= 3) {
          hull = computeHull(info.points);
        } else {
          const xs = info.points.map((p) => p[0]);
          const ys = info.points.map((p) => p[1]);
          const cx = xs.reduce((sum, x) => sum + x, 0) / info.points.length;
          const cy = ys.reduce((sum, y) => sum + y, 0) / info.points.length;
          const radius = Math.max(80, Math.max(...xs.map((x) => Math.abs(x - cx)), ...ys.map((y) => Math.abs(y - cy))) + 60);
          hull = buildCirclePoints(cx, cy, radius);
        }
        pods.push({
          key,
          points: hull,
          color: info.color,
          borderColor: info.color,
        });
      });

      setPodShapes(pods);
    };

    chart?.off('finished', computePods);
    chart?.on('finished', computePods);
    computePods();

    return () => {
      chart?.off('finished', computePods);
    };
  }, [showPods, groupingMode, filteredNetwork]);

  const option = useMemo(() => {
    const { nodes, links } = filteredNetwork;
    const categories = baseNetwork.categories;

    return {
      tooltip: {
        formatter: (params: { data?: NetworkNode }) => {
          if (!params.data) return '';
          const data = params.data.fullData;
          return `
            <div style="padding:8px;max-width:260px;">
              <div style="font-weight:bold;margin-bottom:4px;">${data.name}</div>
              <div style="font-size:11px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">
                ${data.type || 'entity'}
              </div>
              <div style="font-size:12px;color:#64748b;">${data.description || ''}</div>
            </div>
          `;
        },
      },
      legend: {
        data: categories.map((category) => category.label),
        orient: 'vertical',
        left: 10,
        top: 20,
        textStyle: { fontSize: 11 },
      },
      graphic: showPods
        ? podShapes.map((pod) => ({
            type: 'polygon',
            shape: { points: pod.points },
            style: {
              fill: withAlpha(pod.color, 0.12),
              stroke: withAlpha(pod.borderColor, 0.4),
              lineWidth: 1.5,
            },
            z: -10,
            silent: true,
          }))
        : [],
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          label: {
            show: true,
            position: 'right',
            fontSize: 10,
            color: '#334155',
          },
          force: {
            repulsion: groupingMode !== 'random' ? forceRepulsion * 0.7 : forceRepulsion,
            edgeLength:
              groupingMode === 'entity_type'
                ? [edgeLength * 0.5, edgeLength * 1.2]
                : groupingMode === 'stakeholder_category'
                ? [edgeLength * 0.6, edgeLength * 1.4]
                : [edgeLength * 0.8, edgeLength * 1.4],
            gravity: groupingMode === 'random' ? 0.08 : 0.03,
            friction: 0.6,
            layoutAnimation: true,
          },
          emphasis: {
            focus: 'adjacency',
            blurScope: 'global',
            label: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          },
          categories: categories.map((category) => ({ name: category.label })),
          data: nodes.map((node) => {
            const categoryIndex = categoryLookup.get(node.type) ?? 0;
            const clusterId = detectedClusters.get(node.id);
            const isHighlighted = highlightedIds?.has(node.id);
            const isSelected = node.id === selectedId;
            const dimNode = highlightActive && !isHighlighted;

            return {
              ...node,
              category: categories[categoryIndex]?.label || node.type,
              itemStyle: {
                ...node.itemStyle,
                borderColor: isSelected ? '#f59e0b' : clusterId !== undefined ? '#6366f1' : '#ffffff',
                borderWidth: isSelected ? 3 : clusterId !== undefined ? 2 : 1,
                opacity: dimNode ? 0.25 : 1,
                ...(clusterId !== undefined && showClusters
                  ? {
                      shadowBlur: 10,
                      shadowColor: CLUSTER_SHADOWS[clusterId % CLUSTER_SHADOWS.length],
                    }
                  : {}),
              },
            };
          }),
          links: links.map((link) => {
            const inFocus =
              highlightActive &&
              highlightedIds?.has(link.source) &&
              highlightedIds?.has(link.target);
            const baseStyle = showLinkStrength
              ? link.lineStyle
              : {
                  color: 'rgba(148,163,184,0.45)',
                  width: 1.5,
                  opacity: 0.4,
                };
            return {
              ...link,
              lineStyle: {
                ...baseStyle,
                opacity: highlightActive ? (inFocus ? baseStyle.opacity ?? 0.8 : 0.1) : baseStyle.opacity,
              },
            };
          }),
        },
      ],
    };
  }, [
    baseNetwork.categories,
    categoryLookup,
    detectedClusters,
    filteredNetwork,
    highlightedIds,
    highlightActive,
    selectedId,
    showClusters,
    showLinkStrength,
    forceRepulsion,
    edgeLength,
    groupingMode,
  ]);

  const handleNodeClick = (params: { dataType?: string; data?: { id?: string } }) => {
    if (params.dataType === 'node' && params.data?.id) {
      const nodeId = params.data.id;
      onSelectNodeAction(nodeId === selectedId ? null : nodeId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 px-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs text-slate-600 whitespace-nowrap">Group by:</label>
          <select
            value={groupingMode}
            onChange={(e) => setGroupingMode(e.target.value as LayoutMode)}
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
            checked={showLinkStrength}
            onChange={(e) => setShowLinkStrength(e.target.checked)}
            className="rounded"
          />
          Show Link Strength
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="rounded"
          />
          Show Clusters
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPods}
            onChange={(e) => setShowPods(e.target.checked)}
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
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 whitespace-nowrap">Filter by Category:</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {baseNetwork.categories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
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

      {showLinkStrength && (
        <div className="px-4 flex flex-wrap gap-4 items-center text-xs">
          <span className="text-slate-600 font-medium">Link Strength:</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-400" />
            <span className="text-slate-500">Weak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500" />
            <span className="text-slate-500">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500" />
            <span className="text-slate-500">Strong</span>
          </div>
        </div>
      )}

      {showClusters && detectedClusters.size > 0 && (
        <div className="px-4 text-xs text-slate-600">
          Detected {new Set(detectedClusters.values()).size} clusters
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white rounded-xl shadow border border-slate-200" style={{ height: '700px' }}>
          <ReactECharts
            echarts={echarts}
            option={option}
            style={{ height: '100%', width: '100%' }}
            onEvents={{ click: handleNodeClick }}
            onChartReady={(instance) => {
              chartRef.current = instance;
            }}
          />
        </div>
        <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <StakeholderInsightPanel
            selectedNode={selectedNode}
            relatedEntities={relatedEntities}
            onSelectNodeAction={onSelectNodeAction}
            emptyState="Click any node in the graph to view its details, connections, and related entities."
          />
        </div>
      </div>
    </div>
  );
}


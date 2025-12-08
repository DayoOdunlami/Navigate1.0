'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {
  buildStakeholderNetwork,
  StakeholderNetworkNode,
} from '@/lib/toolkit/stakeholderNetworkGraph';
import type { ToolkitStakeholder, ToolkitProject, WorkingGroup } from '@/data/toolkit/types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([TooltipComponent, LegendComponent, GraphChart, CanvasRenderer]);

type LayoutMode = 'organic' | 'grouped';

export function NetworkGraphECharts() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('organic');
  const [repulsion, setRepulsion] = useState(80); // closer to WebKit style
  const [edgeLength, setEdgeLength] = useState(40);

  const { nodes, links, categories } = useMemo(() => buildStakeholderNetwork(), []);

  // Seed positions for grouped layout so stakeholders / projects / working groups
  // (and stakeholder sub-categories) form distinct lobes, while organic layout
  // leaves positioning to the force engine.
  const positionedNodes = useMemo(() => {
    if (layoutMode !== 'grouped') return nodes;

    // Group key is stakeholder category (government / academia / industry / intermediary)
    // or entity type for projects / working groups.
    const groupMap = new Map<string, StakeholderNetworkNode[]>();
    nodes.forEach((n) => {
      let key: string;
      if (n.entityType === 'stakeholder') {
        const cat = (n.fullData as ToolkitStakeholder).category || 'other';
        key = cat;
      } else {
        key = n.entityType;
      }
      const arr = groupMap.get(key) ?? [];
      arr.push(n);
      groupMap.set(key, arr);
    });

    const orderedKeys = ['government', 'academia', 'industry', 'intermediary', 'project', 'working_group'];
    const presentKeys = orderedKeys.filter((k) => groupMap.has(k));
    const extraKeys = Array.from(groupMap.keys()).filter((k) => !orderedKeys.includes(k));
    const keys = [...presentKeys, ...extraKeys];

    const groupCount = Math.max(keys.length, 1);
    // Push groups much further apart so colours form clearly separated lobes
    const radiusOuter = 380;
    const withPositions: StakeholderNetworkNode[] = [];

    keys.forEach((key, groupIndex) => {
      const groupNodes = groupMap.get(key)!;
      const angleCenter = (2 * Math.PI * groupIndex) / groupCount;
      const cx = Math.cos(angleCenter) * radiusOuter;
      const cy = Math.sin(angleCenter) * radiusOuter;

      const innerRadius = 110;
      const step = (2 * Math.PI) / Math.max(groupNodes.length, 1);

      groupNodes.forEach((node, index) => {
        const angle = index * step;
        withPositions.push({
          ...node,
          x: cx + Math.cos(angle) * innerRadius,
          y: cy + Math.sin(angle) * innerRadius,
        });
      });
    });

    return withPositions;
  }, [nodes, layoutMode]);

  const option = useMemo(
    () => ({
      tooltip: {
        formatter: (params: {
          dataType?: string;
          data?: StakeholderNetworkNode;
        }) => {
          if (params.dataType === 'node' && params.data) {
            const node = params.data;
            const data = node.fullData as ToolkitStakeholder | ToolkitProject | WorkingGroup;
            const type = node.entityType;

            if (type === 'stakeholder') {
              return `
                <div style="padding: 8px; max-width: 260px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${data.name || ''}</div>
                  <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">
                    ${(data as ToolkitStakeholder).category || ''}
                  </div>
                  <div style="font-size: 12px; color: #64748b;">${data.description || ''}</div>
                </div>
              `;
            }

            if (type === 'project') {
              const project = data as ToolkitProject;
              return `
                <div style="padding: 8px; max-width: 260px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${project.name || ''}</div>
                  <div style="font-size: 11px; text-transform: uppercase; color: #e76f51; margin-bottom: 4px;">Project</div>
                  <div style="font-size: 12px; color: #64748b;">${project.description || ''}</div>
                </div>
              `;
            }

            if (type === 'working_group') {
              const wg = data as WorkingGroup;
              return `
                <div style="padding: 8px; max-width: 260px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${wg.name || ''}</div>
                  <div style="font-size: 11px; text-transform: uppercase; color: #264653; margin-bottom: 4px;">Working Group</div>
                  <div style="font-size: 12px; color: #64748b;">${wg.description || ''}</div>
                </div>
              `;
            }
          }
          return '';
        },
      },
      legend: {
        data: categories.map((c) => c.name),
        orient: 'vertical',
        left: 10,
        top: 20,
        textStyle: {
          fontSize: 11,
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          // Reduce label collisions like the label-overlap example
          labelLayout: {
            hideOverlap: true,
          },
          lineStyle: {
            color: 'rgba(148,163,184,0.7)',
            width: 1.2,
            curveness: 0.25,
          },
          label: {
            show: true,
            position: 'right',
            color: '#334155',
            fontSize: 10,
          },
          force: {
            repulsion: layoutMode === 'grouped' ? repulsion * 1.4 : repulsion,
            edgeLength:
              layoutMode === 'organic'
                ? [edgeLength, edgeLength * 4]
                : [edgeLength * 0.5, edgeLength * 1.4],
            gravity: layoutMode === 'organic' ? 0.08 : 0.02,
          },
          categories,
          data: positionedNodes.map((n) => ({
            ...n,
            itemStyle: {
              ...n.itemStyle,
              borderColor: selectedId === n.id ? '#f97316' : '#ffffff',
              borderWidth: selectedId === n.id ? 3 : 1,
            },
          })),
          links,
        },
      ],
    }),
    [positionedNodes, links, categories, selectedId, layoutMode, repulsion, edgeLength],
  );

  const handleClick = (params: { dataType?: string; data?: StakeholderNetworkNode }) => {
    if (params.dataType === 'node' && params.data) {
      setSelectedId(params.data.id);
    }
  };

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-96 rounded-xl border border-slate-200 bg-white">
        <p className="text-slate-500 text-sm">
          No entities to display in ECharts stakeholder network view.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-medium">Layout:</span>
          <div className="inline-flex rounded-md bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('organic')}
              className={`px-2 py-1 rounded ${layoutMode === 'organic' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            >
              Organic
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grouped')}
              className={`px-2 py-1 rounded ${layoutMode === 'grouped' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
            >
              Grouped
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Repulsion</span>
          <input
            type="range"
            min={10}
            max={200}
            step={10}
            value={repulsion}
            onChange={(e) => setRepulsion(Number(e.target.value))}
          />
          <span className="w-10 text-right">{repulsion}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Edge length</span>
          <input
            type="range"
            min={10}
            max={120}
            step={10}
            value={edgeLength}
            onChange={(e) => setEdgeLength(Number(e.target.value))}
          />
          <span className="w-10 text-right">{edgeLength}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200" style={{ height: '600px' }}>
        <ReactECharts
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{ click: handleClick }}
        />
      </div>
    </div>
  );
}

export default NetworkGraphECharts;



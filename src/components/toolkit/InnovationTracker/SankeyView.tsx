'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
} from 'echarts/components';
import { SankeyChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Try to load funding flows data, fallback to empty if file doesn't exist
let fundingFlowsData: { nodes: any[]; links: any[] };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fundingFlowsData = require('@/data/toolkit/fundingFlows.json');
} catch {
  // Funding flows file doesn't exist yet, use empty data
  fundingFlowsData = { nodes: [], links: [] };
}

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  SankeyChart,
  CanvasRenderer,
]);

export function SankeyView() {
  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">
                  ${params.data.source} → ${params.data.target}
                </div>
                <div style="font-size: 12px; color: #6B7280;">
                  Value: ${params.data.value}
                </div>
              </div>
            `;
          } else {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">
                  ${params.data.name}
                </div>
                <div style="font-size: 12px; color: #6B7280;">
                  Category: ${params.data.category || 'N/A'}
                </div>
              </div>
            `;
          }
        },
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency',
            blurScope: 'global',
          },
          nodeAlign: 'left',
          data: fundingFlowsData.nodes,
          links: fundingFlowsData.links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
          },
          levels: [
            {
              depth: 0,
              itemStyle: {
                color: '#059669', // Green for sources (Public/Private)
              },
            },
            {
              depth: 1,
              itemStyle: {
                color: '#0891b2', // Blue for government departments
              },
            },
            {
              depth: 2,
              itemStyle: {
                color: '#7c3aed', // Purple for intermediaries (UKRI/IUK)
              },
            },
            {
              depth: 3,
              itemStyle: {
                color: '#f59e0b', // Orange for recipients
              },
            },
          ],
        },
      ],
    };
  }, []);

  return (
    <div className="w-full h-[700px]">
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}


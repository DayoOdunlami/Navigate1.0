'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import focusAreasData from '@/data/cpc_domain/focus_areas.json';
import milestonesData from '@/data/cpc_domain/milestones.json';

// Try to import projects, but handle if it doesn't exist
let projectsData: { projects: any[] } = { projects: [] };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  projectsData = require('@/data/cpc_domain/projects.json');
} catch {
  // Projects file doesn't exist yet, use empty array
  projectsData = { projects: [] };
}

interface FocusArea {
  id: string;
  name: string;
  mode: string;
  stage: string;
  strategic_themes: string[];
}

const MODE_COLORS: Record<string, string> = {
  'Aviation': '#E91E63',
  'Maritime': '#3F51B5',
  'Rail': '#009688',
  'Highways': '#FF5722',
  'HIT': '#9C27B0',
  'Integrated Transport': '#9C27B0'
};

type VisualizationType = 'treemap' | 'sunburst';

export function TreemapSunburstTransition() {
  const [vizType, setVizType] = useState<VisualizationType>('treemap');
  const chartRef = useRef<any>(null);

  const focusAreas: FocusArea[] = focusAreasData.entities;
  const milestones = milestonesData.milestones;

  // Prepare data structure that works for both visualizations
  const chartData = useMemo(() => {
    // Mode → Focus Area structure
    const modes = ['Aviation', 'Maritime', 'Rail', 'Highways'];
    
    return modes.map(mode => {
      const modeFocusAreas = focusAreas.filter(fa => fa.mode === mode);
      const modeMilestones = milestones.filter(m => m.mode === mode);
      
      return {
        name: mode,
        value: modeFocusAreas.length + modeMilestones.length,
        itemStyle: { color: MODE_COLORS[mode] },
        children: modeFocusAreas.map(fa => ({
          name: fa.name,
          value: 1,
          itemStyle: { 
            color: MODE_COLORS[mode],
            opacity: fa.stage === 'Validation' ? 0.5 : fa.stage === 'Development' ? 0.75 : 1
          },
          data: { ...fa, entityType: 'focus_area' }
        }))
      };
    });
  }, [focusAreas, milestones]);

  const treemapOption = useMemo(() => ({
    series: [{
      type: 'treemap',
      id: 'portfolio-viz',
      animationDurationUpdate: 1000,
      roam: false,
      nodeClick: undefined,
      data: chartData,
      universalTransition: true,
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 11
      },
      breadcrumb: {
        show: false
      },
      levels: [
        {
          itemStyle: {
            borderWidth: 3,
            borderColor: '#333',
            gapWidth: 3
          },
          upperLabel: { show: true }
        },
        {
          itemStyle: {
            borderWidth: 2,
            borderColor: '#666',
            gapWidth: 2
          },
          upperLabel: { show: true }
        }
      ]
    }],
    tooltip: {
      formatter: (params: any) => {
        const d = params.data?.data;
        if (d?.entityType === 'focus_area') {
          return `<strong>${d.name}</strong><br/>
                  Mode: ${d.mode}<br/>
                  Stage: ${d.stage}`;
        }
        return `<strong>${params.name}</strong><br/>Items: ${params.value}`;
      }
    }
  }), [chartData]);

  const sunburstOption = useMemo(() => ({
    series: [{
      type: 'sunburst',
      id: 'portfolio-viz',
      radius: ['20%', '90%'],
      animationDurationUpdate: 1000,
      nodeClick: undefined,
      data: chartData,
      universalTransition: true,
      itemStyle: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.5)'
      },
      label: {
        show: false
      },
      levels: [
        {},
        {
          r0: '20%',
          r: '50%',
          itemStyle: { borderWidth: 2 },
          label: { rotate: 'tangential', fontSize: 11 }
        },
        {
          r0: '50%',
          r: '90%',
          label: { 
            position: 'outside',
            fontSize: 9
          },
          itemStyle: { borderWidth: 1 }
        }
      ]
    }],
    tooltip: {
      formatter: (params: any) => {
        const d = params.data?.data;
        if (d?.entityType === 'focus_area') {
          return `<strong>${d.name}</strong><br/>
                  Mode: ${d.mode}<br/>
                  Stage: ${d.stage}`;
        }
        return `<strong>${params.name}</strong><br/>Count: ${params.value}`;
      }
    }
  }), [chartData]);

  const currentOption = vizType === 'treemap' ? treemapOption : sunburstOption;

  // Handle click on chart background (black space) to toggle
  const handleChartClick = (params: any) => {
    // If clicking on empty space (no data), toggle visualization
    if (!params.data || params.dataType === 'empty') {
      setVizType(prev => prev === 'treemap' ? 'sunburst' : 'treemap');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Portfolio Visualization (Transition)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Click on empty space to transition between Treemap and Sunburst views. Uses ECharts universal transition.
      </p>

      {/* Manual toggle button */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setVizType('treemap')}
          className={`px-4 py-2 rounded text-sm ${vizType === 'treemap' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
        >
          Treemap View
        </button>
        <button
          onClick={() => setVizType('sunburst')}
          className={`px-4 py-2 rounded text-sm ${vizType === 'sunburst' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
        >
          Sunburst View
        </button>
        <div className="ml-auto text-xs text-gray-500 flex items-center">
          <span>Tip: Click on empty space to toggle</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <ReactECharts 
          ref={chartRef}
          option={currentOption} 
          style={{ height: '500px' }}
          onEvents={{ click: handleChartClick }}
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
        <strong>Current view:</strong> {vizType === 'treemap' ? 'Treemap' : 'Sunburst'} | 
        <strong> Transition:</strong> ECharts universal transition with 1000ms animation
      </div>
    </div>
  );
}

export default TreemapSunburstTransition;



'use client';

import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { SankeyChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Note: Card components removed - using plain divs to avoid nested cards
import { enhancedFundingFlowsData, FundingFlowLink } from '@/data/toolkit/fundingFlows-enhanced';
import { harmonizedEntities, getEntity } from '@/data/toolkit/entities-harmonized';
import { InnovationTrackerInsightPanel } from './InnovationTrackerInsightPanel';
import { InnovationTrackerControls, InnovationTrackerFilters } from './InnovationTrackerControls';
import { InnovationTrackerWaterfall } from './InnovationTrackerWaterfall';
import { InnovationTrackerFundingBreakdown } from './InnovationTrackerFundingBreakdown';
import { InnovationTrackerFundingInsights } from './InnovationTrackerFundingInsights';
import { TrendingUp, BarChart3, PieChart, ScatterChart } from 'lucide-react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  SankeyChart,
  CanvasRenderer,
]);

type EnhancedInnovationTrackerProps = {
  // Props for external control/insights integration
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: ((renderControls: (() => ReactNode) | null) => void) | null;
  onInsightsRender?: ((renderInsights: (() => ReactNode) | null) => void) | null;
};

export function EnhancedInnovationTracker({
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender = null,
  onInsightsRender = null,
}: EnhancedInnovationTrackerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<FundingFlowLink | null>(null);
  const [activeView, setActiveView] = useState<'sankey' | 'waterfall' | 'breakdown' | 'insights'>('sankey');
  const [filters, setFilters] = useState<InnovationTrackerFilters>({
    fiscalYear: 'FY24',
    fundingSource: 'all',
    showDetailedProjects: false,
    scenarioAdjustments: {},
  });

  // Check if using external controls/insights
  const usingExternalControls = Boolean(onControlsRender);
  const usingExternalInsights = Boolean(onInsightsRender);

  // Apply filters and scenario adjustments to data
  const filteredData = useMemo(() => {
    const nodes = enhancedFundingFlowsData.nodes;
    let links = enhancedFundingFlowsData.links.filter(link => {
      // Apply funding source filter
      if (filters.fundingSource !== 'all') {
        const sourceEntity = getEntity(link.source);
        if (filters.fundingSource === 'public' && sourceEntity?.type === 'source' && link.source === 'private') {
          return false;
        }
        if (filters.fundingSource === 'private' && link.source !== 'private' && !link.source.includes('airbus')) {
          return false;
        }
      }
      
      // Apply programme filter
      if (filters.programme && link.programme !== filters.programme) {
        return false;
      }
      
      return true;
    });

    // Apply scenario adjustments
    if (Object.keys(filters.scenarioAdjustments).length > 0) {
      links = links.map(link => {
        let adjustedValue = link.value;
        
        // Adjust based on target entity
        const targetId = link.target.toLowerCase();
        if (filters.scenarioAdjustments[targetId]) {
          adjustedValue = link.value * (filters.scenarioAdjustments[targetId] / 100);
        }
        
        // Adjust based on programme
        if (link.programme?.includes('ATI') && filters.scenarioAdjustments['ati']) {
          adjustedValue = link.value * (filters.scenarioAdjustments['ati'] / 100);
        }
        if (link.programme?.includes('Advanced Fuels') && filters.scenarioAdjustments['aff']) {
          adjustedValue = link.value * (filters.scenarioAdjustments['aff'] / 100);
        }
        if (link.target === 'UKRI' && filters.scenarioAdjustments['ukri']) {
          adjustedValue = link.value * (filters.scenarioAdjustments['ukri'] / 100);
        }
        
        return { ...link, value: adjustedValue };
      });
    }

    return { nodes, links };
  }, [filters]);

  // Get selected entity
  const selectedEntity = useMemo(() => {
    if (selectedNodeId) {
      // Try exact match first
      let entity = getEntity(selectedNodeId);
      if (!entity) {
        // Try lowercase
        entity = getEntity(selectedNodeId.toLowerCase());
      }
      if (!entity) {
        // Try to find by name match
        const allEntities = Object.values(harmonizedEntities);
        entity = allEntities.find(e => 
          e.displayName.toLowerCase() === selectedNodeId.toLowerCase() ||
          e.id.toLowerCase() === selectedNodeId.toLowerCase()
        );
      }
      return entity;
    }
    return undefined;
  }, [selectedNodeId]);

  // Provide controls renderer to parent if requested
  useEffect(() => {
    if (onControlsRender) {
      onControlsRender(() => (
        <div className="space-y-4">
          <InnovationTrackerControls
            filters={filters}
            onFiltersChange={setFilters}
          />
          {/* View selector tabs for external mode */}
          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2">View</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveView('sankey')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  activeView === 'sankey' 
                    ? 'bg-[#006E51] text-white border-[#006E51]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Sankey
              </button>
              <button
                onClick={() => setActiveView('waterfall')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  activeView === 'waterfall' 
                    ? 'bg-[#006E51] text-white border-[#006E51]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Waterfall
              </button>
              <button
                onClick={() => setActiveView('breakdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  activeView === 'breakdown' 
                    ? 'bg-[#006E51] text-white border-[#006E51]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Breakdown
              </button>
              <button
                onClick={() => setActiveView('insights')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  activeView === 'insights' 
                    ? 'bg-[#006E51] text-white border-[#006E51]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ScatterChart className="w-3.5 h-3.5" />
                Mix
              </button>
            </div>
          </div>
        </div>
      ));
      return () => {
        onControlsRender(null);
      };
    }
  }, [onControlsRender, filters, activeView]);

  // Provide insights renderer to parent if requested
  useEffect(() => {
    if (onInsightsRender) {
      onInsightsRender(() => (
        <InnovationTrackerInsightPanel
          selectedNodeId={selectedNodeId}
          selectedLink={selectedLink}
          entity={selectedEntity}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedLink(null);
          }}
        />
      ));
      return () => {
        onInsightsRender(null);
      };
    }
  }, [onInsightsRender, selectedNodeId, selectedLink, selectedEntity]);

  // Build ECharts option with harmonized colors
  const echartsOption = useMemo(() => {
    const nodes = filteredData.nodes.map(node => {
      const entity = getEntity(node.id);
      const color = entity?.color || '#6b7280';
      
      return {
        name: node.name, // Display name
        id: node.id, // Store ID for click handling
        itemStyle: {
          color: color,
          borderColor: '#fff',
          borderWidth: 1,
        },
        label: {
          fontSize: 12,
          fontWeight: node.depth === 0 ? 'bold' : 'normal',
        },
        // Store the node data for click handlers
        value: node.id, // Store ID in value for easy access
      };
    });

    const links = filteredData.links.map(link => {
      const sourceEntity = getEntity(link.source.toLowerCase());
      const targetEntity = getEntity(link.target.toLowerCase());
      const sourceColor = sourceEntity?.color || '#6b7280';
      const targetColor = targetEntity?.color || '#6b7280';
      
      return {
        source: link.source,
        target: link.target,
        value: link.value,
        lineStyle: {
          color: 'gradient',
          opacity: 0.6,
        },
      };
    });

    return {
      title: usingExternalControls ? undefined : {
        text: 'Zero emission aviation funding distribution FY24',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937',
        },
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const value = params.data.value;
            const formattedValue = value >= 1 ? `£${value.toFixed(1)}M` : `£${(value * 1000).toFixed(0)}K`;
            const link = filteredData.links.find(
              l => l.source === params.data.source && l.target === params.data.target
            );
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.data.source} → ${params.data.target}</div>
                <div style="font-size: 14px; color: #006E51;">${formattedValue}</div>
                ${link?.programme ? `<div style="font-size: 11px; color: #6B7280; margin-top: 4px;">${link.programme}</div>` : ''}
              </div>
            `;
          }
          const entity = getEntity(params.name.toLowerCase());
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; font-size: 14px;">${params.name}</div>
              ${entity?.metadata.description ? `<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${entity.metadata.description}</div>` : ''}
            </div>
          `;
        },
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency',
          },
          nodeAlign: 'left',
          data: nodes,
          links: links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
          label: {
            fontSize: 12,
          },
        },
      ],
    };
  }, [filteredData, usingExternalControls]);

  const handleNodeClick = (params: any) => {
    if (params.dataType === 'node') {
      // Get node ID from params (stored in value or id field)
      const nodeId = params.data?.value || params.data?.id || params.id;
      const nodeName = params.name || params.data?.name;
      
      if (nodeId) {
        // Use the stored ID directly
        setSelectedNodeId(nodeId);
        setSelectedLink(null);
      } else if (nodeName) {
        // Fallback: find node by name to get ID
        const node = filteredData.nodes.find(n => n.name === nodeName);
        if (node) {
          setSelectedNodeId(node.id);
          setSelectedLink(null);
        }
      }
    }
  };

  const handleLinkClick = (params: any) => {
    console.log('Link clicked:', params);
    if (params.dataType === 'edge') {
      const source = params.data?.source || params.source;
      const target = params.data?.target || params.target;
      const link = filteredData.links.find(
        l => l.source === source && l.target === target
      );
      if (link) {
        setSelectedLink(link);
        setSelectedNodeId(null);
      }
    }
  };

  // Render visualization content (shared between embedded and external modes)
  const renderVisualizationContent = () => (
    <>
      {activeView === 'sankey' && (
        <div className="w-full h-full min-h-[500px]">
          <ReactECharts
            echarts={echarts}
            option={echartsOption}
            style={{ height: '100%', width: '100%' }}
            onEvents={{
              click: (params: any) => {
                if (params.dataType === 'node') {
                  handleNodeClick(params);
                } else if (params.dataType === 'edge') {
                  handleLinkClick(params);
                }
              },
            }}
            notMerge={true}
            lazyUpdate={false}
          />
        </div>
      )}
      {activeView === 'waterfall' && (
        <InnovationTrackerWaterfall
          filters={filters}
          selectedEntityId={selectedNodeId}
          onEntityClick={(entityId) => {
            setSelectedNodeId(entityId);
            setSelectedLink(null);
          }}
        />
      )}
      {activeView === 'breakdown' && (
        <InnovationTrackerFundingBreakdown
          nodes={filteredData.nodes}
          links={filteredData.links}
          onNodeSelect={(entityId) => {
            setSelectedNodeId(entityId);
            setSelectedLink(null);
          }}
        />
      )}
      {activeView === 'insights' && (
        <InnovationTrackerFundingInsights
          links={filteredData.links}
          onLinkSelect={(link) => {
            setSelectedLink(link);
            setSelectedNodeId(null);
          }}
        />
      )}
    </>
  );

  // External mode: just render the visualization, controls/insights handled externally
  if (usingExternalControls || usingExternalInsights) {
    return (
      <div className="w-full h-full">
        {renderVisualizationContent()}
      </div>
    );
  }

  // Embedded mode: original layout with controls and insights
  return (
    <div className="w-full space-y-4">
      {/* Controls Panel at Top */}
      {showEmbeddedControls && (
        <InnovationTrackerControls
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Visualization Selector Tabs at Top */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="mb-4">
          <TabsTrigger value="sankey" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Funding Flows (Sankey)
          </TabsTrigger>
          <TabsTrigger value="waterfall" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Waterfall
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Funding Breakdown
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <ScatterChart className="w-4 h-4" />
            Programme Mix
          </TabsTrigger>
        </TabsList>

        {/* Main Content Area: Visualization + Insights */}
        <div className={`grid grid-cols-1 ${showEmbeddedInsights ? 'lg:grid-cols-4' : ''} gap-4`}>
          {/* Main Visualization Area */}
          <div className={showEmbeddedInsights ? "lg:col-span-3" : ""}>
            <div className="bg-white rounded-lg border p-4">
              <TabsContent value="sankey" className="mt-0">
                <div 
                  className="w-full" 
                  style={{ height: '600px' }}
                >
                  <ReactECharts
                    echarts={echarts}
                    option={echartsOption}
                    style={{ height: '100%', width: '100%' }}
                    onEvents={{
                      click: (params: any) => {
                        if (params.dataType === 'node') {
                          handleNodeClick(params);
                        } else if (params.dataType === 'edge') {
                          handleLinkClick(params);
                        }
                      },
                    }}
                    notMerge={true}
                    lazyUpdate={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="waterfall" className="mt-0">
                <InnovationTrackerWaterfall
                  filters={filters}
                  selectedEntityId={selectedNodeId}
                  onEntityClick={(entityId) => {
                    setSelectedNodeId(entityId);
                    setSelectedLink(null);
                  }}
                />
              </TabsContent>

              <TabsContent value="breakdown" className="mt-0">
                <InnovationTrackerFundingBreakdown
                  nodes={filteredData.nodes}
                  links={filteredData.links}
                  onNodeSelect={(entityId) => {
                    setSelectedNodeId(entityId);
                    setSelectedLink(null);
                  }}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <InnovationTrackerFundingInsights
                  links={filteredData.links}
                  onLinkSelect={(link) => {
                    setSelectedLink(link);
                    setSelectedNodeId(null);
                  }}
                />
              </TabsContent>
            </div>
          </div>

          {/* Insight Panel on Right */}
          {showEmbeddedInsights && (
            <div className="lg:col-span-1">
              <InnovationTrackerInsightPanel
                selectedNodeId={selectedNodeId}
                selectedLink={selectedLink}
                entity={selectedEntity}
                onClose={() => {
                  setSelectedNodeId(null);
                  setSelectedLink(null);
                }}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

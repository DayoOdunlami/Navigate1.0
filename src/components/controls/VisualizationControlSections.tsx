'use client';

import React from 'react';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';
import { TimelineTrack, BarSortOrder, BarValueMode, HeatmapColorMode, TreemapViewMode } from '@/types/visualization-controls';
import { visualizationControlRegistry } from '@/config/visualization-control-registry';

export type VisualizationType =
  | 'sankey'
  | 'heatmap'
  | 'network'
  | 'network3d'
  | 'network-toolkit'
  | 'sunburst'
  | 'chord'
  | 'radar'
  | 'bar'
  | 'circle'
  | 'bump'
  | 'treemap'
  | 'stream'
  | 'parallel'
  | 'swarm'
  | 'timeline'
  | 'bubble-scatter';

export interface VisualizationControlContext {
  useNavigateData: boolean;
  timelineTracks: Record<TimelineTrack, boolean>;
  toggleTimelineTrack: (track: TimelineTrack) => void;
  barSortOrder: BarSortOrder;
  setBarSortOrder: (order: BarSortOrder) => void;
  barValueMode: BarValueMode;
  setBarValueMode: (mode: BarValueMode) => void;
  barChartView: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl';
  setBarChartView: (view: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl') => void;
  circlePackingView: 'by_stakeholder_type' | 'by_technology_category' | 'by_funding';
  setCirclePackingView: (view: 'by_stakeholder_type' | 'by_technology_category' | 'by_funding') => void;
  bumpView: 'all_technologies' | 'by_category' | 'top_advancing';
  setBumpView: (view: 'all_technologies' | 'by_category' | 'top_advancing') => void;
  selectedCategories: TechnologyCategory[];
  setSelectedCategories: (categories: TechnologyCategory[]) => void;
  treemapView: TreemapViewMode;
  setTreemapView: (view: TreemapViewMode) => void;
  chordView: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow';
  setChordView: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow') => void;
  heatmapView: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status';
  setHeatmapView: (view: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status') => void;
  heatmapColorMode: HeatmapColorMode;
  setHeatmapColorMode: (mode: HeatmapColorMode) => void;
  streamView: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';
  setStreamView: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type') => void;
  streamScenario?: 'baseline' | 'accelerated';
  setStreamScenario?: (scenario: 'baseline' | 'accelerated') => void;
  streamScenarioState?: { government_funding_multiplier: number; private_funding_multiplier: number };
  setStreamScenarioState?: (state: { government_funding_multiplier: number; private_funding_multiplier: number }) => void;
  parallelDimensions: string[];
  setParallelDimensions: (dimensions: string[]) => void;
  swarmView: 'by_trl' | 'by_category';
  setSwarmView: (view: 'by_trl' | 'by_category') => void;
  selectedTechIds: string[];
  setSelectedTechIds: (ids: string[]) => void;
  selectedDimensions: string[];
  setSelectedDimensions: (dims: string[]) => void;
  filteredTechnologies: Technology[];
  technologyCategories: string[];
  similarityThreshold: number;
  setSimilarityThreshold: (value: number) => void;
  showClusters: boolean;
  setShowClusters: (value: boolean) => void;
  isOrbiting: boolean;
  setIsOrbiting: (value: boolean) => void;
}

export interface VisualizationControlGroup {
  id: string;
  title: string;
  description?: string;
  appliesTo: VisualizationType[];
  render: (ctx: VisualizationControlContext) => React.ReactNode;
}

interface VisualizationControlSectionsProps {
  activeViz: VisualizationType;
  context: VisualizationControlContext;
}

export function VisualizationControlSections({ activeViz, context }: VisualizationControlSectionsProps) {
  const sections = visualizationControlRegistry
    .filter((group) => group.appliesTo.includes(activeViz))
    .map((group) => (
      <section
        key={group.id}
        className="p-4 bg-white/80 rounded-lg border border-[#CCE2DC]/50 space-y-3"
      >
        <div>
          <h4 className="font-medium text-[#006E51]">{group.title}</h4>
          {group.description && <p className="text-xs text-gray-500">{group.description}</p>}
        </div>
        {group.render(context)}
      </section>
    ));

  if (sections.length === 0) {
    return null;
  }

  return <div className="space-y-4">{sections}</div>;
}

export type { TimelineTrack, BarSortOrder, BarValueMode, HeatmapColorMode, TreemapViewMode } from '@/types/visualization-controls';

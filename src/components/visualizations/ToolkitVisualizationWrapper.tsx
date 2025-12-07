'use client';

import { useState, useMemo, useCallback, ReactNode, createContext, useContext } from 'react';
import { buildCirclePackingMaps, getHighlightedIds } from '@/lib/circlePackingRelationships';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';

// =============================================================================
// CONTEXT FOR SHARING STATE BETWEEN WRAPPER AND PANELS
// =============================================================================

interface ToolkitContextValue {
  // Selection state
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  selectedNode: CirclePackingNode | null;
  relatedEntities: CirclePackingNode[];
  highlightedIds: Set<string> | null;
  
  // Controls render function (provided by toolkit component)
  controlsRenderer: (() => ReactNode) | null;
  setControlsRenderer: (renderer: (() => ReactNode) | null) => void;
  
  // For Innovation Tracker specific state
  activeView: string;
  setActiveView: (view: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
}

const ToolkitContext = createContext<ToolkitContextValue | null>(null);

export function useToolkitContext() {
  const context = useContext(ToolkitContext);
  if (!context) {
    throw new Error('useToolkitContext must be used within ToolkitVisualizationWrapper');
  }
  return context;
}

// =============================================================================
// MAIN WRAPPER COMPONENT
// =============================================================================

interface ToolkitVisualizationWrapperProps {
  visualizationType: 'stakeholder-network' | 'stakeholder-circle' | 'innovation-tracker';
  children: (props: {
    // Props to pass to the toolkit component
    selectedId: string | null;
    selectedNode: CirclePackingNode | null;
    highlightedIds: Set<string> | null;
    relatedEntities: CirclePackingNode[];
    onSelectNodeAction: (id: string | null) => void;
    showEmbeddedControls: boolean;
    showEmbeddedInsights: boolean;
    onControlsRender: (renderer: (() => ReactNode) | null) => void;
  }) => ReactNode;
  
  // Render props for external panels
  renderControls?: (context: ToolkitContextValue) => ReactNode;
  renderInsights?: (context: ToolkitContextValue) => ReactNode;
}

export function ToolkitVisualizationWrapper({
  visualizationType,
  children,
  renderControls,
  renderInsights,
}: ToolkitVisualizationWrapperProps) {
  // Build node maps for stakeholder visualizations
  const { nodeMap, adjacency } = useMemo(() => buildCirclePackingMaps(), []);
  
  // Selection state
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const highlightedIds = useMemo(
    () => getHighlightedIds(selectedEntityId, adjacency),
    [selectedEntityId, adjacency]
  );
  const selectedNode = selectedEntityId ? nodeMap[selectedEntityId] : null;
  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = adjacency[selectedEntityId];
    if (!relatedIds) return [];
    return Array.from(relatedIds)
      .map((id) => nodeMap[id])
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
  }, [selectedEntityId, adjacency, nodeMap]);
  
  // Controls renderer (set by toolkit component via callback)
  const [controlsRenderer, setControlsRenderer] = useState<(() => ReactNode) | null>(null);
  
  // Innovation Tracker specific state
  const [activeView, setActiveView] = useState('sankey');
  const [filters, setFilters] = useState<Record<string, any>>({
    fiscalYear: 'FY24',
    fundingSource: 'all',
  });
  
  // Context value
  const contextValue: ToolkitContextValue = {
    selectedEntityId,
    setSelectedEntityId,
    selectedNode,
    relatedEntities,
    highlightedIds,
    controlsRenderer,
    setControlsRenderer,
    activeView,
    setActiveView,
    filters,
    setFilters,
  };
  
  return (
    <ToolkitContext.Provider value={contextValue}>
      {children({
        selectedId: selectedEntityId,
        selectedNode,
        highlightedIds,
        relatedEntities,
        onSelectNodeAction: setSelectedEntityId,
        showEmbeddedControls: false,
        showEmbeddedInsights: false,
        onControlsRender: setControlsRenderer,
      })}
    </ToolkitContext.Provider>
  );
}

// =============================================================================
// TOOLKIT CONTROLS PANEL - Renders controls from toolkit component
// =============================================================================

export function ToolkitControlsPanel() {
  const { controlsRenderer } = useToolkitContext();
  
  if (!controlsRenderer) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <p>Controls loading...</p>
      </div>
    );
  }
  
  return (
    <div className="toolkit-controls">
      {controlsRenderer()}
    </div>
  );
}

// =============================================================================
// TOOLKIT INSIGHTS PANEL - Renders insights based on selection
// =============================================================================

interface ToolkitInsightsPanelProps {
  emptyStateMessage?: string;
}

export function ToolkitInsightsPanel({ emptyStateMessage }: ToolkitInsightsPanelProps) {
  const { selectedNode, relatedEntities, setSelectedEntityId } = useToolkitContext();
  
  if (!selectedNode) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-[#0f8b8d]/10 to-[#0f8b8d]/5 p-4">
          <p className="text-xs uppercase tracking-wider text-[#0f8b8d]/70 mb-1">Explore</p>
          <h3 className="text-base font-semibold text-[#0f8b8d]">Select an Element</h3>
          <p className="text-xs text-[#0f8b8d]/80 mt-2">
            {emptyStateMessage || 'Click any element in the visualization to view its details and connections.'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Selected Entity */}
      <div className="rounded-xl bg-gradient-to-br from-[#006E51]/10 to-[#006E51]/5 p-4">
        <p className="text-xs uppercase tracking-wider text-[#006E51]/70 mb-1">
          {selectedNode.type?.toUpperCase() || 'ENTITY'}
        </p>
        <h3 className="text-lg font-bold text-[#006E51]">{selectedNode.name}</h3>
        {selectedNode.description && (
          <p className="text-sm text-gray-600 mt-2">{selectedNode.description}</p>
        )}
        {selectedNode.status && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Status: </span>
            <span className="text-xs font-medium text-gray-700">{selectedNode.status}</span>
          </div>
        )}
        {selectedNode.lead && (
          <div className="mt-1">
            <span className="text-xs text-gray-500">Lead: </span>
            <span className="text-xs font-medium text-gray-700">{selectedNode.lead}</span>
          </div>
        )}
        {selectedNode.output && (
          <div className="mt-1">
            <span className="text-xs text-gray-500">Output: </span>
            <span className="text-xs font-medium text-gray-700">{selectedNode.output}</span>
          </div>
        )}
      </div>
      
      {/* Related Entities */}
      {relatedEntities.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            Related Entities
          </p>
          <div className="space-y-2">
            {/* Group by type */}
            {Object.entries(
              relatedEntities.reduce((acc, entity) => {
                const type = entity.type || 'Other';
                if (!acc[type]) acc[type] = [];
                acc[type].push(entity);
                return acc;
              }, {} as Record<string, typeof relatedEntities>)
            ).map(([type, entities]) => (
              <div key={type}>
                <p className="text-xs text-gray-400 capitalize mb-1">{type}</p>
                <div className="flex flex-wrap gap-1">
                  {entities.map((entity) => (
                    <button
                      key={entity.id || entity.name}
                      onClick={() => setSelectedEntityId(entity.id || null)}
                      className="text-xs px-2 py-1 rounded-full bg-[#006E51]/10 text-[#006E51] hover:bg-[#006E51]/20 transition-colors"
                    >
                      {entity.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Clear Selection */}
      <button
        onClick={() => setSelectedEntityId(null)}
        className="w-full text-xs text-gray-500 hover:text-[#006E51] transition-colors py-2"
      >
        Clear selection
      </button>
    </div>
  );
}

export default ToolkitVisualizationWrapper;



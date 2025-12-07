/**
 * AI Function Execution Handlers
 * 
 * Maps AI function calls to actual UI state changes.
 * This is the "execution layer" that makes AI actually functional.
 */

import { getVisualization } from '@/lib/visualisations/registry';

/**
 * Legacy ID mapping for backward compatibility
 * Maps registry IDs to legacy IDs used in pages
 */
const REGISTRY_TO_LEGACY_MAP: Record<string, string> = {
  'network-graph-navigate': 'network',
  'network-graph-navigate-3d': 'network3d',
  'unified-network-graph': 'unifiednetwork',
  'sankey-chart-navigate': 'sankey',
  'radar-chart-navigate': 'radar',
  'bar-chart-navigate': 'bar',
  'circle-packing-navigate': 'circle',
  'bump-chart-navigate': 'bump',
  'timeline-navigate': 'timeline',
  'treemap-navigate': 'treemap',
  'heatmap-navigate': 'heatmap',
  'chord-diagram-navigate': 'chord',
  'stream-graph-navigate': 'stream',
  'swarm-plot-navigate': 'swarm',
};

/**
 * Convert registry visualization ID to legacy ID if needed
 */
export function normalizeVisualizationId(id: string): string {
  // Check if it's already a legacy ID
  if (Object.values(REGISTRY_TO_LEGACY_MAP).includes(id)) {
    return id;
  }
  
  // Check if it's a registry ID that needs conversion
  if (REGISTRY_TO_LEGACY_MAP[id]) {
    return REGISTRY_TO_LEGACY_MAP[id];
  }
  
  // Try to find by registry lookup
  const viz = getVisualization(id);
  if (viz && REGISTRY_TO_LEGACY_MAP[id]) {
    return REGISTRY_TO_LEGACY_MAP[id];
  }
  
  // Return as-is if no mapping found (might be a direct registry ID)
  return id;
}

/**
 * Function execution handler interface
 */
export interface FunctionExecutionState {
  // Visualization state
  activeViz?: string;
  setActiveViz?: (viz: string) => void;
  
  // Filter state
  trlRange?: [number, number];
  setTrlRange?: (range: [number, number]) => void;
  useNavigateData?: boolean;
  setUseNavigateData?: (use: boolean) => void;
  
  // Control state - Add as needed for each visualization
  // Radar
  selectedTechIds?: string[];
  setSelectedTechIds?: (ids: string[]) => void;
  selectedDimensions?: string[];
  setSelectedDimensions?: (dims: string[]) => void;
  
  // Bar Chart
  barChartView?: string;
  setBarChartView?: (view: string) => void;
  
  // Circle Packing
  circlePackingView?: string;
  setCirclePackingView?: (view: string) => void;
  
  // Bump Chart
  bumpView?: string;
  setBumpView?: (view: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (cats: string[]) => void;
  
  // Timeline
  timelineTracks?: Record<string, boolean>;
  setTimelineTracks?: (tracks: Record<string, boolean>) => void;
  
  // Treemap
  treemapView?: string;
  setTreemapView?: (view: string) => void;
  
  // Heatmap
  heatmapView?: string;
  setHeatmapView?: (view: string) => void;
  
  // Chord
  chordView?: string;
  setChordView?: (view: string) => void;
  
  // Stream
  streamView?: string;
  setStreamView?: (view: string) => void;
  
  // Swarm
  swarmView?: string;
  setSwarmView?: (view: string) => void;
  
  // Network
  similarityThreshold?: number;
  setSimilarityThreshold?: (val: number) => void;
  showClusters?: boolean;
  setShowClusters?: (show: boolean) => void;
  isOrbiting?: boolean;
  setIsOrbiting?: (orbit: boolean) => void;
  
  // Entity selection/highlighting
  highlightedEntityIds?: string[];
  setHighlightedEntityIds?: (ids: string[]) => void;
  selectedEntity?: any;
  setSelectedEntity?: (entity: any) => void;
  
  // Router for navigation
  router?: any;
}

/**
 * Main function execution handler
 * Maps AI function calls to state setters
 */
export function handleAIFunctionCall(
  functionName: string,
  args: Record<string, unknown>,
  state: FunctionExecutionState
): { success: boolean; error?: string } {
  try {
    switch (functionName) {
      case 'switch_visualization': {
        const vizId = args.visualization as string;
        if (!vizId) {
          return { success: false, error: 'Missing visualization ID' };
        }
        
        const normalizedId = normalizeVisualizationId(vizId);
        
        // Validate visualization exists
        const viz = getVisualization(vizId) || getVisualization(normalizedId);
        if (!viz && !REGISTRY_TO_LEGACY_MAP[vizId]) {
          console.warn(`Visualization not found: ${vizId}, trying ${normalizedId}`);
        }
        
        // Switch visualization
        state.setActiveViz?.(normalizedId);
        
        // Auto-enable NAVIGATE data for NAVIGATE-only visualizations
        const navigateOnlyVizs = ['stream', 'swarm', 'radar', 'bar', 'circle', 'bump', 'treemap', 'heatmap', 'chord', 'network3d'];
        if (navigateOnlyVizs.includes(normalizedId) && !state.useNavigateData) {
          state.setUseNavigateData?.(true);
        }
        
        // Update URL if router provided
        if (state.router) {
          state.router.push(`?viz=${normalizedId}`);
        }
        
        return { success: true };
      }
      
      case 'set_control': {
        const controlId = args.controlId as string;
        const value = args.value;
        
        if (!controlId) {
          return { success: false, error: 'Missing control ID' };
        }
        
        // Map control IDs to state setters
        switch (controlId) {
          // Global controls
          case 'trl_range':
            if (Array.isArray(value) && value.length === 2) {
              state.setTrlRange?.([value[0] as number, value[1] as number]);
              return { success: true };
            }
            break;
            
          case 'data_source':
            state.setUseNavigateData?.(value as boolean);
            return { success: true };
            
          // Radar controls
          case 'radar.toggleTechnology':
            if (Array.isArray(value)) {
              const techIds = (value as string[]).slice(0, 8); // Max 8 technologies
              state.setSelectedTechIds?.(techIds);
              return { success: true };
            }
            break;
            
          case 'radar.toggleDimension':
            if (Array.isArray(value)) {
              state.setSelectedDimensions?.(value as string[]);
              return { success: true };
            }
            break;
            
          // Bar chart controls
          case 'bar.setView':
            if (typeof value === 'string') {
              state.setBarChartView?.(value);
              return { success: true };
            }
            break;
            
          // Circle packing controls
          case 'circle.setView':
            if (typeof value === 'string') {
              state.setCirclePackingView?.(value);
              return { success: true };
            }
            break;
            
          // Bump chart controls
          case 'bump.setMode':
            if (typeof value === 'string') {
              state.setBumpView?.(value);
              return { success: true };
            }
            break;
            
          case 'bump.toggleCategory':
            if (Array.isArray(value)) {
              state.setSelectedCategories?.(value as string[]);
              return { success: true };
            }
            break;
            
          // Timeline controls
          case 'timeline.toggleTrack':
            if (Array.isArray(value)) {
              // Convert array to track object
              const tracks: Record<string, boolean> = {};
              (value as string[]).forEach(track => {
                tracks[track] = true;
              });
              state.setTimelineTracks?.(tracks);
              return { success: true };
            }
            break;
            
          // Treemap controls
          case 'treemap.setView':
            if (typeof value === 'string') {
              state.setTreemapView?.(value);
              return { success: true };
            }
            break;
            
          // Heatmap controls
          case 'heatmap.setMatrix':
            if (typeof value === 'string') {
              state.setHeatmapView?.(value);
              return { success: true };
            }
            break;
            
          // Chord controls
          case 'chord.setView':
            if (typeof value === 'string') {
              state.setChordView?.(value);
              return { success: true };
            }
            break;
            
          // Stream controls
          case 'stream.setView':
            if (typeof value === 'string') {
              state.setStreamView?.(value);
              return { success: true };
            }
            break;
            
          // Swarm controls
          case 'swarm.setView':
            if (typeof value === 'string') {
              state.setSwarmView?.(value);
              return { success: true };
            }
            break;
            
          // Network controls
          case 'network.setSimilarity':
            if (typeof value === 'number') {
              const clamped = Math.max(0, Math.min(1, value));
              state.setSimilarityThreshold?.(clamped);
              return { success: true };
            }
            break;
            
          case 'network.toggleCluster':
            if (typeof value === 'boolean') {
              state.setShowClusters?.(value);
              return { success: true };
            }
            break;
            
          case 'network.toggleOrbit':
            if (typeof value === 'boolean') {
              state.setIsOrbiting?.(value);
              return { success: true };
            }
            break;
            
          default:
            console.warn(`Unknown control ID: ${controlId}`);
            return { success: false, error: `Unknown control ID: ${controlId}` };
        }
        
        return { success: false, error: `Invalid value for control: ${controlId}` };
      }
      
      case 'filter_data': {
        // Apply filters
        if (args.trlRange && Array.isArray(args.trlRange) && args.trlRange.length === 2) {
          const min = Math.max(1, Math.min(9, args.trlRange[0] as number));
          const max = Math.max(1, Math.min(9, args.trlRange[1] as number));
          state.setTrlRange?.([min, max]);
        }
        
        // Additional filters can be added here (categories, stakeholder types, etc.)
        // These would need to be passed through state
        
        return { success: true };
      }
      
      case 'highlight_entities': {
        const entityIds = (args.entityIds as string[]) || [];
        const entityNames = (args.entityNames as string[]) || [];
        
        // For now, just use IDs. Name resolution would require entity lookup
        if (entityIds.length > 0) {
          state.setHighlightedEntityIds?.(entityIds);
        } else if (entityNames.length > 0) {
          // TODO: Resolve entity names to IDs
          console.warn('Entity name resolution not yet implemented');
        }
        
        return { success: true };
      }
      
      default:
        console.warn(`Unknown function: ${functionName}`);
        return { success: false, error: `Unknown function: ${functionName}` };
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Build bidirectional context for AI
 * Provides current state so AI can make informed decisions
 */
export function buildAIContext(state: FunctionExecutionState): Record<string, unknown> {
  return {
    activeViz: state.activeViz || 'network',
    useNavigateData: state.useNavigateData || false,
    controls: {
      trlRange: state.trlRange || [1, 9],
      selectedTechIds: state.selectedTechIds || [],
      selectedDimensions: state.selectedDimensions || [],
      barChartView: state.barChartView,
      circlePackingView: state.circlePackingView,
      bumpView: state.bumpView,
      selectedCategories: state.selectedCategories || [],
      treemapView: state.treemapView,
      heatmapView: state.heatmapView,
      chordView: state.chordView,
      streamView: state.streamView,
      swarmView: state.swarmView,
      similarityThreshold: state.similarityThreshold,
      showClusters: state.showClusters,
      isOrbiting: state.isOrbiting,
    },
    selectedEntity: state.selectedEntity,
    highlightedEntityIds: state.highlightedEntityIds || [],
  };
}



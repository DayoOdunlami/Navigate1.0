/**
 * Zustand Store for NAVIGATE Platform
 * 
 * Centralized state management for filters, selections, insights, and UI state
 */

import { create } from 'zustand';
import { Stakeholder, Technology, FundingEvent, Project, Relationship } from '@/lib/navigate-types';
import type { Insight } from '@/lib/ai';

// ============================================================================
// Filter State
// ============================================================================

export interface FilterState {
  stakeholderTypes: string[];
  technologyCategories: string[];
  fundingTypes: string[];
  trlRange: [number, number];
  fundingRange: [number, number];
  searchQuery: string;
  dateRange: [string, string] | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: FilterState;
  icon?: string;
  isDefault?: boolean;
}

// ============================================================================
// Store State
// ============================================================================

interface NavigateStore {
  // Data
  stakeholders: Stakeholder[];
  technologies: Technology[];
  fundingEvents: FundingEvent[];
  projects: Project[];
  relationships: Relationship[];

  // Filters
  filters: FilterState;
  filterPresets: FilterPreset[];
  comparisonMode: {
    enabled: boolean;
    scenarioA: FilterState | null;
    scenarioB: FilterState | null;
  };

  // Selection
  selectedEntities: string[];
  highlightedEntities: string[];
  activeEntity: string | null;

  // Insights
  insights: Insight[];
  activeInsight: Insight | null;

  // UI State
  activeView: 'dashboard' | 'network' | 'funding' | 'technology' | 'table';
  panels: {
    filters: boolean;
    insights: boolean;
    aiChat: boolean;
  };

  // Actions
  setStakeholders: (stakeholders: Stakeholder[]) => void;
  setTechnologies: (technologies: Technology[]) => void;
  setFundingEvents: (events: FundingEvent[]) => void;
  setProjects: (projects: Project[]) => void;
  setRelationships: (relationships: Relationship[]) => void;

  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  applyPreset: (preset: FilterPreset) => void;
  savePreset: (name: string, description: string) => void;
  deletePreset: (id: string) => void;

  setSelectedEntities: (ids: string[]) => void;
  addSelectedEntity: (id: string) => void;
  removeSelectedEntity: (id: string) => void;
  clearSelection: () => void;

  setHighlightedEntities: (ids: string[]) => void;
  setActiveEntity: (id: string | null) => void;

  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  setActiveInsight: (insight: Insight | null) => void;

  setActiveView: (view: NavigateStore['activeView']) => void;
  togglePanel: (panel: keyof NavigateStore['panels']) => void;

  enableComparison: (presetA: FilterPreset, presetB: FilterPreset) => void;
  disableComparison: () => void;

  // Computed
  getFilteredStakeholders: () => Stakeholder[];
  getFilteredTechnologies: () => Technology[];
  getFilteredFundingEvents: () => FundingEvent[];
  getFilteredProjects: () => Project[];
  getFilteredRelationships: () => Relationship[];
}

const defaultFilters: FilterState = {
  stakeholderTypes: [],
  technologyCategories: [],
  fundingTypes: [],
  trlRange: [1, 9],
  fundingRange: [0, 1000000000],
  searchQuery: '',
  dateRange: null,
};

const defaultPresets: FilterPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Show all entities',
    filters: defaultFilters,
    isDefault: true,
  },
  {
    id: 'trl-gap',
    name: 'TRL 6-7 Gap',
    description: 'Technologies at TRL 6-7 with low funding',
    filters: {
      ...defaultFilters,
      trlRange: [6, 7],
      fundingRange: [0, 5000000],
    },
  },
  {
    id: 'government-funded',
    name: 'Government Funded',
    description: 'Projects and technologies funded by government',
    filters: {
      ...defaultFilters,
      fundingTypes: ['Public'],
    },
  },
];

export const useNavigateStore = create<NavigateStore>((set, get) => ({
  // Initial data state
  stakeholders: [],
  technologies: [],
  fundingEvents: [],
  projects: [],
  relationships: [],

  // Initial filter state
  filters: defaultFilters,
  filterPresets: defaultPresets,
  comparisonMode: {
    enabled: false,
    scenarioA: null,
    scenarioB: null,
  },

  // Initial selection state
  selectedEntities: [],
  highlightedEntities: [],
  activeEntity: null,

  // Initial insights state
  insights: [],
  activeInsight: null,

  // Initial UI state
  activeView: 'dashboard',
  panels: {
    filters: true,
    insights: true,
    aiChat: false,
  },

  // Data setters
  setStakeholders: (stakeholders) => set({ stakeholders }),
  setTechnologies: (technologies) => set({ technologies }),
  setFundingEvents: (fundingEvents) => set({ fundingEvents }),
  setProjects: (projects) => set({ projects }),
  setRelationships: (relationships) => set({ relationships }),

  // Filter actions
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  applyPreset: (preset) => set({ filters: preset.filters }),

  savePreset: (name, description) => {
    const preset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      filters: get().filters,
    };
    set((state) => ({
      filterPresets: [...state.filterPresets, preset],
    }));
  },

  deletePreset: (id) =>
    set((state) => ({
      filterPresets: state.filterPresets.filter((p) => p.id !== id),
    })),

  // Selection actions
  setSelectedEntities: (ids) => set({ selectedEntities: ids }),
  addSelectedEntity: (id) =>
    set((state) => ({
      selectedEntities: [...state.selectedEntities, id],
    })),
  removeSelectedEntity: (id) =>
    set((state) => ({
      selectedEntities: state.selectedEntities.filter((e) => e !== id),
    })),
  clearSelection: () => set({ selectedEntities: [], activeEntity: null }),

  setHighlightedEntities: (ids) => set({ highlightedEntities: ids }),
  setActiveEntity: (id) => set({ activeEntity: id }),

  // Insights actions
  setInsights: (insights) => set({ insights }),
  addInsight: (insight) =>
    set((state) => ({
      insights: [...state.insights, insight],
    })),
  setActiveInsight: (insight) => set({ activeInsight: insight }),

  // UI actions
  setActiveView: (view) => set({ activeView: view }),
  togglePanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: !state.panels[panel],
      },
    })),

  // Comparison mode
  enableComparison: (presetA, presetB) =>
    set({
      comparisonMode: {
        enabled: true,
        scenarioA: presetA.filters,
        scenarioB: presetB.filters,
      },
    }),

  disableComparison: () =>
    set({
      comparisonMode: {
        enabled: false,
        scenarioA: null,
        scenarioB: null,
      },
    }),

  // Computed getters
  getFilteredStakeholders: () => {
    const { stakeholders, filters } = get();
    return stakeholders.filter((s) => {
      if (filters.stakeholderTypes.length > 0 && !filters.stakeholderTypes.includes(s.type)) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  },

  getFilteredTechnologies: () => {
    const { technologies, filters } = get();
    return technologies.filter((t) => {
      if (filters.technologyCategories.length > 0 && !filters.technologyCategories.includes(t.category)) {
        return false;
      }
      if (t.trl_current < filters.trlRange[0] || t.trl_current > filters.trlRange[1]) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  },

  getFilteredFundingEvents: () => {
    const { fundingEvents, filters } = get();
    return fundingEvents.filter((f) => {
      if (filters.fundingTypes.length > 0 && !filters.fundingTypes.includes(f.funding_type)) {
        return false;
      }
      if (f.amount < filters.fundingRange[0] || f.amount > filters.fundingRange[1]) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return f.program.toLowerCase().includes(query) || f.impact_description?.toLowerCase().includes(query);
      }
      return true;
    });
  },

  getFilteredProjects: () => {
    const { projects, filters } = get();
    return projects.filter((p) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query);
      }
      return true;
    });
  },

  getFilteredRelationships: () => {
    const { relationships } = get();
    // Relationships are filtered based on filtered entities
    const filteredStakeholders = get().getFilteredStakeholders();
    const filteredTechnologies = get().getFilteredTechnologies();
    const filteredIds = new Set([
      ...filteredStakeholders.map((s) => s.id),
      ...filteredTechnologies.map((t) => t.id),
    ]);
    
    return relationships.filter(
      (r) => filteredIds.has(r.source) && filteredIds.has(r.target)
    );
  },
}));


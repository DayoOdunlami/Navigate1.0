'use client';

import { memo } from 'react';
import clsx from 'clsx';
import {
  Network,
  GitBranch,
  Layers,
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  Users,
  Lightbulb,
  Sliders,
  Check,
} from 'lucide-react';
import type { VisualizationCategory, VisualizationStatus } from './VisualLibraryCard';

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryCount {
  category: VisualizationCategory;
  count: number;
}

export interface StatusCount {
  status: VisualizationStatus;
  count: number;
}

export interface VisualLibrarySidebarProps {
  categories: CategoryCount[];
  statuses: StatusCount[];
  selectedCategories: Set<VisualizationCategory>;
  selectedStatuses: Set<VisualizationStatus>;
  onCategoryToggle: (category: VisualizationCategory) => void;
  onStatusToggle: (status: VisualizationStatus) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

// ============================================================================
// CATEGORY ICONS & COLORS
// ============================================================================

const CATEGORY_CONFIG: Record<VisualizationCategory, { icon: typeof Network; color: string; label: string }> = {
  Network: { icon: Network, color: '#50C878', label: 'Network' },
  Flow: { icon: GitBranch, color: '#006E51', label: 'Flow' },
  Hierarchy: { icon: Layers, color: '#F5A623', label: 'Hierarchy' },
  Matrix: { icon: BarChart3, color: '#4A90E2', label: 'Matrix' },
  Comparison: { icon: Sliders, color: '#8b5cf6', label: 'Comparison' },
  Timeline: { icon: Clock, color: '#0EA5E9', label: 'Timeline' },
  Distribution: { icon: Activity, color: '#EC4899', label: 'Distribution' },
  Stakeholder: { icon: Users, color: '#006E51', label: 'Stakeholder' },
  Innovation: { icon: Lightbulb, color: '#F5A623', label: 'Innovation' },
};

const STATUS_CONFIG: Record<VisualizationStatus, { color: string; label: string }> = {
  ready: { color: '#10b981', label: 'Ready' },
  development: { color: '#f59e0b', label: 'In Development' },
  placeholder: { color: '#9ca3af', label: 'Planned' },
};

// ============================================================================
// SIDEBAR SECTION
// ============================================================================

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">
        {title}
      </h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// FILTER ITEM
// ============================================================================

interface FilterItemProps {
  icon?: typeof Network;
  color: string;
  label: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
}

function FilterItem({ icon: Icon, color, label, count, selected, onToggle }: FilterItemProps) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
        selected 
          ? 'bg-gray-100 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      {/* Selection indicator or icon */}
      <div className="w-4 h-4 flex items-center justify-center">
        {selected ? (
          <Check className="h-3.5 w-3.5" style={{ color }} />
        ) : Icon ? (
          <Icon className="h-3.5 w-3.5 opacity-50" style={{ color }} />
        ) : (
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      
      <span className="flex-1 text-left truncate">{label}</span>
      
      <span className={clsx(
        'text-xs tabular-nums',
        selected ? 'text-gray-600' : 'text-gray-400'
      )}>
        {count}
      </span>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VisualLibrarySidebar = memo(function VisualLibrarySidebar({
  categories,
  statuses,
  selectedCategories,
  selectedStatuses,
  onCategoryToggle,
  onStatusToggle,
  onClearFilters,
  totalCount,
  filteredCount,
  className,
}: VisualLibrarySidebarProps) {
  const hasFilters = selectedCategories.size > 0 || selectedStatuses.size > 0;
  
  return (
    <aside className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-[#006E51] hover:text-[#005a42] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {filteredCount} of {totalCount} visualizations
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Category filters */}
        <SidebarSection title="Category">
          {categories.map(({ category, count }) => {
            const config = CATEGORY_CONFIG[category];
            return (
              <FilterItem
                key={category}
                icon={config.icon}
                color={config.color}
                label={config.label}
                count={count}
                selected={selectedCategories.has(category)}
                onToggle={() => onCategoryToggle(category)}
              />
            );
          })}
        </SidebarSection>

        {/* Status filters */}
        <SidebarSection title="Status">
          {statuses.map(({ status, count }) => {
            const config = STATUS_CONFIG[status];
            return (
              <FilterItem
                key={status}
                color={config.color}
                label={config.label}
                count={count}
                selected={selectedStatuses.has(status)}
                onToggle={() => onStatusToggle(status)}
              />
            );
          })}
        </SidebarSection>
      </div>

      {/* Footer with legend */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400 mb-2">Status Legend</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {(['ready', 'development', 'placeholder'] as VisualizationStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-1">
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span>{config.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
});

export default VisualLibrarySidebar;



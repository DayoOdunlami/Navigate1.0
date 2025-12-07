'use client';

import { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

export type VisualizationStatus = 'ready' | 'development' | 'placeholder';
export type VisualizationCategory = 
  | 'Network' 
  | 'Flow' 
  | 'Hierarchy' 
  | 'Matrix' 
  | 'Comparison' 
  | 'Timeline' 
  | 'Distribution'
  | 'Stakeholder'
  | 'Innovation';

export interface VisualizationCardData {
  id: string;
  name: string;
  description?: string;
  category: VisualizationCategory;
  status: VisualizationStatus;
  previewOption?: any; // ECharts option for mini preview
  previewImage?: string; // Fallback static image
  icon?: React.ComponentType<{ className?: string }>;
}

export interface VisualLibraryCardProps {
  visualization: VisualizationCardData;
  onClick: (vizId: string) => void;
  selected?: boolean;
  className?: string;
}

// ============================================================================
// CATEGORY COLORS
// ============================================================================

const CATEGORY_COLORS: Record<VisualizationCategory, string> = {
  Network: '#50C878',
  Flow: '#006E51',
  Hierarchy: '#F5A623',
  Matrix: '#4A90E2',
  Comparison: '#8b5cf6',
  Timeline: '#0EA5E9',
  Distribution: '#EC4899',
  Stakeholder: '#006E51',
  Innovation: '#F5A623',
};

const STATUS_CONFIG: Record<VisualizationStatus, { dot: string; opacity: string }> = {
  ready: { dot: 'bg-emerald-500', opacity: 'opacity-100' },
  development: { dot: 'bg-amber-500', opacity: 'opacity-80' },
  placeholder: { dot: 'bg-gray-400', opacity: 'opacity-50' },
};

// ============================================================================
// MINI PREVIEW COMPONENT
// ============================================================================

interface MiniPreviewProps {
  option?: any;
  fallbackImage?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: VisualizationCategory;
}

const MiniPreview = memo(function MiniPreview({ 
  option, 
  fallbackImage, 
  icon: Icon,
  category 
}: MiniPreviewProps) {
  const categoryColor = CATEGORY_COLORS[category];

  // ECharts mini preview - simplified, non-interactive
  const miniOption = useMemo(() => {
    if (!option) return null;
    return {
      ...option,
      animation: false,
      tooltip: { show: false },
      legend: { show: false },
      toolbox: { show: false },
      grid: option.grid || { top: 10, right: 10, bottom: 10, left: 10 },
    };
  }, [option]);

  if (option && miniOption) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <ReactECharts
          option={miniOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          lazyUpdate
        />
      </div>
    );
  }

  if (fallbackImage) {
    return (
      <img 
        src={fallbackImage} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // Icon fallback with gradient background
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}05 100%)` 
      }}
    >
      {Icon ? (
        <Icon className="h-12 w-12" style={{ color: `${categoryColor}50` }} />
      ) : (
        <div 
          className="w-16 h-16 rounded-xl opacity-30"
          style={{ backgroundColor: categoryColor }}
        />
      )}
    </div>
  );
});

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

export const VisualLibraryCard = memo(function VisualLibraryCard({
  visualization,
  onClick,
  selected = false,
  className,
}: VisualLibraryCardProps) {
  const { id, name, category, status, previewOption, previewImage, icon } = visualization;
  const statusConfig = STATUS_CONFIG[status];
  const categoryColor = CATEGORY_COLORS[category];

  return (
    <div
      onClick={() => onClick(id)}
      className={clsx(
        'group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200',
        'bg-white border',
        selected 
          ? 'ring-2 ring-[#006E51] border-[#006E51] shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
        statusConfig.opacity,
        className
      )}
    >
      {/* Preview Area - 4:3 aspect ratio like ECharts gallery */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <MiniPreview 
          option={previewOption}
          fallbackImage={previewImage}
          icon={icon}
          category={category}
        />

        {/* Status indicator - subtle dot in corner */}
        <div className="absolute top-2 left-2">
          <div className={clsx('w-2 h-2 rounded-full', statusConfig.dot)} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#006E51]/0 group-hover:bg-[#006E51]/5 transition-colors duration-200" />
      </div>

      {/* Card Footer - Minimal text */}
      <div className="px-3 py-2">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#006E51] transition-colors">
          {name}
        </h3>
        {/* Optional: tiny category indicator */}
        <div 
          className="mt-1 h-0.5 w-8 rounded-full opacity-60"
          style={{ backgroundColor: categoryColor }}
        />
      </div>
    </div>
  );
});

// ============================================================================
// SIMPLIFIED CARD (Even more minimal - just image + title)
// ============================================================================

export const VisualLibraryCardSimple = memo(function VisualLibraryCardSimple({
  visualization,
  onClick,
  selected = false,
  className,
}: VisualLibraryCardProps) {
  const { id, name, category, status, previewOption, previewImage, icon } = visualization;
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div
      onClick={() => onClick(id)}
      className={clsx(
        'group cursor-pointer transition-all duration-200',
        selected && 'ring-2 ring-[#006E51] rounded-lg',
        statusConfig.opacity,
        className
      )}
    >
      {/* Preview Area */}
      <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-white border border-gray-100 group-hover:border-gray-200 transition-colors">
        <MiniPreview 
          option={previewOption}
          fallbackImage={previewImage}
          icon={icon}
          category={category}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      {/* Title only */}
      <p className="mt-1.5 text-xs text-center text-gray-600 group-hover:text-[#006E51] transition-colors truncate">
        {name}
      </p>
    </div>
  );
});

export default VisualLibraryCard;



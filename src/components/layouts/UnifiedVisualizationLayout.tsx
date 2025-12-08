'use client';

import { useState, useCallback, ReactNode } from 'react';
import clsx from 'clsx';
import {
  ChevronLeft,
  Layout,
  Maximize2,
  Minimize2,
  PanelLeft,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { 
  FloatingPanelSystem, 
  UnifiedIntelligencePanel,
  type PanelConfig,
  type QuickStats,
  type SelectedEntity,
  type RelatedEntity,
} from '@/components/panels';

// ============================================================================
// TYPES
// ============================================================================

export type LayoutMode = 
  | 'floating'      // V6 style - floating panels on right
  | 'split'         // Split panel - sidebar on right
  | 'inline';       // Inline controls above viz

export interface UnifiedVisualizationLayoutProps {
  // Content
  visualization: ReactNode;
  controlsContent?: ReactNode;
  
  // Intelligence panel data
  selectedEntity?: SelectedEntity | null;
  relatedEntities?: RelatedEntity[];
  quickStats?: QuickStats;
  datasetLabel?: string;
  visualizationType?: string;
  useNavigateData?: boolean;
  
  // Callbacks
  onEntitySelect?: (entity: SelectedEntity) => void;
  onClearSelection?: () => void;
  onFunctionCall?: (functionName: string, args: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  onBack?: () => void;
  
  // Header content
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  
  // Layout options
  defaultLayout?: LayoutMode;
  showLayoutSwitcher?: boolean;
  showBackButton?: boolean;
  
  // Fullscreen
  allowFullscreen?: boolean;
  
  className?: string;
}

// ============================================================================
// LAYOUT OPTION BUTTON
// ============================================================================

interface LayoutOptionProps {
  mode: LayoutMode;
  currentMode: LayoutMode;
  icon: typeof Layout;
  label: string;
  onClick: () => void;
}

function LayoutOption({ mode, currentMode, icon: Icon, label, onClick }: LayoutOptionProps) {
  const isActive = mode === currentMode;
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        isActive 
          ? 'bg-[#006E51] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ============================================================================
// LAYOUT SWITCHER
// ============================================================================

interface LayoutSwitcherProps {
  currentLayout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
}

function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl">
      <LayoutOption 
        mode="floating" 
        currentMode={currentLayout}
        icon={Layers}
        label="Floating"
        onClick={() => onLayoutChange('floating')}
      />
      <LayoutOption 
        mode="split" 
        currentMode={currentLayout}
        icon={PanelLeft}
        label="Split"
        onClick={() => onLayoutChange('split')}
      />
      <LayoutOption 
        mode="inline" 
        currentMode={currentLayout}
        icon={SlidersHorizontal}
        label="Inline"
        onClick={() => onLayoutChange('inline')}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedVisualizationLayout({
  visualization,
  controlsContent,
  selectedEntity,
  relatedEntities = [],
  quickStats,
  datasetLabel = 'All Data',
  visualizationType = 'visualization',
  useNavigateData = true,
  onEntitySelect,
  onClearSelection,
  onFunctionCall,
  onBack,
  title,
  subtitle,
  headerActions,
  defaultLayout = 'floating',
  showLayoutSwitcher = true,
  showBackButton = false,
  allowFullscreen = true,
  className,
}: UnifiedVisualizationLayoutProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inlineControlsExpanded, setInlineControlsExpanded] = useState(true);
  const [splitPanelOpen, setSplitPanelOpen] = useState(true);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Build intelligence panel content
  const intelligencePanel = (
    <UnifiedIntelligencePanel
      selectedEntity={selectedEntity}
      relatedEntities={relatedEntities}
      quickStats={quickStats}
      datasetLabel={datasetLabel}
      visualizationType={visualizationType}
      useNavigateData={useNavigateData}
      onEntitySelect={onEntitySelect}
      onClearSelection={onClearSelection}
      onFunctionCall={onFunctionCall}
    />
  );

  // Build panel configs for floating mode
  const floatingPanels: PanelConfig[] = [];
  
  if (controlsContent) {
    floatingPanels.push({
      key: 'controls',
      content: <div className="p-4">{controlsContent}</div>,
      widthOffset: 40,
    });
  }
  
  floatingPanels.push({
    key: 'intelligence',
    content: intelligencePanel,
    widthOffset: -20,
  });

  // ============================================================================
  // RENDER: FULLSCREEN MODE
  // ============================================================================

  if (isFullscreen) {
    return (
      <div className={clsx('fixed inset-0 z-50 bg-white', className)}>
        {/* Minimal header in fullscreen */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
            Exit Fullscreen
          </button>
        </div>

        {/* Full visualization */}
        <div className="h-full">
          {visualization}
        </div>

        {/* Floating panels in fullscreen */}
        {layout === 'floating' && (
          <FloatingPanelSystem
            panels={floatingPanels}
            initialOpenPanels={['intelligence']}
            topOffset={80}
            bottomOffset={24}
          />
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER: NORMAL MODE
  // ============================================================================

  return (
    <div className={clsx('flex flex-col min-h-screen bg-slate-50', className)}>
      {/* Header */}
      <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-gray-500 hover:text-[#006E51] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          
          {(title || subtitle) && (
            <div>
              {subtitle && (
                <p className="text-xs uppercase tracking-wider text-gray-500">{subtitle}</p>
              )}
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {headerActions}
          
          {showLayoutSwitcher && (
            <LayoutSwitcher 
              currentLayout={layout} 
              onLayoutChange={setLayout} 
            />
          )}
          
          {allowFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content - varies by layout */}
      <main className="flex-1 relative">
        {/* ===================== FLOATING LAYOUT ===================== */}
        {layout === 'floating' && (
          <div className="h-[calc(100vh-72px)] relative">
            {/* Full-width visualization */}
            <div className="h-full">
              {visualization}
            </div>

            {/* Floating panel system */}
            <FloatingPanelSystem
              panels={floatingPanels}
              initialOpenPanels={controlsContent ? ['controls', 'intelligence'] : ['intelligence']}
              topOffset={80}
              bottomOffset={24}
            />
          </div>
        )}

        {/* ===================== SPLIT LAYOUT ===================== */}
        {layout === 'split' && (
          <div className="flex h-[calc(100vh-72px)]">
            {/* Visualization area */}
            <div className={clsx(
              'flex-1 transition-all duration-300',
              splitPanelOpen ? 'mr-0' : 'mr-0'
            )}>
              {/* Inline controls if present */}
              {controlsContent && (
                <div className="border-b border-gray-200 bg-white">
                  <button
                    onClick={() => setInlineControlsExpanded(!inlineControlsExpanded)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Controls
                    </span>
                    <ChevronLeft className={clsx(
                      'h-4 w-4 transition-transform',
                      inlineControlsExpanded ? 'rotate-90' : '-rotate-90'
                    )} />
                  </button>
                  {inlineControlsExpanded && (
                    <div className="px-4 pb-4">
                      {controlsContent}
                    </div>
                  )}
                </div>
              )}

              {/* Visualization */}
              <div className="h-full">
                {visualization}
              </div>
            </div>

            {/* Right panel - Intelligence */}
            <aside className={clsx(
              'w-96 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 flex flex-col',
              splitPanelOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
              {/* Panel toggle */}
              <button
                onClick={() => setSplitPanelOpen(!splitPanelOpen)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-6 h-16 bg-white border border-r-0 border-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronLeft className={clsx(
                  'h-4 w-4 text-gray-400 transition-transform',
                  splitPanelOpen ? 'rotate-0' : 'rotate-180'
                )} />
              </button>

              {intelligencePanel}
            </aside>
          </div>
        )}

        {/* ===================== INLINE LAYOUT ===================== */}
        {layout === 'inline' && (
          <div className="h-[calc(100vh-72px)] flex flex-col">
            {/* Inline controls */}
            {controlsContent && (
              <div className="border-b border-gray-200 bg-white">
                <button
                  onClick={() => setInlineControlsExpanded(!inlineControlsExpanded)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#006E51]" />
                    Visualization Controls
                  </span>
                  <ChevronLeft className={clsx(
                    'h-4 w-4 text-gray-400 transition-transform',
                    inlineControlsExpanded ? 'rotate-90' : '-rotate-90'
                  )} />
                </button>
                {inlineControlsExpanded && (
                  <div className="px-6 pb-4 bg-gray-50/50 border-t border-gray-100">
                    {controlsContent}
                  </div>
                )}
              </div>
            )}

            {/* Main area with visualization + floating intelligence */}
            <div className="flex-1 relative">
              {visualization}
              
              {/* Floating intelligence panel (simplified for inline mode) */}
              <div className="absolute right-4 top-4 bottom-4 w-80 z-20">
                <div className="h-full rounded-2xl bg-white/95 backdrop-blur-lg shadow-xl border border-gray-100 overflow-hidden">
                  {intelligencePanel}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UnifiedVisualizationLayout;



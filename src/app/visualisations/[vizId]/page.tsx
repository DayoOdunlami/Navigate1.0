'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import clsx from 'clsx';
import {
  SlidersHorizontal,
  Sparkles,
  Bot,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { TopNavigation } from '@/components/ui/TopNavigation';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { AIChatPanel } from '@/components/layouts/AIChatPanel';
import { ControlsRenderer } from '@/lib/visualisations/components/ControlsRenderer';
import {
  getVisualization,
  getControlsForDomain,
  type Domain,
  type ControlState,
  type VisualizationConfig,
} from '@/lib/visualisations/registry';

// Import your unified data
import { unifiedEntities, unifiedRelationships, getEntitiesByDomain } from '@/data/unified';

// =============================================================================
// PANEL SYSTEM (V6 Pattern)
// =============================================================================

type PanelKey = 'controls' | 'insights' | 'ai';

const PANEL_META: Record<PanelKey, { label: string; icon: typeof SlidersHorizontal; accent: string }> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function VisualizationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const vizId = params.vizId as string;

  // Get visualization config from registry
  const vizConfig = getVisualization(vizId);
  if (!vizConfig) {
    notFound();
  }

  // Get initial domain from URL or default
  const initialDomain = (searchParams.get('domain') as Domain | 'all') || 'all';

  // =============================================================================
  // STATE
  // =============================================================================

  // Panel state (V6 pattern)
  const [dockedPanels, setDockedPanels] = useState<Record<PanelKey, boolean>>({
    controls: true,
    insights: true,
    ai: false, // Start with AI closed
  });
  const [panelOrder, setPanelOrder] = useState<PanelKey[]>(['controls', 'insights', 'ai']);
  const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>({
    controls: false,
    insights: false,
    ai: false,
  });
  const [panelWidth, setPanelWidth] = useState(340);
  const [focusMode, setFocusMode] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Visualization state
  const [activeDomain, setActiveDomain] = useState<Domain | 'all'>(initialDomain);
  const [controlState, setControlState] = useState<ControlState>(vizConfig.defaultState);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Resize state
  const resizeMeta = useRef({ active: false, startX: 0, startWidth: 0 });

  // =============================================================================
  // DERIVED STATE
  // =============================================================================

  // Filter controls by domain
  const domainControls = useMemo(
    () => getControlsForDomain(vizConfig.controls, activeDomain),
    [vizConfig.controls, activeDomain]
  );

  // Filter entities by domain (map 'cpc' to 'cpc-internal' for data layer)
  const filteredEntities = useMemo(() => {
    if (activeDomain === 'all') return unifiedEntities;
    // Map 'cpc' domain from registry to 'cpc-internal' used in data layer
    const domainForData = activeDomain === 'cpc' ? ('cpc-internal' as const) : activeDomain;
    return getEntitiesByDomain(domainForData);
  }, [activeDomain]);

  // Get open panels in order
  const openPanels = useMemo(
    () => panelOrder.filter((p) => dockedPanels[p] && !collapsedPanels[p]),
    [panelOrder, dockedPanels, collapsedPanels]
  );
  const hasOpenPanels = openPanels.length > 0;

  // Build AI context
  const aiContext: AIVisualizationContext = useMemo(
    () => ({
      visualization: {
        id: vizConfig.id,
        name: vizConfig.name,
        description: vizConfig.description,
        aiDescription: vizConfig.aiDescription,
      },
      controls: {
        schema: domainControls,
        state: controlState,
      },
      data: {
        domain: activeDomain,
        entityCounts: {
          total: filteredEntities.length,
          challenges: filteredEntities.filter((e) => e.entityType === 'challenge').length,
          stakeholders: filteredEntities.filter((e) => e.entityType === 'stakeholder').length,
          technologies: filteredEntities.filter((e) => e.entityType === 'technology').length,
        },
        availableFilters: domainControls.map((c) => c.id),
      },
      selection: {
        entity: selectedEntity,
      },
    }),
    [vizConfig, domainControls, controlState, activeDomain, filteredEntities, selectedEntity]
  );

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleControlChange = useCallback((controlId: string, value: any) => {
    // Special handling for domain selector
    if (controlId === 'activeDomain') {
      setActiveDomain(value as Domain | 'all');
    }
    setControlState((prev) => ({ ...prev, [controlId]: value }));
  }, []);

  const togglePanel = useCallback((panel: PanelKey) => {
    setDockedPanels((prev) => {
      const next = !prev[panel];
      if (next) {
        setCollapsedPanels((collapsed) => ({ ...collapsed, [panel]: false }));
      }
      return { ...prev, [panel]: next };
    });
  }, []);

  const toggleCollapse = useCallback((panel: PanelKey) => {
    setCollapsedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const movePanel = useCallback((panel: PanelKey, direction: 'left' | 'right') => {
    setPanelOrder((prev) => {
      const currentIndex = prev.indexOf(panel);
      if (currentIndex === -1) return prev;
      const targetIndex =
        direction === 'left'
          ? Math.max(0, currentIndex - 1)
          : Math.min(prev.length - 1, currentIndex + 1);
      if (targetIndex === currentIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  }, []);

  // AI function call handler
  const handleAIFunctionCall = useCallback(
    (functionName: string, args: any) => {
      if (functionName === 'set_control' && args?.controlId && args?.value !== undefined) {
        handleControlChange(args.controlId, args.value);
        return true;
      }
      if (functionName === 'select_entity' && args?.entityId) {
        const entity = filteredEntities.find((e) => e.id === args.entityId);
        if (entity) {
          setSelectedEntity(entity);
          return true;
        }
      }
      return false;
    },
    [handleControlChange, filteredEntities]
  );

  // Resize handlers
  const handleResizing = useCallback((event: MouseEvent) => {
    if (!resizeMeta.current.active) return;
    const delta = resizeMeta.current.startX - event.clientX;
    const nextWidth = Math.min(420, Math.max(260, resizeMeta.current.startWidth + delta));
    setPanelWidth(nextWidth);
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizeMeta.current.active = false;
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizing]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      resizeMeta.current = { active: true, startX: event.clientX, startWidth: panelWidth };
      window.addEventListener('mousemove', handleResizing);
      window.addEventListener('mouseup', handleResizeEnd);
    },
    [handleResizing, handleResizeEnd, panelWidth]
  );

  const computePanelWidth = useCallback(
    (panel: PanelKey) => {
      const offsets: Record<PanelKey, number> = { controls: 60, insights: -10, ai: 30 };
      return Math.max(280, Math.min(520, panelWidth + (offsets[panel] || 0)));
    },
    [panelWidth]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleResizing);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizing, handleResizeEnd]);

  // =============================================================================
  // RENDER
  // =============================================================================

  const VisualizationComponent = vizConfig.Component;

  return (
    <div className="relative min-h-screen bg-slate-100">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">{vizConfig.category}</p>
          <h1 className="text-xl font-semibold text-gray-900">{vizConfig.name}</h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {/* Domain Quick Selector (if multi-domain) */}
          {vizConfig.domains.length > 1 && (
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveDomain('all')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  activeDomain === 'all' ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                All
              </button>
              {vizConfig.domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setActiveDomain(domain)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    activeDomain === domain ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setFocusMode((prev) => !prev)}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              focusMode
                ? 'border-[#006E51] bg-[#006E51]/10 text-[#006E51]'
                : 'border-gray-200 text-gray-600'
            )}
          >
            {focusMode ? 'Exit Focus' : 'Focus Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-72px)] bg-slate-50">
        {/* Visualization Canvas */}
        <div className="relative h-full w-full">
          {VisualizationComponent ? (
            <VisualizationComponent
              domain={activeDomain}
              controlState={controlState}
              onControlChange={handleControlChange}
              onEntitySelect={setSelectedEntity}
              selectedEntity={selectedEntity}
              className="h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Visualization component not loaded</p>
                <p className="text-sm text-gray-400">Component reference needs to be added to registry</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel Launcher Buttons */}
        <div className="absolute right-6 top-4 z-30 flex items-center gap-2">
          {(Object.keys(PANEL_META) as PanelKey[]).map((panel) => {
            const meta = PANEL_META[panel];
            const Icon = meta.icon;
            const active = dockedPanels[panel] && !collapsedPanels[panel];
            return (
              <button
                key={panel}
                onClick={() => togglePanel(panel)}
                className={clsx(
                  'relative flex h-12 w-12 items-center justify-center rounded-full border shadow-xl transition-all',
                  active ? 'bg-white text-gray-900 border-white' : 'bg-white/70 text-gray-500 hover:bg-white'
                )}
                style={{ color: active ? meta.accent : undefined }}
                title={meta.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {/* Floating Panel Stack */}
        {hasOpenPanels && (
          <div
            className={clsx(
              'pointer-events-none absolute right-6 top-20 bottom-6 z-20 flex gap-4 transition-opacity duration-200',
              focusMode ? 'opacity-0' : 'opacity-100'
            )}
          >
            {/* Resize Handle */}
            <div className={clsx('relative flex items-center pr-2', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
              <div
                className="h-20 w-1 rounded-full bg-white/80 shadow-md ring-1 ring-black/5 cursor-ew-resize"
                onMouseDown={handleResizeStart}
                title="Drag to resize panels"
              />
            </div>

            {/* Panels */}
            <div className={clsx('flex items-start gap-4', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
              {openPanels.map((panel) => {
                const meta = PANEL_META[panel];
                const index = openPanels.indexOf(panel);
                return (
                  <SidebarPanel
                    key={panel}
                    title={meta.label}
                    accent={meta.accent}
                    width={computePanelWidth(panel)}
                    collapsed={collapsedPanels[panel]}
                    onCollapse={() => toggleCollapse(panel)}
                    onClose={() => togglePanel(panel)}
                    onMoveLeft={() => movePanel(panel, 'left')}
                    onMoveRight={() => movePanel(panel, 'right')}
                    canMoveLeft={index > 0}
                    canMoveRight={index < openPanels.length - 1}
                    icon={meta.icon}
                  >
                    {/* Controls Panel */}
                    {panel === 'controls' && (
                      <ControlsRenderer
                        controls={domainControls}
                        state={controlState}
                        onChange={handleControlChange}
                        activeDomain={activeDomain}
                        showAdvanced={showAdvancedControls}
                        onToggleAdvanced={() => setShowAdvancedControls((prev) => !prev)}
                      />
                    )}

                    {/* Insights Panel */}
                    {panel === 'insights' && (
                      <InsightsPanel
                        entity={selectedEntity}
                        vizConfig={vizConfig}
                        entityCount={filteredEntities.length}
                        domain={activeDomain}
                      />
                    )}

                    {/* AI Chat Panel */}
                    {panel === 'ai' && (
                      <div className="h-full">
                        <AIChatPanel
                          context={{
                            activeViz: vizConfig.name,
                            useNavigateData: activeDomain === 'navigate' || activeDomain === 'all',
                            selectedEntities: selectedEntity ? [selectedEntity] : [],
                            visualizationContext: aiContext,
                          }}
                          onFunctionCall={handleAIFunctionCall}
                        />
                      </div>
                    )}
                  </SidebarPanel>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SIDEBAR PANEL COMPONENT
// =============================================================================

interface SidebarPanelProps {
  title: string;
  accent: string;
  width: number;
  collapsed: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  icon: typeof SlidersHorizontal;
  children: React.ReactNode;
}

function SidebarPanel({
  title,
  accent,
  width,
  collapsed,
  onCollapse,
  onClose,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  icon: Icon,
  children,
}: SidebarPanelProps) {
  if (collapsed) return null;

  return (
    <div
      className="pointer-events-auto flex h-[80vh] max-h-[80vh] flex-col rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl"
      style={{ width }}
    >
      <div
        className="flex items-center justify-between border-b border-white/40 px-4 py-3 text-sm font-semibold"
        style={{ color: accent }}
        onDoubleClick={onCollapse}
        title="Double-click to collapse"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={clsx('rounded-full p-1 transition-colors', canMoveLeft ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed')}
            title="Move left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={clsx('rounded-full p-1 transition-colors', canMoveRight ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed')}
            title="Move right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onCollapse} className="rounded-full p-1 text-gray-400 hover:text-gray-600" title="Collapse panel">
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </button>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:text-gray-600" title="Close panel">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

// =============================================================================
// INSIGHTS PANEL COMPONENT
// =============================================================================

interface InsightsPanelProps {
  entity: any;
  vizConfig: VisualizationConfig;
  entityCount: number;
  domain: Domain | 'all';
}

function InsightsPanel({ entity, vizConfig, entityCount, domain }: InsightsPanelProps) {
  if (!entity) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Explore</p>
          <h3 className="text-lg font-semibold text-emerald-900">{vizConfig.name}</h3>
          <p className="text-sm text-emerald-900/80 mt-1">{vizConfig.description}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Quick Stats</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>Domain</span>
              <span className="font-semibold capitalize">{domain}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Entities</span>
              <span className="font-semibold">{entityCount}</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-500">Click on any element to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#006E51]/20 bg-[#006E51]/5 p-4">
        <p className="text-xs uppercase tracking-wider text-[#006E51]">{entity.entityType}</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">{entity.name}</h3>
        {entity.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{entity.description}</p>}
      </div>

      {/* Entity metadata */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Details</p>
        <dl className="space-y-2 text-sm">
          {entity.metadata?.sector && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Sector</dt>
              <dd className="font-medium">{Array.isArray(entity.metadata.sector) ? entity.metadata.sector.join(', ') : entity.metadata.sector}</dd>
            </div>
          )}
          {entity.domain && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Domain</dt>
              <dd className="font-medium capitalize">{entity.domain}</dd>
            </div>
          )}
          {entity.metadata?.trl && (
            <div className="flex justify-between">
              <dt className="text-gray-500">TRL</dt>
              <dd className="font-medium">
                {typeof entity.metadata.trl === 'object' 
                  ? `${entity.metadata.trl.current || entity.metadata.trl.min}-${entity.metadata.trl.max || entity.metadata.trl.target}` 
                  : entity.metadata.trl}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Tags */}
      {entity.metadata?.tags && entity.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.metadata.tags.slice(0, 8).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * Challenge Explorer Page
 * 
 * Main page for exploring Atlas funding challenges
 * Uses V6 layout with floating panels
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { TopNavigation } from '@/components/ui/TopNavigation';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { AIChatPanel } from '@/components/layouts/AIChatPanel';
import { ControlsRenderer } from '@/lib/visualisations/components/ControlsRenderer';
import { ChallengeTreemap } from '@/components/visualisations/ChallengeTreemap';
import { challengeControlSchema } from '@/lib/visualisations/controls/challengeControls';
import { strategyAdvisorTools } from '@/lib/strategyAdvisor/tools';
import { buildStrategyAdvisorSystemPrompt } from '@/lib/strategyAdvisor/prompts';
import { unifiedEntities } from '@/data/unified';
import { SlidersHorizontal, Sparkles, Bot } from 'lucide-react';
import type { ControlDefinition, ControlState } from '@/lib/visualisations/types';
import type { FunctionExecutionState } from '@/lib/ai-function-handlers';
import clsx from 'clsx';

type PanelKey = 'controls' | 'insights' | 'ai';

const PANEL_META: Record<PanelKey, { label: string; icon: typeof SlidersHorizontal; accent: string }> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
};

export default function ChallengeExplorerPage() {
  // Panel state
  const [dockedPanels, setDockedPanels] = useState<Record<PanelKey, boolean>>({
    controls: true,
    insights: true,
    ai: false,
  });
  const [panelOrder, setPanelOrder] = useState<PanelKey[]>(['controls', 'insights', 'ai']);
  const [panelWidth, setPanelWidth] = useState(320);

  // Control state
  const [controlState, setControlState] = useState<ControlState>(() => {
    const defaults: ControlState = {};
    challengeControlSchema.forEach(control => {
      defaults[control.id] = control.defaultValue;
    });
    return defaults;
  });

  // Selection state
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Get filtered entities
  const filteredEntities = useMemo(() => {
    let entities = unifiedEntities.filter(
      e => e.domain === 'atlas' && e.entityType === 'challenge'
    );

    // Apply filters
    if (controlState.modes && Array.isArray(controlState.modes) && controlState.modes.length > 0) {
      entities = entities.filter(e => {
        const custom = e.metadata.custom as any;
        const entityModes = custom?.modes || [];
        return controlState.modes.some((mode: string) => entityModes.includes(mode));
      });
    }

    if (controlState.themes && Array.isArray(controlState.themes) && controlState.themes.length > 0) {
      entities = entities.filter(e => {
        const custom = e.metadata.custom as any;
        const entityThemes = custom?.strategicThemes || [];
        return controlState.themes.some((theme: string) => entityThemes.includes(theme));
      });
    }

    if (controlState.tiers && Array.isArray(controlState.tiers) && controlState.tiers.length > 0) {
      entities = entities.filter(e => {
        const custom = e.metadata.custom as any;
        const tier = String(custom?.sourceTier);
        return controlState.tiers.includes(tier);
      });
    }

    if (controlState.status && Array.isArray(controlState.status) && controlState.status.length > 0) {
      entities = entities.filter(e => {
        return controlState.status.includes(e.metadata.status || '');
      });
    }

    if (controlState.smeOnly) {
      entities = entities.filter(e => {
        const custom = e.metadata.custom as any;
        return custom?.eligibility?.sme_specific === true;
      });
    }

    if (controlState.fundingRange && Array.isArray(controlState.fundingRange)) {
      const [min, max] = controlState.fundingRange;
      entities = entities.filter(e => {
        const funding = e.metadata.funding?.amount || 0;
        return funding >= min && funding <= max;
      });
    }

    if (controlState.minRelevance) {
      entities = entities.filter(e => {
        const custom = e.metadata.custom as any;
        return (custom?.cpcRelevance?.score || 0) >= controlState.minRelevance;
      });
    }

    return entities;
  }, [controlState]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredEntities.length;
    const totalFunding = filteredEntities.reduce(
      (sum, e) => sum + (e.metadata.funding?.amount || 0),
      0
    );

    const byMode: Record<string, number> = {};
    const byTheme: Record<string, number> = {};

    filteredEntities.forEach(e => {
      const custom = e.metadata.custom as any;
      (custom?.modes || []).forEach((mode: string) => {
        byMode[mode] = (byMode[mode] || 0) + 1;
      });
      (custom?.strategicThemes || []).forEach((theme: string) => {
        byTheme[theme] = (byTheme[theme] || 0) + 1;
      });
    });

    return { total, totalFunding, byMode, byTheme };
  }, [filteredEntities]);

  // Control handlers
  const handleControlChange = useCallback((controlId: string, value: any) => {
    setControlState(prev => ({ ...prev, [controlId]: value }));
  }, []);

  // Panel handlers
  const togglePanel = useCallback((panel: PanelKey) => {
    setDockedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  // AI function call handler
  const handleAIFunctionCall = useCallback(
    async (functionName: string, args: any): Promise<{ success: boolean; message?: string; error?: string }> => {
      if (functionName === 'set_control' && args?.controlId && args?.value !== undefined) {
        handleControlChange(args.controlId, args.value);
        return { success: true, message: `Control ${args.controlId} updated` };
      }
      if (functionName === 'select_entity' && args?.entityId) {
        const entity = filteredEntities.find(e => e.id === args.entityId);
        if (entity) {
          setSelectedEntity(entity);
          return { success: true, message: `Entity ${args.entityId} selected` };
        }
        return { success: false, error: `Entity ${args.entityId} not found` };
      }
      return { success: false, error: `Unknown function: ${functionName}` };
    },
    [handleControlChange, filteredEntities]
  );

  // Build AI system prompt
  const systemPrompt = useMemo(() => {
    return buildStrategyAdvisorSystemPrompt(filteredEntities.length, stats.totalFunding);
  }, [filteredEntities.length, stats.totalFunding]);

  return (
    <div className="relative min-h-screen bg-slate-100">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">Atlas</p>
          <h1 className="text-xl font-semibold text-gray-900">Funding Challenge Explorer</h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <div className="rounded-lg bg-slate-100 px-3 py-1.5">
            <span className="font-medium">{stats.total}</span>
            <span className="text-gray-600 ml-1">challenges</span>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-1.5">
            <span className="font-medium">£{(stats.totalFunding / 1000000).toFixed(1)}M</span>
            <span className="text-gray-600 ml-1">total funding</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative flex h-[calc(100vh-73px)]">
        {/* Visualization canvas */}
        <div className="flex-1 relative">
          <ChallengeTreemap
            domain="atlas"
            controlState={controlState}
            onControlChange={handleControlChange}
            onEntitySelect={setSelectedEntity}
            selectedEntity={selectedEntity}
            className="w-full h-full"
          />
        </div>

        {/* Floating panels */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col gap-2 p-2 pointer-events-none">
          {panelOrder.map((panelKey) => {
            if (!dockedPanels[panelKey]) return null;

            const meta = PANEL_META[panelKey];
            const PanelIcon = meta.icon;

            return (
              <div
                key={panelKey}
                className="pointer-events-auto bg-white rounded-lg shadow-lg border border-gray-200"
                style={{ width: panelWidth }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-4 py-2 border-b border-gray-200"
                  style={{ backgroundColor: `${meta.accent}08` }}
                >
                  <div className="flex items-center gap-2">
                    <PanelIcon className="w-4 h-4" style={{ color: meta.accent }} />
                    <h3 className="font-medium text-sm">{meta.label}</h3>
                  </div>
                  <button
                    onClick={() => togglePanel(panelKey)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {/* Panel content */}
                <div className="p-4 max-h-[calc(100vh-150px)] overflow-y-auto">
                  {panelKey === 'controls' && (
                    <ControlsRenderer
                      controls={challengeControlSchema}
                      state={controlState}
                      onChange={handleControlChange}
                      activeDomain="atlas"
                    />
                  )}

                  {panelKey === 'insights' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Total Challenges:</span>{' '}
                            <span className="font-medium">{stats.total}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Funding:</span>{' '}
                            <span className="font-medium">£{(stats.totalFunding / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>

                      {selectedEntity && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-2">Selected Challenge</h4>
                          <div className="space-y-2 text-sm">
                            <div className="font-medium">{selectedEntity.name}</div>
                            <div className="text-gray-600">
                              {(selectedEntity.metadata.custom as any)?.fundingBody}
                            </div>
                            <div>
                              <span className="text-gray-600">Funding:</span>{' '}
                              <span className="font-medium">
                                £{((selectedEntity.metadata.funding?.amount || 0) / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {panelKey === 'ai' && (
                    <AIChatPanel
                      mode="text"
                      context={{
                        activeViz: 'challenge-treemap',
                        selectedEntities: selectedEntity ? [selectedEntity] : [],
                      }}
                      onFunctionCall={handleAIFunctionCall}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel launchers */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          {panelOrder.map((panelKey) => {
            if (dockedPanels[panelKey]) return null;

            const meta = PANEL_META[panelKey];
            const PanelIcon = meta.icon;

            return (
              <button
                key={panelKey}
                onClick={() => togglePanel(panelKey)}
                className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform"
                style={{ color: meta.accent }}
                title={meta.label}
              >
                <PanelIcon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


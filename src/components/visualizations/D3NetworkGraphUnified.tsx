/**
 * Unified D3 Network Graph - NEW IMPLEMENTATION
 * 
 * This is a separate implementation that uses BaseEntity[] for unified data.
 * This is for testing the unified approach separately from the working Toolkit version.
 * 
 * To use: Import this component instead of D3NetworkGraphToolkit when testing BaseEntity integration.
 */

'use client';

import { useMemo, useState, useCallback, useEffect, ReactNode } from 'react';
import { D3NetworkGraphUniversal } from './D3NetworkGraphUniversal';
import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';

interface D3NetworkGraphUnifiedProps {
  entities: BaseEntity[];
  relationships?: UniversalRelationship[];
  onExternalControlsChange?: (controls: ReactNode | null) => void;
  onEntitySelect?: (entity: { type: 'stakeholder' | 'technology' | 'project' | 'funding' | 'challenge'; id: string; data: any } | null) => void;
  defaultInlineInsights?: boolean;
  inlineInsightsLocked?: boolean;
}

export function D3NetworkGraphUnified({
  entities,
  relationships = [],
  onExternalControlsChange,
  onEntitySelect,
  defaultInlineInsights = true,
  inlineInsightsLocked = false,
}: D3NetworkGraphUnifiedProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showEmbeddedControls, setShowEmbeddedControls] = useState(true);
  const [showEmbeddedInsights, setShowEmbeddedInsights] = useState(defaultInlineInsights);
  const [controlsRenderer, setControlsRenderer] = useState<(() => ReactNode) | null>(null);

  const handleControlsRender = useCallback((renderFn: (() => ReactNode) | null) => {
    setControlsRenderer(() => renderFn);
  }, []);

  useEffect(() => {
    if (inlineInsightsLocked) {
      setShowEmbeddedInsights(false);
      return;
    }
    setShowEmbeddedInsights(defaultInlineInsights);
  }, [defaultInlineInsights, inlineInsightsLocked]);

  // Get selected entity
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find(e => e.id === selectedEntityId) || null;
  }, [selectedEntityId, entities]);

  // Get related entities
  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = new Set<string>();
    
    // Find relationships where this entity is source or target
    relationships.forEach(rel => {
      if (rel.source === selectedEntityId) relatedIds.add(rel.target);
      if (rel.target === selectedEntityId) relatedIds.add(rel.source);
    });
    
    // Also check entity.relationships
    selectedEntity?.relationships?.forEach(rel => {
      relatedIds.add(rel.targetId);
    });
    
    return Array.from(relatedIds)
      .map(id => entities.find(e => e.id === id))
      .filter((e): e is BaseEntity => e !== undefined);
  }, [selectedEntityId, entities, relationships, selectedEntity]);

  useEffect(() => {
    if (!onEntitySelect) return;
    
    if (selectedEntity) {
      onEntitySelect({
        type: selectedEntity.entityType as 'stakeholder' | 'technology' | 'project' | 'funding' | 'challenge',
        id: selectedEntity.id,
        data: {
          ...selectedEntity,
          relatedEntities: relatedEntities,
        },
      });
    } else {
      onEntitySelect(null);
    }
  }, [selectedEntity, relatedEntities, onEntitySelect]);

  const externalControls = useMemo(() => {
    if (!controlsRenderer) return null;
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 border-b border-[#CCE2DC] flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-[#006E51]">Unified Network Controls</p>
            <p className="text-xs text-gray-500">Using BaseEntity[] - Unified implementation</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                showEmbeddedControls
                  ? 'border-[#006E51] text-[#006E51] hover:bg-[#006E51]/10'
                  : 'border-slate-300 text-slate-500 hover:bg-slate-100'
              }`}
              onClick={() => setShowEmbeddedControls((prev) => !prev)}
            >
              {showEmbeddedControls ? 'Hide Inline Controls' : 'Show Inline Controls'}
            </button>
            {!inlineInsightsLocked && (
              <button
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showEmbeddedInsights
                    ? 'border-[#006E51] text-[#006E51] hover:bg-[#006E51]/10'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setShowEmbeddedInsights((prev) => !prev)}
              >
                {showEmbeddedInsights ? 'Hide Inline Insights' : 'Show Inline Insights'}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1 py-3">
          {controlsRenderer()}
        </div>
      </div>
    );
  }, [controlsRenderer, showEmbeddedControls, showEmbeddedInsights, inlineInsightsLocked]);

  useEffect(() => {
    if (!onExternalControlsChange) return;
    onExternalControlsChange(externalControls);
  }, [externalControls, onExternalControlsChange]);

  useEffect(() => {
    return () => {
      onExternalControlsChange?.(null);
    };
  }, [onExternalControlsChange]);

  return (
    <div className="w-full h-full">
      <D3NetworkGraphUniversal
        entities={entities}
        relationships={relationships}
        selectedEntityId={selectedEntityId}
        onEntitySelect={(id) => {
          setSelectedEntityId(id);
        }}
        showEmbeddedControls={showEmbeddedControls}
        showEmbeddedInsights={showEmbeddedInsights}
        onControlsRender={handleControlsRender}
        onControlsVisibilityChange={setShowEmbeddedControls}
        onInsightsVisibilityChange={inlineInsightsLocked ? undefined : setShowEmbeddedInsights}
        insightsToggleEnabled={!inlineInsightsLocked}
      />
    </div>
  );
}




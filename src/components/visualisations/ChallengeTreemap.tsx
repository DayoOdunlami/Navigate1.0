/**
 * Challenge Treemap Visualization
 * 
 * Displays funding challenges in a hierarchical treemap
 * Groups by: tier → funding body → programme
 */

'use client';

import { useMemo } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import type { VisualizationComponentProps } from '@/lib/visualisations/types';
import { transformToTreemap } from '@/lib/visualisations/adapters/challengeTreemap';
import { unifiedEntities } from '@/data/unified';

export function ChallengeTreemap({
  domain,
  controlState,
  onEntitySelect,
  selectedEntity,
  className = '',
}: VisualizationComponentProps) {
  // Get filtered challenges
  const challenges = useMemo(() => {
    let entities = unifiedEntities.filter(
      e => e.domain === 'atlas' && e.entityType === 'challenge'
    );

    // Apply filters from controlState
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
  }, [domain, controlState]);

  // Transform to treemap data
  const treemapData = useMemo(() => {
    if (challenges.length === 0) {
      return { name: 'No Data', children: [] };
    }
    return transformToTreemap(challenges);
  }, [challenges]);

  // Handle node click
  const handleNodeClick = (node: any) => {
    if (node.data?.challenge && onEntitySelect) {
      onEntitySelect(node.data.challenge);
    }
  };

  if (challenges.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No challenges match the current filters</p>
          <p className="text-sm mt-2">Try adjusting your filter settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveTreeMap
        data={treemapData}
        identity="name"
        value="value"
        valueFormat=">-.2s"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        label={(node) => {
          // Show funding amount for leaf nodes
          if (!node.children) {
            return `${node.data.name}\n£${(node.data.value / 1000000).toFixed(1)}M`;
          }
          return node.data.name;
        }}
        labelSkipSize={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
        parentLabelPosition="left"
        parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
        colors={{ scheme: 'nivo' }}
        animate={true}
        motionConfig="wobbly"
        onClick={handleNodeClick}
        tooltip={({ node }) => (
          <div className="bg-white p-3 rounded shadow-lg border">
            <div className="font-semibold">{node.id}</div>
            <div className="text-sm text-gray-600">
              Funding: £{(node.value / 1000000).toFixed(2)}M
            </div>
            {node.data?.challenge && (
              <div className="text-xs text-gray-500 mt-1">
                Click to view details
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}


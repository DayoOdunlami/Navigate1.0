/**
 * Challenge Treemap Adapter
 * 
 * Transforms challenge data for treemap visualization
 * Groups by: tier → funding body → programme
 */

import type { BaseEntity } from '@/lib/base-entity';

export interface TreemapNode {
  name: string;
  value: number;
  children?: TreemapNode[];
  challenge?: BaseEntity; // For leaf nodes
}

export interface TreemapData {
  name: string;
  children: TreemapNode[];
}

/**
 * Transform challenges to treemap structure
 */
export function transformToTreemap(challenges: BaseEntity[]): TreemapData {
  // Group by tier
  const byTier: Record<number, BaseEntity[]> = {};
  
  challenges.forEach(challenge => {
    const custom = challenge.metadata.custom as any;
    const tier = custom?.sourceTier;
    if (tier) {
      if (!byTier[tier]) {
        byTier[tier] = [];
      }
      byTier[tier].push(challenge);
    }
  });

  // Build tree structure
  const children: TreemapNode[] = [1, 2, 3, 4, 5]
    .filter(tier => byTier[tier])
    .map(tier => ({
      name: `Tier ${tier}`,
      value: 0, // Will be calculated
      children: groupByFundingBody(byTier[tier]),
    }));

  // Calculate values
  const totalValue = calculateTotalValue(children);

  return {
    name: 'Funding Landscape',
    children,
  };
}

/**
 * Group challenges by funding body, then by programme
 */
function groupByFundingBody(challenges: BaseEntity[]): TreemapNode[] {
  const byFundingBody: Record<string, BaseEntity[]> = {};

  challenges.forEach(challenge => {
    const custom = challenge.metadata.custom as any;
    const fundingBody = custom?.fundingBody || 'Unknown';
    
    if (!byFundingBody[fundingBody]) {
      byFundingBody[fundingBody] = [];
    }
    byFundingBody[fundingBody].push(challenge);
  });

  return Object.entries(byFundingBody).map(([fundingBody, bodyChallenges]) => {
    const byProgramme: Record<string, BaseEntity[]> = {};

    bodyChallenges.forEach(challenge => {
      const custom = challenge.metadata.custom as any;
      const programme = custom?.programme || 'Unspecified';
      
      if (!byProgramme[programme]) {
        byProgramme[programme] = [];
      }
      byProgramme[programme].push(challenge);
    });

    const programmeNodes: TreemapNode[] = Object.entries(byProgramme).map(
      ([programme, programmeChallenges]) => ({
        name: programme,
        value: programmeChallenges.reduce(
          (sum, c) => sum + (c.metadata.funding?.amount || 0),
          0
        ),
        children: programmeChallenges.map(challenge => ({
          name: challenge.name,
          value: challenge.metadata.funding?.amount || 0,
          challenge,
        })),
      })
    );

    return {
      name: fundingBody,
      value: programmeNodes.reduce((sum, node) => sum + node.value, 0),
      children: programmeNodes,
    };
  });
}

/**
 * Calculate total value recursively
 */
function calculateTotalValue(nodes: TreemapNode[]): number {
  return nodes.reduce((sum, node) => {
    if (node.children) {
      return sum + calculateTotalValue(node.children);
    }
    return sum + node.value;
  }, 0);
}


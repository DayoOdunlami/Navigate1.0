import { stakeholdersData } from '@/data/toolkit/stakeholders';
import { relationshipsData } from '@/data/toolkit/relationships';
import { projectsData } from '@/data/toolkit/projects';
import { workingGroupsData } from '@/data/toolkit/workingGroups';
import type {
  ToolkitStakeholder,
  ToolkitProject,
  WorkingGroup,
} from '@/data/toolkit/types';

const CATEGORY_CONFIG = {
  government: { color: '#006E51', symbol: 'circle' },
  academia: { color: '#50C878', symbol: 'circle' },
  industry: { color: '#F5A623', symbol: 'circle' },
  intermediary: { color: '#4A90E2', symbol: 'circle' },
  project: { color: '#e76f51', symbol: 'rect' },
  working_group: { color: '#264653', symbol: 'diamond' },
} as const;

export type StakeholderEntityType = 'stakeholder' | 'project' | 'working_group';

export interface StakeholderNetworkNode {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  symbol: string;
  itemStyle: {
    color: string;
  };
  entityType: StakeholderEntityType;
  fullData: ToolkitStakeholder | ToolkitProject | WorkingGroup;
  x?: number;
  y?: number;
}

export interface StakeholderNetworkLink {
  source: string;
  target: string;
  value?: number;
  lineStyle: {
    color: string;
    width: number;
    curveness?: number;
    type?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
}

export interface StakeholderNetworkResult {
  nodes: StakeholderNetworkNode[];
  links: StakeholderNetworkLink[];
  categories: { name: string }[];
}

/**
 * Build the same stakeholder / project / working-group network
 * that powers the main EChartsGraphView. No thresholds or similarity scoring,
 * just explicit relationships from the data.
 */
export function buildStakeholderNetwork(): StakeholderNetworkResult {
  const categoryList = ['government', 'intermediary', 'academia', 'industry', 'project', 'working_group'] as const;

  const categoryIndexMap = new Map<string, number>(
    categoryList.map((cat, i) => [cat, i]),
  );

  // Stakeholder nodes
  const stakeholderNodes: StakeholderNetworkNode[] = stakeholdersData.map(
    (s) => ({
      id: s.id,
      name: s.shortName || s.name,
      category: categoryIndexMap.get(s.category) ?? 0,
      symbolSize: 35,
      symbol: CATEGORY_CONFIG[s.category]?.symbol || 'circle',
      itemStyle: {
        color: CATEGORY_CONFIG[s.category]?.color || '#6b7280',
      },
      entityType: 'stakeholder',
      fullData: s,
    }),
  );

  // Project nodes
  const projectNodes: StakeholderNetworkNode[] = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    category: categoryIndexMap.get('project') ?? 4,
    symbolSize: 25,
    symbol: 'rect',
    itemStyle: {
      color: CATEGORY_CONFIG.project.color,
    },
    entityType: 'project',
    fullData: p,
  }));

  // Working group nodes
  const workingGroupNodes: StakeholderNetworkNode[] = workingGroupsData.map(
    (wg) => ({
      id: wg.id,
      name: wg.name,
      category: categoryIndexMap.get('working_group') ?? 5,
      symbolSize: 20,
      symbol: 'diamond',
      itemStyle: {
        color: CATEGORY_CONFIG.working_group.color,
      },
      entityType: 'working_group',
      fullData: wg,
    }),
  );

  const allNodes: StakeholderNetworkNode[] = [
    ...stakeholderNodes,
    ...projectNodes,
    ...workingGroupNodes,
  ];

  const nodeIdSet = new Set(allNodes.map((n) => n.id));

  const links: StakeholderNetworkLink[] = [];

  // Stakeholder-to-stakeholder relationships
  relationshipsData.forEach((rel) => {
    if (nodeIdSet.has(rel.source) && nodeIdSet.has(rel.target)) {
      // Basic type-based weighting, same as EChartsGraphView core idea
      let linkWeight = 1;
      const typeWeights: Record<string, number> = {
        funds: 1.5,
        leads: 1.8,
        delivers: 1.3,
        member: 1.2,
        host: 1.4,
        regulates: 1.1,
        advises: 1.0,
        chair: 1.6,
      };
      linkWeight *= typeWeights[rel.type] || 1.0;

      links.push({
        source: rel.source,
        target: rel.target,
        value: linkWeight,
        lineStyle: {
          color: '#94a3b8',
          width: Math.min(3, linkWeight),
          curveness: 0.2,
          opacity: 0.6,
        },
      });
    }
  });

  // Project-to-stakeholder links
  projectsData.forEach((project) => {
    project.stakeholderIds?.forEach((stakeholderId, index) => {
      if (nodeIdSet.has(stakeholderId)) {
        const isLead = index === 0;
        const linkWeight = isLead ? 2.5 : 1.5;

        links.push({
          source: project.id,
          target: stakeholderId,
          value: linkWeight,
          lineStyle: {
            color: CATEGORY_CONFIG.project.color,
            width: isLead ? 2 : 1,
            type: isLead ? 'solid' : 'dashed',
            opacity: 0.8,
          },
        });
      }
    });
  });

  // Working group-to-stakeholder links
  workingGroupsData.forEach((wg) => {
    wg.memberIds?.forEach((memberId) => {
      if (nodeIdSet.has(memberId)) {
        const linkWeight = 1.3;

        links.push({
          source: wg.id,
          target: memberId,
          value: linkWeight,
          lineStyle: {
            color: CATEGORY_CONFIG.working_group.color,
            width: 1,
            type: 'dotted',
            opacity: 0.6,
          },
        });
      }
    });
  });

  const categories = categoryList.map((name) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

  return { nodes: allNodes, links, categories };
}



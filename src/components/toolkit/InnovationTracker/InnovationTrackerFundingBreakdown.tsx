/**
 * InnovationTrackerFundingBreakdown
 *
 * Reuses the NAVIGATE treemap experience inside the Toolkit.
 * Builds hierarchy from the currently filtered funding data so users
 * always see up-to-date allocations.
 */

'use client';

import { useMemo, useState } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { FundingFlowLink, FundingFlowNode } from '@/data/toolkit/fundingFlows-enhanced';

type BreakdownView = 'category' | 'programme';

interface FundingBreakdownProps {
  nodes: FundingFlowNode[];
  links: FundingFlowLink[];
  onNodeSelect?: (nodeId: string) => void;
}

interface TreemapNode {
  id: string;
  name: string;
  value: number;
  color?: string;
  entityId?: string;
  children?: TreemapNode[];
}

const CATEGORY_LABELS: Record<string, string> = {
  source: 'Funding Sources',
  government: 'Govt Departments',
  intermediary: 'Intermediaries',
  recipient: 'Recipients',
  private: 'Private Sector',
  outcome: 'Programme Outcomes',
};

const CATEGORY_COLORS: Record<string, string> = {
  source: '#006E51',
  government: '#1D4ED8',
  intermediary: '#9333EA',
  recipient: '#F97316',
  private: '#22C55E',
  outcome: '#FACC15',
  default: '#6B7280',
};

const PROGRAMME_TYPE_COLORS: Record<string, string> = {
  grant: '#006E51',
  contract: '#4C1D95',
  partnership: '#F97316',
  other: '#2563EB',
};

export function InnovationTrackerFundingBreakdown({
  nodes,
  links,
  onNodeSelect,
}: FundingBreakdownProps) {
  const [view, setView] = useState<BreakdownView>('category');

  const nodeTotals = useMemo(() => {
    const totals = new Map<string, number>();
    links.forEach(link => {
      totals.set(link.source, (totals.get(link.source) || 0) + link.value);
      totals.set(link.target, (totals.get(link.target) || 0) + link.value);
    });
    return totals;
  }, [links]);

  const categoryHierarchy = useMemo<TreemapNode>(() => {
    const categories = new Map<string, TreemapNode>();

    nodes.forEach(node => {
      const value = nodeTotals.get(node.id) || 0;
      if (value <= 0) return;

      const categoryKey = node.category || 'default';
      if (!categories.has(categoryKey)) {
        categories.set(categoryKey, {
          id: `cat-${categoryKey}`,
          name: CATEGORY_LABELS[categoryKey] || categoryKey,
          value: 0,
          color: CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default,
          children: [],
        });
      }

      const categoryNode = categories.get(categoryKey)!;
      categoryNode.children!.push({
        id: `entity-${node.id}`,
        name: node.name,
        value,
        color: categoryNode.color,
        entityId: node.id,
      });
      categoryNode.value += value;
    });

    const sortedCategories = Array.from(categories.values()).sort((a, b) => b.value - a.value);
    const totalValue = sortedCategories.reduce((sum, cat) => sum + cat.value, 0);
    
    return {
      id: 'funding-breakdown',
      name: 'Funding Breakdown',
      value: totalValue,
      children: sortedCategories,
    };
  }, [nodes, nodeTotals]);

  const programmeHierarchy = useMemo<TreemapNode>(() => {
    const groups = new Map<string, TreemapNode>();

    links.forEach(link => {
      const programmeName = link.programme || `${link.source} → ${link.target}`;
      const type = link.programmeType || 'other';
      const key = `${type}`;
      if (!groups.has(key)) {
        groups.set(key, {
          id: `progtype-${type}`,
          name: type === 'other' ? 'Other Programmes' : `${type.charAt(0).toUpperCase()}${type.slice(1)} Programmes`,
          value: 0,
          color: PROGRAMME_TYPE_COLORS[type] || PROGRAMME_TYPE_COLORS.other,
          children: [],
        });
      }
      const groupNode = groups.get(key)!;

      const childKey = `${programmeName}-${link.target}`;
      const existingChild = groupNode.children!.find(child => child.id === childKey);
      if (existingChild) {
        existingChild.value += link.value;
      } else {
        groupNode.children!.push({
          id: childKey,
          name: programmeName,
          value: link.value,
          color: groupNode.color,
        });
      }
      groupNode.value += link.value;
    });

    const sortedGroups = Array.from(groups.values()).sort((a, b) => b.value - a.value);
    const totalValue = sortedGroups.reduce((sum, group) => sum + group.value, 0);
    
    return {
      id: 'programme-breakdown',
      name: 'Programme Breakdown',
      value: totalValue,
      children: sortedGroups,
    };
  }, [links]);

  const treemapData = view === 'category' ? categoryHierarchy : programmeHierarchy;

  if (!treemapData.children || treemapData.children.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center text-gray-500">
        No funding breakdown data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Funding Breakdown</h3>
          <p className="text-sm text-gray-500">
            {view === 'category' ? 'Entity type contribution' : 'Programme level allocation'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('category')}
            className={`px-3 py-1 text-sm rounded border ${view === 'category' ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-gray-200 text-gray-600'}`}
          >
            By Entity Type
          </button>
          <button
            onClick={() => setView('programme')}
            className={`px-3 py-1 text-sm rounded border ${view === 'programme' ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-gray-200 text-gray-600'}`}
          >
            By Programme
          </button>
        </div>
      </div>

      <div className="w-full h-[600px]">
        <ResponsiveTreeMap
          data={treemapData as any}
          identity="id"
          value="value"
          animate
          motionConfig="gentle"
          nodeOpacity={0.9}
          labelSkipSize={12}
          label={(node) => {
            const name = node.data.name || '';
            return name.length > 18 ? `${name.slice(0, 18)}…` : name;
          }}
          colors={(node) => node.data.color || '#6B7280'}
          borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          tooltip={({ node }) => (
            <div className="bg-white p-3 rounded border shadow">
              <div className="text-sm font-semibold">{node.data.name}</div>
              <div className="text-xs text-gray-500 mt-1">£{node.value?.toFixed(1)}m</div>
            </div>
          )}
          onClick={(node) => {
            if (node.data.entityId && onNodeSelect) {
              onNodeSelect(node.data.entityId);
            }
          }}
        />
      </div>
    </div>
  );
}


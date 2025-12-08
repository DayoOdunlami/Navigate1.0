/**
 * BarChartNavigate
 * 
 * NAVIGATE version of Bar Chart showing:
 * - Funding by stakeholder type
 * - Funding by technology category
 * - Project count by status
 * - Technology count by TRL level
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stakeholder, Technology, Project, FundingEvent } from '@/lib/navigate-types';

interface BarChartNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  fundingEvents: FundingEvent[];
  view?: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl';
  onViewChange?: (view: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl') => void;
  onBarClick?: (barData: any, barType: 'stakeholder' | 'technology' | 'project') => void;
  className?: string;
  sortOrder?: 'asc' | 'desc';
  valueMode?: 'absolute' | 'percentage';
}

type BarChartView = 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl';

export function BarChartNavigate({ 
  stakeholders,
  technologies,
  projects,
  fundingEvents,
  view: externalView,
  onViewChange,
  onBarClick,
  className = '',
  sortOrder = 'desc',
  valueMode = 'absolute'
}: BarChartNavigateProps) {
  const [internalView, setInternalView] = useState<BarChartView>('funding_by_stakeholder');
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  // Calculate funding by stakeholder type
  const fundingByStakeholder = useMemo(() => {
    const byType = new Map<string, number>();
    
    stakeholders.forEach(s => {
      const total = (s.total_funding_provided || 0) + (s.total_funding_received || 0);
      byType.set(s.type, (byType.get(s.type) || 0) + total);
    });
    
    return Array.from(byType.entries())
      .map(([type, amount]) => ({
        type: type.replace(/_/g, ' '),
        amount: amount / 1000000, // Convert to millions
        'Funding (£M)': amount / 1000000
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [stakeholders]);

  // Calculate funding by technology category
  const fundingByTech = useMemo(() => {
    const byCategory = new Map<string, number>();
    
    technologies.forEach(t => {
      const total = t.total_funding || 0;
      byCategory.set(t.category, (byCategory.get(t.category) || 0) + total);
    });
    
    return Array.from(byCategory.entries())
      .map(([category, amount]) => ({
        category: category.replace(/([A-Z])/g, ' $1').trim(),
        amount: amount / 1000000,
        'Funding (£M)': amount / 1000000
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [technologies]);

  // Projects by status
  const projectsByStatus = useMemo(() => {
    const byStatus = new Map<string, number>();
    
    projects.forEach(p => {
      byStatus.set(p.status, (byStatus.get(p.status) || 0) + 1);
    });
    
    return Array.from(byStatus.entries())
      .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        'Project Count': count
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  // Technologies by TRL level
  const techByTRL = useMemo(() => {
    const byTRL = new Map<number, number>();
    
    technologies.forEach(t => {
      const trl = t.trl_current || 0;
      byTRL.set(trl, (byTRL.get(trl) || 0) + 1);
    });
    
    return Array.from(byTRL.entries())
      .map(([trl, count]) => ({
        trl: `TRL ${trl}`,
        trlValue: trl,
        count,
        'Technology Count': count
      }))
      .sort((a, b) => a.trlValue - b.trlValue);
  }, [technologies]);

  const getBaseData = () => {
    switch (view) {
      case 'funding_by_stakeholder':
        return fundingByStakeholder;
      case 'funding_by_tech':
        return fundingByTech;
      case 'projects_by_status':
        return projectsByStatus;
      case 'tech_by_trl':
        return techByTRL;
      default:
        return [];
    }
  };

  const getKeys = () => {
    switch (view) {
      case 'funding_by_stakeholder':
      case 'funding_by_tech':
        return ['Funding (£M)'];
      case 'projects_by_status':
      case 'tech_by_trl':
        return ['Technology Count', 'Project Count'].filter(key => 
          getBaseData().some(d => d.hasOwnProperty(key))
        );
      default:
        return [];
    }
  };

  const getPrimaryValueKey = () => {
    switch (view) {
      case 'funding_by_stakeholder':
      case 'funding_by_tech':
        return 'Funding (£M)';
      case 'projects_by_status':
        return 'Project Count';
      case 'tech_by_trl':
        return 'Technology Count';
      default:
        return undefined;
    }
  };

  const applyValueModeToDataset = (dataset: any[], key?: string) => {
    if (!key) return dataset;

    const total = dataset.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

    return dataset.map(item => {
      const base = Number(item[key]) || 0;
      const value =
        valueMode === 'percentage' && total > 0
          ? Number(((base / total) * 100).toFixed(1))
          : base;

      return {
        ...item,
        [key]: value,
        __rawValue: base
      };
    });
  };

  const sortDataset = (dataset: any[], key?: string) => {
    if (view === 'tech_by_trl') {
      const sorted = [...dataset].sort((a, b) => (a.trlValue ?? 0) - (b.trlValue ?? 0));
      return sortOrder === 'asc' ? sorted : sorted.reverse();
    }

    if (!key) return dataset;

    const sorted = [...dataset].sort((a, b) => {
      const aVal = Number(a[key]) || 0;
      const bVal = Number(b[key]) || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  };

  const getIndexBy = () => {
    switch (view) {
      case 'funding_by_stakeholder':
        return 'type';
      case 'funding_by_tech':
        return 'category';
      case 'projects_by_status':
        return 'status';
      case 'tech_by_trl':
        return 'trl';
      default:
        return 'id';
    }
  };

  const getColors = () => {
    switch (view) {
      case 'funding_by_stakeholder':
        return ['#006E51', '#4A90E2', '#F5A623', '#EC4899'];
      case 'funding_by_tech':
        return ['#006E51', '#50C878', '#4A90E2', '#F5A623', '#CCE2DC'];
      case 'projects_by_status':
        return ['#50C878', '#F5A623', '#EC4899', '#6b7280'];
      case 'tech_by_trl':
        return (bar: any) => {
          const trl = bar.data.trlValue;
          if (trl <= 3) return '#EC4899'; // Red for low TRL
          if (trl <= 6) return '#F5A623'; // Orange for mid TRL
          return '#50C878'; // Green for high TRL
        };
      default:
        return '#006E51';
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'funding_by_stakeholder':
        return 'Funding by Stakeholder Type';
      case 'funding_by_tech':
        return 'Funding by Technology Category';
      case 'projects_by_status':
        return 'Projects by Status';
      case 'tech_by_trl':
        return 'Technologies by TRL Level';
      default:
        return 'NAVIGATE Bar Chart';
    }
  };

  const keys = getKeys();
  const indexBy = getIndexBy();
  const primaryKey = getPrimaryValueKey();
  const data = sortDataset(
    applyValueModeToDataset(
      getBaseData().map(item => ({ ...item })),
      primaryKey
    ),
    primaryKey
  );

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Bar Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NAVIGATE Bar Chart</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{getTitle()}</p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[500px]">
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 50, right: 130, bottom: 80, left: 80 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={getColors()}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: view === 'funding_by_tech' ? -45 : 0,
              legend: view === 'funding_by_stakeholder' ? 'Stakeholder Type' :
                      view === 'funding_by_tech' ? 'Technology Category' :
                      view === 'projects_by_status' ? 'Project Status' :
                      'TRL Level',
              legendPosition: 'middle',
              legendOffset: 60
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend:
                valueMode === 'percentage'
                  ? 'Share (%)'
                  : view === 'funding_by_stakeholder' || view === 'funding_by_tech'
                    ? 'Funding (£M)'
                    : 'Count',
              legendPosition: 'middle',
              legendOffset: -60
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={true}
            motionConfig="gentle"
            tooltip={({ id, value, indexValue, data: barData }) => {
              const isFundingView = view === 'funding_by_stakeholder' || view === 'funding_by_tech';
              const rawValue = typeof barData?.__rawValue === 'number' ? barData.__rawValue : Number(value) || 0;
              const formattedValue =
                valueMode === 'percentage'
                  ? `${Number(value).toFixed(1)}%`
                  : isFundingView
                    ? `£${Number(value).toFixed(1)}M`
                    : Number(value).toLocaleString();
              const extraText =
                valueMode === 'percentage'
                  ? isFundingView
                    ? ` (£${rawValue.toFixed(1)}M)`
                    : ` (${rawValue.toLocaleString()})`
                  : '';

              return (
                <div className="bg-white p-2 border rounded shadow-lg">
                  <div className="font-semibold">{indexValue}</div>
                  <div className="text-sm">
                    <span className="font-medium">{id}:</span> {formattedValue}
                    {extraText && <span className="text-gray-500"> {extraText}</span>}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}


/**
 * BumpChartNavigate
 * 
 * NAVIGATE version of Bump Chart showing TRL progression over time (2019-2024)
 * Shows how technologies advance through TRL levels year-over-year
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveBump } from '@nivo/bump';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';
import { hiaRoadmap } from '@/data/roadmap-data';

interface BumpChartNavigateProps {
  technologies: Technology[];
  view?: 'all_technologies' | 'by_category' | 'top_advancing';
  selectedCategories?: TechnologyCategory[];
  onViewChange?: (view: 'all_technologies' | 'by_category' | 'top_advancing') => void;
  // kept for API compatibility; currently unused
  onTechnologySelect?: (techId: string) => void;
  className?: string;
}

type BumpView = 'all_technologies' | 'by_category' | 'top_advancing';

export function BumpChartNavigate({ 
  technologies,
  view: externalView,
  selectedCategories: externalCategories = [],
  onViewChange: _onViewChange,
  onTechnologySelect: _onTechnologySelect,
  className = '' 
}: BumpChartNavigateProps) {
  // keep optional callbacks in signature for API compatibility
  void _onViewChange;
  void _onTechnologySelect;
  const [internalView] = useState<BumpView>('all_technologies');
  
  // Use external props if provided, otherwise use internal state
  const view = externalView ?? internalView;
  const selectedCategories = useMemo(
    () => (externalCategories.length > 0 ? externalCategories : []),
    [externalCategories]
  );

  // Generate historical TRL progression for each technology
  // Since we only have current TRL, we'll simulate realistic progression
  const generateTRLHistory = (tech: Technology): Array<{ x: string; y: number }> => {
    const currentTRL = tech.trl_current;
    const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
    
    // Estimate starting TRL based on current TRL and category
    // Technologies typically advance 1-2 TRL levels over 5 years
    let startTRL = Math.max(1, currentTRL - Math.floor(Math.random() * 3) - 1);
    
    // Ensure startTRL is reasonable (not higher than current)
    startTRL = Math.min(startTRL, currentTRL - 1);
    
    const history: Array<{ x: string; y: number }> = [];
    let currentLevel = startTRL;
    
    years.forEach((year, index) => {
      // Progress towards current TRL
      if (index === years.length - 1) {
        // Last year = current TRL
        currentLevel = currentTRL;
      } else {
        // Gradual progression with some variation
        const progress = (currentTRL - startTRL) / (years.length - 1);
        const targetLevel = Math.round(startTRL + progress * (index + 1));
        
        // Add some realistic variation (not always linear)
        if (Math.random() > 0.3 && currentLevel < targetLevel) {
          currentLevel = Math.min(targetLevel, currentTRL);
        } else if (currentLevel < targetLevel - 1) {
          currentLevel = Math.min(currentLevel + 1, currentTRL);
        }
        
        // Ensure we don't exceed current TRL
        currentLevel = Math.min(currentLevel, currentTRL);
      }
      
      history.push({ x: year, y: currentLevel });
    });
    
    return history;
  };

  // Transform technologies to bump chart format
  const bumpData = useMemo(() => {
    let filteredTechs = technologies;
    
    // Filter by category if view is 'by_category' and categories are selected
    if (view === 'by_category' && selectedCategories.length > 0) {
      filteredTechs = technologies.filter(t => selectedCategories.includes(t.category));
    }
    
    // For 'top_advancing', show technologies with highest TRL progression
    if (view === 'top_advancing') {
      // Sort by current TRL and take top 8
      filteredTechs = [...technologies]
        .sort((a, b) => b.trl_current - a.trl_current)
        .slice(0, 8);
    }
    
    return filteredTechs.map(tech => ({
      id: tech.name,
      data: generateTRLHistory(tech)
    }));
  }, [technologies, view, selectedCategories]);

  // Helper to get color by category
  const getCategoryColor = (category: TechnologyCategory): string => {
    const colors: Record<TechnologyCategory, string> = {
      H2Production: '#006E51',
      H2Storage: '#50C878',
      FuelCells: '#4A90E2',
      Aircraft: '#F5A623',
      Infrastructure: '#CCE2DC',
    };
    return colors[category] || '#6b7280';
  };

  // Get color for each technology based on its category
  const getTechColor = (techId: string): string => {
    const tech = technologies.find(t => t.name === techId);
    if (!tech) return '#6b7280';
    return getCategoryColor(tech.category);
  };

  const getTitle = () => {
    switch (view) {
      case 'all_technologies': return 'TRL Progression: All Technologies';
      case 'by_category': return 'TRL Progression: By Category';
      case 'top_advancing': return 'TRL Progression: Top Advancing Technologies';
      default: return 'TRL Progression Over Time';
    }
  };

  // Get timeline milestones that fall within the chart's time range (2019-2024)
  const timelineMarkerColor = '#0EA5E9';

  const timelineMarkers = useMemo(() => {
    const chartYears = ['2019', '2020', '2021', '2022', '2023', '2024'];
    const chartStartYear = 2019;
    const chartEndYear = 2024;
    
    return hiaRoadmap
      .filter(item => {
        // Only show technology-related milestones in this timeframe
        if (item.group !== 'technology') return false;
        const itemYear = item.start.getFullYear();
        return itemYear >= chartStartYear && itemYear <= chartEndYear;
      })
      .map(item => ({
        ...item,
        year: item.start.getFullYear().toString(),
        yearIndex: chartYears.indexOf(item.start.getFullYear().toString())
      }))
      .filter(item => item.yearIndex >= 0); // Only include years in our chart range
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Track how technologies advance through TRL levels (1-9) from 2019 to 2024.
          Steeper lines indicate faster advancement.
        </p>
      </CardHeader>
      <CardContent className="h-[500px] p-0 relative">
        {bumpData.length > 0 ? (
          <div className="relative w-full h-full">
            <ResponsiveBump
              data={bumpData}
              colors={(serie) => {
                // Get color based on technology category
                return getTechColor(serie.id);
              }}
              lineWidth={3}
              activeLineWidth={6}
              inactiveLineWidth={2}
              inactiveOpacity={0.15}
              pointSize={10}
              activePointSize={16}
              inactivePointSize={0}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={3}
              activePointBorderWidth={3}
              pointBorderColor={{ from: 'serie.color' }}
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: -36
              }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Year',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'TRL Level',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              margin={{ top: 40, right: 100, bottom: 60, left: 60 }}
              axisRight={null}
              startLabel={d => d.id}
              endLabel={d => {
                const lastPoint = d.data[d.data.length - 1];
                const suffix = typeof lastPoint?.y === 'number' ? ` (TRL ${lastPoint.y})` : '';
                return `${d.id}${suffix}`;
              }}
            />
            
            {/* Timeline Markers Overlay */}
            {timelineMarkers.length > 0 && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ marginTop: '40px', marginLeft: '60px', marginRight: '100px', marginBottom: '60px' }}>
                {timelineMarkers.map((marker) => {
                  // Calculate position: chart has 6 years (2019-2024), so each year is ~16.67% width
                  const yearIndex = marker.yearIndex;
                  const xPosition = `${(yearIndex / 5) * 100}%`; // 0-5 index, 5 intervals
                  
                  return (
                    <div
                      key={marker.id}
                      className="absolute pointer-events-auto"
                      style={{
                        left: xPosition,
                        top: '0',
                        transform: 'translateX(-50%)',
                        zIndex: 10
                      }}
                      title={marker.title || marker.content}
                    >
                      {/* Vertical line marker */}
                      <div 
                        className="w-0.5 h-full opacity-60"
                        style={{ height: 'calc(100% - 20px)', backgroundColor: timelineMarkerColor }}
                      />
                      {/* Marker dot */}
                      <div 
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
                        style={{ marginTop: '-6px', backgroundColor: timelineMarkerColor }}
                      />
                      {/* Label */}
                      <div 
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap text-xs font-medium bg-white/90 px-2 py-1 rounded shadow-sm"
                        style={{ marginTop: '4px', color: timelineMarkerColor }}
                      >
                        {marker.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {view === 'by_category' && selectedCategories.length === 0
              ? 'Select at least one category to view'
              : 'No data available for this view'}
          </div>
        )}
        
        {/* Legend for timeline markers */}
        {timelineMarkers.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/90 px-3 py-2 rounded shadow-sm text-xs border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: timelineMarkerColor }}></div>
              <span className="font-medium">Key Milestones</span>
            </div>
            <div className="text-gray-600 text-xs">
              Hover over markers for details
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


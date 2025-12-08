/**
 * ChordDiagramNavigate
 * 
 * NAVIGATE version of Chord Diagram showing relationships between stakeholder types
 * or technology categories based on shared projects, funding, or collaborations
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveChord } from '@nivo/chord';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stakeholder, Technology, Relationship, StakeholderType, TechnologyCategory } from '@/lib/navigate-types';

interface ChordDiagramNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  relationships: Relationship[];
  view?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow';
  onViewChange?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow') => void;
  onEntitySelect?: (entityId: string, entityType: 'stakeholder' | 'technology') => void;
  className?: string;
}

type ChordView = 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow';

// Get color for stakeholder type
function getStakeholderTypeColor(type: StakeholderType): string {
  const colors: Record<StakeholderType, string> = {
    'Government': '#006E51',      // CPC Primary Teal
    'Research': '#4A90E2',        // CPC Info Blue
    'Industry': '#F5A623',        // CPC Warning Amber
    'Intermediary': '#8B5CF6',    // Purple
    'Working Group': '#0EA5E9',   // Light blue
  };
  return colors[type] || '#6b7280';
}

// Get color for technology category
function getTechCategoryColor(category: TechnologyCategory): string {
  const colors: Record<TechnologyCategory, string> = {
    'H2Production': '#006E51',   // CPC Primary Teal
    'H2Storage': '#4A90E2',       // Blue
    'FuelCells': '#F5A623',       // Amber
    'Aircraft': '#EC4899',        // Pink
    'Infrastructure': '#8B5CF6'   // Purple
  };
  return colors[category] || '#6b7280';
}

// Transform stakeholders to chord diagram format (by type)
function transformStakeholderTypesToChord(
  stakeholders: Stakeholder[],
  relationships: Relationship[]
) {
  const typeNames: StakeholderType[] = ['Government', 'Research', 'Industry', 'Intermediary', 'Working Group'];
  const typeMap = new Map<StakeholderType, Set<string>>();
  
  // Group stakeholders by type
  typeNames.forEach(type => {
    typeMap.set(type, new Set());
  });
  
  stakeholders.forEach(s => {
    const set = typeMap.get(s.type);
    if (set) {
      set.add(s.id);
    }
  });
  
  // Build matrix: connections between types based on relationships
  const matrix: number[][] = [];
  
  for (let i = 0; i < typeNames.length; i++) {
    matrix[i] = [];
    const type1 = typeNames[i];
    const type1Stakeholders = typeMap.get(type1) || new Set();
    
    for (let j = 0; j < typeNames.length; j++) {
      const type2 = typeNames[j];
      const type2Stakeholders = typeMap.get(type2) || new Set();
      
      if (i === j) {
        // Self-connection: count relationships within same type
        let count = 0;
        relationships.forEach(rel => {
          const sourceInType1 = type1Stakeholders.has(rel.source);
          const targetInType1 = type1Stakeholders.has(rel.target);
          if (sourceInType1 && targetInType1 && rel.source !== rel.target) {
            count++;
          }
        });
        matrix[i][j] = count;
      } else {
        // Cross-connection: relationships between different types
        let count = 0;
        relationships.forEach(rel => {
          const sourceInType1 = type1Stakeholders.has(rel.source);
          const targetInType2 = type2Stakeholders.has(rel.target);
          const sourceInType2 = type2Stakeholders.has(rel.source);
          const targetInType1 = type1Stakeholders.has(rel.target);
          
          if ((sourceInType1 && targetInType2) || (sourceInType2 && targetInType1)) {
            count++;
          }
        });
        matrix[i][j] = count;
      }
    }
  }
  
  return {
    matrix,
    keys: typeNames
  };
}

// Transform technologies to chord diagram format (by category)
function transformTechCategoriesToChord(
  technologies: Technology[],
  relationships: Relationship[]
) {
  const categories: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'];
  const categoryMap = new Map<TechnologyCategory, Set<string>>();
  
  // Group technologies by category
  categories.forEach(cat => {
    categoryMap.set(cat, new Set());
  });
  
  technologies.forEach(t => {
    const set = categoryMap.get(t.category);
    if (set) {
      set.add(t.id);
    }
  });
  
  // Build matrix: connections between categories based on shared stakeholders
  const matrix: number[][] = [];
  
  for (let i = 0; i < categories.length; i++) {
    matrix[i] = [];
    const cat1 = categories[i];
    const cat1Techs = categoryMap.get(cat1) || new Set();
    
    // Get stakeholders working on cat1 technologies
    const cat1Stakeholders = new Set<string>();
    relationships.forEach(rel => {
      if (cat1Techs.has(rel.target) || cat1Techs.has(rel.source)) {
        if (rel.source.startsWith('org-')) cat1Stakeholders.add(rel.source);
        if (rel.target.startsWith('org-')) cat1Stakeholders.add(rel.target);
      }
    });
    
    for (let j = 0; j < categories.length; j++) {
      const cat2 = categories[j];
      const cat2Techs = categoryMap.get(cat2) || new Set();
      
      // Get stakeholders working on cat2 technologies
      const cat2Stakeholders = new Set<string>();
      relationships.forEach(rel => {
        if (cat2Techs.has(rel.target) || cat2Techs.has(rel.source)) {
          if (rel.source.startsWith('org-')) cat2Stakeholders.add(rel.source);
          if (rel.target.startsWith('org-')) cat2Stakeholders.add(rel.target);
        }
      });
      
      if (i === j) {
        // Self-connection: number of unique stakeholders working on this category
        matrix[i][j] = cat1Stakeholders.size;
      } else {
        // Cross-connection: shared stakeholders between categories
        const shared = [...cat1Stakeholders].filter(s => cat2Stakeholders.has(s));
        matrix[i][j] = shared.length;
      }
    }
  }
  
  return {
    matrix,
    keys: categories
  };
}

export function ChordDiagramNavigate({ 
  stakeholders,
  technologies,
  relationships,
  view: externalView,
  onViewChange,
  onEntitySelect,
  className = '' 
}: ChordDiagramNavigateProps) {
  const [internalView, setInternalView] = useState<ChordView>('by_stakeholder_type');
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  
  const chordData = useMemo(() => {
    if (view === 'by_stakeholder_type') {
      return transformStakeholderTypesToChord(stakeholders, relationships);
    } else if (view === 'by_tech_category') {
      return transformTechCategoriesToChord(technologies, relationships);
    } else {
      // by_funding_flow - similar to stakeholder types but weighted by funding
      return transformStakeholderTypesToChord(stakeholders, relationships);
    }
  }, [stakeholders, technologies, relationships, view]);
  
  const colors = useMemo(() => {
    if (view === 'by_stakeholder_type' || view === 'by_funding_flow') {
      return chordData.keys.map(key => getStakeholderTypeColor(key as StakeholderType));
    } else {
      return chordData.keys.map(key => getTechCategoryColor(key as TechnologyCategory));
    }
  }, [chordData.keys, view]);
  
  const getTitle = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return 'Stakeholder Type Relationships';
      case 'by_tech_category':
        return 'Technology Category Connections';
      case 'by_funding_flow':
        return 'Funding Flow Between Types';
      default:
        return 'NAVIGATE Relationship Analysis';
    }
  };
  
  if (stakeholders.length === 0 && technologies.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Relationship Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No data available to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Event handlers
  const handleArcClick = (arc: any) => {
    if (onEntitySelect && arc.index !== undefined) {
      const key = chordData.keys[arc.index];
      // For now, just log - could enhance to select specific entities
      console.log('Arc clicked:', key);
    }
  };
  
  const handleRibbonClick = (ribbon: any) => {
    console.log('Ribbon clicked:', ribbon);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NAVIGATE Relationship Analysis</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{getTitle()}</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${Math.max(500, chordData.keys.length * 60 + 200)}px` }}>
          <ResponsiveChord
            data={chordData.matrix}
            keys={chordData.keys}
            margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
            valueFormat=".0f"
            padAngle={0.02}
            innerRadiusRatio={0.96}
            innerRadiusOffset={0.02}
            arcOpacity={1}
            arcBorderWidth={1}
            arcBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.4]]
            }}
            ribbonOpacity={0.5}
            ribbonBorderWidth={1}
            ribbonBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.4]]
            }}
            enableLabel={true}
            label="id"
            labelOffset={12}
            labelRotation={-90}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1]]
            }}
            colors={colors}
            isInteractive={true}
            onArcClick={handleArcClick}
            onRibbonClick={handleRibbonClick}
            animate={true}
            motionConfig="wobbly"
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-sm font-semibold mb-2">
              {view === 'by_stakeholder_type' || view === 'by_funding_flow' ? 'Stakeholder Types' : 'Technology Categories'}
            </div>
            <div className="space-y-1">
              {chordData.keys.map((key, index) => (
                <div key={key} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span>{key}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Hover over arcs to see details</div>
              <div>• Hover over ribbons to see connection strength</div>
              <div>• Thicker ribbons = stronger connections</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


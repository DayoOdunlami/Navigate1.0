/**
 * CirclePackingNavigate
 * 
 * NAVIGATE version of Circle Packing showing hierarchical stakeholder relationships
 * Hierarchical: Stakeholder Type → Organization → Technologies/Projects
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stakeholder, Technology, Project, FundingEvent, Relationship } from '@/lib/navigate-types';

interface CirclePackingNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  fundingEvents: FundingEvent[];
  relationships: Relationship[];
  view?: HierarchyView;
  onViewChange?: (view: HierarchyView) => void;
  onNodeClick?: (nodeId: string, entityType?: 'stakeholder' | 'technology' | 'project' | 'funding', data?: unknown) => void;
  className?: string;
}

type HierarchyView = 'by_stakeholder_type' | 'by_technology_category' | 'by_funding';

// Custom labels layer with callouts
const CustomLabelsLayer = ({ nodes, labelTextColor }: any) => {
  return (
    <g>
      {nodes
        .filter((node: any) => node.depth <= 2 && node.radius >= 10)
        .map((node: any) => {
          const label = node.data?.name || node.id || '';
          const radius = node.radius || 0;
          const estimatedTextWidth = label.length * 6;
          const labelFits = radius * 2 > estimatedTextWidth;
          const color = node.color || '#333';
          
          if (!labelFits) {
            // Calculate angle from center to position label outside
            const parentX = node.parent?.x || 0;
            const parentY = node.parent?.y || 0;
            const angle = Math.atan2(node.y - parentY, node.x - parentX);
            const labelX = node.x + (radius + 15) * Math.cos(angle);
            const labelY = node.y + (radius + 15) * Math.sin(angle);
            
            return (
              <g key={node.id || node.data?.id || `node-${node.x}-${node.y}`}>
                {/* Leader line (dashed) */}
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={labelX}
                  y2={labelY}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  opacity={0.4}
                />
                {/* Label text outside */}
                <text
                  x={labelX}
                  y={labelY}
                  fontSize={11}
                  fill={color}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {label.length > 25 ? label.substring(0, 25) + '...' : label}
                </text>
              </g>
            );
          }
          
          // Label fits - render below circle (offset)
          return (
            <text
              key={node.id || node.data?.id || `node-${node.x}-${node.y}`}
              x={node.x}
              y={node.y + radius + 12}
              fontSize={11}
              fill={color}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: 'none' }}
            >
              {label.length > 20 ? label.substring(0, 20) + '...' : label}
            </text>
          );
        })}
    </g>
  );
};

export function CirclePackingNavigate({ 
  stakeholders,
  technologies,
  projects,
  fundingEvents,
  relationships,
  view: externalView,
  onViewChange,
  onNodeClick,
  className = '' 
}: CirclePackingNavigateProps) {
  const [internalView, setInternalView] = useState<HierarchyView>('by_stakeholder_type');
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  
  // Zoom state for click-to-zoom functionality
  const [zoomedNode, setZoomedNode] = useState<any>(null);
  const [zoomPath, setZoomPath] = useState<string[]>([]);
  
  // Reset zoom when view changes
  useEffect(() => {
    setZoomedNode(null);
    setZoomPath([]);
  }, [view]);

  // Build hierarchy by stakeholder type
  const hierarchyByStakeholderType = useMemo(() => {
    const byType = new Map<string, Stakeholder[]>();
    
    stakeholders.forEach(s => {
      if (!byType.has(s.type)) {
        byType.set(s.type, []);
      }
      byType.get(s.type)!.push(s);
    });

    const children = Array.from(byType.entries()).map(([type, orgs]) => ({
      id: `type-${type}`,
      name: type,
      value: orgs.reduce((sum, o) => sum + (o.total_funding_provided || 0) + (o.total_funding_received || 0), 0),
      children: orgs.map((org, orgIdx) => ({
        id: `org-${org.id}-${orgIdx}`,
        name: org.name,
        value: (org.total_funding_provided || 0) + (org.total_funding_received || 0),
        // Add technologies this org works on
        children: technologies
          .filter(t => {
            // Find relationships or funding events linking org to tech
            return fundingEvents.some(f => 
              (f.source_id === org.id && f.technologies_supported?.includes(t.id)) ||
              relationships.some(r => 
                (r.source === org.id && r.target === t.id && r.type === 'advances') ||
                (r.target === org.id && r.source === t.id && r.type === 'researches')
              )
            );
          })
          .slice(0, 5) // Limit to 5 per org
          .map((tech, techIdx) => ({
            id: `tech-${tech.id}-${org.id}-${techIdx}`, // Unique ID per occurrence
            name: tech.name,
            value: tech.total_funding || 100000
          }))
      }))
    }));

    return {
      id: 'root-ecosystem',
      name: 'NAVIGATE Ecosystem',
      children
    };
  }, [stakeholders, technologies, fundingEvents, relationships]);

  // Build hierarchy by technology category
  const hierarchyByTechCategory = useMemo(() => {
    const byCategory = new Map<string, Technology[]>();
    
    technologies.forEach(t => {
      if (!byCategory.has(t.category)) {
        byCategory.set(t.category, []);
      }
      byCategory.get(t.category)!.push(t);
    });

    const children = Array.from(byCategory.entries()).map(([category, techs]) => ({
      id: `category-${category}`,
      name: category.replace(/([A-Z])/g, ' $1').trim(),
      value: techs.reduce((sum, t) => sum + (t.total_funding || 0), 0),
      children: techs.map((tech, techIdx) => ({
        id: `tech-${tech.id}-${techIdx}`,
        name: tech.name,
        value: tech.total_funding || 100000,
        // Add stakeholders working on this tech
        children: stakeholders
          .filter(s => {
            return fundingEvents.some(f => 
              (f.source_id === s.id && f.technologies_supported?.includes(tech.id)) ||
              relationships.some(r => 
                (r.source === s.id && r.target === tech.id && r.type === 'advances') ||
                (r.target === s.id && r.source === tech.id && r.type === 'researches')
              )
            );
          })
          .slice(0, 5) // Limit to 5 per tech
          .map((stakeholder, stakeIdx) => ({
            id: `stakeholder-${stakeholder.id}-${tech.id}-${stakeIdx}`,
            name: stakeholder.name,
            value: (stakeholder.total_funding_provided || 0) + (stakeholder.total_funding_received || 0)
          }))
      }))
    }));

    return {
      id: 'root-technologies',
      name: 'NAVIGATE Technologies',
      children
    };
  }, [technologies, stakeholders, fundingEvents, relationships]);

  // Build hierarchy by funding
  const hierarchyByFunding = useMemo(() => {
    const byType = new Map<string, FundingEvent[]>();
    
    fundingEvents.forEach(f => {
      if (!byType.has(f.funding_type)) {
        byType.set(f.funding_type, []);
      }
      byType.get(f.funding_type)!.push(f);
    });

    const children = Array.from(byType.entries()).map(([type, events]) => ({
      id: `funding-type-${type}`,
      name: type,
      value: events.reduce((sum, e) => sum + e.amount, 0),
      children: events.slice(0, 10).map((event, eventIdx) => {
        const recipient = stakeholders.find(s => s.id === event.recipient_id) ||
                         technologies.find(t => t.id === event.recipient_id);
        return {
          id: `funding-${event.id}-${eventIdx}`,
          name: recipient?.name || event.program,
          value: event.amount
        };
      })
    }));

    return {
      id: 'root-funding',
      name: 'NAVIGATE Funding',
      children
    };
  }, [fundingEvents, stakeholders, technologies]);

  const getData = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return hierarchyByStakeholderType;
      case 'by_technology_category':
        return hierarchyByTechCategory;
      case 'by_funding':
        return hierarchyByFunding;
      default:
        return hierarchyByStakeholderType;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return 'Hierarchy by Stakeholder Type';
      case 'by_technology_category':
        return 'Hierarchy by Technology Category';
      case 'by_funding':
        return 'Hierarchy by Funding Type';
      default:
        return 'NAVIGATE Circle Packing';
    }
  };

  // Format value for display (e.g., "£68M" instead of "£68.0M")
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      const millions = value / 1000000;
      return millions % 1 === 0 ? `£${millions.toFixed(0)}M` : `£${millions.toFixed(1)}M`;
    } else if (value >= 1000) {
      const thousands = value / 1000;
      return thousands % 1 === 0 ? `£${thousands.toFixed(0)}K` : `£${thousands.toFixed(1)}K`;
    }
    return `£${value.toFixed(0)}`;
  };

  // Handle click to zoom and entity selection
  const handleNodeClick = (node: any) => {
    // Nivo passes node with id and data properties
    const nodeId = node.id || node.data?.name || node.name;
    const nodeName = node.data?.name || node.name || nodeId;
    const nodeData = node.data || node;
    
    // Call onNodeClick if provided (for entity selection in Insights Panel)
    if (onNodeClick) {
      // Determine node type from ID pattern
      let nodeType: 'stakeholder' | 'technology' | 'project' | 'funding' = 'stakeholder';
      
      if (typeof nodeId === 'string') {
        if (nodeId.startsWith('org-') || nodeId.startsWith('type-')) {
          nodeType = 'stakeholder';
          // Extract actual org ID if it's in format "org-{id}-{idx}"
          const orgIdMatch = nodeId.match(/^org-([^-]+)/);
          if (orgIdMatch) {
            const orgId = orgIdMatch[1];
            const stakeholder = stakeholders.find(s => s.id === orgId);
            if (stakeholder) {
              onNodeClick(orgId, 'stakeholder', stakeholder);
            } else {
              onNodeClick(nodeId, 'stakeholder', nodeData);
            }
          } else {
            onNodeClick(nodeId, 'stakeholder', nodeData);
          }
        } else if (nodeId.startsWith('tech-') || nodeId.startsWith('category-')) {
          nodeType = 'technology';
          // Extract actual tech ID if it's in format "tech-{id}-{parentId}-{idx}"
          const techIdMatch = nodeId.match(/^tech-([^-]+)/);
          if (techIdMatch) {
            const techId = techIdMatch[1];
            const tech = technologies.find(t => t.id === techId);
            if (tech) {
              onNodeClick(techId, 'technology', tech);
            } else {
              onNodeClick(nodeId, 'technology', nodeData);
            }
          } else {
            onNodeClick(nodeId, 'technology', nodeData);
          }
        } else if (nodeId.startsWith('proj-')) {
          nodeType = 'project';
          const project = projects.find(p => p.id === nodeId);
          if (project) {
            onNodeClick(nodeId, 'project', project);
          } else {
            onNodeClick(nodeId, 'project', nodeData);
          }
        } else if (nodeId.startsWith('fund-')) {
          nodeType = 'funding';
          const funding = fundingEvents.find(f => f.id === nodeId);
          if (funding) {
            onNodeClick(nodeId, 'funding', funding);
          } else {
            onNodeClick(nodeId, 'funding', nodeData);
          }
        } else {
          // Fallback: try to determine from data
          onNodeClick(nodeId, nodeType, nodeData);
        }
      }
    }
    
    // Handle zoom functionality
    if (zoomedNode && (zoomedNode.id === nodeId || zoomedNode.name === nodeName)) {
      // Clicking the same node resets zoom
      setZoomedNode(null);
      setZoomPath([]);
    } else {
      // Zoom into clicked node
      const newNode = {
        id: nodeId,
        name: nodeName,
        data: nodeData
      };
      setZoomedNode(newNode);
      setZoomPath(prev => [...prev, nodeName]);
    }
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomedNode(null);
    setZoomPath([]);
  };

  // Get data - if zoomed, show only the zoomed node's children
  const getDisplayData = () => {
    const baseData = getData();
    if (!zoomedNode) return baseData;
    
    // Find the zoomed node in the hierarchy
    const findNode = (node: any, targetId: string, targetName: string): any => {
      if ((node.id === targetId || node.name === targetId) || 
          (node.name === targetName || node.id === targetName)) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId, targetName);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundNode = findNode(baseData, zoomedNode.id, zoomedNode.name);
    if (foundNode && foundNode.children && foundNode.children.length > 0) {
      // Return the found node as root (so its children are displayed)
      return foundNode;
    }
    return baseData;
  };

  const data = getDisplayData();

  if (!data.children || data.children.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Circle Packing</CardTitle>
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

  // Color scheme based on view
  const getColors = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return ['#006E51', '#4A90E2', '#F5A623', '#EC4899', '#8B5CF6'];
      case 'by_technology_category':
        return ['#006E51', '#50C878', '#4A90E2', '#F5A623', '#CCE2DC'];
      case 'by_funding':
        return ['#006E51', '#F5A623', '#4A90E2'];
      default:
        return ['#006E51'];
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Circle Packing</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{getTitle()}</p>
          </div>
          {zoomedNode && (
            <button
              onClick={handleResetZoom}
              className="text-xs px-3 py-1 bg-[#006E51] text-white rounded hover:bg-[#005A42] transition-colors"
            >
              Reset Zoom
            </button>
          )}
        </div>
        
        {/* Breadcrumb Navigation */}
        {zoomPath.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Path:</span>
            <button
              onClick={handleResetZoom}
              className="text-[#006E51] hover:underline"
            >
              Root
            </button>
            {zoomPath.map((pathItem, idx) => (
              <React.Fragment key={idx}>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{pathItem}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px]">
          <ResponsiveCirclePacking
            data={data}
            id="id"
            value="value"
            valueFormat=".2s"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            padding={8}
            colors={getColors()}
            colorBy="depth"
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            enableLabels={false}
            layers={['circles', CustomLabelsLayer]}
            animate={true}
            motionConfig="gentle"
            onClick={handleNodeClick}
            tooltip={({ id, value, depth }) => (
              <div className="bg-white p-2 border rounded shadow-lg">
                <div className="font-semibold">{id}</div>
                <div className="text-sm">
                  Value: {formatValue(typeof value === 'number' ? value : 0)}
                </div>
                <div className="text-xs text-gray-500">Depth: {depth}</div>
                {depth > 0 && (
                  <div className="text-xs text-[#006E51] mt-1">Click to zoom in</div>
                )}
              </div>
            )}
          />
        </div>

        {/* Explanation */}
        <div className="mt-4 p-4 bg-[#CCE2DC]/20 rounded-lg">
          <h4 className="text-sm font-medium text-[#006E51] mb-2">How to Read</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Circle size = Value (funding amount)</li>
            <li>• Nested circles = Hierarchy (parent contains children)</li>
            <li>• Click to zoom into a level</li>
            <li>• Hover for details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}


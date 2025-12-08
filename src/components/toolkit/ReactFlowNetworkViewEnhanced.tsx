'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  addEdge,
  MarkerType,
  NodeTypes,
  BackgroundVariant,
  ReactFlowProvider,
  Handle,
  Position,
  EdgeTypes,
  NodeToolbar,
  BaseEdge,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings, Save, RotateCcw, Search, X, Filter, Download, Upload, Trash2, ZoomIn, Users, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stakeholdersData } from '@/data/toolkit/stakeholders';
import { relationshipsData } from '@/data/toolkit/relationships';
import { ToolkitStakeholder } from '@/data/toolkit/types';

const STORAGE_KEY = 'reactflow-network-enhanced';

// Custom Stakeholder Node Component with Toolbar
function StakeholderNode({ data, selected }: { data: any; selected?: boolean }) {
  const isFocused = data?.isFocused;
  const active = selected || isFocused;

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
          <Button size="sm" variant="outline" onClick={() => console.log('View details:', data.id)}>
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => console.log('Highlight connections:', data.id)}>
            Connections
          </Button>
        </div>
      </NodeToolbar>
      <div
        className={`
          px-3 py-2 rounded-lg bg-white border-2 shadow-sm text-xs font-semibold text-center min-w-[80px] cursor-pointer
          transition-all duration-200
          ${active ? 'border-[#EF4444] border-4 shadow-lg scale-110 z-50' : 'border-gray-300 hover:border-[#006E51]'}
        `}
        style={{ borderColor: active ? '#EF4444' : data.color }}
        onClick={() => {
          if (data?.onClickNode && data.id) {
            data.onClickNode(data.id);
          }
        }}
      >
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <div className="font-medium" style={{ color: data.color }}>
          {data.label}
        </div>
        {data.category && (
          <div className="text-[10px] text-gray-500 mt-1">{data.category}</div>
        )}
        {data.connectionCount !== undefined && (
          <div className="text-[10px] text-blue-600 mt-1">{data.connectionCount} links</div>
        )}
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      </div>
    </>
  );
}

// Custom Edge with Label
function CustomEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, label } = props;
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          className="react-flow__edge-text"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '10px', fill: '#666' }}
        >
          {label}
        </text>
      )}
    </>
  );
}

// Background Venn-style circle node
function VennCircleNode({ data }: { data: any }) {
  const { label, color, showEdges, toggleEdges } = data;

  return (
    <div
      className="flex items-center justify-center rounded-full shadow-inner cursor-pointer border-2 border-dashed"
      style={{
        width: 380,
        height: 380,
        backgroundColor: color,
        opacity: 0.18,
        borderColor: color,
      }}
      onClick={toggleEdges}
      title="Click to show/hide arrows"
    >
      <div
        className="px-3 py-1 rounded-full text-sm font-semibold bg-white/80 border"
        style={{ borderColor: color, color }}
      >
        {label} {showEdges ? '(arrows on)' : '(arrows off)'}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  stakeholder: StakeholderNode,
  vennCircle: VennCircleNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Inner component that uses React Flow hooks
function NetworkFlowContentEnhanced({
  onSave,
  allowConnections,
  setAllowConnections,
  searchQuery,
  selectedCategory,
}: {
  onSave: (nodes: Node[], edges: Edge[]) => void;
  allowConnections: boolean;
  setAllowConnections: (value: boolean) => void;
  searchQuery: string;
  selectedCategory: string | null;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getNodes, getEdges, deleteElements } = useReactFlow();
  const [showEdges, setShowEdges] = useState(true);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length > 0) {
          setNodes(parsed.nodes);
        }
        if (parsed.edges && parsed.edges.length > 0) {
          setEdges(parsed.edges);
        }
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, [setNodes, setEdges]);

  // Calculate connection counts
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach(edge => {
      counts[edge.source] = (counts[edge.source] || 0) + 1;
      counts[edge.target] = (counts[edge.target] || 0) + 1;
    });
    return counts;
  }, [edges]);

  // Initialize nodes from stakeholders
  useEffect(() => {
    if (nodes.length === 0) {
      const categoryColors: Record<string, string> = {
        government: '#006E51',
        academia: '#50C878',
        industry: '#F5A623',
        intermediary: '#8b5cf6',
      };

      const initialNodes: Node[] = [];

      // Add three large background Venn circles as React Flow nodes
      initialNodes.push(
        {
          id: 'circle-government',
          type: 'vennCircle',
          position: { x: 0, y: -50 },
          draggable: true,
          selectable: false,
          data: {
            label: 'Governmental body',
            color: categoryColors.government,
            showEdges,
            toggleEdges: () => {
              setFocusedNodeId(null);
              setShowEdges((prev) => !prev);
            },
          },
        },
        {
          id: 'circle-academia',
          type: 'vennCircle',
          position: { x: 420, y: -60 },
          draggable: true,
          selectable: false,
          data: {
            label: 'Academia / Research institutions',
            color: categoryColors.academia,
            showEdges,
            toggleEdges: () => {
              setFocusedNodeId(null);
              setShowEdges((prev) => !prev);
            },
          },
        },
        {
          id: 'circle-industry',
          type: 'vennCircle',
          position: { x: 210, y: 260 },
          draggable: true,
          selectable: false,
          data: {
            label: 'Industry',
            color: categoryColors.industry,
            showEdges,
            toggleEdges: () => {
              setFocusedNodeId(null);
              setShowEdges((prev) => !prev);
            },
          },
        }
      );

      // Position stakeholders roughly within circles based on category
      const governmentPositions = [
        { x: 140, y: 40 },
        { x: 220, y: 20 },
        { x: 260, y: 80 },
        { x: 180, y: 100 },
        { x: 80, y: 100 },
      ];
      const academiaPositions = [
        { x: 520, y: 20 },
        { x: 600, y: 40 },
        { x: 680, y: 20 },
        { x: 620, y: 90 },
      ];
      const industryPositions = [
        { x: 380, y: 320 },
        { x: 460, y: 360 },
        { x: 540, y: 320 },
      ];
      const overlapGovAcad = [{ x: 340, y: 40 }]; // UKRI/EPSRC
      const overlapAcadInd = [{ x: 460, y: 220 }]; // ATI

      const govIndex = { value: 0 };
      const acadIndex = { value: 0 };
      const indIndex = { value: 0 };

      const takePosition = (positions: { x: number; y: number }[], indexRef: { value: number }) => {
        const pos = positions[indexRef.value % positions.length];
        indexRef.value += 1;
        return pos;
      };

      stakeholdersData.forEach((stakeholder) => {
        let position;
        if (stakeholder.id === 'ukri' || stakeholder.id === 'epsrc') {
          position = overlapGovAcad[0];
        } else if (stakeholder.id === 'ati') {
          position = overlapAcadInd[0];
        } else if (stakeholder.category === 'government') {
          position = takePosition(governmentPositions, govIndex);
        } else if (stakeholder.category === 'academia') {
          position = takePosition(academiaPositions, acadIndex);
        } else if (stakeholder.category === 'industry') {
          position = takePosition(industryPositions, indIndex);
        } else {
          // intermediaries and others in the central overlap
          position = { x: 340 + Math.random() * 80, y: 160 + Math.random() * 60 };
        }

        initialNodes.push({
          id: stakeholder.id,
          type: 'stakeholder',
          position,
          data: {
            id: stakeholder.id,
            label: stakeholder.shortName || stakeholder.name.split(' ')[0],
            category: stakeholder.category,
            color: categoryColors[stakeholder.category] || '#6b7280',
            fullName: stakeholder.name,
            connectionCount: connectionCounts[stakeholder.id] || 0,
            isFocused: focusedNodeId === stakeholder.id,
            onClickNode: (id: string) => {
              setFocusedNodeId((prev) => (prev === id ? null : id));
            },
          },
        });
      });

      setNodes(initialNodes);
    }
  }, [nodes.length, setNodes, connectionCounts, showEdges, focusedNodeId]);

  // Update connection counts in nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          connectionCount: connectionCounts[node.id] || 0,
        },
      }))
    );
  }, [connectionCounts, setNodes]);

  // Initialize edges from relationships
  useEffect(() => {
    if (edges.length === 0) {
      const initialEdges: Edge[] = relationshipsData
        .filter(r => {
          const sourceExists = stakeholdersData.some(s => s.id === r.source);
          const targetExists = stakeholdersData.some(s => s.id === r.target);
          return sourceExists && targetExists;
        })
        .slice(0, 30) // Show more connections
        .map((rel, idx) => ({
          id: `edge-${rel.source}-${rel.target}-${idx}`,
          source: rel.source,
          target: rel.target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#EF4444', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#EF4444',
          },
          label: rel.type || 'related',
          labelStyle: { fill: '#666', fontSize: '10px' },
        }));
      setEdges(initialEdges);
    }
  }, [edges.length, setEdges]);

  // Filter nodes by search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setNodes((nds) =>
        nds.map((node) => {
          const matches =
            node.data.fullName?.toLowerCase().includes(query) ||
            node.data.label?.toLowerCase().includes(query) ||
            node.data.category?.toLowerCase().includes(query);
          return {
            ...node,
            hidden: !matches,
            style: {
              ...node.style,
              opacity: matches ? 1 : 0.2,
            },
          };
        })
      );
    } else {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          hidden: false,
          style: {
            ...node.style,
            opacity: 1,
          },
        }))
      );
    }
  }, [searchQuery, setNodes]);

  // Filter nodes by category
  useEffect(() => {
    if (selectedCategory) {
      setNodes((nds) =>
        nds.map((node) => {
          const matches = node.data.category === selectedCategory;
          return {
            ...node,
            hidden: !matches,
            style: {
              ...node.style,
              opacity: matches ? 1 : 0.2,
            },
          };
        })
      );
    } else {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          hidden: false,
          style: {
            ...node.style,
            opacity: 1,
          },
        }))
      );
    }
  }, [selectedCategory, setNodes]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (allowConnections) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#EF4444', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#EF4444',
              },
            },
            eds
          )
        );
      }
    },
    [allowConnections, setEdges]
  );

  // Auto-save when nodes/edges change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0) {
        onSave(nodes, edges);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = getNodes().filter(n => n.selected);
        const selectedEdges = getEdges().filter(e => e.selected);
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          deleteElements({ nodes: selectedNodes, edges: selectedEdges });
        }
      }
      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fitView({ padding: 0.2 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, getEdges, deleteElements, setNodes, fitView]);

  // Context menu handler (can be extended with custom context menu component)
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // Could show a custom context menu here
    // For now, just log - can be extended with a custom menu component
    console.log('Context menu for:', node.id);
  }, []);

  const visibleEdges = useMemo(() => {
    if (focusedNodeId) {
      return edges.filter((e) => e.source === focusedNodeId || e.target === focusedNodeId);
    }
    if (showEdges) return edges;
    return [];
  }, [edges, focusedNodeId, showEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={visibleEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeContextMenu={onNodeContextMenu}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      connectionMode="loose"
      defaultEdgeOptions={{
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#EF4444', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#EF4444',
        },
      }}
      nodesDraggable={true}
      nodesConnectable={allowConnections}
      elementsSelectable={true}
      selectNodesOnDrag={false}
      multiSelectionKeyCode={['Meta', 'Control']}
      deleteKeyCode={['Delete', 'Backspace']}
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          return node.data?.color || '#6b7280';
        }}
        maskColor="rgba(0, 0, 0, 0.1)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

export function ReactFlowNetworkViewEnhanced() {
  const [allowConnections, setAllowConnections] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  // Save config
  const saveConfig = useCallback((nodes: Node[], edges: Edge[]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes,
        edges,
      })
    );
  }, []);

  // Export layout
  const exportLayout = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const blob = new Blob([saved], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reactflow-network-layout.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  // Import layout
  const importLayout = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            localStorage.setItem(STORAGE_KEY, content);
            window.location.reload();
          } catch (err) {
            console.error('Failed to import layout:', err);
            alert('Failed to import layout. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  // Reset config
  const resetConfig = useCallback(() => {
    if (confirm('Reset all positions and connections?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(stakeholdersData.map(s => s.category));
    return Array.from(cats);
  }, []);

  const stats = useMemo(() => {
    return {
      total: stakeholdersData.length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = stakeholdersData.filter(s => s.category === cat).length;
        return acc;
      }, {} as Record<string, number>),
      connections: relationshipsData.length,
    };
  }, [categories]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#006E51]">Stakeholder Network (Enhanced)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Interactive network with search, filtering, grouping, and keyboard shortcuts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStats(!showStats)}>
              <Network className="w-4 h-4 mr-2" />
              {showStats ? 'Hide' : 'Show'} Stats
            </Button>
            <Button variant="outline" onClick={exportLayout}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={importLayout}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={resetConfig}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Search Stakeholders</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="category">Filter by Category</Label>
            <select
              id="category"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Button
            variant={allowConnections ? 'default' : 'outline'}
            onClick={() => setAllowConnections(!allowConnections)}
          >
            {allowConnections ? 'Disable' : 'Enable'} Manual Connections
          </Button>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Stakeholders</div>
                  <div className="text-2xl font-bold text-[#006E51]">{stats.total}</div>
                </div>
                {categories.map(cat => (
                  <div key={cat}>
                    <div className="text-sm text-gray-600">{cat}</div>
                    <div className="text-2xl font-bold" style={{ color: cat === 'government' ? '#006E51' : cat === 'academia' ? '#50C878' : '#F5A623' }}>
                      {stats.byCategory[cat]}
                    </div>
                  </div>
                ))}
                <div>
                  <div className="text-sm text-gray-600">Connections</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.connections}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* React Flow Diagram */}
      <div className="relative bg-gray-50 rounded-lg border border-gray-200" style={{ height: '700px' }}>
        <ReactFlowProvider>
          <NetworkFlowContentEnhanced
            onSave={saveConfig}
            allowConnections={allowConnections}
            setAllowConnections={setAllowConnections}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        </ReactFlowProvider>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Keyboard Shortcuts:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><kbd className="px-1 py-0.5 bg-white rounded border">Delete</kbd> or <kbd className="px-1 py-0.5 bg-white rounded border">Backspace</kbd> - Delete selected nodes/edges</li>
            <li><kbd className="px-1 py-0.5 bg-white rounded border">Ctrl/Cmd + A</kbd> - Select all nodes</li>
            <li><kbd className="px-1 py-0.5 bg-white rounded border">Ctrl/Cmd + F</kbd> - Fit view</li>
            <li><kbd className="px-1 py-0.5 bg-white rounded border">Ctrl/Cmd + Click</kbd> - Multi-select nodes</li>
          </ul>
          <p className="mt-2"><strong>Interactions:</strong> Drag nodes to reposition. Right-click nodes for context menu. Use minimap to navigate. Search and filter to find specific stakeholders.</p>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  MarkerType,
  NodeTypes,
  BackgroundVariant,
  ReactFlowProvider,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { stakeholdersData } from '@/data/toolkit/stakeholders';
import { relationshipsData } from '@/data/toolkit/relationships';
import { ToolkitStakeholder } from '@/data/toolkit/types';

const STORAGE_KEY = 'reactflow-network-config';

// Custom Stakeholder Node Component
function StakeholderNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div
      className={`
        px-3 py-2 rounded-lg bg-white border-2 shadow-sm text-xs font-semibold text-center min-w-[80px]
        transition-all duration-200
        ${selected ? 'border-[#EF4444] border-4 shadow-lg scale-110' : 'border-gray-300 hover:border-[#006E51]'}
      `}
      style={{ borderColor: selected ? '#EF4444' : data.color }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div className="font-medium" style={{ color: data.color }}>
        {data.label}
      </div>
      {data.category && (
        <div className="text-[10px] text-gray-500 mt-1">{data.category}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  stakeholder: StakeholderNode,
};

// Inner component that uses React Flow hooks
function NetworkFlowContent({
  onSave,
  allowConnections,
  setAllowConnections,
}: {
  onSave: (nodes: Node[], edges: Edge[]) => void;
  allowConnections: boolean;
  setAllowConnections: (value: boolean) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

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

  // Initialize nodes from stakeholders
  useEffect(() => {
    if (nodes.length === 0) {
      const categoryColors: Record<string, string> = {
        government: '#006E51',
        academia: '#50C878',
        industry: '#F5A623',
        intermediary: '#8b5cf6',
      };

      // Simple grid layout for initial positioning
      const cols = Math.ceil(Math.sqrt(stakeholdersData.length));
      const nodeWidth = 100;
      const nodeHeight = 80;
      const spacing = 150;

      const initialNodes: Node[] = stakeholdersData.map((stakeholder, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        
        return {
          id: stakeholder.id,
          type: 'stakeholder',
          position: {
            x: col * spacing + 50,
            y: row * spacing + 50,
          },
          data: {
            label: stakeholder.shortName || stakeholder.name.split(' ')[0],
            category: stakeholder.category,
            color: categoryColors[stakeholder.category] || '#6b7280',
            fullName: stakeholder.name,
          },
        };
      });
      setNodes(initialNodes);
    }
  }, [nodes.length, setNodes]);

  // Initialize edges from relationships
  useEffect(() => {
    if (edges.length === 0) {
      const initialEdges: Edge[] = relationshipsData
        .filter(r => {
          const sourceExists = stakeholdersData.some(s => s.id === r.source);
          const targetExists = stakeholdersData.some(s => s.id === r.target);
          return sourceExists && targetExists;
        })
        .slice(0, 20) // Limit to 20 for clarity
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
        }));
      setEdges(initialEdges);
    }
  }, [edges.length, setEdges]);

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
    }, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
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

export function ReactFlowNetworkView() {
  const [allowConnections, setAllowConnections] = useState(false);

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

  // Reset config
  const resetConfig = useCallback(() => {
    if (confirm('Reset all positions and connections?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }, []);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#006E51]">Stakeholder Network</h2>
          <p className="text-sm text-gray-600 mt-1">
            Interactive network graph with drag-and-drop nodes and automatic connections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetConfig}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant={allowConnections ? 'default' : 'outline'}
            onClick={() => setAllowConnections(!allowConnections)}
          >
            {allowConnections ? 'Disable' : 'Enable'} Manual Connections
          </Button>
        </div>
      </div>

      {/* React Flow Diagram */}
      <div className="relative bg-gray-50 rounded-lg border border-gray-200" style={{ height: '700px' }}>
        <ReactFlowProvider>
          <NetworkFlowContent
            onSave={saveConfig}
            allowConnections={allowConnections}
            setAllowConnections={setAllowConnections}
          />
        </ReactFlowProvider>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong> Drag nodes to reposition them. Use the minimap (bottom-right) to navigate.
          Zoom with mouse wheel, pan by dragging the background. Positions are auto-saved.
          {allowConnections && ' Drag from one node to another to create new connections.'}
        </p>
      </div>
    </div>
  );
}


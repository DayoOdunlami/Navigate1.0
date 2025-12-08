'use client';

import { useMemo, useState } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { circlePackingData, CirclePackingNode } from '@/data/toolkit/circlePackingData';

type NivoNode = {
  id: string;
  name: string;
  value: number;
  color?: string;
  data: CirclePackingNode;
  children?: NivoNode[];
};

const toNivoNode = (node: CirclePackingNode): NivoNode => {
  const id = node.id || node.name;
  const children = node.children?.map((child) => toNivoNode(child));
  return {
    id,
    name: node.name,
    value: node.size ?? Math.max(children?.reduce((sum, c) => sum + c.value, 0) || 1, 1),
    color: node.color,
    data: node,
    children,
  };
};

const nivoData = toNivoNode(circlePackingData);

const INFO_FIELDS: { label: string; key: keyof CirclePackingNode }[] = [
  { label: 'Description', key: 'description' },
  { label: 'Funding Role', key: 'funding_role' },
  { label: 'Funding Amount', key: 'funding_amount' },
  { label: 'Funding Received', key: 'funding_received' },
  { label: 'Status', key: 'status' },
  { label: 'TRL', key: 'trl' },
  { label: 'Lead', key: 'lead' },
  { label: 'Target Date', key: 'target_date' },
  { label: 'Output', key: 'output' },
];

export function CirclePackingStakeholderNivoView() {
  const [selectedNode, setSelectedNode] = useState<CirclePackingNode | null>(null);

  const colorsByType = useMemo(
    () => ({
      government: '#1a5f7a',
      intermediary: '#2d8f6f',
      academia: '#7b2cbf',
      project: '#f4a261',
      industry: '#e76f51',
      working_group: '#264653',
    }),
    []
  );

  const getColor = (node: CirclePackingNode) => {
    if (node.color) return node.color;
    if (node.type && colorsByType[node.type as keyof typeof colorsByType]) {
      return colorsByType[node.type as keyof typeof colorsByType];
    }
    return '#64748b';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-h-[500px] bg-white rounded-xl shadow border border-slate-200">
          <ResponsiveCirclePacking
            data={nivoData}
            id="id"
            value="value"
            colors={(node) => {
              const nivoNode = node?.data as NivoNode | undefined;
              if (!nivoNode) {
                return '#94a3b8';
              }
              return getColor(nivoNode.data);
            }}
            padding={6}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            enableLabels={false}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            onClick={(node) => {
              const nivoNode = node?.data as NivoNode | undefined;
              if (nivoNode?.data) {
                setSelectedNode(nivoNode.data);
              }
            }}
            tooltip={(datum) => {
              const nivoNode = datum?.data as NivoNode | undefined;
              if (!nivoNode) {
                return <div className="bg-white p-2 rounded border shadow min-w-[180px]"></div>;
              }
              const data = nivoNode.data;
              return (
                <div className="bg-white p-2 rounded border shadow min-w-[180px]">
                  <div className="text-xs uppercase text-slate-400">{data.type || 'cluster'}</div>
                  <div className="text-sm font-semibold text-slate-900">{data.name}</div>
                  {data.description && <div className="text-xs text-slate-600 mt-1">{data.description}</div>}
                </div>
              );
            }}
            layers={[
              'circles',
              ({ nodes }) => {
                const labelSkipRadius = 20; // Minimum radius to show label
                return (
                  <g>
                    {nodes
                      .filter((node) => node.data && node.data.children && node.radius > labelSkipRadius)
                      .map((node) => (
                        <text
                          key={node.id}
                          x={node.x}
                          y={node.y + node.radius + 12}
                          textAnchor="middle"
                          style={{
                            fill: node.color as string,
                            fontSize: 11,
                            fontWeight: 600,
                            pointerEvents: 'none',
                          }}
                        >
                          {node.data.name}
                        </text>
                      ))}
                  </g>
                );
              },
            ]}
          />
        </div>
        <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{selectedNode.type || 'entity'}</div>
                <div className="text-lg font-semibold text-slate-900">{selectedNode.name}</div>
              </div>
              {INFO_FIELDS.map(({ label, key }) => {
                const value = selectedNode[key];
                if (!value) return null;
                // Convert value to string for rendering
                const displayValue = Array.isArray(value) 
                  ? value.join(', ') 
                  : typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value);
                return (
                  <div key={key as string}>
                    <div className="text-xs font-medium text-slate-500">{label}</div>
                    <div className="text-sm text-slate-900">{displayValue}</div>
                  </div>
                );
              })}
              {selectedNode.capabilities && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Capabilities</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedNode.connections && selectedNode.connections.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Connections</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.connections.map((connection) => (
                      <span key={connection} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                        {connection.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Click any bubble to view its description, connections, or capabilities. Use zoom gestures (scroll/pinch) to explore
              smaller nodes.
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Interaction Tips</h3>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
          <li>Zoom in/out with your mouse wheel or trackpad.</li>
          <li>Click a circle to highlight it and see metadata on the right.</li>
          <li>Colors represent entity types (Government, Industry, Projects, etc.).</li>
          <li>Use the Nivo toolbar (top-left) to reset zoom or center the view.</li>
        </ul>
      </div>
    </div>
  );
}


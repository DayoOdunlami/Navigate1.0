'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import {
  buildStakeholderNetwork,
  StakeholderNetworkNode,
  StakeholderNetworkLink,
} from '@/lib/toolkit/stakeholderNetworkGraph';

type LayoutMode = 'organic' | 'grouped';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NetworkGraphD3Props {
  // Kept for future extensibility; not used for building links anymore
}

export function NetworkGraphD3({}: NetworkGraphD3Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('organic');
  const [repulsion, setRepulsion] = useState(-150);
  const [edgeLength, setEdgeLength] = useState(80);

  const { nodes, links } = useMemo(() => buildStakeholderNetwork(), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = 600;

    // Clear previous svg
    d3.select(containerRef.current).selectAll('*').remove();

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f9fafb');

    const zoomLayer = svg.append('g');

    const link = zoomLayer
      .append('g')
      .attr('stroke', '#cbd5f5')
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(
        links as unknown as (StakeholderNetworkLink &
          d3.SimulationLinkDatum<d3.SimulationNodeDatum>)[],
      )
      .enter()
      .append('line')
      .attr('stroke-width', (d) => 1 + (d.value || 0) * 2);

    const node = zoomLayer
      .append('g')
      .selectAll('circle')
      .data(nodes as unknown as (StakeholderNetworkNode & d3.SimulationNodeDatum)[])
      .enter()
      .append('circle')
      .attr('r', (d: any) => (d.symbolSize || 20) / 2)
      .attr('fill', (d: any) => d.itemStyle?.color || '#6b7280')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2)
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      )
      // Click currently just highlights in-place; can be wired to external state later
      .on('click', () => {})
      .append('title')
      .text((d: any) => d.title);

    const simulation = d3.forceSimulation(nodes as any);

    simulation
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance((d: any) =>
            layoutMode === 'organic'
              ? edgeLength + (1 - (d.value || 0)) * edgeLength
              : edgeLength * 0.6 + (1 - (d.value || 0)) * edgeLength,
          ),
      )
      .force('charge', d3.forceManyBody().strength(repulsion))
      .force('collision', d3.forceCollide().radius(26));

    if (layoutMode === 'grouped') {
      // Cluster by stakeholder category colour / group key
      const groupKey = (d: any) => {
        if (d.entityType === 'stakeholder') {
          return d.fullData?.category || 'other';
        }
        return d.entityType;
      };

      const keys = Array.from(
        new Set(
          (nodes as any[]).map((d) => groupKey(d)),
        ),
      );

      // Push groups further apart so coloured clusters are clearly separated
      const radius = Math.min(width, height) * 0.35;
      const centers: Record<string, { x: number; y: number }> = {};
      keys.forEach((key, i) => {
        const angle = (2 * Math.PI * i) / Math.max(keys.length, 1);
        centers[key] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
        };
      });

      simulation
        .force(
          'x',
          d3
            .forceX((d: any) => {
              const key = groupKey(d);
              return centers[key]?.x ?? width / 2;
            })
            .strength(0.25),
        )
        .force(
          'y',
          d3
            .forceY((d: any) => {
              const key = groupKey(d);
              return centers[key]?.y ?? height / 2;
            })
            .strength(0.25),
        );
    } else {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      zoomLayer
        .selectAll('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        zoomLayer.attr('transform', event.transform.toString());
      });

    svg.call(zoom as any);

    return () => {
      simulation.stop();
    };
  }, [nodes, links, layoutMode, repulsion, edgeLength]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-medium">Layout:</span>
          <div className="inline-flex rounded-md bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('organic')}
              className={`px-2 py-1 rounded ${
                layoutMode === 'organic'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600'
              }`}
            >
              Organic
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grouped')}
              className={`px-2 py-1 rounded ${
                layoutMode === 'grouped'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600'
              }`}
            >
              Grouped
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Repulsion</span>
          <input
            type="range"
            min={-400}
            max={-50}
            step={10}
            value={repulsion}
            onChange={(e) => setRepulsion(Number(e.target.value))}
          />
          <span className="w-12 text-right">{repulsion}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Edge length</span>
          <input
            type="range"
            min={30}
            max={200}
            step={10}
            value={edgeLength}
            onChange={(e) => setEdgeLength(Number(e.target.value))}
          />
          <span className="w-10 text-right">{edgeLength}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-xl shadow border border-slate-200 w-full h-[600px] overflow-hidden"
      />
    </div>
  );
}

export default NetworkGraphD3;



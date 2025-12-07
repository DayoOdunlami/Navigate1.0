/**
 * InnovationTrackerFundingInsights
 *
 * ECharts hybrid scatter + aggregate bar inspired by the
 * scatter-aggregate-bar example: https://echarts.apache.org/examples/en/editor.html?c=scatter-aggregate-bar
 * Shows programme-level allocations (scatter) alongside aggregated totals
 * by programme type, using the currently filtered funding links.
 */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FundingFlowLink } from '@/data/toolkit/fundingFlows-enhanced';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface FundingInsightsProps {
  links: FundingFlowLink[];
  onLinkSelect?: (link: FundingFlowLink) => void;
}

interface ScatterDatum {
  programme: string;
  type: string;
  value: number;
  rawLink: FundingFlowLink;
}

export function InnovationTrackerFundingInsights({ links, onLinkSelect }: FundingInsightsProps) {
  const [chartMode, setChartMode] = useState<'scatter' | 'bar'>('scatter');
  const chartRef = useRef<any>(null);

  const scatterData = useMemo<ScatterDatum[]>(() => {
    return links.map(link => ({
      programme: link.programme || `${link.source} → ${link.target}`,
      type: link.programmeType || 'other',
      value: link.value,
      rawLink: link,
    }));
  }, [links]);

  const typeTotals = useMemo(() => {
    const totals = new Map<string, { sum: number; count: number }>();
    scatterData.forEach(item => {
      if (!totals.has(item.type)) {
        totals.set(item.type, { sum: 0, count: 0 });
      }
      const record = totals.get(item.type)!;
      record.sum += item.value;
      record.count += 1;
    });
    return Array.from(totals.entries()).map(([type, stats]) => ({
      type,
      value: stats.count > 0 ? stats.sum / stats.count : 0,
    }));
  }, [scatterData]);

  const uniqueProgrammes = useMemo(
    () => Array.from(new Set(scatterData.map(item => item.programme))),
    [scatterData]
  );

  const groupedScatter = useMemo(() => {
    const map = new Map<string, ScatterDatum[]>();
    scatterData.forEach(item => {
      if (!map.has(item.type)) {
        map.set(item.type, []);
      }
      map.get(item.type)!.push(item);
    });
    return Array.from(map.entries());
  }, [scatterData]);

  useEffect(() => {
    const chartInstance = chartRef.current?.getEchartsInstance?.();
    if (!chartInstance) {
      return;
    }
    const zr = chartInstance.getZr();
    const handleBackgroundClick = (event: any) => {
      if (!event.target) {
        setChartMode(prev => (prev === 'scatter' ? 'bar' : 'scatter'));
      }
    };
    zr.on('click', handleBackgroundClick);
    return () => {
      zr.off('click', handleBackgroundClick);
    };
  }, [chartMode]);

  const scatterSeriesKeys = useMemo(
    () => groupedScatter.map(([type]) => `scatter-${type}`),
    [groupedScatter]
  );

  const scatterOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const datum = params.data?.datum as ScatterDatum | undefined;
          if (datum) {
            return `
              <div style="padding:8px">
                <div style="font-weight:600">${datum.programme}</div>
                <div style="font-size:12px;color:#6B7280">Type: ${datum.type}</div>
                <div style="margin-top:4px;color:#006E51">£${datum.value.toFixed(1)}m</div>
              </div>
            `;
          }
          return '';
        },
      },
      xAxis: {
        type: 'category',
        data: uniqueProgrammes,
        axisLabel: { rotate: 40, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: '£ millions',
        axisLabel: { formatter: (val: number) => `£${val}` },
      },
      series: groupedScatter.map(([type, data]) => ({
        name: type,
        type: 'scatter',
        id: `scatter-${type}`,
        dataGroupId: type,
        universalTransition: {
          enabled: true,
          delay: () => Math.random() * 400,
        },
        symbolSize: (val: number[]) => Math.sqrt(val[1]) * 3 + 8,
        data: data.map(item => ({
          value: [item.programme, item.value],
          datum: item,
        })),
      })),
    };
  }, [groupedScatter, uniqueProgrammes]);

  const barOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="padding:8px">
              <div style="font-weight:600">${params.name}</div>
              <div style="color:#006E51">£${params.value.toFixed(1)}m avg allocation</div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: typeTotals.map(item => item.type),
      },
      yAxis: {
        type: 'value',
        name: '£ millions',
        axisLabel: { formatter: (val: number) => `£${val}` },
      },
      series: [
        {
          type: 'bar',
          id: 'bar-total',
          data: typeTotals.map(item => ({
            name: item.type,
            value: item.value,
            groupId: item.type,
          })),
          itemStyle: { color: '#F97316' },
          universalTransition: {
            enabled: true,
            seriesKey: scatterSeriesKeys,
            delay: () => Math.random() * 400,
          },
        },
      ],
    };
  }, [scatterSeriesKeys, typeTotals]);

  const handleEvents = {
    click: (params: any) => {
      if (chartMode === 'scatter' && typeof params.dataIndex === 'number') {
        const datum = params.data?.datum as ScatterDatum | undefined;
        if (datum && onLinkSelect) {
          onLinkSelect(datum.rawLink);
        }
      }
    },
  };

  const currentOption = chartMode === 'scatter' ? scatterOption : barOption;

  if (scatterData.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center text-gray-500">
        No programme data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Programme Investment Mix</h3>
          <span className="text-xs uppercase tracking-wide text-[#006E51]">
            {chartMode === 'scatter' ? 'Programme Scatter' : 'Type Breakdown'}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Click empty canvas space to toggle between programme-level scatter points and programme-type bar breakdown (ECharts universal transition).
        </p>
      </div>
      <div className="w-full h-[600px]">
        <ReactECharts
          ref={chartRef}
          option={currentOption}
          style={{ width: '100%', height: '100%' }}
          onEvents={handleEvents}
          notMerge={false}
        />
      </div>
    </div>
  );
}


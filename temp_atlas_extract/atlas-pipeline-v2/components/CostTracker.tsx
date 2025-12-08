// ============================================================================
// COST TRACKING WIDGET - Shows AI usage costs
// ============================================================================
// Copy to: src/components/atlas/CostTracker.tsx

'use client';

import { useState, useEffect } from 'react';

interface CostEntry {
  id: string;
  timestamp: string;
  cost: number;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  operation?: string;
}

interface CostSummary {
  totalCost: number;
  totalCalls: number;
  totalTokens: number;
  averageCostPerCall: number;
  provider: string;
  model: string;
}

interface CostByOperation {
  [operation: string]: {
    cost: number;
    calls: number;
  };
}

interface CostTrackerProps {
  refreshInterval?: number;  // ms, default 5000
  showHistory?: boolean;
  compact?: boolean;
}

export function CostTracker({ 
  refreshInterval = 5000, 
  showHistory = true,
  compact = false 
}: CostTrackerProps) {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [history, setHistory] = useState<CostEntry[]>([]);
  const [byOperation, setByOperation] = useState<CostByOperation>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchCostData = async () => {
    try {
      const res = await fetch('/api/atlas/costs');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setHistory(data.history || []);
        setByOperation(data.byOperation || {});
      }
    } catch (err) {
      console.error('Failed to fetch cost data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
    const interval = setInterval(fetchCostData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${(cost * 100).toFixed(2)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens > 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (!summary) return null;

  // Compact version - just shows total cost
  if (compact) {
    return (
      <div 
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200"
        onClick={() => setExpanded(!expanded)}
        title="Click for details"
      >
        <span className="text-gray-500">💰</span>
        <span className="font-mono font-medium">{formatCost(summary.totalCost)}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">{summary.totalCalls} calls</span>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="p-4 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-sm text-gray-500">AI Usage Cost</div>
              <div className="text-2xl font-bold font-mono">{formatCost(summary.totalCost)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Provider</div>
            <div className="font-medium">{summary.provider} / {summary.model.split('-').slice(-2).join('-')}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{summary.totalCalls}</div>
          <div className="text-xs text-gray-500">API Calls</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{formatTokens(summary.totalTokens)}</div>
          <div className="text-xs text-gray-500">Tokens</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{formatCost(summary.averageCostPerCall)}</div>
          <div className="text-xs text-gray-500">Avg/Call</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <>
          {/* Cost by Operation */}
          {Object.keys(byOperation).length > 0 && (
            <div className="p-4 border-b">
              <div className="text-sm font-medium text-gray-700 mb-2">Cost by Operation</div>
              <div className="space-y-2">
                {Object.entries(byOperation).map(([op, data]) => (
                  <div key={op} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {op}
                      </span>
                      <span className="text-sm text-gray-500">{data.calls} calls</span>
                    </div>
                    <span className="font-mono text-sm">{formatCost(data.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent History */}
          {showHistory && history.length > 0 && (
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Recent Activity</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(-10).reverse().map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      {entry.operation && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                          {entry.operation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {formatTokens(entry.inputTokens + entry.outputTokens)} tok
                      </span>
                      <span className="font-mono">{formatCost(entry.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 text-sm text-gray-500 hover:bg-gray-50 border-t"
      >
        {expanded ? '▲ Less' : '▼ More'}
      </button>
    </div>
  );
}

// ============================================================================
// MINI COST BADGE - For inline use
// ============================================================================

interface CostBadgeProps {
  cost: number;
  tokens?: number;
}

export function CostBadge({ cost, tokens }: CostBadgeProps) {
  const formatCost = (c: number) => {
    if (c < 0.001) return '<$0.001';
    if (c < 0.01) return `$${(c * 100).toFixed(1)}¢`;
    return `$${c.toFixed(3)}`;
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-mono">
      {formatCost(cost)}
      {tokens && <span className="text-green-500">({tokens} tok)</span>}
    </span>
  );
}

// ============================================================================
// SESSION COST SUMMARY - For end of extraction
// ============================================================================

interface SessionCostProps {
  stages: { stage: string; cost: number; duration: number }[];
  totalCost: number;
  totalDuration: number;
}

export function SessionCostSummary({ stages, totalCost, totalDuration }: SessionCostProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-gray-700">Extraction Cost</span>
        <span className="text-xl font-bold font-mono text-green-700">
          ${totalCost.toFixed(4)}
        </span>
      </div>
      
      <div className="space-y-1">
        {stages.map((s) => (
          <div key={s.stage} className="flex justify-between text-sm">
            <span className="text-gray-600">{s.stage}</span>
            <div className="flex gap-4">
              <span className="text-gray-400">{s.duration}ms</span>
              <span className="font-mono text-gray-700">${s.cost.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-green-200 text-xs text-gray-500">
        Total time: {(totalDuration / 1000).toFixed(1)}s
      </div>
    </div>
  );
}

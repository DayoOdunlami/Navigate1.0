'use client';

import { useState, useEffect } from 'react';
import type { ScanHistoryEntry } from '@/lib/atlas/store';

export function HistoryPanel() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/atlas/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Scan History</h2>
        <div className="text-sm text-gray-600">
          {history.length} total scans
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">URLs</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Challenges</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.urls.length} URL(s)
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDuration(entry.duration)}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  ${entry.cost.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.challengesExtracted}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(entry.status)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    {selectedEntry === entry.id ? 'Hide' : 'View'} Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {history.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No scan history yet. Start extracting to see history here.
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {selectedEntry && (
        <div className="bg-white border rounded-lg p-6">
          {(() => {
            const entry = history.find(e => e.id === selectedEntry);
            if (!entry) return null;
            return (
              <div className="space-y-4">
                <h3 className="font-bold">Scan Details</h3>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">URLs Processed:</div>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {entry.urls.map((url, i) => (
                      <li key={i} className="truncate">{url}</li>
                    ))}
                  </ul>
                </div>
                {entry.errors && entry.errors.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-red-700 mb-2">Errors:</div>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {entry.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Challenge IDs:</div>
                  <div className="text-xs text-gray-600 font-mono">
                    {entry.challengeIds.join(', ')}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}


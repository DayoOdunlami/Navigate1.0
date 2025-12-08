'use client';

import { useState, useEffect } from 'react';
import type { AtlasSource } from '@/lib/atlas/store';

interface SourcesPanelProps {
  onScanSource: (sourceId: string) => void;
  onScanAllStale: () => void;
}

export function SourcesPanel({ onScanSource, onScanAllStale }: SourcesPanelProps) {
  const [sources, setSources] = useState<AtlasSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    baseUrl: '',
    type: 'funding' as const,
    method: 'jina' as const,
    scanFrequency: 'weekly' as const,
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/atlas/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    try {
      const res = await fetch('/api/atlas/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource),
      });
      
      if (res.ok) {
        await fetchSources();
        setShowAddForm(false);
        setNewSource({ name: '', baseUrl: '', type: 'funding', method: 'jina', scanFrequency: 'weekly' });
      }
    } catch (err) {
      console.error('Failed to add source:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this source?')) return;
    
    try {
      const res = await fetch(`/api/atlas/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSources();
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const getStatusBadge = (source: AtlasSource) => {
    if (!source.lastScanAt) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">New</span>;
    }
    
    const lastScan = new Date(source.lastScanAt);
    const daysSince = (Date.now() - lastScan.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince <= 1) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Fresh</span>;
    }
    if (daysSince <= 7) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Stale</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Very Stale</span>;
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const staleSources = sources.filter(s => {
    if (!s.lastScanAt) return false;
    const daysSince = (Date.now() - new Date(s.lastScanAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sources...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sources</h2>
        <div className="flex gap-2">
          {staleSources.length > 0 && (
            <button
              onClick={onScanAllStale}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              Scan All Stale ({staleSources.length})
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Source
          </button>
        </div>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Add New Source</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="e.g., Innovate UK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base URL</label>
              <input
                type="url"
                value={newSource.baseUrl}
                onChange={(e) => setNewSource({ ...newSource, baseUrl: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newSource.type}
                onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="funding">Funding</option>
                <option value="policy">Policy</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={newSource.method}
                onChange={(e) => setNewSource({ ...newSource, method: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="jina">Jina</option>
                <option value="firecrawl">Firecrawl</option>
                <option value="playwright">Playwright</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSource}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              Add Source
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sources Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Last Scan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Challenges</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{source.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{source.baseUrl}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{source.type}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatTimeAgo(source.lastScanAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {source.lastScanChallenges || 0}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(source)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onScanSource(source.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Scan
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sources.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No sources configured. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}


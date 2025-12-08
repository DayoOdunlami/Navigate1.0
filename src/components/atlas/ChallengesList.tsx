'use client';

import { useState, useEffect } from 'react';

export function ChallengesList() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    mode: '',
    theme: '',
    source: '',
    search: '',
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/atlas/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (filters.mode && !c.modes.includes(filters.mode)) return false;
    if (filters.theme && !c.strategicThemes.includes(filters.theme)) return false;
    if (filters.source && c.source.name !== filters.source) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!c.title.toLowerCase().includes(searchLower) && 
          !c.description.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  const uniqueModes = [...new Set(challenges.flatMap(c => c.modes || []))];
  const uniqueThemes = [...new Set(challenges.flatMap(c => c.strategicThemes || []))];
  const uniqueSources = [...new Set(challenges.map(c => c.source?.name).filter(Boolean))];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Title or description..."
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Modes</option>
              {uniqueModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select
              value={filters.theme}
              onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Themes</option>
              {uniqueThemes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredChallenges.length} of {challenges.length} challenges
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{challenge.title}</h3>
                <div className="text-sm text-gray-600 mt-1">{challenge.summary}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {challenge.modes.map((mode: string) => (
                    <span key={mode} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {mode}
                    </span>
                  ))}
                  {challenge.strategicThemes.map((theme: string) => (
                    <span key={theme} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Source: {challenge.source?.name} • Extracted: {new Date(challenge.extraction.extractedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className={`px-3 py-1 rounded font-bold ${
                  challenge.validation.score >= 80 ? 'text-green-600 bg-green-50' :
                  challenge.validation.score >= 60 ? 'text-yellow-600 bg-yellow-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {challenge.validation.score}/100
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredChallenges.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No challenges found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}


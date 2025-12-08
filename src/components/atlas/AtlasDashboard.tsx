'use client';

import { useState } from 'react';
import { SourcesPanel } from './SourcesPanel';
import { BatchExtractor } from './BatchExtractor';
import { ExtractionResults } from './ExtractionResults';
import { ChallengesList } from './ChallengesList';
import { HistoryPanel } from './HistoryPanel';
import { CostTracker } from './CostTracker';

type Tab = 'sources' | 'extract' | 'challenges' | 'history';

export function AtlasDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('extract');
  const [extractionResults, setExtractionResults] = useState<any[]>([]);

  const handleSaveChallenge = async (challenge: any) => {
    try {
      const res = await fetch('/api/atlas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge }),
      });
      
      if (res.ok) {
        alert('✅ Challenge saved to knowledge base!');
        // Refresh challenges list if on that tab
        if (activeTab === 'challenges') {
          window.location.reload();
        }
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      alert('❌ Failed to save challenge: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleReExtract = (url: string) => {
    // Switch to extract tab and pre-fill URL
    setActiveTab('extract');
    // Could use a ref or state to pre-fill the URL input
  };

  const handleScanSource = async (sourceId: string) => {
    // TODO: Implement source scanning
    alert(`Scanning source ${sourceId}... (Feature coming soon)`);
  };

  const handleScanAllStale = async () => {
    // TODO: Implement batch source scanning
    alert('Scanning all stale sources... (Feature coming soon)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔭</span>
              <div>
                <h1 className="text-xl font-bold">Innovation Atlas</h1>
                <p className="text-sm text-gray-500">
                  Extract and manage innovation challenges
                </p>
              </div>
            </div>
            <CostTracker compact />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {(['sources', 'extract', 'challenges', 'history'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'sources' && (
          <SourcesPanel
            onScanSource={handleScanSource}
            onScanAllStale={handleScanAllStale}
          />
        )}

        {activeTab === 'extract' && (
          <div className="space-y-6">
            <BatchExtractor onResults={setExtractionResults} />
            {extractionResults.length > 0 && (
              <ExtractionResults
                results={extractionResults}
                onSaveChallenge={handleSaveChallenge}
                onReExtract={handleReExtract}
              />
            )}
          </div>
        )}

        {activeTab === 'challenges' && <ChallengesList />}

        {activeTab === 'history' && <HistoryPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          Part of Sparkworks • Powered by OpenAI
        </div>
      </footer>
    </div>
  );
}


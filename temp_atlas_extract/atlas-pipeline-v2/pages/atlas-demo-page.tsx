// ============================================================================
// ATLAS DEMO PAGE - Standalone version for testing
// ============================================================================
// Copy to: src/app/atlas/demo/page.tsx
// This version works without the API routes - calls extraction directly

'use client';

import { useState } from 'react';

// Types (inline for demo)
interface ExtractionStage {
  stage: string;
  duration: number;
  cost: number;
}

interface ExtractionState {
  status: 'idle' | 'scraping' | 'extracting' | 'classifying' | 'enriching' | 'validating' | 'complete' | 'error';
  stages: ExtractionStage[];
  totalCost: number;
  result?: any;
  error?: string;
}

export default function AtlasDemoPage() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<ExtractionState>({
    status: 'idle',
    stages: [],
    totalCost: 0,
  });

  // Simulated extraction for demo (replace with real API call)
  const handleExtract = async () => {
    setState({ status: 'scraping', stages: [], totalCost: 0 });

    // Simulate scraping
    await sleep(800);
    setState(s => ({ ...s, status: 'extracting' }));

    // Simulate extraction
    await sleep(1200);
    const stage1: ExtractionStage = { stage: 'extraction', duration: 1200, cost: 0.012 };
    setState(s => ({ 
      ...s, 
      status: 'classifying', 
      stages: [...s.stages, stage1],
      totalCost: s.totalCost + stage1.cost 
    }));

    // Simulate classification
    await sleep(900);
    const stage2: ExtractionStage = { stage: 'classification', duration: 900, cost: 0.008 };
    setState(s => ({ 
      ...s, 
      status: 'enriching', 
      stages: [...s.stages, stage2],
      totalCost: s.totalCost + stage2.cost 
    }));

    // Simulate enrichment
    await sleep(1000);
    const stage3: ExtractionStage = { stage: 'enrichment', duration: 1000, cost: 0.005 };
    setState(s => ({ 
      ...s, 
      status: 'validating', 
      stages: [...s.stages, stage3],
      totalCost: s.totalCost + stage3.cost 
    }));

    // Simulate validation
    await sleep(200);
    setState(s => ({ 
      ...s, 
      status: 'complete',
      result: DEMO_RESULT,
    }));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const statusLabels: Record<string, string> = {
    idle: 'Ready',
    scraping: '🔄 Fetching page...',
    extracting: '🔄 Extracting fields...',
    classifying: '🔄 Classifying...',
    enriching: '🔄 Enriching...',
    validating: '🔄 Validating...',
    complete: '✅ Complete',
    error: '❌ Error',
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🔭 Atlas Demo</h1>
          <p className="text-gray-600">
            This is a demo showing the extraction flow. 
            Connect to real API for actual extraction.
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">URL to Extract</label>
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://apply-for-innovation-funding.service.gov.uk/..."
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={handleExtract}
              disabled={state.status !== 'idle' && state.status !== 'complete' && state.status !== 'error'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                         hover:bg-blue-700 disabled:opacity-50"
            >
              Extract
            </button>
          </div>

          {/* Sample URLs */}
          <div className="mt-3 text-sm text-gray-500">
            Try: 
            <button 
              onClick={() => setUrl('https://www.gov.uk/government/publications/jet-zero-strategy')}
              className="ml-2 text-blue-600 hover:underline"
            >
              Jet Zero Strategy
            </button>
            <button 
              onClick={() => setUrl('https://apply-for-innovation-funding.service.gov.uk/competition/1234/overview')}
              className="ml-2 text-blue-600 hover:underline"
            >
              IUK Competition
            </button>
          </div>
        </div>

        {/* Progress */}
        {state.status !== 'idle' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">{statusLabels[state.status]}</span>
              <span className="font-mono text-green-600">${state.totalCost.toFixed(4)}</span>
            </div>

            {/* Stage Progress */}
            <div className="space-y-2">
              {['extraction', 'classification', 'enrichment', 'validation'].map((stage) => {
                const stageData = state.stages.find(s => s.stage === stage);
                const isActive = state.status === stage.replace('ion', 'ing').replace('ation', 'ating');
                const isComplete = !!stageData;

                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                      ${isComplete ? 'bg-green-100 text-green-600' : 
                        isActive ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                        'bg-gray-100 text-gray-400'}`}
                    >
                      {isComplete ? '✓' : isActive ? '•' : '○'}
                    </div>
                    <div className="flex-1">
                      <span className={isComplete ? 'text-gray-900' : 'text-gray-400'}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </span>
                    </div>
                    {stageData && (
                      <div className="text-sm text-gray-500">
                        {stageData.duration}ms • ${stageData.cost.toFixed(4)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result */}
        {state.result && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{state.result.title}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {state.result.modes.map((mode: string) => (
                  <span key={mode} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {mode}
                  </span>
                ))}
                {state.result.themes.map((theme: string) => (
                  <span key={theme} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
              <div>
                <div className="text-sm text-gray-500">Funding</div>
                <div className="font-bold">{state.result.funding}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-bold">{state.result.deadline}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">TRL</div>
                <div className="font-bold">{state.result.trl}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Confidence</div>
                <div className="font-bold">{state.result.confidence}%</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Problem Statement</h3>
                <p className="text-gray-600">{state.result.problemStatement}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Summary</h3>
                <p className="text-gray-600">{state.result.summary}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t flex justify-between">
              <span className="text-sm text-gray-500">
                Extracted in {state.stages.reduce((sum, s) => sum + s.duration, 0)}ms
              </span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Add to Knowledge Base
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {state.status === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 mb-2">
              <strong>This is a demo page.</strong>
            </p>
            <p className="text-blue-600 text-sm">
              To enable real extraction, set up the API routes and use the full ExtractChallengeForm component.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// Demo result data
const DEMO_RESULT = {
  title: 'Net Zero Aviation Fuels Competition',
  modes: ['Aviation'],
  themes: ['Decarbonisation', 'Industry'],
  type: 'technology_development',
  funding: '£2m - £5m',
  deadline: '2025-03-12',
  trl: '4-7',
  confidence: 92,
  problemStatement: 'Aviation contributes 2.5% of global CO2 emissions with no scalable alternative to kerosene-based jet fuel, blocking the sector\'s path to net zero.',
  summary: 'Innovate UK competition seeking innovative projects to accelerate sustainable aviation fuel development and scale-up, with £12m total funding available for collaborative projects at TRL 4-7.',
  keyEntities: ['Innovate UK', 'SAF', 'airlines', 'airports', 'ATI'],
};

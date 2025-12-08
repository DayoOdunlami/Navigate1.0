// ============================================================================
// ATLAS EXTRACTION FORM - With Provider Selection & Cost Tracking
// ============================================================================
// Copy to: src/components/atlas/ExtractChallengeForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { CostTracker, SessionCostSummary, CostBadge } from './CostTracker';

// Types
interface ExtractedChallenge {
  id: string;
  title: string;
  modes: string[];
  strategicThemes: string[];
  challengeType: string;
  problemStatement: string;
  summary: string;
  funding?: {
    min?: number;
    max?: number;
    currency: string;
    type: string;
  };
  deadline?: string;
  trl?: { min: number; max: number };
  keyEntities: string[];
  extraction: {
    confidence: number;
    model: string;
  };
  validation: {
    passed: boolean;
    score: number;
    warnings: string[];
    errors: string[];
  };
  classification: {
    modes: { value: string; confidence: number; reasoning?: string }[];
    themes: { value: string; confidence: number; reasoning?: string }[];
    challengeType: { value: string; confidence: number; reasoning?: string };
  };
}

interface ExtractionResult {
  challenge: ExtractedChallenge;
  review: { needed: boolean; reasons: string[] };
  duration: number;
  cost: {
    total: number;
    stages: { stage: string; duration: number; cost: number }[];
    provider: string;
    model: string;
  };
}

interface ProviderInfo {
  providers: { provider: string; available: boolean; reason?: string }[];
  models: Record<string, string[]>;
  default: { provider: string; model: string };
}

export function ExtractChallengeForm() {
  // State
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [skipEnrichment, setSkipEnrichment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);

  // Fetch available providers on mount
  useEffect(() => {
    fetch('/api/atlas/extract')
      .then(res => res.json())
      .then(data => {
        setProviderInfo(data);
        if (data.default) {
          setProvider(data.default.provider);
          setModel(data.default.model);
        }
      })
      .catch(console.error);
  }, []);

  // Update model when provider changes
  useEffect(() => {
    if (providerInfo?.models[provider]) {
      setModel(providerInfo.models[provider][0]);
    }
  }, [provider, providerInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/atlas/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, provider, model, skipEnrichment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Extraction failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header with Cost Tracker */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Atlas Challenge Extractor</h1>
        <CostTracker compact />
      </div>

      {/* Extraction Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Funding Call or Policy URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://apply-for-innovation-funding.service.gov.uk/..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Provider & Model Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              {providerInfo?.providers.map((p) => (
                <option 
                  key={p.provider} 
                  value={p.provider}
                  disabled={!p.available}
                >
                  {p.provider.charAt(0).toUpperCase() + p.provider.slice(1)}
                  {!p.available && ` (${p.reason})`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              {providerInfo?.models[provider]?.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipEnrichment}
              onChange={(e) => setSkipEnrichment(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">
              Skip enrichment (faster, lower cost)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium 
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting...
            </>
          ) : (
            'Extract Challenge'
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-700 font-medium">Extraction Failed</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Cost Summary */}
          <SessionCostSummary
            stages={result.cost.stages}
            totalCost={result.cost.total}
            totalDuration={result.duration}
          />

          {/* Review Warning */}
          {result.review.needed && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800">⚠️ Needs Human Review</h3>
              <ul className="mt-2 text-yellow-700 text-sm">
                {result.review.reasons.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenge Card */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">{result.challenge.title}</h2>
                <CostBadge cost={result.cost.total} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Extracted with {result.cost.model} in {(result.duration / 1000).toFixed(1)}s
              </p>
            </div>

            {/* Classification Tags */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-2">
                {result.challenge.modes.map((mode) => (
                  <span
                    key={mode}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {mode}
                  </span>
                ))}
                {result.challenge.strategicThemes.map((theme) => (
                  <span
                    key={theme}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {result.challenge.challengeType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y border-b">
              {result.challenge.funding && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Funding</p>
                  <p className="font-bold mt-1">
                    {result.challenge.funding.currency}{' '}
                    {result.challenge.funding.min?.toLocaleString() || '?'} -{' '}
                    {result.challenge.funding.max?.toLocaleString() || '?'}
                  </p>
                </div>
              )}
              {result.challenge.deadline && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Deadline</p>
                  <p className="font-bold mt-1">{result.challenge.deadline}</p>
                </div>
              )}
              {result.challenge.trl && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">TRL</p>
                  <p className="font-bold mt-1">{result.challenge.trl.min} - {result.challenge.trl.max}</p>
                </div>
              )}
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
                <p className="font-bold mt-1">{(result.challenge.extraction.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Problem Statement</h3>
                <p className="text-gray-600">{result.challenge.problemStatement || 'Not extracted'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Summary</h3>
                <p className="text-gray-600">{result.challenge.summary}</p>
              </div>

              {result.challenge.keyEntities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Key Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.challenge.keyEntities.map((entity, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Validation Footer */}
            <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`font-medium ${result.challenge.validation.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.challenge.validation.passed ? '✓ Validation Passed' : '✗ Validation Failed'}
                </span>
                <span className="text-gray-500 text-sm">
                  Score: {result.challenge.validation.score}/100
                </span>
              </div>
              <button
                onClick={() => {
                  // TODO: Add to knowledge base
                  alert('Add to KB: ' + result.challenge.id);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                           hover:bg-green-700 disabled:opacity-50"
                disabled={!result.challenge.validation.passed}
              >
                Add to Knowledge Base
              </button>
            </div>
          </div>

          {/* Classification Confidence Details */}
          <details className="bg-white border rounded-lg">
            <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50">
              Classification Confidence Details
            </summary>
            <div className="p-4 border-t space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Modes</p>
                {result.challenge.classification.modes.map((m) => (
                  <div key={m.value} className="flex items-center gap-3 mb-2">
                    <div className="w-24 font-medium">{m.value}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${m.confidence * 100}%` }} />
                    </div>
                    <div className="w-12 text-sm text-gray-500">{(m.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Themes</p>
                {result.challenge.classification.themes.map((t) => (
                  <div key={t.value} className="flex items-center gap-3 mb-2">
                    <div className="w-32 font-medium truncate">{t.value}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${t.confidence * 100}%` }} />
                    </div>
                    <div className="w-12 text-sm text-gray-500">{(t.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </details>

          {/* Raw JSON */}
          <details className="bg-gray-50 border rounded-lg">
            <summary className="p-4 cursor-pointer font-medium">View Raw JSON</summary>
            <pre className="p-4 text-xs overflow-auto max-h-96 border-t">
              {JSON.stringify(result.challenge, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Full Cost Tracker (Bottom) */}
      <div className="mt-8">
        <CostTracker showHistory />
      </div>
    </div>
  );
}

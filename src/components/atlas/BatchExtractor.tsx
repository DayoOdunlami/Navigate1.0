'use client';

import { useState } from 'react';

interface ExtractionProgress {
  url: string;
  status: 'pending' | 'scraping' | 'extracting' | 'classifying' | 'enriching' | 'validating' | 'complete' | 'error';
  stage?: string;
  duration?: number;
  cost?: number;
  challenge?: any;
  error?: string;
  fields?: {
    title: boolean;
    funding: boolean;
    deadline: boolean;
    trl: boolean;
    eligibility: boolean;
  };
}

interface BatchExtractorProps {
  onResults: (results: any[]) => void;
}

const SAMPLE_URLS = {
  'Gov.uk Transport Policy': [
    'https://www.gov.uk/government/publications/jet-zero-strategy',
    'https://www.gov.uk/government/publications/decarbonising-transport-a-better-greener-britain',
    'https://www.gov.uk/government/publications/clean-maritime-plan-maritime-2050',
  ],
  'UKRI Opportunities': [
    'https://www.ukri.org/opportunity/',
  ],
  'Strategy Documents': [
    'https://www.ati.org.uk/flyzero/',
    'https://www.maritimeuk.org/priorities/environment/',
  ],
};

export function BatchExtractor({ onResults }: BatchExtractorProps) {
  const [urls, setUrls] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [skipEnrichment, setSkipEnrichment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const handleExtract = async () => {
    const urlList = urls.split('\n').filter(u => u.trim()).map(u => u.trim());
    if (urlList.length === 0) return;

    setLoading(true);
    setProgress(urlList.map(url => ({ url, status: 'pending' })));
    setCurrentUrlIndex(0);

    const results: any[] = [];

    for (let i = 0; i < urlList.length; i++) {
      setCurrentUrlIndex(i);
      setProgress(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'scraping', stage: 'scraping' };
        return updated;
      });

      try {
        const response = await fetch('/api/atlas/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlList[i],
            provider,
            model,
            skipEnrichment,
          }),
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${text.substring(0, 200)}`);
        }

        if (response.ok && data.challenge) {
          const challenge = data.challenge;
          const fields = {
            title: !!challenge.title,
            funding: !!challenge.funding?.max,
            deadline: !!challenge.deadline,
            trl: !!challenge.trl?.min,
            eligibility: !!(challenge.eligibility && challenge.eligibility.length > 0),
          };

          setProgress(prev => {
            const updated = [...prev];
            updated[i] = {
              url: urlList[i],
              status: 'complete',
              stage: 'complete',
              duration: data.duration,
              cost: data.cost.total,
              challenge,
              fields,
            };
            return updated;
          });

          results.push(data);
        } else {
          setProgress(prev => {
            const updated = [...prev];
            updated[i] = {
              url: urlList[i],
              status: 'error',
              error: data.error || 'Extraction failed',
            };
            return updated;
          });
        }
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? (error.message.includes('JSON') ? 'Server returned invalid response. Please check the URL or try again.' : error.message)
            : 'Unknown error';
          
          setProgress(prev => {
            const updated = [...prev];
            updated[i] = {
              url: urlList[i],
              status: 'error',
              error: errorMessage,
            };
            return updated;
          });
        }
    }

    setLoading(false);
    onResults(results);
  };

  const handleSampleUrls = (key: string) => {
    const sampleUrls = SAMPLE_URLS[key as keyof typeof SAMPLE_URLS];
    if (sampleUrls) {
      setUrls(sampleUrls.join('\n'));
    }
  };

  const totalCost = progress.reduce((sum, p) => sum + (p.cost || 0), 0);
  const completed = progress.filter(p => p.status === 'complete').length;
  const failed = progress.filter(p => p.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Batch Extract</h2>
          <select
            onChange={(e) => handleSampleUrls(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
            defaultValue=""
          >
            <option value="">Sample URLs...</option>
            {Object.keys(SAMPLE_URLS).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            URLs (one per line)
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://apply-for-innovation-funding.service.gov.uk/competition/123&#10;https://www.ukri.org/opportunity/net-zero-aviation/&#10;https://www.gov.uk/government/publications/jet-zero-strategy"
            className="w-full p-3 border rounded-lg font-mono text-sm"
            rows={6}
          />
          <div className="mt-2 text-sm text-gray-500">
            {urls.split('\n').filter(u => u.trim()).length} URL(s)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipEnrichment}
              onChange={(e) => setSkipEnrichment(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Skip enrichment (faster, lower cost)</span>
          </label>
        </div>

        <button
          onClick={handleExtract}
          disabled={loading || !urls.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Extracting... (${completed}/${progress.length})` : `Extract All (${urls.split('\n').filter(u => u.trim()).length} URLs)`}
          {totalCost > 0 && ` - Est. cost: $${totalCost.toFixed(4)}`}
        </button>
      </div>

      {/* Progress Section */}
      {progress.length > 0 && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Extraction Progress</h3>
            <div className="text-sm text-gray-600">
              ✅ {completed} complete  ❌ {failed} failed  🔄 {progress.length - completed - failed} pending
            </div>
          </div>

          <div className="space-y-3">
            {progress.map((p, i) => (
              <div
                key={i}
                className={`p-4 border rounded-lg ${
                  p.status === 'complete' ? 'bg-green-50 border-green-200' :
                  p.status === 'error' ? 'bg-red-50 border-red-200' :
                  i === currentUrlIndex ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.url}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.status === 'complete' && p.duration && `Completed in ${(p.duration / 1000).toFixed(1)}s`}
                      {p.status === 'error' && `Error: ${p.error}`}
                      {p.status === 'pending' && 'Waiting...'}
                      {i === currentUrlIndex && p.status !== 'complete' && p.status !== 'error' && `Processing... (${p.stage})`}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {p.cost && (
                      <div className="text-sm font-mono text-green-600">${p.cost.toFixed(4)}</div>
                    )}
                    {p.status === 'complete' && (
                      <span className="text-xs text-green-600">✅</span>
                    )}
                    {p.status === 'error' && (
                      <span className="text-xs text-red-600">❌</span>
                    )}
                  </div>
                </div>

                {/* Fields Status */}
                {p.fields && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-2">Fields Extracted:</div>
                    <div className="flex flex-wrap gap-2">
                      {p.fields.title && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✅ Title</span>}
                      {p.fields.funding && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✅ Funding</span>}
                      {p.fields.deadline && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✅ Deadline</span>}
                      {p.fields.trl && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✅ TRL</span>}
                      {p.fields.eligibility && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✅ Eligibility</span>}
                      {!p.fields.title && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">❌ Title</span>}
                      {!p.fields.funding && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">⚠️ Funding</span>}
                      {!p.fields.deadline && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">⚠️ Deadline</span>}
                      {!p.fields.trl && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">⚠️ TRL</span>}
                      {!p.fields.eligibility && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">⚠️ Eligibility</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


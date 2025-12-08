'use client';

import { useState } from 'react';
import { CostBadge } from './CostTracker';

interface ExtractionResultsProps {
  results: any[];
  onSaveChallenge: (challenge: any) => void;
  onReExtract: (url: string) => void;
}

export function ExtractionResults({ results, onSaveChallenge, onReExtract }: ExtractionResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  const getMissingFields = (challenge: any) => {
    const missing: string[] = [];
    if (!challenge.funding?.max) missing.push('Funding');
    if (!challenge.deadline) missing.push('Deadline');
    if (!challenge.trl?.min) missing.push('TRL');
    if (!challenge.eligibility || challenge.eligibility.length === 0) missing.push('Eligibility');
    return missing;
  };

  if (results.length === 0) {
    return null;
  }

  const successful = results.filter(r => r.challenge && r.challenge.validation.passed);
  const needsReview = results.filter(r => r.challenge && !r.challenge.validation.passed);
  const failed = results.filter(r => !r.challenge);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <span className="text-2xl font-bold text-green-600">{successful.length}</span>
              <span className="text-sm text-gray-600 ml-2">extracted</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-yellow-600">{needsReview.length}</span>
              <span className="text-sm text-gray-600 ml-2">needs review</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-red-600">{failed.length}</span>
              <span className="text-sm text-gray-600 ml-2">failed</span>
            </div>
          </div>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `atlas-extraction-${new Date().toISOString()}.json`;
              link.click();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => {
          if (!result.challenge) {
            return (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="font-medium text-red-800">Extraction Failed</div>
                <div className="text-sm text-red-600 mt-1">{result.error || 'Unknown error'}</div>
                <button
                  onClick={() => onReExtract(result.url || '')}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Re-extract
                </button>
              </div>
            );
          }

          const challenge = result.challenge;
          const score = challenge.validation.score || 0;
          const missing = getMissingFields(challenge);

          return (
            <div
              key={index}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{challenge.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
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
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`px-3 py-1 rounded font-bold ${getScoreColor(score)}`}>
                      {getScoreBadge(score)} {score}/100
                    </div>
                    <CostBadge cost={result.cost?.total || 0} />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {challenge.funding && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Funding</div>
                      <div className="font-bold">
                        {challenge.funding.currency} {challenge.funding.min?.toLocaleString() || '?'} - {challenge.funding.max?.toLocaleString() || '?'}
                      </div>
                    </div>
                  )}
                  {challenge.deadline && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Deadline</div>
                      <div className="font-bold">{challenge.deadline}</div>
                    </div>
                  )}
                  {challenge.trl && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase">TRL</div>
                      <div className="font-bold">{challenge.trl.min} - {challenge.trl.max}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Confidence</div>
                    <div className="font-bold">{(challenge.extraction.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {/* Missing Fields Warning */}
                {missing.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm font-medium text-yellow-800">Missing Fields:</div>
                    <div className="text-sm text-yellow-700 mt-1">{missing.join(', ')}</div>
                  </div>
                )}

                {/* Summary */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Summary</div>
                  <div className="text-sm text-gray-600">{challenge.summary}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {challenge.validation.passed ? (
                    <button
                      onClick={() => onSaveChallenge(challenge)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Add to KB
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedIndex(selectedIndex === index ? null : index);
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                    >
                      Review & Edit
                    </button>
                  )}
                  <button
                    onClick={() => onReExtract(result.url || challenge.source.url)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Re-extract
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIndex(selectedIndex === index ? null : index);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    {selectedIndex === index ? 'Hide' : 'View'} Details
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedIndex === index && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Problem Statement</div>
                      <div className="text-sm text-gray-600">{challenge.problemStatement || 'Not extracted'}</div>
                    </div>
                    {challenge.keyEntities && challenge.keyEntities.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Key Entities</div>
                        <div className="flex flex-wrap gap-2">
                          {challenge.keyEntities.map((entity: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {challenge.validation.warnings && challenge.validation.warnings.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-yellow-700 mb-1">Warnings</div>
                        <ul className="text-sm text-yellow-600 list-disc list-inside">
                          {challenge.validation.warnings.map((w: string, i: number) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {challenge.validation.errors && challenge.validation.errors.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-red-700 mb-1">Errors</div>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {challenge.validation.errors.map((e: string, i: number) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


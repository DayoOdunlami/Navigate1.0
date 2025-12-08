/**
 * ProvenanceEntityCard - Example component showing best practices
 * 
 * Demonstrates:
 * - Progressive disclosure of provenance info
 * - Quality indicators
 * - Trust badges
 * - Expandable details
 */

'use client';

import { useState } from 'react';
import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { computeProvenanceMetrics } from '@/lib/base-entity-enhanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProvenanceEntityCardProps {
  entity: BaseEntity;
  showProvenanceByDefault?: boolean;
  onVerify?: (entity: BaseEntity) => void;
  onFlag?: (entity: BaseEntity) => void;
}

export function ProvenanceEntityCard({
  entity,
  showProvenanceByDefault = false,
  onVerify,
  onFlag,
}: ProvenanceEntityCardProps) {
  const [showDetails, setShowDetails] = useState(showProvenanceByDefault);
  const metrics = computeProvenanceMetrics(entity.provenance);
  const { provenance } = entity;

  return (
    <Card className={`entity-card quality-${metrics.qualityTier}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{entity.name}</CardTitle>
          
          {/* Quality badges - minimal but informative */}
          <div className="flex items-center gap-2">
            {metrics.isTrustworthy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="default" className="cursor-help bg-green-600 text-white border-green-600">
                      ✓ Verified
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>High confidence, verified, fresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {metrics.isStale && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="warning" className="cursor-help">
                      🕐 Stale
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data is {metrics.ageInDays} days old</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {provenance.quality.confidence < 0.5 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="cursor-help">
                      ⚠ Low Confidence
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confidence: {Math.round(provenance.quality.confidence * 100)}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{entity.description}</p>

        {/* Expandable provenance details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
            {showDetails ? 'Hide' : 'Show'} data quality info
            <span className="text-xs">
              ({Math.round(provenance.quality.confidence * 100)}% confidence)
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <ProvenanceDetails
              entity={entity}
              metrics={metrics}
              onVerify={onVerify}
              onFlag={onFlag}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ProvenanceDetails({
  entity,
  metrics,
  onVerify,
  onFlag,
}: {
  entity: BaseEntity;
  metrics: ReturnType<typeof computeProvenanceMetrics>;
  onVerify?: (entity: BaseEntity) => void;
  onFlag?: (entity: BaseEntity) => void;
}) {
  const { provenance } = entity;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="provenance-details space-y-4 text-sm border-t pt-4">
      {/* Quality Metrics */}
      <div>
        <h4 className="font-semibold mb-2">Quality Metrics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Confidence:</strong> {Math.round(provenance.quality.confidence * 100)}%
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  provenance.quality.confidence >= 0.8
                    ? 'bg-green-500'
                    : provenance.quality.confidence >= 0.6
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${provenance.quality.confidence * 100}%` }}
              />
            </div>
          </div>
          <div>
            <strong>Quality Tier:</strong> {metrics.qualityTier.toUpperCase()}
          </div>
          <div>
            <strong>Verification:</strong>{' '}
            <span className="capitalize">{provenance.quality.verificationStatus}</span>
          </div>
          <div>
            <strong>Age:</strong> {metrics.ageInDays} days
          </div>
        </div>
      </div>

      {/* Source Information */}
      <div>
        <h4 className="font-semibold mb-2">Source</h4>
        <div className="space-y-1 text-sm">
          <div>
            <strong>Type:</strong> <span className="capitalize">{provenance.source.type.replace('_', ' ')}</span>
          </div>
          <div>
            <strong>Name:</strong> {provenance.source.name}
          </div>
          {provenance.source.reference && (
            <div>
              <strong>Reference:</strong>{' '}
              <a
                href={provenance.source.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {provenance.source.reference}
              </a>
            </div>
          )}
          <div>
            <strong>Ingested:</strong> {formatDate(provenance.source.ingestedAt)}
          </div>
        </div>
      </div>

      {/* Verification Info */}
      {provenance.quality.verifiedBy && (
        <div>
          <h4 className="font-semibold mb-2">Verification</h4>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Verified by:</strong> {provenance.quality.verifiedBy}
            </div>
            {provenance.quality.verifiedAt && (
              <div>
                <strong>Verified on:</strong> {formatDate(provenance.quality.verifiedAt)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quality Flags */}
      {provenance.flags && provenance.flags.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Quality Flags</h4>
          <ul className="space-y-1">
            {provenance.flags.map((flag, idx) => (
              <li
                key={idx}
                className={`p-2 rounded text-sm ${
                  flag.severity === 'error'
                    ? 'bg-red-50 text-red-800'
                    : flag.severity === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <strong className="capitalize">{flag.severity}:</strong> {flag.message}
                {flag.field && <span className="text-xs"> (field: {flag.field})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {(onVerify || onFlag) && (
        <div className="flex gap-2 pt-2 border-t">
          {onVerify && provenance.quality.verificationStatus !== 'verified' && (
            <button
              onClick={() => onVerify(entity)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark as Verified
            </button>
          )}
          {onFlag && (
            <button
              onClick={() => onFlag(entity)}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Flag Issue
            </button>
          )}
        </div>
      )}

      {/* Audit Trail (last 5 entries) */}
      {provenance.audit.changeHistory && provenance.audit.changeHistory.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recent Changes</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            {provenance.audit.changeHistory.slice(0, 5).map((entry, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="capitalize">{entry.changeType}</span>
                <span>{formatDate(entry.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


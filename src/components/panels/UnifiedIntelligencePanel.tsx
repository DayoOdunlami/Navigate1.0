'use client';

import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Bot, 
  ChevronDown, 
  ChevronUp,
  Users,
  Cpu,
  FolderKanban,
  Banknote,
  Link2,
  Tag,
  Building2,
  Globe,
  Gauge,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import { AIChatPanel, Message as AIMessage } from '@/components/layouts/AIChatPanel';

// ============================================================================
// TYPES
// ============================================================================

export interface QuickStats {
  stakeholders?: number;
  technologies?: number;
  projects?: number;
  totalFunding?: number | string;
  relationships?: number;
  challenges?: number;
  [key: string]: number | string | undefined;
}

export interface SelectedEntity {
  type: 'stakeholder' | 'technology' | 'project' | 'funding' | 'challenge' | string;
  id: string;
  name: string;
  data?: any;
}

export interface RelatedEntity {
  id: string;
  name: string;
  type: string;
  relationship?: string;
}

export interface UnifiedIntelligencePanelProps {
  // Insights data
  selectedEntity?: SelectedEntity | null;
  relatedEntities?: RelatedEntity[];
  quickStats?: QuickStats;
  datasetLabel?: string;
  // Optional: override the default insights body with custom content
  customInsightsContent?: React.ReactNode;
  
  // Context for AI
  visualizationType?: string;
  useNavigateData?: boolean;
  
  // Callbacks
  onEntitySelect?: (entity: SelectedEntity) => void;
  onClearSelection?: () => void;
  onFunctionCall?: (functionName: string, args: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  
  // Layout options
  defaultAIExpanded?: boolean;
  showQuickStats?: boolean;
  className?: string;
  maxRelatedEntities?: number;
  // Chat state (to persist across layout changes)
  chatMessages?: AIMessage[];
  onChatMessagesChange?: (messages: AIMessage[]) => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatItem({ 
  icon: Icon, 
  label, 
  value, 
  color = '#006E51' 
}: { 
  icon: typeof Users; 
  label: string; 
  value: number | string; 
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-gray-600">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function EntityMetadataGrid({ entity }: { entity: SelectedEntity }) {
  const data = entity.data || {};
  
  const metadataItems = [
    { label: 'Type', value: data.entityType || data.type || entity.type, icon: Tag },
    { label: 'Category', value: data.category || data.stakeholderCategory, icon: Building2 },
    { label: 'Sector', value: data.sector, icon: Globe },
    { label: 'TRL', value: data.trl || data.trl_current, icon: Gauge },
    { label: 'Funding', value: data.funding ? `£${(data.funding / 1000000).toFixed(1)}M` : undefined, icon: Banknote },
    { label: 'Status', value: data.status, icon: FolderKanban },
  ].filter(item => item.value);

  if (metadataItems.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {metadataItems.map((item) => (
        <div key={item.label} className="rounded-lg bg-gray-50 p-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <item.icon className="h-3 w-3" />
            {item.label}
          </div>
          <div className="text-sm font-medium text-gray-900 truncate">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedEntitiesList({ 
  entities, 
  maxItems = 10,
  onEntitySelect 
}: { 
  entities: RelatedEntity[];
  maxItems?: number;
  onEntitySelect?: (entity: SelectedEntity) => void;
}) {
  const displayedEntities = entities.slice(0, maxItems);
  const remainingCount = entities.length - maxItems;

  const getEntityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stakeholder: '#006E51',
      technology: '#4A90E2',
      project: '#F5A623',
      funding: '#50C878',
      government: '#1a5f7a',
      industry: '#e76f51',
      academia: '#7b2cbf',
      intermediary: '#2d8f6f',
    };
    return colors[type.toLowerCase()] || '#64748b';
  };

  return (
    <div className="space-y-1">
      {displayedEntities.map((entity) => (
        <button
          key={entity.id}
          onClick={() => onEntitySelect?.({
            type: entity.type,
            id: entity.id,
            name: entity.name,
            data: entity
          })}
          className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
        >
          <span 
            className="h-2 w-2 rounded-full flex-shrink-0" 
            style={{ backgroundColor: getEntityTypeColor(entity.type) }}
          />
          <span className="text-sm text-gray-900 truncate flex-1">{entity.name}</span>
          {entity.relationship && (
            <span className="text-xs text-gray-400 truncate max-w-[80px]">
              {entity.relationship}
            </span>
          )}
          <ExternalLink className="h-3 w-3 text-gray-300 flex-shrink-0" />
        </button>
      ))}
      {remainingCount > 0 && (
        <p className="text-xs text-gray-400 py-2 text-center">
          +{remainingCount} more connections
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedIntelligencePanel({
  selectedEntity,
  relatedEntities = [],
  quickStats,
  datasetLabel = 'All Data',
  visualizationType = 'visualization',
  useNavigateData = true,
  onEntitySelect,
  onClearSelection,
  onFunctionCall,
  defaultAIExpanded = true,
  showQuickStats = true,
  className,
  maxRelatedEntities = 10,
  customInsightsContent,
  chatMessages,
  onChatMessagesChange,
}: UnifiedIntelligencePanelProps) {
  const [aiExpanded, setAiExpanded] = useState(defaultAIExpanded);
  const [insightsExpanded, setInsightsExpanded] = useState(true);

  // Build context for AI - include current insights
  const aiContext = useMemo(() => ({
    activeViz: visualizationType,
    useNavigateData,
    selectedEntities: selectedEntity ? [{
      type: selectedEntity.type,
      id: selectedEntity.id,
      name: selectedEntity.name,
      ...selectedEntity.data,
    }] : [],
    // Include current insights context for AI awareness
    currentInsights: {
      quickStats,
      selectedEntityName: selectedEntity?.name,
      selectedEntityType: selectedEntity?.type,
      relatedEntitiesCount: relatedEntities.length,
      datasetLabel,
    },
  }), [visualizationType, useNavigateData, selectedEntity, quickStats, relatedEntities.length, datasetLabel]);

  // Format funding for display
  const formattedStats = useMemo(() => {
    if (!quickStats) return null;
    return {
      ...quickStats,
      totalFunding: typeof quickStats.totalFunding === 'number' 
        ? `£${(quickStats.totalFunding / 1000000).toFixed(0)}M`
        : quickStats.totalFunding,
    };
  }, [quickStats]);

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* INSIGHTS SECTION - Always visible, collapsible */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setInsightsExpanded(!insightsExpanded)}
          className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0f8b8d]" />
            <span className="text-sm font-semibold text-[#0f8b8d]">Insights</span>
            {selectedEntity && (
              <span className="rounded-full bg-[#0f8b8d]/10 px-2 py-0.5 text-xs text-[#0f8b8d]">
                {selectedEntity.name}
              </span>
            )}
          </div>
          {insightsExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {insightsExpanded && (
          <div className="px-3 pb-3 space-y-3 max-h-64 overflow-y-auto">
            {/** Custom insights content overrides default rendering when provided */}
            {customInsightsContent ? (
              <>{customInsightsContent}</>
            ) : !selectedEntity ? (
              <>
                {/* Dataset overview */}
                <div className="rounded-xl bg-gradient-to-br from-[#0f8b8d]/10 to-[#0f8b8d]/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-[#0f8b8d]/70">Explore</p>
                  <h3 className="text-base font-semibold text-[#0f8b8d]">{datasetLabel}</h3>
                  <p className="text-xs text-[#0f8b8d]/80 mt-1">
                    Click on any element to view detailed insights, provenance, and relationships.
                  </p>
                </div>

                {/* Quick stats */}
                {showQuickStats && formattedStats && (
                  <div className="rounded-xl border border-gray-100 bg-white p-3">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Quick Stats</p>
                    <div className="space-y-0.5">
                      {formattedStats.stakeholders !== undefined && (
                        <StatItem icon={Users} label="Stakeholders" value={formattedStats.stakeholders} />
                      )}
                      {formattedStats.technologies !== undefined && (
                        <StatItem icon={Cpu} label="Technologies" value={formattedStats.technologies} color="#4A90E2" />
                      )}
                      {formattedStats.projects !== undefined && (
                        <StatItem icon={FolderKanban} label="Projects" value={formattedStats.projects} color="#F5A623" />
                      )}
                      {formattedStats.totalFunding && (
                        <StatItem icon={Banknote} label="Total Funding" value={formattedStats.totalFunding} color="#50C878" />
                      )}
                      {formattedStats.relationships !== undefined && (
                        <StatItem icon={Link2} label="Relationships" value={formattedStats.relationships} color="#8b5cf6" />
                      )}
                      {formattedStats.challenges !== undefined && (
                        <StatItem icon={Tag} label="Challenges" value={formattedStats.challenges} color="#e76f51" />
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Selected entity header */}
                <div className="rounded-xl bg-gradient-to-br from-[#006E51]/10 to-[#006E51]/5 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#006E51]/70">
                        {selectedEntity.type}
                      </p>
                      <h3 className="text-base font-semibold text-[#006E51] mt-0.5">
                        {selectedEntity.name}
                      </h3>
                    </div>
                    {onClearSelection && (
                      <button
                        onClick={onClearSelection}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {selectedEntity.data?.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                      {selectedEntity.data.description}
                    </p>
                  )}
                </div>

                {/* Entity metadata */}
                <EntityMetadataGrid entity={selectedEntity} />

                {/* Tags if present */}
                {selectedEntity.data?.tags && selectedEntity.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedEntity.data.tags.slice(0, 6).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {selectedEntity.data.tags.length > 6 && (
                      <span className="text-xs text-gray-400">
                        +{selectedEntity.data.tags.length - 6}
                      </span>
                    )}
                  </div>
                )}

                {/* Related entities */}
                {relatedEntities.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Connections ({relatedEntities.length})
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 max-h-[200px] overflow-y-auto">
                      <RelatedEntitiesList 
                        entities={relatedEntities} 
                        maxItems={maxRelatedEntities}
                        onEntitySelect={onEntitySelect}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* AI CHAT SECTION - Expandable, context-aware */}
      <div className="flex-1 flex flex-col min-h-0">
        <button
          onClick={() => setAiExpanded(!aiExpanded)}
          className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-[#7c3aed]">AI Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedEntity && (
              <span className="text-xs text-gray-400">
                Context: {selectedEntity.name}
              </span>
            )}
            {aiExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>

        {aiExpanded && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AIChatPanel
              context={aiContext}
              onFunctionCall={onFunctionCall}
              initialMessages={chatMessages}
              onMessagesChange={onChatMessagesChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedIntelligencePanel;


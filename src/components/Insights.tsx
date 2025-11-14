"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useNavigateStore } from '@/stores/navigate-store';
import type { Insight } from '@/lib/ai';
import { getAIProvider } from '@/lib/ai';
import { useEffect, useState } from 'react';

export function Insights() {
  const insights = useNavigateStore((state) => state.insights);
  const activeInsight = useNavigateStore((state) => state.activeInsight);
  const setInsights = useNavigateStore((state) => state.setInsights);
  const setActiveInsight = useNavigateStore((state) => state.setActiveInsight);
  const setHighlightedEntities = useNavigateStore((state) => state.setHighlightedEntities);
  const setFilters = useNavigateStore((state) => state.setFilters);

  const stakeholders = useNavigateStore((state) => state.getFilteredStakeholders());
  const technologies = useNavigateStore((state) => state.getFilteredTechnologies());
  const fundingEvents = useNavigateStore((state) => state.getFilteredFundingEvents());
  const projects = useNavigateStore((state) => state.getFilteredProjects());
  const relationships = useNavigateStore((state) => state.getFilteredRelationships());

  const [isGenerating, setIsGenerating] = useState(false);

  // Generate insights when data changes
  useEffect(() => {
    const generateInsights = async () => {
      setIsGenerating(true);
      try {
        const aiProvider = getAIProvider();
        const graphData = {
          stakeholders,
          technologies,
          fundingEvents,
          projects,
          relationships,
        };
        
        const newInsights = await aiProvider.generateInsights(graphData);
        setInsights(newInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    if (stakeholders.length > 0 || technologies.length > 0) {
      generateInsights();
    }
  }, [stakeholders, technologies, fundingEvents, projects, relationships, setInsights]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'gap':
        return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity':
        return <Target className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'gap':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'opportunity':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'risk':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'trend':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const handleInsightClick = (insight: Insight) => {
    setActiveInsight(insight);
    if (insight.entities.length > 0) {
      setHighlightedEntities(insight.entities);
    }
  };

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Analyzing data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>No insights available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Insights will appear here as you explore the data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
        <CardDescription>
          {insights.length} insight{insights.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => handleInsightClick(insight)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeInsight?.id === insight.id
                ? 'ring-2 ring-blue-500'
                : getInsightColor(insight.type)
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {insight.type}
                  </Badge>
                  {insight.actionable && (
                    <Badge variant="secondary" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {insight.description}
                </p>
                {insight.entities.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Affects {insight.entities.length} entit{insight.entities.length !== 1 ? 'ies' : 'y'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


"use client"

import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ForceGraph } from '@/components/visualizations/ForceGraph';
import { Search } from '@/components/Search';
import { Insights } from '@/components/Insights';
import { FilterPresets } from '@/components/FilterPresets';
import { Button } from '@/components/ui/button';
import { Download, Settings, Lightbulb } from 'lucide-react';
import { useNavigateStore } from '@/stores/navigate-store';
import { stakeholders, technologies, fundingEvents, projects, relationships } from '@/data/navigate-dummy-data';
import { exportStakeholders, exportTechnologies, exportScenario } from '@/lib/export-utils';

export default function NetworkPage() {
  const setStakeholders = useNavigateStore((state) => state.setStakeholders);
  const setTechnologies = useNavigateStore((state) => state.setTechnologies);
  const setFundingEvents = useNavigateStore((state) => state.setFundingEvents);
  const setProjects = useNavigateStore((state) => state.setProjects);
  const setRelationships = useNavigateStore((state) => state.setRelationships);
  const panels = useNavigateStore((state) => state.panels);
  const togglePanel = useNavigateStore((state) => state.togglePanel);

  // Load data into store (only once)
  useEffect(() => {
    setStakeholders(stakeholders);
    setTechnologies(technologies);
    setFundingEvents(fundingEvents);
    setProjects(projects);
    setRelationships(relationships);
  }, [setStakeholders, setTechnologies, setFundingEvents, setProjects, setRelationships]);

  const handleExport = () => {
    const state = useNavigateStore.getState();
    exportScenario({
      stakeholders: state.getFilteredStakeholders(),
      technologies: state.getFilteredTechnologies(),
      fundingEvents: state.getFilteredFundingEvents(),
      projects: state.getFilteredProjects(),
      relationships: state.getFilteredRelationships(),
      filters: state.filters,
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Network View
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Explore stakeholder and technology relationships
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Search />
          </div>

          {/* Three-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Filters */}
            <div className={`lg:col-span-3 space-y-4 ${!panels.filters ? 'hidden lg:block' : ''}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePanel('filters')}
                  className="lg:hidden"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <FilterPresets />
            </div>

            {/* Center Panel - Visualization */}
            <div className="lg:col-span-6">
              <ForceGraph height={700} />
            </div>

            {/* Right Panel - Insights */}
            <div className={`lg:col-span-3 space-y-4 ${!panels.insights ? 'hidden lg:block' : ''}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Insights</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePanel('insights')}
                  className="lg:hidden"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>
              <Insights />
            </div>
          </div>

          {/* Floating Panel Toggles (when panels are hidden) */}
          {(!panels.filters || !panels.insights) && (
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
              {!panels.filters && (
                <Button
                  onClick={() => togglePanel('filters')}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
              {!panels.insights && (
                <Button
                  onClick={() => togglePanel('insights')}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Insights
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}


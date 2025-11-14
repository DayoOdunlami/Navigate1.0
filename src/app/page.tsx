"use client"

import { useEffect } from 'react';
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/Search"
import { Link } from "next/link"
import { stakeholders, technologies, fundingEvents, projects, relationships } from "@/data/navigate-dummy-data"
import { useNavigateStore } from "@/stores/navigate-store"

export default function HomePage() {
  const setStakeholders = useNavigateStore((state) => state.setStakeholders);
  const setTechnologies = useNavigateStore((state) => state.setTechnologies);
  const setFundingEvents = useNavigateStore((state) => state.setFundingEvents);
  const setProjects = useNavigateStore((state) => state.setProjects);
  const setRelationships = useNavigateStore((state) => state.setRelationships);

  // Load data into store
  useEffect(() => {
    setStakeholders(stakeholders);
    setTechnologies(technologies);
    setFundingEvents(fundingEvents);
    setProjects(projects);
    setRelationships(relationships);
  }, [setStakeholders, setTechnologies, setFundingEvents, setProjects, setRelationships]);

  // Calculate quick stats
  const totalFunding = fundingEvents.reduce((sum, event) => sum + event.amount, 0)
  const avgTRL = technologies.length > 0
    ? technologies.reduce((sum, tech) => sum + (tech.trl_current || 0), 0) / technologies.length
    : 0

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              NAVIGATE Platform
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              Interactive intelligence platform for the UK's zero-emission aviation ecosystem
            </p>
            <div className="mb-4">
              <Search />
            </div>
            <div className="flex gap-2">
              <Link href="/network">
                <Button>View Network Graph</Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  £{(totalFunding / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Across all funding events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stakeholders.length}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Stakeholders in ecosystem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {technologies.length}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Avg TRL: {avgTRL.toFixed(1)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projects.length}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Active projects
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stakeholders */}
            <Card>
              <CardHeader>
                <CardTitle>Stakeholders</CardTitle>
                <CardDescription>
                  Organizations in the zero-emission aviation ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stakeholders.slice(0, 5).map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {stakeholder.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {stakeholder.type} • {stakeholder.sector}
                        </div>
                      </div>
                      <Badge variant="outline">{stakeholder.funding_capacity}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Stakeholders
                </Button>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
                <CardDescription>
                  Zero-emission aviation technologies being developed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {technologies.slice(0, 5).map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {tech.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {tech.category} • TRL {tech.trl_current}
                        </div>
                      </div>
                      <Badge variant="secondary">TRL {tech.trl_current}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Technologies
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Funding Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Funding Events</CardTitle>
              <CardDescription>
                Latest funding activities in the ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fundingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {event.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(event.date).toLocaleDateString()} • {event.funding_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        £{(event.amount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Banner */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Phase 0 Complete ✅
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Platform foundation is ready. Phase 1 will add visualizations, search, and AI features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

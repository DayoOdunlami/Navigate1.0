"use client"

import Link from 'next/link'
import { Building2, Network, TrendingUp, AlertCircle, ArrowRight, BarChart3, DollarSign, Target, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/ui/TopNavigation'

export default function PolicyAnalystProfile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <TopNavigation />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                ET
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Dr. Emma Thompson
                </h1>
                <p className="text-lg text-gray-600 mb-3">Department for Transport (DfT)</p>
                <p className="text-gray-500 mb-3">Senior Policy Analyst - Zero Emission Aviation</p>
                <div className="flex gap-2">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    🏛️ Policy & Strategy Profile
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active User
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link 
                href="/profile/navigate"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ← Back to Profiles
              </Link>
              <Link 
                href="#"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Open NAVIGATE Dashboard
              </Link>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t">
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Network className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Explore Network</div>
                <div className="text-xs text-gray-500">Knowledge graph</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Funding Analysis</div>
                <div className="text-xs text-gray-500">Sankey diagram</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Run Scenario</div>
                <div className="text-xs text-gray-500">Model policies</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Zap className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Ask AI</div>
                <div className="text-xs text-gray-500">Natural language</div>
              </div>
            </a>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">287</div>
            <div className="text-sm text-gray-600 font-medium">Organizations</div>
            <div className="text-xs text-gray-500 mt-1">Tracked in ecosystem</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">£340M</div>
            <div className="text-sm text-gray-600 font-medium">Total Funding</div>
            <div className="text-xs text-gray-500 mt-1">Public & private</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-amber-600 mb-2">8</div>
            <div className="text-sm text-gray-600 font-medium">Funding Gaps</div>
            <div className="text-xs text-gray-500 mt-1">Identified</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">3</div>
            <div className="text-sm text-gray-600 font-medium">TRL Bottlenecks</div>
            <div className="text-xs text-gray-500 mt-1">Need attention</div>
          </div>
        </div>
        
        {/* Focus Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Technology Focus Areas</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                H2 Production
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                H2 Storage
              </span>
              <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Fuel Cells
              </span>
              <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Aircraft
              </span>
              <span className="px-3 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                Infrastructure
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Stakeholder Types</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Government</div>
                  <div className="text-sm text-gray-600">Policy & regulation</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Industry</div>
                  <div className="text-sm text-gray-600">Commercial development</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Scenarios */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Saved Scenarios</h2>
            <Button variant="outline" size="sm">
              + New Scenario
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Baseline
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Baseline 2024
                  </h3>
                  <p className="text-sm text-gray-600">
                    Current state of the zero emission aviation ecosystem
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📊 287 organizations</span>
                <span>💰 £340M funding</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Optimistic
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    50% Public Funding Increase
                  </h3>
                  <p className="text-sm text-gray-600">
                    Models impact of increased government investment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📈 +50% funding</span>
                <span>🎯 12 new projects</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Gap Analysis
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    TRL 6-7 Gap Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Technologies needing support to reach commercial viability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⚠️ 3 bottlenecks</span>
                <span>💡 Needs £15M</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      Regional
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Scotland Focus
                  </h3>
                  <p className="text-sm text-gray-600">
                    Regional analysis of Scottish zero emission aviation initiatives
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📍 Scotland</span>
                <span>🏢 23 orgs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Network className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Explored ZeroAvia's funding network</div>
                <div className="text-sm text-gray-600 mt-1">Found 5 connections to government and research organizations</div>
                <div className="text-xs text-gray-500 mt-2">2 hours ago</div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Identified 3 technologies at TRL 6 that need £15M funding</div>
                <div className="text-sm text-gray-600 mt-1">Advanced H2 Storage, Fuel Cell Stack, and Aircraft Integration</div>
                <div className="text-xs text-gray-500 mt-2">1 day ago</div>
              </div>
              <Button variant="ghost" size="sm">Review</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Compared Scotland vs London funding distribution</div>
                <div className="text-sm text-gray-600 mt-1">Scotland shows strong research focus, London has more commercial activity</div>
                <div className="text-xs text-gray-500 mt-2">2 days ago</div>
              </div>
              <Button variant="ghost" size="sm">Compare</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Asked AI: "What are the main barriers to hydrogen aircraft adoption?"</div>
                <div className="text-sm text-gray-600 mt-1">AI identified infrastructure, certification timeline, and cost as key barriers</div>
                <div className="text-xs text-gray-500 mt-2">3 days ago</div>
              </div>
              <Button variant="ghost" size="sm">View Response</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



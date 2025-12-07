"use client"

import Link from 'next/link'
import { DollarSign, TrendingUp, Target, BarChart3, ArrowRight, Filter, Award, TrendingDown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/ui/TopNavigation'

export default function InvestmentManagerProfile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <TopNavigation />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                MC
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Marcus Chen
                </h1>
                <p className="text-lg text-gray-600 mb-3">Aerospace Technology Institute (ATI)</p>
                <p className="text-gray-500 mb-3">Funding Manager - Zero Emission Aviation Portfolio</p>
                <div className="flex gap-2">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    💰 Investment Manager Profile
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active Portfolio
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Open NAVIGATE Dashboard
              </Link>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t">
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Filter className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Filter Technologies</div>
                <div className="text-xs text-gray-500">By TRL, category</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Funding Flows</div>
                <div className="text-xs text-gray-500">Sankey analysis</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Portfolio Impact</div>
                <div className="text-xs text-gray-500">Model scenarios</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Opportunities</div>
                <div className="text-xs text-gray-500">Co-investment</div>
              </div>
            </a>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-sm text-gray-600 font-medium">Active Investments</div>
            <div className="text-xs text-gray-500 mt-1">In portfolio</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">£85M</div>
            <div className="text-sm text-gray-600 font-medium">Portfolio Value</div>
            <div className="text-xs text-gray-500 mt-1">Total committed</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">8</div>
            <div className="text-sm text-gray-600 font-medium">TRL 6-7 Targets</div>
            <div className="text-xs text-gray-500 mt-1">Evaluation stage</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-amber-600 mb-2">5</div>
            <div className="text-sm text-gray-600 font-medium">Co-Investment Opps</div>
            <div className="text-xs text-gray-500 mt-1">Identified</div>
          </div>
        </div>
        
        {/* Focus Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Investment Criteria</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">TRL 6-7 Focus</div>
                  <div className="text-sm text-gray-600">Technologies ready for scaling</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">High Growth Potential</div>
                  <div className="text-sm text-gray-600">Clear path to commercial viability</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Strategic Alignment</div>
                  <div className="text-sm text-gray-600">UK zero emission aviation goals</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Technology Categories</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                H2 Production
              </span>
              <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                H2 Storage
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Fuel Cells
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Aircraft
              </span>
              <span className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Infrastructure
              </span>
            </div>
          </div>
        </div>

        {/* Investment Opportunities */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">High-Priority Opportunities</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      High Priority
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      TRL 7
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      H2 Storage
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Advanced Hydrogen Storage System
                  </h3>
                  <p className="text-sm text-gray-600">
                    High-density storage solution for aircraft applications. Needs £8M to reach TRL 8.
                  </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap ml-4">
                  Evaluate
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>💰 £8M needed</span>
                <span>🎯 85% strategic fit</span>
                <span>📈 Strong growth potential</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Medium Priority
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      TRL 6
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Fuel Cells
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Next-Generation Fuel Cell Stack
                  </h3>
                  <p className="text-sm text-gray-600">
                    Improved efficiency and power density. Needs £12M to reach TRL 7.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-4">
                  Review
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>💰 £12M needed</span>
                <span>🎯 75% strategic fit</span>
                <span>🤝 2 co-investors interested</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      Co-Investment
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      TRL 7
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Aircraft
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Hydrogen Aircraft Integration
                  </h3>
                  <p className="text-sm text-gray-600">
                    ZeroAvia partnership opportunity. Private investors already committed £15M.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-4">
                  Explore
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>💰 £5M opportunity</span>
                <span>🤝 ZeroAvia partnership</span>
                <span>⚡ High visibility project</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Reviewed funding history of ZeroAvia</div>
                <div className="text-sm text-gray-600 mt-1">Total funding: £45M (35M public, 10M private). Largest event: £15M ATI Round 3</div>
                <div className="text-xs text-gray-500 mt-2">4 hours ago</div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Filtered technologies by TRL 6-7</div>
                <div className="text-sm text-gray-600 mt-1">Found 8 technologies matching investment criteria</div>
                <div className="text-xs text-gray-500 mt-2">1 day ago</div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Identified 3 co-investment opportunities</div>
                <div className="text-sm text-gray-600 mt-1">Projects with private investor interest and strategic alignment</div>
                <div className="text-xs text-gray-500 mt-2">2 days ago</div>
              </div>
              <Button variant="ghost" size="sm">Review</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Modeled portfolio impact of £20M additional investment</div>
                <div className="text-sm text-gray-600 mt-1">Scenario shows 5 technologies could reach TRL 8 by 2026</div>
                <div className="text-xs text-gray-500 mt-2">3 days ago</div>
              </div>
              <Button variant="ghost" size="sm">View Scenario</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



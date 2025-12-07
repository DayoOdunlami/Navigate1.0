"use client"

import Link from 'next/link'
import { GraduationCap, Network, Users, BookOpen, ArrowRight, Search, TrendingUp, Zap, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/ui/TopNavigation'

export default function ResearchLeadProfile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <TopNavigation />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                JM
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Prof. James Mitchell
                </h1>
                <p className="text-lg text-gray-600 mb-3">Cranfield University</p>
                <p className="text-gray-500 mb-3">Professor of Aerospace Engineering - Hydrogen Systems Research</p>
                <div className="flex gap-2">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                    🎓 Research Lead Profile
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active Researcher
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
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
              >
                Open NAVIGATE Dashboard
              </Link>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t">
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Network className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Explore Network</div>
                <div className="text-xs text-gray-500">Research connections</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <Search className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Find Collaborators</div>
                <div className="text-xs text-gray-500">Research partners</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Track Projects</div>
                <div className="text-xs text-gray-500">Active research</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Research Gaps</div>
                <div className="text-xs text-gray-500">Identify needs</div>
              </div>
            </a>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-amber-600 mb-2">15</div>
            <div className="text-sm text-gray-600 font-medium">Active Projects</div>
            <div className="text-xs text-gray-500 mt-1">In portfolio</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">8</div>
            <div className="text-sm text-gray-600 font-medium">Collaboration Partners</div>
            <div className="text-xs text-gray-500 mt-1">Industry & academia</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">TRL 5-6</div>
            <div className="text-sm text-gray-600 font-medium">Research Focus</div>
            <div className="text-xs text-gray-500 mt-1">Technology readiness</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">3</div>
            <div className="text-sm text-gray-600 font-medium">Research Gaps</div>
            <div className="text-xs text-gray-500 mt-1">Identified</div>
          </div>
        </div>
        
        {/* Focus Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Research Interests</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                H2 Storage
              </span>
              <span className="px-3 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                Fuel Cells
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                System Integration
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Safety Analysis
              </span>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Primary focus: Hydrogen storage systems for aircraft applications, 
                including safety, weight optimization, and thermal management.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Collaboration Network</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Universities</div>
                  <div className="text-sm text-gray-600">5 research partners</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Network className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Industry</div>
                  <div className="text-sm text-gray-600">3 company partnerships</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Publications</div>
                  <div className="text-sm text-gray-600">12 papers in 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Opportunities */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Potential Collaborations</h2>
            <Button variant="outline" size="sm">
              Explore More
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      High Match
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Research
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      H2 Storage
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    University of Manchester - Advanced Materials Lab
                  </h3>
                  <p className="text-sm text-gray-600">
                    Working on lightweight composite materials for hydrogen storage. 
                    Complementary research to your thermal management work.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-4">
                  Connect
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>🎓 Research organization</span>
                <span>📊 3 active projects</span>
                <span>🤝 2 mutual connections</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      Industry Partner
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      TRL 6
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Fuel Cells
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    ZeroAvia - Research Collaboration Opportunity
                  </h3>
                  <p className="text-sm text-gray-600">
                    Seeking academic partner for fuel cell efficiency research. 
                    Your safety analysis expertise would be valuable.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-4">
                  Explore
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>🏢 Industry partner</span>
                <span>💰 Funded opportunity</span>
                <span>⚡ Active project</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Research Gap
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      TRL 4-5
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      System Integration
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Aircraft-Level Integration Research
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gap identified: Limited research on full aircraft system integration. 
                    Opportunity for multi-institution consortium.
                  </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-4">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>🔍 Research gap</span>
                <span>📚 2 publications needed</span>
                <span>🎯 High impact potential</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Search className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Searched for researchers working on hydrogen storage at TRL 5-6</div>
                <div className="text-sm text-gray-600 mt-1">Found 8 research groups with complementary expertise</div>
                <div className="text-xs text-gray-500 mt-2">5 hours ago</div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Network className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Explored ZeroAvia's research network</div>
                <div className="text-sm text-gray-600 mt-1">Identified 3 potential collaboration pathways through mutual connections</div>
                <div className="text-xs text-gray-500 mt-2">1 day ago</div>
              </div>
              <Button variant="ghost" size="sm">View Network</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Compared research vs commercial focus on fuel cells</div>
                <div className="text-sm text-gray-600 mt-1">Research focuses on efficiency, industry on cost reduction. Gap identified for collaboration</div>
                <div className="text-xs text-gray-500 mt-2">2 days ago</div>
              </div>
              <Button variant="ghost" size="sm">View Analysis</Button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Identified research gap in aircraft-level integration</div>
                <div className="text-sm text-gray-600 mt-1">Limited publications on full system integration. Opportunity for consortium research</div>
                <div className="text-xs text-gray-500 mt-2">3 days ago</div>
              </div>
              <Button variant="ghost" size="sm">Explore</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



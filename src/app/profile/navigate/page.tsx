"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Building2, GraduationCap, ArrowRight, CheckCircle, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/ui/TopNavigation'
import { CreativeHero } from '@/components/ui/CreativeHero'

export default function NavigateProfileSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/20 via-white to-blue-50/10 text-[#2E2D2B]">
      <TopNavigation />
      
      {/* Background */}
      <CreativeHero 
        className="fixed inset-0 z-0" 
        sectionTheme="fragmented-vs-organized"
        contentAreas={[
          { x: 0.2, y: 0.5, width: 300, height: 400, shape: 'rectangle', fadeStart: 0.8 },
          { x: 0.5, y: 0.5, width: 300, height: 400, shape: 'rectangle', fadeStart: 0.8 },
          { x: 0.8, y: 0.5, width: 300, height: 400, shape: 'rectangle', fadeStart: 0.8 }
        ]}
      />

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-blue-50 backdrop-blur-sm border border-blue-200 mb-4">
                <span className="relative z-10 text-blue-700 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  NAVIGATE Platform
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Choose Your Profile Type</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore how NAVIGATE works for different user types in the zero emission aviation ecosystem. 
              See how policy makers, investors, and researchers use the platform.
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-blue-300 rounded-full mx-auto mt-6"></div>
          </div>

          {/* Profile Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Policy Maker Profile */}
            <motion.div
              className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              data-particle-zone="policy"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2D2B]">Policy & Strategy</h2>
                  <p className="text-gray-600">Government / Policy Maker</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  See how policy analysts use NAVIGATE to understand the ecosystem, identify funding gaps, 
                  and model policy scenarios.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Explore stakeholder networks and relationships",
                    "Analyze funding flows and identify gaps",
                    "Model policy scenarios with real-time updates",
                    "Generate evidence-based recommendations"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/profile/navigate/policy-analyst">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Policy Analyst Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Example:</strong> Dr. Emma Thompson - DfT Senior Policy Analyst exploring zero emission aviation ecosystem
                </p>
              </div>
            </motion.div>

            {/* Investment Manager Profile */}
            <motion.div
              className="relative overflow-hidden rounded-xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm p-8 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              data-particle-zone="investment"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2D2B]">Investment Manager</h2>
                  <p className="text-gray-600">Funding / Portfolio Manager</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  See how investment managers use NAVIGATE to identify promising technologies, 
                  assess investment opportunities, and track funding flows.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Filter technologies by TRL and maturity",
                    "Track funding history and patterns",
                    "Identify co-investment opportunities",
                    "Assess portfolio impact with scenarios"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/profile/navigate/investment-manager">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Investment Manager Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Example:</strong> Marcus Chen - ATI Funding Manager identifying promising hydrogen technologies
                </p>
              </div>
            </motion.div>

            {/* Research Lead Profile */}
            <motion.div
              className="relative overflow-hidden rounded-xl border-2 border-amber-200 bg-white/90 backdrop-blur-sm p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              data-particle-zone="research"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2D2B]">Research Lead</h2>
                  <p className="text-gray-600">University / Innovation</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  See how research leads use NAVIGATE to explore collaboration opportunities, 
                  understand the competitive landscape, and identify research gaps.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Explore research networks and connections",
                    "Identify collaboration opportunities",
                    "Track technology trends and gaps",
                    "Compare research vs commercial focus"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/profile/navigate/research-lead">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    View Research Lead Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Example:</strong> Prof. James Mitchell - Cranfield University exploring hydrogen storage research
                </p>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#2E2D2B] mb-2">NAVIGATE Platform</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    NAVIGATE is an interactive intelligence platform for the UK's zero emission aviation ecosystem. 
                    These profiles demonstrate how different stakeholders use the platform for evidence-based decision making.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 flex justify-center gap-6">
            <Link href="/profile">
              <Button variant="outline" className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white">
                View Atlas Profiles
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}



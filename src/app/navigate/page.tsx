"use client"

import { useState, useEffect, useMemo, Suspense, ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BarChart3, Network, Zap, Sun, GitBranch, MessageCircle, Maximize2, TrendingUp, DollarSign, Cpu, Clock, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LayoutSwitcher, LayoutOption } from "@/components/layouts/LayoutSwitcher"
import { LayoutRenderer } from "@/components/layouts/LayoutRenderer"
import GlobalControlsPanel from "@/components/controls/GlobalControlsPanel"
import { VisualizationControlSections, VisualizationControlContext, type VisualizationType } from "@/components/controls/VisualizationControlSections"
import { VisualizationRenderer } from "@/components/visualizations/VisualizationRenderer"
import { stakeholders, technologies, projects, relationships, fundingEvents } from "@/data/navigate-dummy-data"
import { AppProvider, useAppContext } from "@/contexts/AppContext"
import { UnifiedFloatingNav } from "@/components/ui/UnifiedFloatingNav"
import { TopNavigation } from "@/components/ui/TopNavigation"
import { ClusterInfo } from "@/lib/cluster-analysis"
import { AIChatPanel } from "@/components/layouts/AIChatPanel"
import { TimelineTrack, BarSortOrder, BarValueMode, HeatmapColorMode, TreemapViewMode } from "@/types/visualization-controls"
import { TechnologyCategory, StakeholderType } from "@/lib/navigate-types"
import { VisualLibrarySection } from "@/components/visualizations/VisualLibrarySection"
import challenges from "@/data/challenges"
import { NetworkGraph } from "@/components/visualizations/NetworkGraph"
import { NetworkGraphNavigate, NetworkRelationshipControls } from "@/components/visualizations/NetworkGraphNavigate"
import { NetworkGraphNavigate3D } from "@/components/visualizations/NetworkGraphNavigate3D"
import { NetworkGraphD3 } from "@/components/visualizations/NetworkGraphD3"
import { NetworkGraphECharts } from "@/components/visualizations/NetworkGraphECharts"
import { SankeyChart } from "@/components/visualizations/SankeyChart"
import { SankeyChartNavigate } from "@/components/visualizations/SankeyChartNavigate"
import { HeatmapChart } from "@/components/visualizations/HeatmapChart"
import { HeatmapNavigate } from "@/components/visualizations/HeatmapNavigate"
import { SunburstChart } from "@/components/visualizations/SunburstChart"
import { CirclePackingNavigate } from "@/components/visualizations/CirclePackingNavigate"
import { TreemapNavigate } from "@/components/visualizations/TreemapNavigate"
import { TreemapSunburstExplorer } from "@/components/visualizations/TreemapSunburstExplorer"
import { ChordDiagram } from "@/components/visualizations/ChordDiagram"
import { ChordDiagramNavigate } from "@/components/visualizations/ChordDiagramNavigate"
import { RadarChartNavigate } from "@/components/visualizations/RadarChartNavigate"
import { BarChartNavigate } from "@/components/visualizations/BarChartNavigate"
import { BumpChartNavigate } from "@/components/visualizations/BumpChartNavigate"
import { StreamGraphNavigate } from "@/components/visualizations/StreamGraphNavigate"
import { ParallelCoordinatesNavigate } from "@/components/visualizations/ParallelCoordinatesNavigate"
import { SwarmPlotNavigate } from "@/components/visualizations/SwarmPlotNavigate"
import { UnifiedInsightsPanel } from "@/components/visualizations/UnifiedInsightsPanel"
import { CirclePackingNode } from "@/data/toolkit/circlePackingData"

type ViewCategory = 'all' | 'network' | 'funding' | 'technology' | 'dashboard'

// Visualization categories mapping
const visualizationCategories: Record<ViewCategory, VisualizationType[]> = {
  all: ['sankey', 'heatmap', 'network', 'network3d', 'network-toolkit', 'sunburst', 'chord', 'radar', 'bar', 'circle', 'bump', 'treemap', 'stream', 'parallel', 'swarm', 'timeline', 'bubble-scatter'],
  network: ['network', 'network3d', 'network-toolkit', 'circle', 'chord'],
  funding: ['sankey', 'treemap', 'stream'],
  technology: ['radar', 'bump', 'timeline', 'parallel', 'swarm', 'bubble-scatter'],
  dashboard: ['bar', 'heatmap', 'bubble-scatter']
}

const visualizations = [
  {
    id: 'sankey' as VisualizationType,
    name: 'Flow Analysis',
    description: 'Challenge progression and resource flows',
    icon: GitBranch,
    color: '#006E51',
    category: 'funding' as ViewCategory
  },
  {
    id: 'radar' as VisualizationType,
    name: 'Tech Maturity Radar',
    description: 'Compare technology readiness across dimensions',
    icon: Zap,
    color: '#8b5cf6',
    category: 'technology' as ViewCategory
  },
  {
    id: 'bar' as VisualizationType,
    name: 'Bar Chart Analysis',
    description: 'Funding, projects, and technology breakdowns',
    icon: BarChart3,
    color: '#4A90E2',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'circle' as VisualizationType,
    name: 'Circle Packing',
    description: 'Hierarchical stakeholder and technology relationships',
    icon: Sun,
    color: '#50C878',
    category: 'network' as ViewCategory
  },
  {
    id: 'bump' as VisualizationType,
    name: 'TRL Progression',
    description: 'Technology readiness level advancement over time',
    icon: BarChart3,
    color: '#EC4899',
    category: 'technology' as ViewCategory
  },
  {
    id: 'timeline' as VisualizationType,
    name: 'Decarbonisation Roadmap',
    description: 'Hydrogen aviation milestones and timeline',
    icon: Clock,
    color: '#0EA5E9',
    category: 'technology' as ViewCategory
  },
  {
    id: 'bubble-scatter' as VisualizationType,
    name: 'Funding vs TRL',
    description: 'Technology maturity vs funding analysis',
    icon: TrendingUp,
    color: '#006E51',
    category: 'technology' as ViewCategory
  },
  {
    id: 'treemap' as VisualizationType,
    name: 'Funding Breakdown',
    description: 'Hierarchical funding distribution and budgets',
    icon: BarChart3,
    color: '#F5A623',
    category: 'funding' as ViewCategory
  },
  {
    id: 'heatmap' as VisualizationType,
    name: 'Intensity Map',
    description: 'Challenge density and hotspots',
    icon: BarChart3,
    color: '#4A90E2',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'network' as VisualizationType,
    name: 'Network Graph',
    description: 'Connections and relationships',
    icon: Network,
    color: '#50C878',
    category: 'network' as ViewCategory
  },
  {
    id: 'network3d' as VisualizationType,
    name: 'Network Graph 3D',
    description: '3D interactive network visualization',
    icon: Network,
    color: '#006E51',
    category: 'network' as ViewCategory
  },
  {
    id: 'network-toolkit' as VisualizationType,
    name: 'Toolkit Network (D3)',
    description: 'Toolkit force-directed network with advanced grouping & pods',
    icon: Network,
    color: '#0EA5E9',
    category: 'network' as ViewCategory
  },
  {
    id: 'sunburst' as VisualizationType,
    name: 'Hierarchical View',
    description: 'Multi-level challenge breakdown',
    icon: Sun,
    color: '#F5A623',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'chord' as VisualizationType,
    name: 'Relationship Matrix',
    description: 'Cross-sector dependencies',
    icon: Zap,
    color: '#8b5cf6',
    category: 'network' as ViewCategory
  },
  {
    id: 'stream' as VisualizationType,
    name: 'Funding Trends',
    description: 'Funding flows over time',
    icon: BarChart3,
    color: '#10B981',
    category: 'funding' as ViewCategory
  },
  {
    id: 'swarm' as VisualizationType,
    name: 'Technology Distribution',
    description: 'TRL and category distribution',
    icon: BarChart3,
    color: '#F59E0B',
    category: 'technology' as ViewCategory
  }
]

// Category navigation items
const categoryNavItems = [
  {
    id: 'all' as ViewCategory,
    name: 'All Visualizations',
    description: `View all ${visualizationCategories.all.length} visualizations`,
    icon: BarChart3,
    color: '#006E51',
    count: visualizationCategories.all.length
  },
  {
    id: 'network' as ViewCategory,
    name: 'Network Analysis',
    description: 'Network Graphs, Circle Packing, Relationship Matrix',
    icon: Network,
    color: '#50C878',
    count: visualizationCategories.network.length
  },
  {
    id: 'funding' as ViewCategory,
    name: 'Funding Intelligence',
    description: 'Flow Analysis, Funding Breakdown, Funding Trends',
    icon: DollarSign,
    color: '#F5A623',
    count: visualizationCategories.funding.length
  },
  {
    id: 'technology' as ViewCategory,
    name: 'Technology Maturity',
    description: 'Radar, TRL Progression, Parallel Coordinates, Distribution',
    icon: Cpu,
    color: '#8b5cf6',
    count: visualizationCategories.technology.length
  },
  {
    id: 'dashboard' as ViewCategory,
    name: 'Dashboard & Metrics',
    description: 'Bar Charts, Heatmaps, Hierarchical Views',
    icon: TrendingUp,
    color: '#4A90E2',
    count: visualizationCategories.dashboard.length
  }
]

// Inner component that uses search params
function NavigateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { 
    filteredChallenges, 
    selectedChallenge, 
    setSelectedChallenge
  } = useAppContext()
  
  // Get view category from URL, default to 'all'
  const viewCategory = (searchParams.get('view') as ViewCategory) || 'all'
  
  // Get visualization from URL query param (from Visual Library click)
  const vizFromUrl = searchParams.get('visualization') as VisualizationType | null
  
  // Filter visualizations based on category
  const filteredVisualizations = viewCategory === 'all'
    ? visualizations
    : visualizations.filter(viz => {
        const categoryVizs = visualizationCategories[viewCategory] || []
        return categoryVizs.includes(viz.id)
      })
  
  // Auto-select first visualization if category has only one
  // But prefer URL param if provided
  const defaultViz = vizFromUrl && visualizations.some(v => v.id === vizFromUrl)
    ? vizFromUrl
    : filteredVisualizations.length > 0 
      ? filteredVisualizations[0].id 
      : 'network'
  
  const [activeViz, setActiveViz] = useState<VisualizationType>(defaultViz)
  const [useNavigateData, setUseNavigateData] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [controlsPinned, setControlsPinned] = useState(false)
  const [controlsHovered, setControlsHovered] = useState(false)
  const [controlsCollapseTimeout, setControlsCollapseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [currentLayout, setCurrentLayout] = useState<LayoutOption>('option2')
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(true) // Start minimized
  const [externalControlsContent, setExternalControlsContent] = useState<ReactNode | null>(null)
  
  // All the same state variables as visualizations page...
  const [circlePackingView, setCirclePackingView] = useState<'by_stakeholder_type' | 'by_technology_category' | 'by_funding'>('by_stakeholder_type')
  const [bumpView, setBumpView] = useState<'all_technologies' | 'by_category' | 'top_advancing'>('all_technologies')
  const [selectedCategories, setSelectedCategories] = useState<TechnologyCategory[]>([])
  const [treemapView, setTreemapView] = useState<TreemapViewMode>('treemap')
  const [barChartView, setBarChartView] = useState<'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl'>('funding_by_stakeholder')
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    'TRL Level',
    'Funding',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  const [chordView, setChordView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow'>('by_stakeholder_type')
  const [heatmapView, setHeatmapView] = useState<'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status'>('trl_vs_category')
  const [streamView, setStreamView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type'>('by_stakeholder_type')
  const [parallelDimensions, setParallelDimensions] = useState<string[]>([
    'TRL Level',
    'Funding (£M)',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  const [swarmView, setSwarmView] = useState<'by_trl' | 'by_category'>('by_trl')
  const [streamScenario, setStreamScenario] = useState<'baseline' | 'accelerated'>('baseline')
  const [streamScenarioState, setStreamScenarioState] = useState<{ government_funding_multiplier: number; private_funding_multiplier: number }>({
    government_funding_multiplier: 100,
    private_funding_multiplier: 200 // Default accelerated: double private funding
  })
  const [libraryRelationshipFilters, setLibraryRelationshipFilters] = useState({
    funds: true,
    collaborates_with: true,
    researches: true,
    advances: true,
    participates_in: true,
  })
  const [libraryHideIsolated, setLibraryHideIsolated] = useState(false)
  const [libraryNodeSpacing, setLibraryNodeSpacing] = useState(0.5)
  const [libraryShowSpacingControl, setLibraryShowSpacingControl] = useState(true)
  const [showInlineLibraryNetworkControls, setShowInlineLibraryNetworkControls] = useState(true)
  const [timelineTracks, setTimelineTracks] = useState<Record<TimelineTrack, boolean>>({
    technology: true,
    infrastructure: true,
    policy: true,
    skills: true
  })
  const activeTimelineGroups = Object.entries(timelineTracks)
    .filter(([, enabled]) => enabled)
    .map(([track]) => track)
  const toggleTimelineTrack = (track: TimelineTrack) => {
    setTimelineTracks(prev => {
      const isEnabled = prev[track]
      const enabledCount = Object.values(prev).filter(Boolean).length
      if (isEnabled && enabledCount === 1) {
        return prev
      }
      return { ...prev, [track]: !isEnabled }
    })
  }

  useEffect(() => {
    if (activeViz !== 'network-toolkit' && externalControlsContent) {
      setExternalControlsContent(null)
    }
  }, [activeViz, externalControlsContent])
  const [barSortOrder, setBarSortOrder] = useState<BarSortOrder>('desc')
  const [barValueMode, setBarValueMode] = useState<BarValueMode>('absolute')
  const [heatmapColorMode, setHeatmapColorMode] = useState<HeatmapColorMode>('absolute')
  const [trlRange, setTrlRange] = useState<[number, number]>([1, 9])
  const [detectedClusters, setDetectedClusters] = useState<ClusterInfo[]>([])
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2)
  const [showClusters, setShowClusters] = useState(false)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [selectedSector, setSelectedSector] = useState<any>(null)
  const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'stakeholder' | 'technology' | 'project' | 'funding';
    id: string;
    data: any;
  } | null>(null)
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<string[]>([]) // New state for highlighting
  const MAX_RADAR_SELECTIONS = 8
  const TECHNOLOGY_CATEGORY_VALUES: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure']
  const STAKEHOLDER_TYPES: StakeholderType[] = ['Government', 'Research', 'Industry', 'Intermediary']

  interface EntityRecord {
    type: 'stakeholder' | 'technology' | 'project' | 'funding'
    id: string
    name: string
    data: any
  }

  const { entityById, entityByName } = useMemo(() => {
    const byId = new Map<string, EntityRecord>()
    const byName = new Map<string, EntityRecord[]>()

    const addEntity = (record: EntityRecord) => {
      byId.set(record.id.toLowerCase(), record)
      const key = record.name.trim().toLowerCase()
      if (!byName.has(key)) {
        byName.set(key, [])
      }
      byName.get(key)!.push(record)
    }

    stakeholders.forEach((stakeholder) => addEntity({ type: 'stakeholder', id: stakeholder.id, name: stakeholder.name, data: stakeholder }))
    technologies.forEach((tech) => addEntity({ type: 'technology', id: tech.id, name: tech.name, data: tech }))
    projects.forEach((project) => addEntity({ type: 'project', id: project.id, name: project.name, data: project }))
    fundingEvents.forEach((event) =>
      addEntity({
        type: 'funding',
        id: event.id,
        name: `${event.program || 'Funding'} ${event.id}`.trim(),
        data: event,
      }),
    )

    return { entityById: byId, entityByName: byName }
  }, [])

  const filterTechnologyCategories = (values: string[]): TechnologyCategory[] =>
    values
      .map((value) => value.trim())
      .filter((value): value is TechnologyCategory => TECHNOLOGY_CATEGORY_VALUES.includes(value as TechnologyCategory))

  const filterStakeholderTypes = (values: string[]): StakeholderType[] =>
    values
      .map((value) => value.trim())
      .filter((value): value is StakeholderType => STAKEHOLDER_TYPES.includes(value as StakeholderType))

  const parseString = (value: any): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }
    if (typeof value === 'number') {
      return String(value)
    }
    return undefined
  }

  const parseStringArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => parseString(item)).filter((item): item is string => Boolean(item))
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  const parseBoolean = (value: any): boolean | undefined => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.toLowerCase()
      if (normalized === 'true') return true
      if (normalized === 'false') return false
    }
    if (typeof value === 'number') {
      return value !== 0
    }
    return undefined
  }

  const parseNumber = (value: any): number | undefined => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
    return undefined
  }

  const parseRange = (value: any): [number, number] | null => {
    if (Array.isArray(value) && value.length >= 2) {
      const min = parseNumber(value[0])
      const max = parseNumber(value[1])
      if (typeof min === 'number' && typeof max === 'number') {
        return [min, max]
      }
    }
    if (typeof value === 'object' && value !== null) {
      const min = parseNumber(value.min ?? value.start ?? value.from)
      const max = parseNumber(value.max ?? value.end ?? value.to)
      if (typeof min === 'number' && typeof max === 'number') {
        return [min, max]
      }
    }
    if (typeof value === 'string' && value.includes('-')) {
      const [minPart, maxPart] = value.split('-')
      const min = parseNumber(minPart)
      const max = parseNumber(maxPart)
      if (typeof min === 'number' && typeof max === 'number') {
        return [min, max]
      }
    }
    return null
  }

  const resolveEntities = ({
    entityIds,
    entityNames,
  }: {
    entityIds?: string | string[]
    entityNames?: string | string[]
  }): EntityRecord[] => {
    const results: EntityRecord[] = []
    const seen = new Set<string>()

    const tryAdd = (record?: EntityRecord) => {
      if (record && !seen.has(record.id)) {
        results.push(record)
        seen.add(record.id)
      }
    }

    const idList = Array.isArray(entityIds) ? entityIds : entityIds ? [entityIds] : []
    idList.forEach((rawId) => {
      const idKey = rawId.trim().toLowerCase()
      tryAdd(entityById.get(idKey))
    })

    const nameList = Array.isArray(entityNames) ? entityNames : entityNames ? [entityNames] : []
    nameList.forEach((rawName) => {
      const key = rawName.trim().toLowerCase()
      const matches = entityByName.get(key)
      matches?.forEach((match) => tryAdd(match))
    })

    return results
  }

  const handleAIHighlightEntities = (args: any) => {
    const matches = resolveEntities({ entityIds: args?.entityIds, entityNames: args?.entityNames })
    if (matches.length > 0) {
      const first = matches[0]
      setSelectedEntity({ type: first.type, id: first.id, data: first.data })
      return true
    }
    return false
  }

  const handleAISetControl = (controlId: string, value: any) => {
    const stringValue = parseString(value)
    switch (controlId) {
      case 'circle.setView':
        if (stringValue) {
          setCirclePackingView(stringValue as typeof circlePackingView)
          return true
        }
        break
      case 'bar.setView':
        if (stringValue) {
          setBarChartView(stringValue as typeof barChartView)
          return true
        }
        break
      case 'bar.setSort':
        if (stringValue === 'asc' || stringValue === 'desc') {
          setBarSortOrder(stringValue as BarSortOrder)
          return true
        }
        break
      case 'bar.setValueMode':
        if (stringValue === 'absolute' || stringValue === 'percentage') {
          setBarValueMode(stringValue as BarValueMode)
          return true
        }
        break
      case 'treemap.setView':
        if (stringValue) {
          setTreemapView(stringValue as typeof treemapView)
          return true
        }
        break
      case 'chord.setView':
        if (stringValue) {
          setChordView(stringValue as typeof chordView)
          return true
        }
        break
      case 'stream.setView':
        if (stringValue) {
          setStreamView(stringValue as typeof streamView)
          return true
        }
        break
      case 'swarm.setView':
        if (stringValue) {
          setSwarmView(stringValue as typeof swarmView)
          return true
        }
        break
      case 'radar.toggleTechnology': {
        const techIds = parseStringArray(value).slice(0, MAX_RADAR_SELECTIONS)
        if (techIds.length > 0) {
          setSelectedTechIds(techIds)
          return true
        }
        break
      }
      case 'radar.toggleDimension': {
        const dims = parseStringArray(value)
        if (dims.length > 0) {
          setSelectedDimensions(dims)
          return true
        }
        break
      }
      case 'bump.setMode':
        if (stringValue) {
          setBumpView(stringValue as typeof bumpView)
          return true
        }
        break
      case 'bump.toggleCategory': {
        const categories = filterTechnologyCategories(parseStringArray(value))
        setSelectedCategories(categories)
        if (categories.length > 0) {
          setBumpView('by_category')
        }
        return true
      }
      case 'timeline.toggleTrack': {
        const entries = Array.isArray(value) ? value : [value]
        setTimelineTracks((prev) => {
          const updated = { ...prev }
          entries.forEach((entry) => {
            if (typeof entry === 'string') {
              const track = entry as TimelineTrack
              if (track in updated) {
                updated[track] = !updated[track]
              }
            } else if (entry && typeof entry === 'object' && entry.track) {
              const track = entry.track as TimelineTrack
              if (track in updated) {
                if (typeof entry.enabled === 'boolean') {
                  updated[track] = entry.enabled
                } else {
                  updated[track] = !updated[track]
                }
              }
            }
          })
          return updated
        })
        return true
      }
      case 'heatmap.setMatrix':
        if (stringValue) {
          setHeatmapView(stringValue as typeof heatmapView)
          return true
        }
        break
      case 'heatmap.setScale':
        if (stringValue === 'absolute' || stringValue === 'normalized') {
          setHeatmapColorMode(stringValue as HeatmapColorMode)
          return true
        }
        break
      case 'parallel.setDimensions': {
        const dims = parseStringArray(value)
        if (dims.length > 0) {
          setParallelDimensions(dims)
          return true
        }
        break
      }
      case 'network.setSimilarity': {
        const num = parseNumber(value)
        if (typeof num === 'number') {
          const clamped = Math.min(Math.max(num, 0), 1)
          setSimilarityThreshold(clamped)
          return true
        }
        break
      }
      case 'network.toggleCluster': {
        const bool = parseBoolean(value)
        if (typeof bool === 'boolean') {
          setShowClusters(bool)
          return true
        }
        break
      }
      case 'network.toggleOrbit': {
        const bool = parseBoolean(value)
        if (typeof bool === 'boolean') {
          setIsOrbiting(bool)
          return true
        }
        break
      }
      case 'data_source': {
        const bool = parseBoolean(value)
        if (typeof bool === 'boolean') {
          setUseNavigateData(bool)
          return true
        }
        break
      }
      case 'trl_range': {
        const range = parseRange(value)
        if (range) {
          const min = Math.max(1, Math.min(range[0], range[1]))
          const max = Math.min(9, Math.max(range[0], range[1]))
          if (min <= max) {
            setTrlRange([min, max])
            return true
          }
        }
        break
      }
    }
    return false
  }

  // Update activeViz when category changes
  useEffect(() => {
    if (filteredVisualizations.length > 0) {
      const firstViz = filteredVisualizations[0].id
      if (!filteredVisualizations.find(v => v.id === activeViz)) {
        setActiveViz(firstViz)
      }
    }
  }, [viewCategory, filteredVisualizations])
  
  // Auto-enable NAVIGATE data for NAVIGATE-only visualizations
  useEffect(() => {
    const navigateOnlyVisualizations: VisualizationType[] = ['stream', 'parallel', 'swarm', 'radar', 'bar', 'circle', 'bump', 'treemap', 'heatmap', 'chord', 'network3d'];
    if (navigateOnlyVisualizations.includes(activeViz) && !useNavigateData) {
      setUseNavigateData(true);
    }
  }, [activeViz, useNavigateData]);
  
  // Filter technologies by TRL range
  const filteredTechnologies = technologies.filter(tech => {
    const trl = tech.trl_current || 0;
    return trl >= trlRange[0] && trl <= trlRange[1];
  });
  const technologyCategories = Array.from(
    new Set(filteredTechnologies.map(t => t.category)),
  ).filter(Boolean) as TechnologyCategory[]

  const activeCategoryMeta = categoryNavItems.find(category => category.id === viewCategory);
  const controlContext: VisualizationControlContext = {
    useNavigateData,
    timelineTracks,
    toggleTimelineTrack,
    barSortOrder,
    setBarSortOrder,
    barValueMode,
    setBarValueMode,
    barChartView,
    setBarChartView,
    circlePackingView,
    setCirclePackingView,
    bumpView,
    setBumpView,
    selectedCategories,
    setSelectedCategories,
    treemapView,
    setTreemapView,
    chordView,
    setChordView,
    heatmapView,
    setHeatmapView,
    heatmapColorMode,
    setHeatmapColorMode,
    streamView,
    setStreamView,
    streamScenario,
    setStreamScenario,
    streamScenarioState,
    setStreamScenarioState,
    parallelDimensions,
    setParallelDimensions,
    swarmView,
    setSwarmView,
    selectedTechIds,
    setSelectedTechIds,
    selectedDimensions,
    setSelectedDimensions,
    filteredTechnologies,
    technologyCategories,
    similarityThreshold,
    setSimilarityThreshold,
    showClusters,
    setShowClusters,
    isOrbiting,
    setIsOrbiting,
  }
  
  // Handle category change
  const handleCategoryChange = (category: ViewCategory) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('view')
    } else {
      params.set('view', category)
    }
    router.push(`/navigate?${params.toString()}`)
  }
  
  // Handle challenge selection
  const handleChallengeSelect = (challenge: any) => {
    setSelectedChallenge(challenge)
    setSelectedEntity(null) // Clear entity selection when challenge is selected
  }
  
  // Handle cluster detection
  const handleClustersDetected = (clusters: ClusterInfo[]) => {
    setDetectedClusters(clusters)
  }
  
  // Handle node clicks
  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
    // Could implement entity selection logic here
  }
  
  // Calculate key metrics for overview
  const totalFunding = fundingEvents.reduce((sum, e) => sum + e.amount, 0)
  const totalStakeholders = stakeholders.length
  const totalTechnologies = filteredTechnologies.length
  const totalProjects = projects.length
  
  // Get active visualization details
  const activeVisualization = visualizations.find(v => v.id === activeViz)
  
  // Render visualization (same logic as visualizations page - will copy the full renderVisualization function)
  // For now, I'll create a simplified version and we can expand it
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10">
        <TopNavigation />
        <UnifiedFloatingNav currentPage="navigate" />
        
        <div className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#006E51] mb-2">NAVIGATE Platform</h1>
              <p className="text-gray-600">Interactive intelligence for zero-emission aviation ecosystem</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/visualisations')}
                className="border-[#006E51]/50 text-[#006E51] hover:bg-[#006E51]/10"
              >
                <Library className="h-4 w-4 mr-2" />
                Visual Library
              </Button>
              <LayoutSwitcher 
                currentLayout={currentLayout}
                onLayoutChange={setCurrentLayout}
              />
              <Button
                variant="outline"
                onClick={() => setShowInsights(!showInsights)}
                className="border-[#006E51] text-[#006E51]"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showInsights ? 'Hide' : 'Show'} Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-[#006E51] text-[#006E51]"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
          
          {/* Category Navigation Cards - Minimized by default, expand on hover */}
          <div 
            className="mb-6 transition-all duration-300"
            onMouseEnter={() => setCategoriesCollapsed(false)}
            onMouseLeave={() => setCategoriesCollapsed(true)}
          >
            {categoriesCollapsed ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#CCE2DC] h-12">
                {categoryNavItems.map((category) => {
                  const Icon = category.icon
                  const isActive = viewCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`p-2 rounded transition-all ${
                        isActive
                          ? 'bg-[#006E51] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={category.name}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  )
                })}
                <div className="ml-auto text-xs text-gray-500">Hover to expand categories</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categoryNavItems.map((category) => {
                  const Icon = category.icon
                  const isActive = viewCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? 'border-[#006E51] bg-[#006E51]/10 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-[#006E51]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-6 w-6 ${isActive ? 'text-[#006E51]' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          isActive ? 'bg-[#006E51] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                      <h3 className={`font-semibold mb-1 ${isActive ? 'text-[#006E51]' : 'text-gray-800'}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Visualization Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filteredVisualizations.map((viz) => {
              const Icon = viz.icon
              const isActive = activeViz === viz.id
              return (
                <button
                  key={viz.id}
                  onClick={() => setActiveViz(viz.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#006E51] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  title={viz.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{viz.name}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Main Content Area - Using Layout Renderer */}
        <LayoutRenderer
          layout={currentLayout}
          controlsPanel={
            <>
              {/* Hover trigger line/icon when collapsed */}
              {!controlsPinned && !controlsHovered && (
                <div 
                  className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-[#006E51]/30 hover:bg-[#006E51]/60 hover:w-2 transition-all duration-300 cursor-pointer rounded-r-full z-50"
                  onMouseEnter={() => {
                    setControlsHovered(true)
                    if (controlsCollapseTimeout) {
                      clearTimeout(controlsCollapseTimeout)
                      setControlsCollapseTimeout(null)
                    }
                  }}
                />
              )}
              
              {/* Controls panel */}
              <div 
                className={`fixed left-0 top-[120px] bottom-0 w-80 bg-white/95 backdrop-blur-sm border-r border-[#CCE2DC] shadow-xl transition-transform duration-300 z-40 ${
                  controlsPinned || controlsHovered
                    ? 'translate-x-0' 
                    : '-translate-x-full'
                }`}
                onMouseEnter={() => {
                  setControlsHovered(true)
                  if (controlsCollapseTimeout) {
                    clearTimeout(controlsCollapseTimeout)
                    setControlsCollapseTimeout(null)
                  }
                }}
                onMouseLeave={() => {
                  if (!controlsPinned) {
                    const timeout = setTimeout(() => {
                      setControlsHovered(false)
                    }, 500)
                    setControlsCollapseTimeout(timeout)
                  }
                }}
              >
                <GlobalControlsPanel
                  pinned={controlsPinned}
                  onTogglePin={() => {
                    setControlsPinned(!controlsPinned)
                    if (controlsHovered) {
                      setControlsHovered(false)
                    }
                  }}
                  showDataSourceToggle
                  useNavigateData={useNavigateData}
                  onDataSourceChange={(val) => setUseNavigateData(val)}
                  showTrlFilter
                  trlRange={trlRange}
                  onTrlRangeChange={setTrlRange}
                  activeVisualizationName={activeVisualization?.name}
                  activeCategoryLabel={activeCategoryMeta?.name}
                  availableCount={filteredTechnologies.length}
                  totalTechnologyCount={technologies.length}
                >
              {activeViz === 'network-toolkit'
                ? (externalControlsContent ?? (
                    <div className="p-4 text-sm text-gray-500">Toolkit network controls loading…</div>
                  ))
                : (
                  <VisualizationControlSections
                    activeViz={activeViz}
                    context={controlContext}
                  />
                )}
                </GlobalControlsPanel>
              </div>
            </>
          }
          visualization={
            <div className={`w-full h-full transition-all duration-300 ${
              controlsPinned || controlsHovered ? 'ml-80' : 'ml-0'
            }`}>
              <VisualizationRenderer
              activeViz={activeViz}
              useNavigateData={useNavigateData}
              isFullscreen={isFullscreen}
              filteredChallenges={filteredChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={handleChallengeSelect}
              onClustersDetected={handleClustersDetected}
              stakeholders={stakeholders}
              technologies={filteredTechnologies}
              projects={projects}
              fundingEvents={fundingEvents}
              relationships={relationships}
              selectedTechIds={selectedTechIds}
              setSelectedTechIds={setSelectedTechIds}
              selectedDimensions={selectedDimensions}
              setSelectedDimensions={setSelectedDimensions}
              barChartView={barChartView}
              setBarChartView={setBarChartView}
              circlePackingView={circlePackingView}
              setCirclePackingView={setCirclePackingView}
              bumpView={bumpView}
              setBumpView={setBumpView}
              selectedCategories={selectedCategories}
              treemapView={treemapView}
              setTreemapView={setTreemapView}
              chordView={chordView}
              setChordView={setChordView}
              heatmapView={heatmapView}
              setHeatmapView={setHeatmapView}
              streamView={streamView}
              setStreamView={setStreamView}
              streamScenario={streamScenario}
              setStreamScenario={setStreamScenario}
              streamScenarioState={streamScenarioState}
              setStreamScenarioState={setStreamScenarioState}
              parallelDimensions={parallelDimensions}
              setParallelDimensions={setParallelDimensions}
              swarmView={swarmView}
              setSwarmView={setSwarmView}
              timelineGroups={activeTimelineGroups}
              barSortOrder={barSortOrder}
              barValueMode={barValueMode}
              heatmapColorMode={heatmapColorMode}
              similarityThreshold={similarityThreshold}
              setSimilarityThreshold={setSimilarityThreshold}
              showClusters={showClusters}
              setShowClusters={setShowClusters}
              isOrbiting={isOrbiting}
              setIsOrbiting={setIsOrbiting}
              selectedCluster={selectedCluster}
              setSelectedCluster={setSelectedCluster}
              onNodeClick={handleNodeClick}
              onEntitySelect={(entity) => {
                setSelectedEntity(entity);
              }}
              onTechnologySelect={(techId) => {
                const tech = filteredTechnologies.find(t => t.id === techId);
                if (tech) {
                  setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                }
              }}
              highlightedEntityIds={highlightedEntityIds}
              onExternalControlsChange={setExternalControlsContent}
              inlineInsightsLocked={currentLayout === 'option3'}
              defaultInlineInsights={currentLayout !== 'option3'}
            />
            </div>
          }
          insightsPanel={
            showInsights ? (
              <UnifiedInsightsPanel
                selectedEntity={selectedEntity}
                relatedEntities={
                  selectedEntity?.data?.relatedEntities as CirclePackingNode[] | undefined
                }
                onEntitySelect={(entity) => setSelectedEntity(entity)}
                onClearSelection={() => setSelectedEntity(null)}
                showQuickStats={true}
                quickStats={{
                  totalFunding,
                  totalStakeholders,
                  totalTechnologies,
                  totalProjects,
                }}
              />
            ) : (
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
                <p className="text-sm text-gray-600">Insights panel hidden</p>
              </div>
            )
          }
          aiChatPanel={
            <AIChatPanel
              context={{
                activeViz: activeViz,
                useNavigateData: useNavigateData,
                selectedEntities: selectedEntity
                  ? [
                      {
                        type: selectedEntity.type,
                        id: selectedEntity.id,
                        name: selectedEntity.data.name,
                        ...selectedEntity.data,
                      },
                    ]
                  : [],
              }}
              onFunctionCall={async (functionName, args) => {
                try {
                  switch (functionName) {
                    case 'switch_visualization':
                      if (args?.visualization) {
                        setActiveViz(args.visualization as VisualizationType)
                      }
                      return { success: true }
                    case 'set_control':
                      if (!handleAISetControl(args?.controlId, args?.value)) {
                        console.warn('AI control change failed', args)
                        return { success: false, error: 'Control change failed' }
                      }
                      return { success: true }
                    case 'filter_data': {
                      const range = parseRange(args?.trlRange)
                      if (range) {
                        const min = Math.max(1, Math.min(range[0], range[1]))
                        const max = Math.min(9, Math.max(range[0], range[1]))
                        if (min <= max) {
                          setTrlRange([min, max])
                        }
                      }
                      if (args?.categories) {
                        const categories = filterTechnologyCategories(parseStringArray(args.categories))
                        if (categories.length > 0) {
                          setSelectedCategories(categories)
                        }
                      }
                      if (typeof args?.useNavigateData !== 'undefined') {
                        const bool = parseBoolean(args.useNavigateData)
                        if (typeof bool === 'boolean') {
                          setUseNavigateData(bool)
                        }
                      }
                      return { success: true }
                    }
                    case 'highlight_entities':
                      if (!handleAIHighlightEntities(args)) {
                        console.warn('AI highlight failed', args)
                        return { success: false, error: 'Highlight failed' }
                      }
                      return { success: true }
                    default:
                      return { success: false, error: `Unknown function: ${functionName}` }
                  }
                } catch (error) {
                  return { 
                    success: false, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                  }
                }
              }}
            />
          }
          quickStats={null}
        />
      </div>

        {/* Toolkit Network Gold Standard */}
        <section className="mt-24 space-y-6" id="library-network">
          <div className="text-center space-y-3">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Gold Standard</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#2E2D2B]">Toolkit Network Diagram</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Toolkit force-directed graph using real NAVIGATE relationships. Compare inline controls with a persistent side-panel view.
            </p>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 text-sm"
              onClick={() => setShowInlineLibraryNetworkControls((prev) => !prev)}
            >
              {showInlineLibraryNetworkControls ? 'Hide Inline Controls' : 'Show Inline Controls'}
            </Button>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            <NetworkGraphNavigate
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              relationships={relationships}
              className="border-none shadow-none"
              showControls={showInlineLibraryNetworkControls}
              relationshipFilters={libraryRelationshipFilters}
              onRelationshipFiltersChange={setLibraryRelationshipFilters}
              hideIsolatedNodes={libraryHideIsolated}
              onHideIsolatedNodesChange={setLibraryHideIsolated}
              nodeSpacing={libraryNodeSpacing}
              onNodeSpacingChange={setLibraryNodeSpacing}
              showSpacingControl={libraryShowSpacingControl}
              onShowSpacingControlChange={setLibraryShowSpacingControl}
            />

            <div className="bg-white/80 backdrop-blur-sm border border-[#CCE2DC]/60 rounded-xl p-6">
              <NetworkRelationshipControls
                relationshipFilters={libraryRelationshipFilters}
                onRelationshipFiltersChange={setLibraryRelationshipFilters}
                hideIsolatedNodes={libraryHideIsolated}
                onHideIsolatedNodesChange={setLibraryHideIsolated}
                nodeSpacing={libraryNodeSpacing}
                onNodeSpacingChange={setLibraryNodeSpacing}
                showSpacingControl={libraryShowSpacingControl}
                onShowSpacingControlChange={setLibraryShowSpacingControl}
              />
            </div>
          </div>
        </section>

        {/* Visualization Library Sections */}
        <div className="mt-24 space-y-16">
          <div className="text-center space-y-3">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Visualization Library</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#2E2D2B]">Compare Atlas, NAVIGATE & Toolkit Visuals</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Review every visualization, understand control layouts, and mark gold standards for future harmonisation.
            </p>
          </div>

          {/* Network Diagrams */}
          <VisualLibrarySection
            sectionId="network-diagrams"
            title="Network Diagrams"
            description="Force-directed graphs showing relationships between entities. Compare implementations to identify the gold standard."
            badge="Library"
            visuals={[
              {
                id: "atlas-network",
                title: "Atlas Challenge Network",
                description: "Similarity-based network graph using challenge keywords & sectors.",
                origin: "Atlas",
                status: "experimental",
                layout: "slideout",
                controls: "Orbit toggle, cluster highlight, similarity slider",
                insights: "Cluster insights + challenge detail cards",
                render: () => (
                  <NetworkGraph
                    challenges={challenges}
                    showControls={false}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-network-navigate",
                title: "Toolkit Network Graph (Navigate)",
                description: "NAVIGATE version using Stakeholder, Technology, Project, and Relationship entities with REAL relationships.",
                origin: "Toolkit",
                status: "gold",
                layout: "panel",
                controls: "Entity selection, filter presets, relationship highlighting",
                insights: "Entity details, relationship paths, TRL overlays",
                render: () => (
                  <NetworkGraphNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    projects={projects}
                    relationships={relationships}
                    showControls={false}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-network-d3",
                title: "Network Graph (D3 Variant)",
                description: "D3.js-based network visualization variant.",
                origin: "Toolkit",
                status: "experimental",
                layout: "inline",
                controls: "Basic D3 interactions",
                render: () => (
                  <div className="p-6 bg-gradient-to-br from-[#CCE2DC]/50 to-white rounded-2xl min-h-[300px] flex flex-col justify-center">
                    <p className="text-xs tracking-[0.4em] uppercase text-[#006E51] mb-4">D3 Variant</p>
                    <p className="text-gray-600">NetworkGraphD3 component - needs data props</p>
                  </div>
                ),
              },
              {
                id: "toolkit-network-echarts",
                title: "Network Graph (ECharts Variant)",
                description: "ECharts-based network visualization variant.",
                origin: "Toolkit",
                status: "experimental",
                layout: "inline",
                controls: "ECharts interactions",
                render: () => (
                  <div className="p-6 bg-gradient-to-br from-[#CCE2DC]/50 to-white rounded-2xl min-h-[300px] flex flex-col justify-center">
                    <p className="text-xs tracking-[0.4em] uppercase text-[#006E51] mb-4">ECharts Variant</p>
                    <p className="text-gray-600">NetworkGraphECharts component - needs data props</p>
                  </div>
                ),
              },
            ]}
            visualType="Network"
            showHarmonization={true}
          />

          {/* Sankey Diagrams */}
          <VisualLibrarySection
            sectionId="sankey-diagrams"
            title="Sankey Flow Diagrams"
            description="Flow visualizations showing resource movement through systems. Compare Atlas challenge flows with Navigate funding flows."
            badge="Library"
            visuals={[
              {
                id: "atlas-sankey",
                title: "Challenge Flow Analysis",
                description: "Atlas sector → problem type → urgency Sankey used for Flow Analysis demos.",
                origin: "Atlas",
                status: "gold",
                layout: "panel",
                controls: "Node click filtering, shared filter bar (planned)",
                insights: "Feeds Flow Analysis insight cards & dataset overview",
                render: () => (
                  <SankeyChart challenges={challenges} className="border-none shadow-none" />
                ),
              },
              {
                id: "toolkit-sankey-navigate",
                title: "Funding Flow (Navigate)",
                description: "NAVIGATE funding flows: Source → Intermediary → Recipient → Technology.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "Funding type filters, date range, amount thresholds",
                insights: "Funding gap narratives, flow patterns",
                render: () => (
                  <SankeyChartNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    fundingEvents={fundingEvents}
                    relationships={relationships}
                    className="border-none shadow-none"
                  />
                ),
              },
            ]}
            visualType="Sankey"
            showHarmonization={true}
          />

          {/* Heatmaps */}
          <VisualLibrarySection
            sectionId="heatmaps"
            title="Heatmap Visualizations"
            description="Intensity maps showing density and patterns. Compare Atlas challenge intensity with Navigate-specific heatmaps."
            badge="Library"
            visuals={[
              {
                id: "atlas-heatmap",
                title: "Challenge Intensity Heatmap",
                description: "Sector × problem-type intensity view from the Atlas Intensity Map.",
                origin: "Atlas",
                status: "gold",
                layout: "panel",
                controls: "Cell selection, preset filters",
                insights: "Heatmap cell analysis + sector summaries",
                render: () => (
                  <HeatmapChart challenges={challenges} className="border-none shadow-none" />
                ),
              },
              {
                id: "toolkit-heatmap-navigate",
                title: "Navigate Heatmap",
                description: "NAVIGATE-specific heatmap showing TRL vs category, tech vs stakeholder, or funding vs status.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode selector, dimension filters",
                insights: "Cell analysis, dimension summaries",
                render: () => (
                  <HeatmapNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
            ]}
            visualType="Heatmap"
            showHarmonization={true}
          />

          {/* Hierarchical Visualizations */}
          <VisualLibrarySection
            sectionId="hierarchical"
            title="Hierarchical Visualizations"
            description="Sunburst, treemap, and circle packing views showing nested relationships. Compare different hierarchical approaches."
            badge="Library"
            visuals={[
              {
                id: "atlas-sunburst",
                title: "Hierarchical Sunburst",
                description: "Toolkit layout prototype showing sector hierarchy with Atlas challenge data.",
                origin: "Atlas",
                status: "experimental",
                layout: "panel",
                controls: "Global dataset selector (planned)",
                insights: "Pairs with hierarchical insight cards",
                render: () => (
                  <SunburstChart challenges={challenges} className="border-none shadow-none" />
                ),
              },
              {
                id: "toolkit-circle-packing",
                title: "Circle Packing (Navigate)",
                description: "Hierarchical stakeholder and technology relationships using circle packing.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode (by stakeholder type, tech category, funding)",
                insights: "Hierarchical breakdown, relationship paths",
                render: () => (
                  <CirclePackingNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    projects={projects}
                    fundingEvents={fundingEvents}
                    relationships={relationships}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-treemap",
                title: "Treemap (Navigate)",
                description: "Funding distribution treemap showing hierarchical funding breakdown.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode toggle, category filters",
                insights: "Funding breakdown by category",
                render: () => (
                  <TreemapNavigate
                    stakeholders={stakeholders}
                    fundingEvents={fundingEvents}
                    technologies={technologies}
                    projects={projects}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-treemap-sunburst-explorer",
                title: "Treemap/Sunburst Explorer",
                description: "Combined treemap and sunburst explorer with view mode toggle.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode toggle (treemap/sunburst), category filters",
                insights: "Hierarchical exploration insights",
                render: () => (
                  <TreemapSunburstExplorer
                    stakeholders={stakeholders}
                    fundingEvents={fundingEvents}
                    technologies={technologies}
                    projects={projects}
                    relationships={relationships}
                    className="border-none shadow-none"
                  />
                ),
              },
            ]}
            visualType="Hierarchical"
            showHarmonization={true}
          />

          {/* Relationship Visualizations */}
          <VisualLibrarySection
            sectionId="relationship"
            title="Relationship Matrix Visualizations"
            description="Chord diagrams showing cross-sector and cross-entity relationships. Compare Atlas and Navigate implementations."
            badge="Library"
            visuals={[
              {
                id: "atlas-chord",
                title: "Relationship Matrix (Chord)",
                description: "Cross-sector dependency chord diagram currently used in toolkit explorations.",
                origin: "Atlas",
                status: "legacy",
                layout: "inline",
                controls: "Hover interactions only",
                insights: "Feeds qualitative dependency notes",
                render: () => (
                  <ChordDiagram challenges={challenges} className="border-none shadow-none" />
                ),
              },
              {
                id: "toolkit-chord-navigate",
                title: "Chord Diagram (Navigate)",
                description: "NAVIGATE relationship chord diagram showing stakeholder type, tech category, or funding flow relationships.",
                origin: "Toolkit",
                status: "experimental",
                layout: "inline",
                controls: "View mode selector, hover interactions",
                insights: "Relationship strength, connection patterns",
                render: () => (
                  <ChordDiagramNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    relationships={relationships}
                    className="border-none shadow-none"
                  />
                ),
              },
            ]}
            visualType="Relationship"
            showHarmonization={true}
          />

          {/* Analysis Charts */}
          <VisualLibrarySection
            sectionId="analysis-charts"
            title="Analysis Charts"
            description="Radar, bar, bump, stream, parallel coordinates, and swarm plots for multi-dimensional analysis."
            badge="Library"
            visuals={[
              {
                id: "toolkit-radar",
                title: "Tech Maturity Radar",
                description: "Compare technology readiness across multiple dimensions (TRL, Market Readiness, Regulatory Status, etc.).",
                origin: "Toolkit",
                status: "gold",
                layout: "panel",
                controls: "Dimension selector, technology multi-select, comparison mode",
                insights: "Technology comparison insights, maturity gaps",
                render: () => (
                  <RadarChartNavigate
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-bar",
                title: "Bar Chart Analysis",
                description: "Funding, projects, and technology breakdowns by various dimensions.",
                origin: "Toolkit",
                status: "gold",
                layout: "panel",
                controls: "View mode (funding by stakeholder, funding by tech, projects by status, tech by TRL)",
                insights: "Breakdown summaries, top performers",
                render: () => (
                  <BarChartNavigate
                    stakeholders={stakeholders}
                    technologies={technologies}
                    fundingEvents={fundingEvents}
                    projects={projects}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-bump",
                title: "TRL Progression (Bump Chart)",
                description: "Technology readiness level advancement over time showing acceleration/stagnation.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode (all technologies, by category, top advancing), category filters",
                insights: "TRL progression patterns, acceleration analysis",
                render: () => (
                  <BumpChartNavigate
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-stream",
                title: "Funding Trends (Stream Graph)",
                description: "Temporal funding streams showing funding flows over time by stakeholder type, tech category, or funding type.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode selector, date range, category filters",
                insights: "Temporal patterns, trend analysis",
                render: () => (
                  <StreamGraphNavigate
                    fundingEvents={fundingEvents}
                    stakeholders={stakeholders}
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-parallel",
                title: "Parallel Coordinates",
                description: "Multi-dimensional technology comparison across TRL, Funding, Market Readiness, Regulatory Status, and 2030 Maturity.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "Dimension selector, technology multi-select, brush selection",
                insights: "Multi-dimensional patterns, outlier detection",
                render: () => (
                  <ParallelCoordinatesNavigate
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
              {
                id: "toolkit-swarm",
                title: "Technology Distribution (Swarm Plot)",
                description: "TRL and category distribution showing technology clustering and patterns.",
                origin: "Toolkit",
                status: "experimental",
                layout: "panel",
                controls: "View mode (by TRL, by category), filters",
                insights: "Distribution patterns, clustering analysis",
                render: () => (
                  <SwarmPlotNavigate
                    technologies={technologies}
                    className="border-none shadow-none"
                  />
                ),
              },
            ]}
            visualType="Analysis"
            showHarmonization={true}
          />
        </div>
    </div>
  )
}

// Main page component with Suspense for search params
export default function NavigatePage() {
  return (
    <AppProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006E51] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading NAVIGATE Platform...</p>
          </div>
        </div>
      }>
        <NavigateContent />
      </Suspense>
    </AppProvider>
  )
}


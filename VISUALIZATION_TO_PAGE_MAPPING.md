# Complete Visualization to Page Mapping

This document maps every visualization component to the pages where it's used, helping identify redundancies and organize the codebase.

## Quick Reference Table

| Visualization Component | `/navigate` | `/visualizations` | `/visualisations` | `/toolkit` | Test Pages | Status |
|------------------------|:-----------:|:-----------------:|:-----------------:|:----------:|:----------:|:------:|
| **Navigate Visualizations** |
| SankeyChartNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| RadarChartNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| BarChartNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| CirclePackingNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| BumpChartNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| TreemapSunburstExplorer | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| HeatmapNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| ChordDiagramNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| StreamGraphNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| SwarmPlotNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| NetworkGraphNavigate | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| NetworkGraphNavigate3D | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| NetworkGraphV8 | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ KEEP |
| TreemapNavigate | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ Check |
| ParallelCoordinatesNavigate | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ DELETED |
| **Base/Atlas Visualizations** |
| SankeyChart | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ KEEP |
| NetworkGraph | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ KEEP |
| HeatmapChart | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ KEEP |
| SunburstChart | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ KEEP |
| ChordDiagram | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ KEEP |
| NetworkGraphD3 | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ KEEP |
| NetworkGraphECharts | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ KEEP |
| UnifiedNetworkGraph | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| **CPC Visualizations** |
| PortfolioTreemap | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| StakeholderSunburst | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| FocusAreaMatrix | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| StagePipeline | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| StakeholderNetwork | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| TreemapSunburstTransition | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ KEEP |
| **Toolkit Visualizations** |
| D3NetworkGraphView | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ KEEP |
| CirclePackingSimpleECharts | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ KEEP |
| EnhancedInnovationTracker | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ KEEP |
| InnovationTrackerSankey | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ KEEP |

**Legend:**
- ✅ = Used on this page
- ❌ = Not used on this page
- ⚠️ = Needs review

---

---

## Navigate Visualizations (Navigate Data)

### SankeyChartNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### RadarChartNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### BarChartNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### CirclePackingNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### BumpChartNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### TreemapSunburstExplorer.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### HeatmapNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### ChordDiagramNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### StreamGraphNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### SwarmPlotNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### NetworkGraphNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### NetworkGraphNavigate3D.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### NetworkGraphV8.tsx
**Pages:**
- `/visualisations/page.tsx` (via dynamic import, registered as 'network-graph-v8')

**Status:** ✅ Used in Visual Library - KEEP

---

### TreemapNavigate.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)

**Status:** ⚠️ ONLY in `/navigate` - Check if redundant with TreemapSunburstExplorer

---

### ParallelCoordinatesNavigate.tsx
**Pages:**
- ❌ REMOVED (already deleted)

**Status:** ✅ DELETED

---

## Base/Atlas Visualizations (Challenge Data)

### SankeyChart.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/test-sankey/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in test page - KEEP

---

### NetworkGraph.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/test-network/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in test page - KEEP

---

### HeatmapChart.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/test-heatmap/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in test page - KEEP

---

### SunburstChart.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/test-sunburst/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in test page - KEEP

---

### ChordDiagram.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/test-chord/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in test page - KEEP

---

## Network Graph Variants

### NetworkGraphD3.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/test-network/page.tsx` (direct import)

**Status:** ✅ Used in test page - KEEP

---

### NetworkGraphECharts.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/test-network/page.tsx` (direct import)

**Status:** ✅ Used in test page - KEEP

---

### UnifiedNetworkGraph.tsx
**Pages:**
- `/navigate/page.tsx` (direct import)
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### NetworkGraphDemo.tsx, NetworkGraphDemoV5.tsx, NetworkGraphDemoV6.tsx, etc.
**Pages:**
- `/test-unified-network-v*` pages (various test pages)

**Status:** ⚠️ Test/demo versions - Consider consolidating or removing

---

## CPC Visualizations

### PortfolioTreemap.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import, registered as 'portfolio-treemap')

**Status:** ✅ Used in Visual Library - KEEP

---

### StakeholderSunburst.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import, registered as 'stakeholder-sunburst')

**Status:** ✅ Used in Visual Library - KEEP

---

### FocusAreaMatrix.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### StagePipeline.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### StakeholderNetwork.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

### TreemapSunburstTransition.tsx
**Pages:**
- `/visualizations/page.tsx` (direct import)
- `/visualisations/page.tsx` (via VisualizationRenderer)

**Status:** ✅ Used in Visual Library - KEEP

---

## Toolkit Visualizations

### D3NetworkGraphView.tsx (in toolkit folder)
**Pages:**
- `/toolkit/page.tsx` (via StakeholderDynamicsView)
- `/visualisations/page.tsx` (via dynamic import, registered as 'stakeholder-network-d3')

**Status:** ✅ Used in Toolkit and Visual Library - KEEP

---

### CirclePackingSimpleECharts.tsx (in toolkit folder)
**Pages:**
- `/toolkit/page.tsx` (via StakeholderDynamicsView)
- `/visualisations/page.tsx` (via dynamic import, registered as 'stakeholder-circle')

**Status:** ✅ Used in Toolkit and Visual Library - KEEP

---

### EnhancedInnovationTracker.tsx (in toolkit folder)
**Pages:**
- `/toolkit/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import, registered as 'innovation-tracker-enhanced')

**Status:** ✅ Used in Toolkit and Visual Library - KEEP

---

### InnovationTrackerSankey.tsx (in toolkit folder)
**Pages:**
- `/toolkit/page.tsx` (direct import)
- `/visualisations/page.tsx` (via dynamic import, registered as 'innovation-tracker-classic')

**Status:** ✅ Used in Toolkit and Visual Library - KEEP

---

## Other/Unused Visualizations

### BubbleScatterNavigate.tsx
**Pages:**
- `/visualisations/page.tsx` (via VisualizationRenderer only)

**Status:** ⚠️ Check if registered in Visual Library

---

### TimelineNavigate.tsx
**Pages:**
- `/visualisations/page.tsx` (via VisualizationRenderer only)

**Status:** ⚠️ Check if registered in Visual Library

---

### HarmonizationAnalysis.tsx
**Pages:**
- ❓ Unknown - Check usage

**Status:** ⚠️ Check if used anywhere

---

### D3NetworkGraphToolkit.tsx, D3NetworkGraphUnified.tsx, D3NetworkGraphUniversal.tsx
**Pages:**
- ❓ Unknown - Check usage

**Status:** ⚠️ Check if used anywhere

---

### UnifiedNetworkGraphClustered.tsx, UnifiedNetworkGraphD3.tsx, UnifiedNetworkGraphNested.tsx
**Pages:**
- ❓ Unknown - Check usage

**Status:** ⚠️ Check if used anywhere

---

## Summary by Page

### `/navigate/page.tsx` (TO BE REMOVED)
**Uses 20+ visualizations** - All are also used elsewhere, safe to remove

### `/visualizations/page.tsx` (TO BE REMOVED)
**Uses 20+ visualizations** - All are also used elsewhere, safe to remove

### `/visualisations/page.tsx` (KEEP - Visual Library)
**Registered Visualizations:**
1. Stakeholder Network (D3) - Toolkit
2. Stakeholder Circle - Toolkit
3. Network Graph V8 - Unified
4. Innovation Tracker Enhanced - Toolkit
5. Innovation Tracker Classic - Toolkit
6. Flow Analysis (Sankey) - Navigate
7. Funding Trends (Stream) - Navigate
8. Funding Breakdown (Treemap) - Navigate
9. Circle Packing - Navigate
10. Tech Maturity Radar - Navigate
11. Bar Chart Analysis - Navigate
12. Relationship Matrix (Chord) - Navigate
13. Intensity Map (Heatmap) - Navigate
14. TRL Progression (Bump) - Navigate
15. Tech Distribution (Swarm) - Navigate
16. Portfolio Treemap - CPC
17. Stakeholder Sunburst - CPC

**Total: 17 visualizations registered**

### `/toolkit/page.tsx` (KEEP)
**Uses:**
- StakeholderDynamicsView (which uses D3NetworkGraphView and CirclePackingSimpleECharts)
- EnhancedInnovationTracker
- InnovationTrackerSankey

### Test Pages (KEEP for development)
- `/test-sankey/page.tsx` - SankeyChart
- `/test-network/page.tsx` - NetworkGraph, NetworkGraphD3, NetworkGraphECharts
- `/test-heatmap/page.tsx` - HeatmapChart
- `/test-sunburst/page.tsx` - SunburstChart
- `/test-chord/page.tsx` - ChordDiagram
- `/test-unified-network-v*` - Various demo versions

---

## Recommendations

### 1. Visual Library Expansion
The Visual Library (`/visualisations/page.tsx`) currently has **17 registered visualizations**. Consider adding:
- FocusAreaMatrix (CPC)
- StagePipeline (CPC)
- StakeholderNetwork (CPC)
- TreemapSunburstTransition (CPC)
- BubbleScatterNavigate
- TimelineNavigate
- UnifiedNetworkGraph variants

### 2. Redundancy Check
- **TreemapNavigate.tsx** - Only in `/navigate`, may be redundant with TreemapSunburstExplorer
- **NetworkGraphDemo variants** - Multiple demo versions, consider consolidating

### 3. Orphaned Components
Check usage of:
- HarmonizationAnalysis.tsx
- D3NetworkGraphToolkit.tsx
- D3NetworkGraphUnified.tsx
- D3NetworkGraphUniversal.tsx
- UnifiedNetworkGraphClustered.tsx
- UnifiedNetworkGraphD3.tsx
- UnifiedNetworkGraphNested.tsx

### 4. Page Cleanup
- ✅ Safe to remove `/navigate/page.tsx`
- ✅ Safe to remove `/visualizations/page.tsx`
- ✅ Keep `/visualisations/page.tsx` as main Visual Library
- ✅ Keep `/toolkit/page.tsx` for Toolkit tools
- ✅ Keep test pages for development

---

## Next Steps

1. **Expand Visual Library** - Add missing CPC and Navigate visualizations to `/visualisations/page.tsx`
2. **Remove redundant pages** - Delete `/navigate` and `/visualizations` pages
3. **Check orphaned components** - Verify if unused components can be removed
4. **Consolidate demo versions** - Consider removing or consolidating NetworkGraphDemo variants
5. **Update navigation** - Point all links to `/visualisations` (Visual Library)


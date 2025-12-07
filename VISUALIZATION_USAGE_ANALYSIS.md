# Visualization Usage Analysis

## Pages Overview

### Main Pages
- **`/navigate/page.tsx`** - Navigate Platform page (TO BE REMOVED)
- **`/visualizations/page.tsx`** - Explore Data page (TO BE REMOVED)
- **`/visualisations/page.tsx`** - Visual Library Gallery (KEEP - this is the main gallery)
- **`/toolkit/page.tsx`** - Toolkit page (KEEP - uses toolkit components)

---

## Visualization Usage by Page

### 1. `/navigate/page.tsx` (TO BE REMOVED)

**Direct Imports:**
- `NetworkGraphNavigate`
- `NetworkGraphNavigate3D`
- `NetworkGraphD3`
- `NetworkGraphECharts`
- `SankeyChartNavigate`
- `HeatmapNavigate`
- `CirclePackingNavigate`
- `TreemapSunburstExplorer`
- `ChordDiagramNavigate`
- `RadarChartNavigate`
- `BarChartNavigate`
- `BumpChartNavigate`
- `StreamGraphNavigate`
- `ParallelCoordinatesNavigate` (already removed)
- `SwarmPlotNavigate`
- `NetworkGraph` (base version)
- `SankeyChart` (base version)
- `HeatmapChart` (base version)
- `SunburstChart` (base version)
- `ChordDiagram` (base version)
- `TreemapNavigate`
- `VisualizationRenderer` (shared component)

**Status:** Uses many visuals, but they're also used elsewhere

---

### 2. `/visualizations/page.tsx` (TO BE REMOVED - "Explore Data")

**Direct Imports:**
- `SankeyChartNavigate`
- `RadarChartNavigate`
- `BarChartNavigate`
- `CirclePackingNavigate`
- `BumpChartNavigate`
- `TreemapSunburstExplorer`
- `HeatmapNavigate`
- `ChordDiagramNavigate`
- `NetworkGraphNavigate` (Navigate 2D)
- `NetworkGraphNavigate3D` (Navigate 3D)
- `NetworkGraph` (Base/Atlas - Challenge data) ⚠️ **MISSING FROM UNREGISTERED LIST**
- `StreamGraphNavigate`
- `SwarmPlotNavigate`
- `FocusAreaMatrix` (CPC)
- `StagePipeline` (CPC)
- `StakeholderNetwork` (CPC)
- `PortfolioTreemap` (CPC)
- `StakeholderSunburst` (CPC)
- `TreemapSunburstTransition` (CPC)
- Base versions: `SankeyChart`, `HeatmapChart`, `SunburstChart`, `ChordDiagram`

**Status:** Uses many visuals, including CPC-specific ones and base/Atlas versions

---

### 3. `/visualisations/page.tsx` (KEEP - Visual Library Gallery)

**Uses via Dynamic Imports:**
- `SankeyChartNavigate`
- `RadarChartNavigate`
- `BarChartNavigate`
- `CirclePackingNavigate`
- `BumpChartNavigate`
- `TreemapSunburstExplorer`
- `HeatmapNavigate`
- `ChordDiagramNavigate`
- `StreamGraphNavigate`
- `SwarmPlotNavigate`
- `D3NetworkGraphView` (Toolkit)
- `CirclePackingSimpleECharts` (Toolkit)
- `EnhancedInnovationTracker` (Toolkit)
- `InnovationTrackerSankey` (Toolkit)
- `PortfolioTreemap` (CPC)
- `StakeholderSunburst` (CPC)
- `NetworkGraphV8` (Unified)

**Status:** This is the MAIN gallery - uses VisualizationRenderer and dynamic imports

---

### 4. `/toolkit/page.tsx` (KEEP)

**Uses:**
- `InnovationTrackerSankey` (Toolkit)
- `EnhancedInnovationTracker` (Toolkit)
- `StakeholderDynamicsView` (Toolkit - which uses D3NetworkGraphView and CirclePackingSimpleECharts)

**Status:** Only uses Toolkit components

---

## Visualization Components Inventory

### Navigate Visualizations (used in multiple places)
✅ **Still Used After Removal:**
- `SankeyChartNavigate.tsx` - Used in `/visualisations/page.tsx`
- `RadarChartNavigate.tsx` - Used in `/visualisations/page.tsx`
- `BarChartNavigate.tsx` - Used in `/visualisations/page.tsx`
- `CirclePackingNavigate.tsx` - Used in `/visualisations/page.tsx`
- `BumpChartNavigate.tsx` - Used in `/visualisations/page.tsx`
- `TreemapSunburstExplorer.tsx` - Used in `/visualisations/page.tsx`
- `HeatmapNavigate.tsx` - Used in `/visualisations/page.tsx`
- `ChordDiagramNavigate.tsx` - Used in `/visualisations/page.tsx`
- `StreamGraphNavigate.tsx` - Used in `/visualisations/page.tsx`
- `SwarmPlotNavigate.tsx` - Used in `/visualisations/page.tsx`
- `NetworkGraphNavigate.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)
- `NetworkGraphNavigate3D.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)

### Base/Atlas Visualizations (Challenge-based)
✅ **Still Used After Removal (in test pages):**
- `SankeyChart.tsx` - Used in `/test-sankey/page.tsx`
- `NetworkGraph.tsx` - Used in `/test-network/page.tsx`
- `HeatmapChart.tsx` - Check `/test-heatmap/page.tsx`
- `SunburstChart.tsx` - Check `/test-sunburst/page.tsx`
- `ChordDiagram.tsx` - Used in `/test-chord/page.tsx`

### CPC Visualizations
✅ **Still Used After Removal:**
- `PortfolioTreemap.tsx` - Used in `/visualisations/page.tsx`
- `StakeholderSunburst.tsx` - Used in `/visualisations/page.tsx`
- `FocusAreaMatrix.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)
- `StagePipeline.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)
- `StakeholderNetwork.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)
- `TreemapSunburstTransition.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)

### Toolkit Visualizations
✅ **Still Used After Removal:**
- `D3NetworkGraphView.tsx` - Used in `/toolkit/page.tsx` and `/visualisations/page.tsx`
- `CirclePackingSimpleECharts.tsx` - Used in `/toolkit/page.tsx` and `/visualisations/page.tsx`
- `EnhancedInnovationTracker.tsx` - Used in `/toolkit/page.tsx` and `/visualisations/page.tsx`
- `InnovationTrackerSankey.tsx` - Used in `/toolkit/page.tsx` and `/visualisations/page.tsx`

### Unified/Advanced Visualizations
✅ **Still Used After Removal:**
- `NetworkGraphV8.tsx` - Used in `/visualisations/page.tsx`
- `UnifiedNetworkGraph.tsx` - Used in `/visualisations/page.tsx` (via VisualizationRenderer)
- `VisualizationRenderer.tsx` - Shared component used by `/visualisations/page.tsx`

### Other Visualizations
⚠️ **Potentially Orphaned:**
- `NetworkGraphD3.tsx` - Only used in `/navigate/page.tsx`
- `NetworkGraphECharts.tsx` - Only used in `/navigate/page.tsx`
- `TreemapNavigate.tsx` - Only used in `/navigate/page.tsx`
- `ParallelCoordinatesNavigate.tsx` - Already removed
- `BubbleScatterNavigate.tsx` - Check usage
- `TimelineNavigate.tsx` - Check usage
- Various NetworkGraph demo versions (V5, V6, V7, etc.) - Test pages only

---

## Summary: What Happens After Removing `/navigate` and `/visualizations` Pages

### ✅ SAFE TO REMOVE (Pages only, components remain):
- `/navigate/page.tsx` - All its visuals are used elsewhere
- `/visualizations/page.tsx` - All its visuals are used elsewhere

### ✅ VISUALS STILL USED (via `/visualisations/page.tsx`):
All Navigate visualizations will still be accessible through the Visual Library Gallery

### ⚠️ BASE/ATLAS VERSIONS (Now in Unregistered List):
These are the Challenge-based (Atlas) versions, not Navigate versions:
- `SankeyChart.tsx` (base) - ✅ Added to unregistered list
- `NetworkGraph.tsx` (base) - ✅ Added to unregistered list (was missing!)
- `HeatmapChart.tsx` (base) - ✅ Added to unregistered list
- `SunburstChart.tsx` (base) - ✅ Added to unregistered list
- `ChordDiagram.tsx` (base) - ✅ Added to unregistered list

**Status:** All base versions are now in the unregistered list in `/visualisations/page.tsx` and can be accessed through the Visual Library Gallery.

### ✅ STILL USED (Specific variants):
- `NetworkGraphD3.tsx` - Used in `/test-network/page.tsx`
- `NetworkGraphECharts.tsx` - Used in `/test-network/page.tsx`

### ⚠️ POTENTIALLY ORPHANED (Specific variants):
- `TreemapNavigate.tsx` - Only in `/navigate` (check if used elsewhere)

---

## Recommendations

1. ✅ **Safe to remove both pages** - All main visuals are preserved in `/visualisations/page.tsx`

2. ✅ **Base versions are safe** - They're used in test pages (`/test-*`), so they won't be orphaned

3. ⚠️ **Check TreemapNavigate** - Only used in `/navigate`, may be redundant if `TreemapSunburstExplorer` covers the same functionality

4. ✅ **Update navigation** - Remove links to `/navigate` and `/visualizations` from:
   - Home page (`/page.tsx`) - Lines 92-110
   - Top navigation components
   - Any other navigation components

---

## Next Steps

1. ✅ **Verified** - Base versions are used in test pages
2. ⚠️ **Check** - `TreemapNavigate.tsx` usage (may be redundant)
3. ✅ **Update navigation links** - Remove from home page and navigation components
4. ✅ **Remove the two pages** - `/navigate/page.tsx` and `/visualizations/page.tsx`
5. ⚠️ **Optional cleanup** - Consider removing `TreemapNavigate.tsx` if redundant

## Final Status

### ✅ SAFE TO REMOVE (Pages):
- `/navigate/page.tsx` 
- `/visualizations/page.tsx`

### ✅ ALL VISUALS PRESERVED:
- All Navigate visualizations → Available in `/visualisations/page.tsx` (Visual Library)
- All base/Atlas visualizations → ✅ **NOW IN UNREGISTERED LIST** in `/visualisations/page.tsx` (Visual Library)
- All Toolkit visualizations → Available in `/toolkit/page.tsx` and `/visualisations/page.tsx`
- All CPC visualizations → Available in `/visualisations/page.tsx`

**Note:** The base `NetworkGraph` (Challenge/Atlas data) was missing from the unregistered list but has now been added along with other base versions (SankeyChart, HeatmapChart, SunburstChart, ChordDiagram).

### ⚠️ ONE POTENTIAL ORPHAN:
- `TreemapNavigate.tsx` - Only used in `/navigate`, check if `TreemapSunburstExplorer` makes it redundant


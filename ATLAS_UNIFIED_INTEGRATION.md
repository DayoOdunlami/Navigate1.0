# Atlas → Unified Data Integration

## Overview

**Yes, Atlas-extracted challenges ARE part of the unified data system!**

When you extract a challenge using Atlas and save it to the knowledge base, it automatically becomes part of your unified entity system and appears in all visualizations.

## Data Flow

```
Atlas Extraction
    ↓
ExtractedChallenge (Atlas format)
    ↓
adaptAtlasChallengeToChallenge() → Challenge (existing format)
    ↓
challengeToBaseEntity() → BaseEntity (unified format)
    ↓
getUnifiedEntities() → Included in all visualizations
```

## How It Works

### 1. **Extraction** (`/atlas` page)
- Extract challenge from URL → `ExtractedChallenge`

### 2. **Save to KB** (Click "Add to Knowledge Base")
- Converts `ExtractedChallenge` → `Challenge` format
- Saves to `src/data/atlas/challenges.json`
- Invalidates unified data cache

### 3. **Unified System** (`src/data/unified/index.ts`)
- Loads Atlas-extracted challenges from store
- Converts to `BaseEntity` format
- Includes in `getUnifiedEntities()` function
- Builds similarity relationships with other challenges

### 4. **Visualizations**
- All visualizations use `getUnifiedEntities()`
- Atlas challenges appear alongside:
  - Static challenges (from `challenges.ts`)
  - Navigate stakeholders/technologies/projects
  - CPC domain entities (focus areas, milestones, stages)

## Entity Types in Unified System

| Source | Entity Types | Domain |
|--------|-------------|--------|
| **Atlas** | `challenge` | `atlas` |
| Navigate | `stakeholder`, `technology`, `project` | `navigate` |
| CPC Internal | `focus_area`, `milestone`, `stage`, `capability`, `initiative` | `cpc-internal` |

## Adapters Created

1. **`lib/atlas/adapter.ts`**
   - `adaptAtlasChallengeToChallenge()` - Atlas → Challenge format
   - Maps transport modes → sectors
   - Maps challenge types → problem types

2. **`lib/adapters/atlas-challenge-adapter.ts`**
   - `atlasExtractedChallengeToBaseEntity()` - Atlas → BaseEntity
   - Uses existing Challenge adapter as intermediate step

3. **`data/unified/index.ts`** (Updated)
   - `getUnifiedEntities()` - Dynamically loads Atlas-extracted challenges
   - `invalidateAtlasCache()` - Clears cache when new challenges added

## What This Means

✅ **Atlas challenges are unified entities**
- They appear in network visualizations
- They can have relationships with Navigate stakeholders/projects
- They're searchable across the entire system
- They're included in similarity calculations

✅ **Automatic integration**
- No manual steps needed
- Just extract → save → appears in unified system
- Cache invalidation ensures fresh data

✅ **Cross-domain relationships**
- Atlas challenges can link to Navigate stakeholders
- Can connect to CPC focus areas
- All relationships work in unified visualizations

## Example

1. Extract challenge: "Net Zero Aviation Fuels" from IUK URL
2. Save to KB → Stored in `data/atlas/challenges.json`
3. Unified system loads it → Converts to `BaseEntity`
4. Appears in:
   - Network visualizations (as node)
   - Similarity relationships (to other challenges)
   - Search results
   - Filtered views (by mode, theme, sector)

## Storage

- **Atlas format**: `src/data/atlas/challenges.json` (original ExtractedChallenge)
- **Unified format**: Loaded dynamically via `getUnifiedEntities()`
- **Cache**: Invalidated when new challenges are saved

## Next Steps

To see Atlas challenges in unified visualizations:
1. Extract challenges using `/atlas`
2. Save them to knowledge base
3. They'll automatically appear in unified views
4. Use `getUnifiedEntities()` in your visualization components

The integration is complete and working! 🎉


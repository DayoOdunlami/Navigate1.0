# Schema Architecture: Enhanced Proposal (Post-Review)

## Executive Summary

**Status:** ✅ **STRONG GREEN LIGHT** with Strategic Enhancements

The hybrid approach is approved with the following key enhancements:
1. Metadata pattern for BaseEntity (more extensible)
2. Relationship strength normalization (unify implicit/explicit)
3. Entity Registry pattern (cross-domain queries)
4. Adapter validation (runtime safety)
5. Enhanced control panel (domain-specific injection)
6. Versioning strategy (future-proof)
7. Backward compatibility layer (smooth migration)

---

## Enhanced BaseEntity Design

### Original Approach (Flat)
```typescript
interface BaseEntity {
  id: string;
  name: string;
  sector?: string;
  tags?: string[];
  trl?: number;
  // ... flat structure
}
```

### Enhanced Approach (Metadata Pattern) ✅
```typescript
interface BaseEntity {
  _version: '1.0'; // Semantic versioning
  
  // Core identity
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  
  // Structured metadata (easier to extend)
  metadata: {
    // Classification
    sector?: string | string[];
    tags?: string[];
    category?: string;
    
    // Maturity/Status
    trl?: number | { 
      current: number; 
      target?: number; 
      min?: number; 
      max?: number 
    };
    status?: 'active' | 'completed' | 'planned' | string;
    
    // Financial
    funding?: {
      amount?: number;
      currency?: string;
      source?: string;
      type?: 'grant' | 'investment' | 'loan' | string;
    };
    
    // Temporal
    dates?: {
      start?: Date | string;
      end?: Date | string;
      milestones?: Array<{ date: Date | string; label: string }>;
    };
    
    // Spatial (for future geographic visualizations)
    location?: {
      country?: string;
      region?: string;
      coordinates?: { lat: number; lng: number };
    };
    
    // Extensibility - domain-specific data
    custom?: Record<string, unknown>;
  };
  
  // Relationships (unified model)
  relationships?: Array<{
    targetId: string;
    type: string;
    strength?: number; // 0-1 normalized
    metadata?: Record<string, unknown>;
  }>;
  
  // Visualization hints (optional)
  visualizationHints?: {
    color?: string;
    size?: number;
    icon?: string;
    priority?: number;
  };
  
  // Reference to original domain object (for advanced use cases)
  _original?: Challenge | Stakeholder | Technology | Project;
}
```

**Why Better:**
- ✅ Cleaner separation of concerns
- ✅ Easier to add new fields without breaking changes
- ✅ `custom` field allows domain-specific data without polluting base
- ✅ Visualization hints let adapters suggest rendering without coupling

---

## Enhanced Relationship Model

### Original Approach
```typescript
interface UniversalRelationship {
  source: string;
  target: string;
  type: string;
  weight: number;
}
```

### Enhanced Approach (Strength Normalization) ✅
```typescript
interface UniversalRelationship {
  source: string;
  target: string;
  type: string; // 'funds', 'similar_to', 'collaborates_with'
  
  // Normalized strength (0-1) - consistent across all relationship types
  strength: number;
  
  // How was this relationship derived?
  derivation: 'explicit' | 'computed' | 'inferred';
  
  // Original data for debugging/display
  metadata?: {
    originalStrength?: number; // e.g., keyword overlap count
    confidence?: number; // for ML-derived relationships
    bidirectional?: boolean;
    amount?: number; // for funding relationships
    program?: string;
    [key: string]: unknown;
  };
}
```

**Benefits:**
- ✅ Consistent edge rendering (thickness, opacity)
- ✅ Can filter by derivation type
- ✅ Enables future ML-based relationship inference
- ✅ Clear distinction between explicit and computed relationships

---

## Entity Registry Pattern

### Implementation ✅
```typescript
class EntityRegistry {
  private entities: Map<string, BaseEntity> = new Map();
  private typeIndex: Map<EntityType, Set<string>> = new Map();
  private relationshipIndex: Map<string, Set<UniversalRelationship>> = new Map();
  
  // Register entities from any domain
  register(entities: BaseEntity[]): void;
  
  // Query by type
  getByType(type: EntityType): BaseEntity[];
  
  // Query by relationship
  getRelated(entityId: string, relationshipType?: string): BaseEntity[];
  
  // Cross-domain queries
  findConnections(entityId: string, maxDepth: number): EntityGraph;
  
  // For AI context
  toContextString(entityIds: string[]): string;
  
  // For visualization
  toNetworkData(filter?: EntityFilter): { 
    nodes: BaseEntity[]; 
    edges: UniversalRelationship[] 
  };
}
```

**Why This Matters:**
- ✅ Enables cross-domain queries (IUK funds tech AND provides challenges)
- ✅ Single source of truth for AI context
- ✅ Efficient lookups for visualizations
- ✅ Foundation for future graph algorithms (centrality, clustering)

---

## Adapter Validation

### Implementation with Zod ✅
```typescript
import { z } from 'zod';

// Schema for BaseEntity
const BaseEntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  entityType: z.enum(['challenge', 'stakeholder', 'technology', 'project']),
  metadata: z.object({
    sector: z.string().optional(),
    tags: z.array(z.string()).optional(),
    trl: z.union([
      z.number(),
      z.object({
        current: z.number(),
        target: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      })
    ]).optional(),
    // ... rest of schema
  }).optional(),
});

// Adapter with validation
function challengesToBaseEntities(challenges: Challenge[]): BaseEntity[] {
  return challenges.map(challenge => {
    const entity = {
      id: challenge.id,
      name: challenge.title,
      description: challenge.description,
      entityType: 'challenge' as const,
      metadata: {
        sector: challenge.sector.primary,
        tags: challenge.keywords,
        trl: challenge.maturity.trl_min ? { 
          min: challenge.maturity.trl_min,
          max: challenge.maturity.trl_max 
        } : undefined,
        // ... rest of mapping
      }
    };
    
    // Validate before returning
    const result = BaseEntitySchema.safeParse(entity);
    if (!result.success) {
      console.error(`Invalid entity from challenge ${challenge.id}:`, result.error);
      throw new Error(`Adapter validation failed: ${result.error.message}`);
    }
    
    return result.data;
  });
}
```

**Benefits:**
- ✅ Catches mapping errors early
- ✅ Documents expected structure
- ✅ Helps with refactoring
- ✅ Better error messages

---

## Enhanced Control Panel

### Domain-Specific Control Injection ✅
```typescript
interface VisualizationControlConfig {
  // Universal controls (work for all entity types)
  universal: ControlDefinition[];
  
  // Domain-specific controls (only show for certain entity types)
  domainSpecific: {
    [entityType: string]: ControlDefinition[];
  };
  
  // Dynamic controls (computed based on data)
  dynamic?: (entities: BaseEntity[]) => ControlDefinition[];
}

// Example usage
const networkGraphControls: VisualizationControlConfig = {
  universal: [
    { id: 'forceRepulsion', type: 'slider', min: 200, max: 900, ... },
    { id: 'edgeLength', type: 'slider', min: 50, max: 300, ... },
    { id: 'trlRange', type: 'range', min: 1, max: 9, ... },
  ],
  domainSpecific: {
    challenge: [
      { id: 'similarityThreshold', type: 'slider', min: 0, max: 1, ... },
      { id: 'problemTypeGrouping', type: 'select', ... },
      { id: 'sectorGrouping', type: 'checkbox', ... },
    ],
    stakeholder: [
      { id: 'relationshipTypeFilter', type: 'multiselect', ... },
      { id: 'stakeholderTypeGrouping', type: 'select', ... },
    ],
  },
  dynamic: (entities) => {
    // Generate controls based on actual data
    const sectors = [...new Set(
      entities
        .map(e => e.metadata?.sector)
        .filter(Boolean)
        .flat()
    )];
    return [{
      id: 'sectorFilter',
      type: 'multiselect',
      options: sectors.map(s => ({ value: s, label: s })),
    }];
  },
};
```

**Benefits:**
- ✅ Controls adapt to data automatically
- ✅ Clean separation of universal vs domain-specific
- ✅ No need to hardcode all possible values

---

## Backward Compatibility Layer

### Wrapper Pattern ✅
```typescript
// Wrapper that accepts old or new format
function D3NetworkGraphView(props: OldProps | NewProps) {
  if ('stakeholders' in props) {
    // Old format - convert on the fly
    return <D3NetworkGraphViewNew 
      entities={[
        ...stakeholdersToBaseEntities(props.stakeholders),
        ...technologiesToBaseEntities(props.technologies || []),
      ]}
      relationships={relationshipsToUniversal(props.relationships || [])}
    />;
  }
  // New format - use directly
  return <D3NetworkGraphViewNew {...props} />;
}
```

**Benefits:**
- ✅ No breaking changes during migration
- ✅ Gradual adoption possible
- ✅ Easy to test both paths

---

## Implementation Roadmap

### Phase 0: Preparation (Week 1)
- ✅ Create BaseEntity interface with metadata pattern
- ✅ Create UniversalRelationship interface with strength normalization
- ✅ Add Zod validation schemas
- ✅ Write adapter tests
- ✅ Create EntityRegistry class

### Phase 1: Foundation (Week 2)
- ✅ Implement adapters for Challenge and Stakeholder (with validation)
- ✅ Create EntityRegistry instance
- ✅ Add backward compatibility wrappers
- ✅ Test adapters with validation

### Phase 2: Visualization Update (Week 3)
- ✅ Update D3NetworkGraphView to accept BaseEntity[]
- ✅ Test with Navigate (verify no visual changes)
- ✅ Test with Atlas (verify same quality)
- ✅ Update control panel for domain-specific controls
- ✅ Implement dynamic control generation

### Phase 3: Cross-Domain (Week 4)
- ✅ Implement cross-domain relationships
- ✅ Update AI context to use EntityRegistry
- ✅ Add cross-domain query examples
- ✅ Test IUK example (funds tech + provides challenges)

### Phase 4: Optimization (Week 5)
- ✅ Add memoization to adapters
- ✅ Performance testing with large datasets
- ✅ Documentation and examples
- ✅ Migration guide for other developers

---

## Risk Mitigation

### Concern 1: Adapter Maintenance Burden
**Mitigation:**
- Use TypeScript's type system to catch breaking changes
- Add adapter tests that verify all fields are mapped
- Consider code generation for simple mappings

### Concern 2: Performance with Large Datasets
**Mitigation:**
- Memoize adapter results
- Use lazy evaluation for large datasets
- Consider Web Workers for heavy transformations

### Concern 3: Loss of Domain-Specific Features
**Mitigation:**
- Use `metadata.custom` for domain-specific fields
- Keep original domain types alongside BaseEntity
- Allow visualizations to access `_original` when needed

---

## Key Decisions Made

1. ✅ **Metadata Pattern** - More extensible than flat structure
2. ✅ **Strength Normalization** - Unified relationship model
3. ✅ **Entity Registry** - Foundation for cross-domain features
4. ✅ **Adapter Validation** - Runtime safety with Zod
5. ✅ **Enhanced Controls** - Domain-specific injection
6. ✅ **Versioning** - Future-proof schema evolution
7. ✅ **Backward Compatibility** - Smooth migration path

---

## Next Steps

1. **Review and approve** this enhanced proposal
2. **Start Phase 0** - Create interfaces and validation schemas
3. **Build adapters** - Challenge and Stakeholder with validation
4. **Update Toolkit D3 Network Graph** - Accept BaseEntity[]
5. **Test thoroughly** - Navigate first (no changes), then Atlas (new capability)

---

## Summary

Kiro's review validates the hybrid approach and adds critical enhancements:
- **Metadata pattern** makes BaseEntity more extensible
- **Relationship normalization** unifies implicit/explicit relationships
- **Entity Registry** enables cross-domain queries
- **Validation** catches errors early
- **Enhanced controls** adapt to data automatically
- **Backward compatibility** ensures smooth migration

**Recommendation:** Proceed with enhanced hybrid approach as outlined above.




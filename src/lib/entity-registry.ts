/**
 * EntityRegistry - Central registry for all entities across domains
 * 
 * Enables cross-domain queries, efficient lookups, and provides
 * foundation for AI context and graph algorithms.
 */

import type { BaseEntity, EntityType, UniversalRelationship, EntityFilter, EntityGraph } from './base-entity';

export class EntityRegistry {
  private entities: Map<string, BaseEntity> = new Map();
  private typeIndex: Map<EntityType, Set<string>> = new Map();
  private relationshipIndex: Map<string, Set<UniversalRelationship>> = new Map();
  private reverseRelationshipIndex: Map<string, Set<UniversalRelationship>> = new Map();

  /**
   * Register entities from any domain
   */
  register(entities: BaseEntity[]): void {
    entities.forEach(entity => {
      // Store entity
      this.entities.set(entity.id, entity);
      
      // Index by type
      if (!this.typeIndex.has(entity.entityType)) {
        this.typeIndex.set(entity.entityType, new Set());
      }
      this.typeIndex.get(entity.entityType)!.add(entity.id);
    });
  }

  /**
   * Register relationships
   */
  registerRelationships(relationships: UniversalRelationship[]): void {
    relationships.forEach(rel => {
      // Index by source
      if (!this.relationshipIndex.has(rel.source)) {
        this.relationshipIndex.set(rel.source, new Set());
      }
      this.relationshipIndex.get(rel.source)!.add(rel);
      
      // Index by target (for reverse lookups)
      if (!this.reverseRelationshipIndex.has(rel.target)) {
        this.reverseRelationshipIndex.set(rel.target, new Set());
      }
      this.reverseRelationshipIndex.get(rel.target)!.add(rel);
    });
  }

  /**
   * Get entity by ID
   */
  getEntity(id: string, type?: EntityType): BaseEntity | null {
    const entity = this.entities.get(id);
    if (!entity) return null;
    if (type && entity.entityType !== type) return null;
    return entity;
  }

  /**
   * Get all entities of a specific type
   */
  getByType(type: EntityType): BaseEntity[] {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.entities.get(id))
      .filter((e): e is BaseEntity => e !== undefined);
  }

  /**
   * Get entities related to a given entity
   */
  getRelated(entityId: string, relationshipType?: string): BaseEntity[] {
    const relationships = this.relationshipIndex.get(entityId);
    if (!relationships) return [];
    
    const filtered = relationshipType
      ? Array.from(relationships).filter(rel => rel.type === relationshipType)
      : Array.from(relationships);
    
    const targetIds = new Set(filtered.map(rel => rel.target));
    return Array.from(targetIds)
      .map(id => this.entities.get(id))
      .filter((e): e is BaseEntity => e !== undefined);
  }

  /**
   * Get relationships for an entity (outgoing)
   */
  getRelationships(entityId: string, relationshipType?: string): UniversalRelationship[] {
    const relationships = this.relationshipIndex.get(entityId);
    if (!relationships) return [];
    
    if (relationshipType) {
      return Array.from(relationships).filter(rel => rel.type === relationshipType);
    }
    
    return Array.from(relationships);
  }

  /**
   * Get reverse relationships (incoming)
   */
  getReverseRelationships(entityId: string, relationshipType?: string): UniversalRelationship[] {
    const relationships = this.reverseRelationshipIndex.get(entityId);
    if (!relationships) return [];
    
    if (relationshipType) {
      return Array.from(relationships).filter(rel => rel.type === relationshipType);
    }
    
    return Array.from(relationships);
  }

  /**
   * Find connections up to a certain depth (BFS)
   */
  findConnections(entityId: string, maxDepth: number = 2): EntityGraph {
    const visited = new Set<string>();
    const nodes: BaseEntity[] = [];
    const edges: UniversalRelationship[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: entityId, depth: 0 }];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);
      
      const entity = this.entities.get(id);
      if (entity) {
        nodes.push(entity);
      }
      
      if (depth < maxDepth) {
        const relationships = this.relationshipIndex.get(id);
        if (relationships) {
          relationships.forEach(rel => {
            if (!visited.has(rel.target)) {
              edges.push(rel);
              queue.push({ id: rel.target, depth: depth + 1 });
            }
          });
        }
      }
    }
    
    return { nodes, edges };
  }

  /**
   * Convert entities to context string for AI
   */
  toContextString(entityIds: string[]): string {
    const entities = entityIds
      .map(id => this.entities.get(id))
      .filter((e): e is BaseEntity => e !== undefined);
    
    return entities.map(entity => {
      const parts = [
        `Entity: ${entity.name} (${entity.entityType})`,
        `Description: ${entity.description}`,
      ];
      
      if (entity.metadata.sector) {
        parts.push(`Sector: ${Array.isArray(entity.metadata.sector) ? entity.metadata.sector.join(', ') : entity.metadata.sector}`);
      }
      
      if (entity.metadata.tags && entity.metadata.tags.length > 0) {
        parts.push(`Tags: ${entity.metadata.tags.join(', ')}`);
      }
      
      if (entity.metadata.trl) {
        if (typeof entity.metadata.trl === 'number') {
          parts.push(`TRL: ${entity.metadata.trl}`);
        } else {
          parts.push(`TRL: ${entity.metadata.trl.current}${entity.metadata.trl.target ? ` (target: ${entity.metadata.trl.target})` : ''}`);
        }
      }
      
      return parts.join('\n');
    }).join('\n\n');
  }

  /**
   * Convert to network data for visualizations
   */
  toNetworkData(filter?: EntityFilter): EntityGraph {
    let nodes = Array.from(this.entities.values());
    
    // Apply filters
    if (filter) {
      if (filter.entityTypes && filter.entityTypes.length > 0) {
        nodes = nodes.filter(e => filter.entityTypes!.includes(e.entityType));
      }
      
      if (filter.sectors && filter.sectors.length > 0) {
        nodes = nodes.filter(e => {
          const sector = e.metadata.sector;
          if (!sector) return false;
          const sectors = Array.isArray(sector) ? sector : [sector];
          return sectors.some(s => filter.sectors!.includes(s));
        });
      }
      
      if (filter.tags && filter.tags.length > 0) {
        nodes = nodes.filter(e => {
          const tags = e.metadata.tags || [];
          return filter.tags!.some(tag => tags.includes(tag));
        });
      }
      
      if (filter.trlRange) {
        nodes = nodes.filter(e => {
          const trl = e.metadata.trl;
          if (!trl) return false;
          const trlValue = typeof trl === 'number' ? trl : trl.current;
          return trlValue >= filter.trlRange!.min && trlValue <= filter.trlRange!.max;
        });
      }
      
      if (filter.status && filter.status.length > 0) {
        nodes = nodes.filter(e => {
          const status = e.metadata.status;
          return status && filter.status!.includes(status);
        });
      }
      
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        nodes = nodes.filter(e => 
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.metadata.tags || []).some(tag => tag.toLowerCase().includes(query))
        );
      }
    }
    
    // Get relationships for filtered nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: UniversalRelationship[] = [];
    
    this.relationshipIndex.forEach((relationships, sourceId) => {
      if (nodeIds.has(sourceId)) {
        relationships.forEach(rel => {
          if (nodeIds.has(rel.target)) {
            edges.push(rel);
          }
        });
      }
    });
    
    return { nodes, edges };
  }

  /**
   * Clear all entities and relationships
   */
  clear(): void {
    this.entities.clear();
    this.typeIndex.clear();
    this.relationshipIndex.clear();
    this.reverseRelationshipIndex.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEntities: number;
    entitiesByType: Record<EntityType, number>;
    totalRelationships: number;
  } {
    const entitiesByType: Record<EntityType, number> = {} as Record<EntityType, number>;
    this.typeIndex.forEach((ids, type) => {
      entitiesByType[type] = ids.size;
    });
    
    let totalRelationships = 0;
    this.relationshipIndex.forEach(relationships => {
      totalRelationships += relationships.size;
    });
    
    return {
      totalEntities: this.entities.size,
      entitiesByType,
      totalRelationships,
    };
  }
}




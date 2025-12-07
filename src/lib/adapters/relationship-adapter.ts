/**
 * Adapter: Navigate Relationship → UniversalRelationship
 * 
 * Converts Navigate Relationship entities to universal format
 * with strength normalization.
 */

import type { Relationship } from '@/lib/navigate-types';
import type { UniversalRelationship, EntityType } from '@/lib/base-entity';
import { validateUniversalRelationship } from '@/lib/base-entity-validation';

/**
 * Normalize relationship weight to 0-1 strength
 */
function normalizeStrength(weight: number, maxWeight: number = 10000000): number {
  // Normalize to 0-1 range
  // For funding amounts, use log scale
  // For similarity scores, use as-is if already 0-1
  if (weight <= 1) {
    return Math.max(0, Math.min(1, weight)); // Already normalized
  }
  // For large numbers (funding), use log scale
  return Math.max(0, Math.min(1, Math.log10(weight + 1) / Math.log10(maxWeight + 1)));
}

/**
 * Convert Navigate Relationship to UniversalRelationship
 * 
 * Note: This requires knowing the entity types of source and target.
 * You may need to look them up from the entity registry or pass them in.
 */
export function relationshipToUniversal(
  relationship: Relationship,
  sourceType: EntityType,
  targetType: EntityType
): UniversalRelationship {
  const universal: UniversalRelationship = {
    id: relationship.id,
    source: relationship.source,
    target: relationship.target,
    sourceType,
    targetType,
    type: relationship.type,
    strength: normalizeStrength(relationship.weight),
    derivation: 'explicit', // Navigate relationships are explicit
    metadata: {
      originalStrength: relationship.weight,
      bidirectional: relationship.bidirectional,
      amount: relationship.metadata.amount,
      program: relationship.metadata.program,
      start_date: relationship.metadata.start_date,
      end_date: relationship.metadata.end_date,
      description: relationship.metadata.description,
      project_id: relationship.metadata.project_id,
    },
    created_at: relationship.created_at,
    updated_at: relationship.updated_at,
  };

  // Validate before returning
  const validation = validateUniversalRelationship(universal);
  if (!validation.success) {
    console.error(`Invalid relationship ${relationship.id}:`, validation.error);
    throw new Error(`Relationship adapter validation failed: ${validation.error.message}`);
  }

  return validation.data;
}

/**
 * Convert array of Navigate Relationships to UniversalRelationships
 * 
 * Requires entity type lookup function to determine source/target types
 */
export function relationshipsToUniversal(
  relationships: Relationship[],
  getEntityType: (id: string) => EntityType | null
): UniversalRelationship[] {
  return relationships
    .map(rel => {
      const sourceType = getEntityType(rel.source);
      const targetType = getEntityType(rel.target);
      
      if (!sourceType || !targetType) {
        console.warn(`Cannot determine entity types for relationship ${rel.id}`);
        return null;
      }
      
      return relationshipToUniversal(rel, sourceType, targetType);
    })
    .filter((rel): rel is UniversalRelationship => rel !== null);
}

/**
 * Build similarity relationships from Challenges based on keyword overlap
 */
export function buildChallengeSimilarityRelationships(
  challenges: Array<{ id: string; keywords: string[] }>,
  threshold: number = 0.3
): UniversalRelationship[] {
  const relationships: UniversalRelationship[] = [];
  
  for (let i = 0; i < challenges.length; i++) {
    for (let j = i + 1; j < challenges.length; j++) {
      const challenge1 = challenges[i];
      const challenge2 = challenges[j];
      
      // Calculate keyword overlap
      const keywords1 = new Set(challenge1.keywords.map(k => k.toLowerCase()));
      const keywords2 = new Set(challenge2.keywords.map(k => k.toLowerCase()));
      
      const intersection = new Set(
        [...keywords1].filter(k => keywords2.has(k))
      );
      const union = new Set([...keywords1, ...keywords2]);
      
      const similarity = union.size > 0 ? intersection.size / union.size : 0;
      
      if (similarity >= threshold) {
        relationships.push({
          id: `sim-${challenge1.id}-${challenge2.id}`,
          source: challenge1.id,
          target: challenge2.id,
          sourceType: 'challenge',
          targetType: 'challenge',
          type: 'similar_to',
          strength: similarity,
          derivation: 'computed',
          metadata: {
            originalStrength: intersection.size,
            confidence: similarity,
            shared_keywords: Array.from(intersection),
            matching_method: 'keyword_overlap',
          },
        });
      }
    }
  }
  
  return relationships;
}




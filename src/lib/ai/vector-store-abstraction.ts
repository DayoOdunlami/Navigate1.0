/**
 * Vector Store Abstraction Layer
 * 
 * Allows easy migration between storage backends:
 * 1. JSON (now → 500 entities) - Simple, no dependencies
 * 2. Vercel KV (500 → 2K entities) - Simple, stays in Vercel ecosystem
 * 3. Supabase pgvector (2K+ entities) - Advanced, scalable
 * 
 * Swap storage implementation without changing code.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import type { Domain, EntityType } from '@/lib/base-entity-enhanced';

export interface VectorStoreInterface {
  embedEntity(entity: BaseEntity): Promise<void>;
  search(
    query: string,
    options?: SearchOptions
  ): Promise<Array<{ entity: BaseEntity; similarity: number }>>;
  deleteEmbedding(entityId: string): Promise<void>;
  embedAll(entities: BaseEntity[]): Promise<void>;
}

export interface SearchOptions {
  domain?: Domain;
  entityType?: EntityType;
  topK?: number;
  usePrecision?: boolean;
  threshold?: number;
}

/**
 * Storage Backend Types
 */
export type StorageBackend = 'json' | 'vercel-kv' | 'supabase';

/**
 * Get storage backend based on entity count or env var
 */
export function getStorageBackend(entityCount: number): StorageBackend {
  // Override with env var if set
  if (process.env.VECTOR_STORE_BACKEND) {
    return process.env.VECTOR_STORE_BACKEND as StorageBackend;
  }
  
  // Auto-select based on scale
  if (entityCount < 500) return 'json';
  if (entityCount < 2000) return 'vercel-kv';
  return 'supabase';
}

/**
 * Factory: Create appropriate vector store
 * 
 * Lazy loads implementations to avoid importing unused dependencies
 */
export function createVectorStore(
  backend?: StorageBackend,
  entityCount?: number
): VectorStoreInterface {
  const selectedBackend = backend || (entityCount ? getStorageBackend(entityCount) : 'json');
  
  switch (selectedBackend) {
    case 'json': {
      // Lazy load to avoid importing if not needed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { JSONVectorStore } = require('./vector-store-json');
      return new JSONVectorStore();
    }
    case 'vercel-kv': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { VercelKVVectorStore } = require('./vector-store-vercel-kv');
      return new VercelKVVectorStore();
    }
    case 'supabase': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SupabaseVectorStore } = require('./vector-store-supabase');
      return new SupabaseVectorStore();
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { JSONVectorStore } = require('./vector-store-json');
      return new JSONVectorStore();
    }
  }
}


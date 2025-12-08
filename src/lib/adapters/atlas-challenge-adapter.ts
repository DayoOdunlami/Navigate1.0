/**
 * Adapter: Atlas ExtractedChallenge → Challenge → BaseEntity
 * 
 * Converts Atlas-extracted challenges (from the extraction pipeline)
 * to the existing Challenge format, then to BaseEntity for unified system.
 */

import type { ExtractedChallenge } from '@/lib/atlas/types';
import type { Challenge } from '@/lib/types';
import { adaptAtlasChallengeToChallenge } from '@/lib/atlas/adapter';
import { challengeToBaseEntity } from './challenge-adapter';
import type { BaseEntity } from '@/lib/base-entity';

/**
 * Convert Atlas ExtractedChallenge directly to BaseEntity
 * (via Challenge format as intermediate step)
 */
export function atlasExtractedChallengeToBaseEntity(atlasChallenge: ExtractedChallenge): BaseEntity {
  // First convert to Challenge format
  const challenge = adaptAtlasChallengeToChallenge(atlasChallenge);
  
  // Then convert to BaseEntity
  return challengeToBaseEntity(challenge);
}

/**
 * Convert array of Atlas ExtractedChallenges to BaseEntities
 */
export function atlasExtractedChallengesToBaseEntities(
  atlasChallenges: ExtractedChallenge[]
): BaseEntity[] {
  return atlasChallenges.map(atlasExtractedChallengeToBaseEntity);
}


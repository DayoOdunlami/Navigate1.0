/**
 * Adapter exports
 * 
 * Central export point for all entity adapters
 */

export {
  challengeToBaseEntity,
  challengesToBaseEntities,
} from './challenge-adapter';

export {
  stakeholderToBaseEntity,
  stakeholdersToBaseEntities,
} from './stakeholder-adapter';

export {
  technologyToBaseEntity,
  technologiesToBaseEntities,
} from './technology-adapter';

export {
  projectToBaseEntity,
  projectsToBaseEntities,
} from './project-adapter';

export {
  relationshipToUniversal,
  relationshipsToUniversal,
  buildChallengeSimilarityRelationships,
} from './relationship-adapter';

export {
  atlasExtractedChallengeToBaseEntity,
  atlasExtractedChallengesToBaseEntities,
} from './atlas-challenge-adapter';


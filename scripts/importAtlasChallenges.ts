/**
 * Import Atlas Challenges Script
 * 
 * Batch imports challenges from JSON file into the vector store
 * 
 * Usage:
 *   npx tsx scripts/importAtlasChallenges.ts [path-to-json-file]
 * 
 * Example:
 *   npx tsx scripts/importAtlasChallenges.ts src/data/atlas_challenges_comprehensive.json
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { AtlasChallengesDataset } from '../src/types/atlas';
import { transformChallengesToEntities } from '../src/lib/atlas/transformChallenge';
import { createVectorStore } from '../src/lib/ai/vector-store-abstraction';

async function importChallenges(jsonFilePath?: string) {
  try {
    // Determine file path
    const filePath = jsonFilePath || join(process.cwd(), 'src/data/atlas_challenges_comprehensive.json');
    
    console.log(`Reading challenges from: ${filePath}`);
    
    // Read JSON file
    const fileContent = await readFile(filePath, 'utf-8');
    const dataset: AtlasChallengesDataset = JSON.parse(fileContent);
    
    console.log(`Found ${dataset.challenges.length} challenges`);
    console.log(`Total funding: £${dataset.metadata.total_funding_gbp.toLocaleString()}`);
    
    // Transform to entities
    console.log('Transforming challenges to entities...');
    const entities = transformChallengesToEntities(dataset.challenges);
    
    console.log(`Transformed ${entities.length} entities`);
    
    // Initialize vector store
    console.log('Initializing vector store...');
    const vectorStore = createVectorStore('json', entities.length);
    
    // Embed and store
    console.log('Embedding and storing entities...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const entity of entities) {
      try {
        await vectorStore.embedEntity(entity);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  Progress: ${successCount}/${entities.length}...`);
        }
      } catch (error) {
        console.error(`  Error embedding entity ${entity.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n✅ Import complete!');
    console.log(`  Successfully imported: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const jsonFilePath = process.argv[2];
  importChallenges(jsonFilePath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { importChallenges };


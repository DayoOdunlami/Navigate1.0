#!/usr/bin/env npx tsx

/**
 * CPC Domain Data Ingestion Script
 * 
 * Ingests CPC internal data (focus areas, milestones, stages) into the vector store.
 * 
 * Usage:
 *   npx tsx scripts/ingestCPCDomain.ts
 *   npx tsx scripts/ingestCPCDomain.ts --force
 *   npx tsx scripts/ingestCPCDomain.ts --dry-run
 * 
 * Options:
 *   --force    Re-embed all entities even if they already have embeddings
 *   --dry-run  Show what would be ingested without actually embedding
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { createDefaultProvenance } from '@/lib/base-entity-enhanced';
import { JSONVectorStore } from '@/lib/ai/vector-store-json';

// Types for raw JSON data
interface FocusAreaRaw {
  id: string;
  name: string;
  mode: string;
  strategic_themes: string[];
  stage: string;
  description: string;
  key_technologies: string[];
  stakeholder_types: string[];
  market_barriers: string[];
  cpc_services: string[];
  related_projects: string[];
  embedding_text: string;
}

interface MilestoneRaw {
  id: string;
  activity: string;
  mode: string;
  impact_priority: string;
  rationale: string;
  customer_status: string;
  business_growth_score: number | null;
  is_alignment: string | null;
  assessment: string;
  stage: string;
  year: string;
  focus_area_ids: string[];
  embedding_text: string;
}

interface StageRaw {
  id: string;
  name: string;
  stage_number: number;
  purpose: string;
  description: string;
  typical_outputs: string[];
  validation_questions?: string[];
  development_activities?: string[];
  commercialisation_activities?: string[];
  logic_model_alignment: string[];
  cpc_strategy_link: string;
  decision_gate: string;
  embedding_text: string;
}

interface Options {
  force: boolean;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    force: false,
    dryRun: false,
  };
  
  for (const arg of args) {
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }
  
  return options;
}

/**
 * Transform focus area to BaseEntity
 */
function transformFocusArea(fa: FocusAreaRaw): BaseEntity {
  const now = new Date().toISOString();
  
  return {
    _version: '1.0',
    id: fa.id,
    name: fa.name,
    description: fa.description,
    entityType: 'focus_area',
    domain: 'cpc-internal',
    metadata: {
      sector: fa.mode,
      tags: [...fa.strategic_themes, fa.stage, fa.mode.toLowerCase()],
      custom: {
        mode: fa.mode,
        strategic_themes: fa.strategic_themes,
        stage: fa.stage,
        key_technologies: fa.key_technologies,
        stakeholder_types: fa.stakeholder_types,
        market_barriers: fa.market_barriers,
        cpc_services: fa.cpc_services,
        related_projects: fa.related_projects,
        embedding_text: fa.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'CPC Transport Strategy 25/26',
      reference: 'Focus Area Descriptions - Transport Strategy 2526',
      ingestedBy: 'ingestCPCDomain.ts',
    }),
  };
}

/**
 * Transform milestone to BaseEntity
 */
function transformMilestone(ms: MilestoneRaw): BaseEntity {
  const now = new Date().toISOString();
  
  return {
    _version: '1.0',
    id: ms.id,
    name: ms.activity,
    description: ms.rationale,
    entityType: 'milestone',
    domain: 'cpc-internal',
    metadata: {
      sector: ms.mode,
      tags: [ms.mode.toLowerCase(), ms.stage, ms.year, ms.assessment],
      status: ms.assessment.toLowerCase(),
      custom: {
        mode: ms.mode,
        impact_priority: ms.impact_priority,
        customer_status: ms.customer_status,
        business_growth_score: ms.business_growth_score,
        is_alignment: ms.is_alignment,
        assessment: ms.assessment,
        stage: ms.stage,
        year: ms.year,
        focus_area_ids: ms.focus_area_ids,
        embedding_text: ms.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'IUK Transport Milestones',
      reference: 'IUK transport milestones.pdf, Milestone long list 26_27.xlsx',
      ingestedBy: 'ingestCPCDomain.ts',
    }),
  };
}

/**
 * Transform stage to BaseEntity
 */
function transformStage(stage: StageRaw): BaseEntity {
  return {
    _version: '1.0',
    id: stage.id,
    name: stage.name,
    description: stage.description,
    entityType: 'stage',
    domain: 'cpc-internal',
    metadata: {
      tags: ['framework', 'maturity', `stage-${stage.stage_number}`],
      custom: {
        stage_number: stage.stage_number,
        purpose: stage.purpose,
        typical_outputs: stage.typical_outputs,
        validation_questions: stage.validation_questions,
        development_activities: stage.development_activities,
        commercialisation_activities: stage.commercialisation_activities,
        logic_model_alignment: stage.logic_model_alignment,
        cpc_strategy_link: stage.cpc_strategy_link,
        decision_gate: stage.decision_gate,
        embedding_text: stage.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'CPC Stage Framework',
      reference: 'Focus Area Stages_copy.docx',
      ingestedBy: 'ingestCPCDomain.ts',
    }),
  };
}

async function main() {
  const options = parseArgs();
  
  console.log('🚀 Starting CPC Domain ingestion...\n');
  
  // Load JSON files
  const dataDir = join(process.cwd(), 'data', 'cpc_domain');
  
  console.log('📂 Loading data files...');
  
  let focusAreasData: { entities: FocusAreaRaw[] };
  let milestonesData: { milestones: MilestoneRaw[] };
  let stagesData: { stages: StageRaw[] };
  
  try {
    const focusAreasJson = await readFile(join(dataDir, 'focus_areas.json'), 'utf-8');
    focusAreasData = JSON.parse(focusAreasJson);
    
    const milestonesJson = await readFile(join(dataDir, 'milestones.json'), 'utf-8');
    milestonesData = JSON.parse(milestonesJson);
    
    const stagesJson = await readFile(join(dataDir, 'stage_framework.json'), 'utf-8');
    stagesData = JSON.parse(stagesJson);
    
    console.log(`✅ Loaded ${focusAreasData.entities.length} focus areas`);
    console.log(`✅ Loaded ${milestonesData.milestones.length} milestones`);
    console.log(`✅ Loaded ${stagesData.stages.length} stages\n`);
  } catch (error: any) {
    console.error(`❌ Error loading data files: ${error.message}`);
    console.error(`   Make sure data files exist in: ${dataDir}`);
    process.exit(1);
  }
  
  // Transform to BaseEntity
  console.log('🔄 Transforming entities...');
  
  const focusAreas = focusAreasData.entities.map(transformFocusArea);
  const milestones = milestonesData.milestones.map(transformMilestone);
  const stages = stagesData.stages.map(transformStage);
  
  const allEntities = [...focusAreas, ...milestones, ...stages];
  
  console.log(`✅ Transformed ${allEntities.length} entities\n`);
  
  // Show breakdown
  console.log('📊 Entity breakdown:');
  console.log(`   Focus Areas: ${focusAreas.length}`);
  console.log(`   Milestones: ${milestones.length}`);
  console.log(`   Stages: ${stages.length}\n`);
  
  if (options.dryRun) {
    console.log('🔍 Dry run - no embeddings will be created.\n');
    console.log('Sample entities that would be embedded:');
    allEntities.slice(0, 5).forEach(e => {
      console.log(`   - ${e.name} (${e.entityType})`);
    });
    return;
  }
  
  // Initialize vector store
  const vectorStore = new JSONVectorStore();
  await vectorStore.ensureReady();
  
  // Check existing embeddings
  if (!options.force) {
    const existingCount = allEntities.filter(e => vectorStore.hasEmbedding(e.id)).length;
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} entities already have embeddings.`);
      console.log('   Use --force to re-embed all.\n');
      
      // Filter to only new entities
      const newEntities = allEntities.filter(e => !vectorStore.hasEmbedding(e.id));
      console.log(`📋 Embedding ${newEntities.length} new entities...\n`);
      
      if (newEntities.length === 0) {
        console.log('✅ All entities already embedded. Nothing to do.');
        return;
      }
      
      // Embed new entities
      const startTime = Date.now();
      await vectorStore.embedAll(newEntities, {
        onProgress: (current, total) => {
          const percent = Math.round((current / total) * 100);
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = current / elapsed;
          const remaining = Math.round((total - current) / rate);
          
          process.stdout.write(
            `\r⏳ Progress: ${current}/${total} (${percent}%) | ` +
            `${rate.toFixed(1)} entities/sec | ` +
            `~${remaining}s remaining     `
          );
        },
      });
      
      console.log('\n');
      console.log('✅ Ingestion complete!');
      return;
    }
  }
  
  // Estimate time and cost
  const estimatedTimeMinutes = Math.ceil(allEntities.length / 5);
  const estimatedCost = (allEntities.length * 100 * 2) / 1000000 * 0.00002;
  
  console.log(`⏱️  Estimated time: ${estimatedTimeMinutes} minutes`);
  console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);
  
  // Start embedding
  const startTime = Date.now();
  
  await vectorStore.embedAll(allEntities, {
    onProgress: (current, total) => {
      const percent = Math.round((current / total) * 100);
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = current / elapsed;
      const remaining = Math.round((total - current) / rate);
      
      process.stdout.write(
        `\r⏳ Progress: ${current}/${total} (${percent}%) | ` +
        `${rate.toFixed(1)} entities/sec | ` +
        `~${remaining}s remaining     `
      );
    },
  });
  
  // Final stats
  const totalTime = (Date.now() - startTime) / 1000;
  const stats = vectorStore.getStats();
  
  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('✅ CPC Domain ingestion complete!');
  console.log('═══════════════════════════════════════');
  console.log(`📊 Total embeddings: ${stats.count}`);
  console.log(`💾 Storage size: ${stats.size.toFixed(2)} MB`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📁 Location: data/embeddings/embeddings.json`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});



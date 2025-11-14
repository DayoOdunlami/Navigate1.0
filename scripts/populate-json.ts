/**
 * Sample Data Population Script
 * 
 * Generates JSON files from the dummy data for use in the platform.
 * Run with: npm run populate-data
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  stakeholders, 
  technologies, 
  fundingEvents, 
  projects, 
  relationships 
} from '../src/data/navigate-dummy-data';

const outputDir = path.join(process.cwd(), 'public', 'data');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON files
const dataFiles = {
  'stakeholders.json': stakeholders,
  'technologies.json': technologies,
  'funding-events.json': fundingEvents,
  'projects.json': projects,
  'relationships.json': relationships,
};

console.log('Generating JSON data files...\n');

Object.entries(dataFiles).forEach(([filename, data]) => {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
  console.log(`✓ Created ${filename} (${data.length} items)`);
});

// Create index file with metadata
const metadata = {
  generated_at: new Date().toISOString(),
  counts: {
    stakeholders: stakeholders.length,
    technologies: technologies.length,
    fundingEvents: fundingEvents.length,
    projects: projects.length,
    relationships: relationships.length,
  },
  version: '1.0.0',
};

fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2),
  'utf-8'
);

console.log(`\n✓ Created metadata.json`);
console.log(`\n✅ All data files generated in ${outputDir}`);


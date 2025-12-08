// ============================================================================
// ATLAS DATA STORE - JSON-based storage for sources, challenges, history
// ============================================================================
// This file uses Node.js fs module - server-only, should only be imported in API routes

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src', 'data', 'atlas');
const SOURCES_FILE = join(DATA_DIR, 'sources.json');
const CHALLENGES_FILE = join(DATA_DIR, 'challenges.json');
const HISTORY_FILE = join(DATA_DIR, 'history.json');

// ============================================================================
// TYPES
// ============================================================================

export interface AtlasSource {
  id: string;
  name: string;
  baseUrl: string;
  type: 'funding' | 'policy' | 'strategy';
  method: 'jina' | 'firecrawl' | 'playwright';
  lastScanAt: string | null;
  lastScanChallenges: number;
  lastScanCost: number;
  lastScanStatus: 'success' | 'partial' | 'failed' | null;
  scanFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  nextScheduledScan: string | null;
  urls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistoryEntry {
  id: string;
  timestamp: string;
  sourceId?: string;
  urls: string[];
  duration: number;
  cost: number;
  challengesExtracted: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
  challengeIds: string[];
}

// ============================================================================
// INITIALIZE DATA DIRECTORY
// ============================================================================

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// ============================================================================
// SOURCES
// ============================================================================

export async function getSources(): Promise<AtlasSource[]> {
  await ensureDataDir();
  
  if (!existsSync(SOURCES_FILE)) {
    return getDefaultSources();
  }
  
  try {
    const content = await readFile(SOURCES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return getDefaultSources();
  }
}

export async function saveSources(sources: AtlasSource[]): Promise<void> {
  await ensureDataDir();
  await writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2), 'utf-8');
}

export async function addSource(source: Omit<AtlasSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<AtlasSource> {
  const sources = await getSources();
  const newSource: AtlasSource = {
    ...source,
    id: `source-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sources.push(newSource);
  await saveSources(sources);
  return newSource;
}

export async function updateSource(id: string, updates: Partial<AtlasSource>): Promise<AtlasSource | null> {
  const sources = await getSources();
  const index = sources.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  sources[index] = {
    ...sources[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveSources(sources);
  return sources[index];
}

export async function deleteSource(id: string): Promise<boolean> {
  const sources = await getSources();
  const filtered = sources.filter(s => s.id !== id);
  if (filtered.length === sources.length) return false;
  await saveSources(filtered);
  return true;
}

function getDefaultSources(): AtlasSource[] {
  return [
    {
      id: 'innovate-uk',
      name: 'Innovate UK',
      baseUrl: 'https://apply-for-innovation-funding.service.gov.uk',
      type: 'funding',
      method: 'firecrawl',
      lastScanAt: null,
      lastScanChallenges: 0,
      lastScanCost: 0,
      lastScanStatus: null,
      scanFrequency: 'weekly',
      nextScheduledScan: null,
      urls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ukri',
      name: 'UKRI Opportunities',
      baseUrl: 'https://www.ukri.org/opportunity',
      type: 'funding',
      method: 'jina',
      lastScanAt: null,
      lastScanChallenges: 0,
      lastScanCost: 0,
      lastScanStatus: null,
      scanFrequency: 'weekly',
      nextScheduledScan: null,
      urls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dft',
      name: 'Department for Transport',
      baseUrl: 'https://www.gov.uk/government/organisations/department-for-transport',
      type: 'policy',
      method: 'playwright',
      lastScanAt: null,
      lastScanChallenges: 0,
      lastScanCost: 0,
      lastScanStatus: null,
      scanFrequency: 'weekly',
      nextScheduledScan: null,
      urls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'horizon-europe',
      name: 'Horizon Europe',
      baseUrl: 'https://ec.europa.eu/info/funding-tenders',
      type: 'funding',
      method: 'playwright',
      lastScanAt: null,
      lastScanChallenges: 0,
      lastScanCost: 0,
      lastScanStatus: null,
      scanFrequency: 'monthly',
      nextScheduledScan: null,
      urls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ============================================================================
// CHALLENGES
// ============================================================================

export async function getChallenges(): Promise<any[]> {
  await ensureDataDir();
  
  if (!existsSync(CHALLENGES_FILE)) {
    return [];
  }
  
  try {
    const content = await readFile(CHALLENGES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveChallenge(challenge: any): Promise<void> {
  const challenges = await getChallenges();
  const existingIndex = challenges.findIndex(c => c.id === challenge.id);
  
  if (existingIndex >= 0) {
    challenges[existingIndex] = challenge;
  } else {
    challenges.push(challenge);
  }
  
  await ensureDataDir();
  await writeFile(CHALLENGES_FILE, JSON.stringify(challenges, null, 2), 'utf-8');
}

export async function saveChallenges(newChallenges: any[]): Promise<void> {
  const challenges = await getChallenges();
  const challengeMap = new Map(challenges.map(c => [c.id, c]));
  
  for (const challenge of newChallenges) {
    challengeMap.set(challenge.id, challenge);
  }
  
  await ensureDataDir();
  await writeFile(CHALLENGES_FILE, JSON.stringify(Array.from(challengeMap.values()), null, 2), 'utf-8');
}

// ============================================================================
// HISTORY
// ============================================================================

export async function getHistory(): Promise<ScanHistoryEntry[]> {
  await ensureDataDir();
  
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }
  
  try {
    const content = await readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function addHistoryEntry(entry: Omit<ScanHistoryEntry, 'id'>): Promise<ScanHistoryEntry> {
  const history = await getHistory();
  const newEntry: ScanHistoryEntry = {
    ...entry,
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  history.unshift(newEntry); // Add to beginning
  history.splice(100); // Keep last 100 entries
  await ensureDataDir();
  await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  return newEntry;
}

// ============================================================================
// UTILITIES
// ============================================================================

export function getSourceStatus(source: AtlasSource): 'fresh' | 'stale' | 'never' {
  if (!source.lastScanAt) return 'never';
  
  const lastScan = new Date(source.lastScanAt);
  const daysSince = (Date.now() - lastScan.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince <= 1) return 'fresh';
  if (daysSince <= 7) return 'stale';
  return 'stale'; // More than 7 days
}


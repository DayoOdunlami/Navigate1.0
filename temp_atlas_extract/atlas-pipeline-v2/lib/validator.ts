// ============================================================================
// ATLAS VALIDATOR - Validation rules for UK transport challenges
// ============================================================================

import type { ExtractedChallenge, TransportMode, StrategicTheme } from './types';
import fewShotExamples from '../data/few-shot-examples.json';

export interface ValidationResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
  score: number; // 0-100
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationRule {
  name: string;
  type: 'error' | 'warning';
  check: (challenge: ExtractedChallenge, rawText: string) => string | null;
}

const VALIDATION_RULES: ValidationRule[] = [
  // === REQUIRED FIELDS ===
  {
    name: 'has_title',
    type: 'error',
    check: (c) => (!c.title || c.title.length < 5) ? 'Missing or invalid title' : null,
  },
  {
    name: 'has_description',
    type: 'error',
    check: (c) => (!c.description || c.description.length < 50) ? 'Missing or too short description' : null,
  },
  {
    name: 'has_modes',
    type: 'error',
    check: (c) => (!c.modes || c.modes.length === 0) ? 'No transport modes classified' : null,
  },
  {
    name: 'has_themes',
    type: 'error',
    check: (c) => (!c.strategicThemes || c.strategicThemes.length === 0) ? 'No strategic themes classified' : null,
  },
  {
    name: 'has_challenge_type',
    type: 'error',
    check: (c) => !c.challengeType ? 'No challenge type classified' : null,
  },

  // === MODE VALIDATION ===
  {
    name: 'mode_keyword_match',
    type: 'warning',
    check: (c, rawText) => {
      const textLower = rawText.toLowerCase();
      const modeKeywords = fewShotExamples.modeKeywords as Record<string, string[]>;
      
      for (const mode of c.modes) {
        const keywords = modeKeywords[mode] || [];
        const found = keywords.some(kw => textLower.includes(kw.toLowerCase()));
        if (!found) {
          return `Mode '${mode}' assigned but no related keywords found in text`;
        }
      }
      return null;
    },
  },
  {
    name: 'cross_modal_validation',
    type: 'warning',
    check: (c, rawText) => {
      if (c.modes.includes('Cross-modal')) {
        const textLower = rawText.toLowerCase();
        const modeKeywords = fewShotExamples.modeKeywords as Record<string, string[]>;
        
        // Count how many modes are actually mentioned
        let modesFound = 0;
        for (const [mode, keywords] of Object.entries(modeKeywords)) {
          if (mode === 'Cross-modal' || mode === 'Integrated') continue;
          const found = keywords.some(kw => textLower.includes(kw.toLowerCase()));
          if (found) modesFound++;
        }
        
        if (modesFound < 2) {
          return 'Cross-modal assigned but fewer than 2 transport modes mentioned in text';
        }
      }
      return null;
    },
  },

  // === FUNDING VALIDATION ===
  {
    name: 'funding_reasonable_range',
    type: 'warning',
    check: (c) => {
      if (c.funding) {
        const max = c.funding.max || c.funding.min || 0;
        if (max > 100000000) { // > £100m
          return `Funding amount (${max}) seems unusually high - verify`;
        }
        if (max > 0 && max < 10000) { // < £10k
          return `Funding amount (${max}) seems unusually low - verify`;
        }
      }
      return null;
    },
  },
  {
    name: 'funding_min_max_order',
    type: 'error',
    check: (c) => {
      if (c.funding && c.funding.min && c.funding.max) {
        if (c.funding.min > c.funding.max) {
          return 'Funding min is greater than max';
        }
      }
      return null;
    },
  },
  {
    name: 'funding_currency_matches_source',
    type: 'warning',
    check: (c, rawText) => {
      if (c.funding) {
        const hasGBP = rawText.includes('£') || rawText.toLowerCase().includes('gbp');
        const hasEUR = rawText.includes('€') || rawText.toLowerCase().includes('eur');
        
        if (c.funding.currency === 'GBP' && !hasGBP && hasEUR) {
          return 'Currency set to GBP but text contains EUR symbols';
        }
        if (c.funding.currency === 'EUR' && !hasEUR && hasGBP) {
          return 'Currency set to EUR but text contains GBP symbols';
        }
      }
      return null;
    },
  },

  // === DEADLINE VALIDATION ===
  {
    name: 'deadline_in_future',
    type: 'warning',
    check: (c) => {
      if (c.deadline) {
        const deadline = new Date(c.deadline);
        const now = new Date();
        if (deadline < now) {
          return `Deadline (${c.deadline}) is in the past`;
        }
      }
      return null;
    },
  },
  {
    name: 'deadline_reasonable',
    type: 'warning',
    check: (c) => {
      if (c.deadline) {
        const deadline = new Date(c.deadline);
        const now = new Date();
        const twoYears = new Date();
        twoYears.setFullYear(twoYears.getFullYear() + 2);
        
        if (deadline > twoYears) {
          return `Deadline (${c.deadline}) is more than 2 years away - verify`;
        }
      }
      return null;
    },
  },
  {
    name: 'deadline_format',
    type: 'error',
    check: (c) => {
      if (c.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(c.deadline)) {
        return `Deadline (${c.deadline}) is not in YYYY-MM-DD format`;
      }
      return null;
    },
  },

  // === TRL VALIDATION ===
  {
    name: 'trl_valid_range',
    type: 'error',
    check: (c) => {
      if (c.trl) {
        if (c.trl.min < 1 || c.trl.min > 9 || c.trl.max < 1 || c.trl.max > 9) {
          return `TRL range (${c.trl.min}-${c.trl.max}) outside valid 1-9 range`;
        }
        if (c.trl.min > c.trl.max) {
          return `TRL min (${c.trl.min}) greater than max (${c.trl.max})`;
        }
      }
      return null;
    },
  },

  // === CONFIDENCE VALIDATION ===
  {
    name: 'low_classification_confidence',
    type: 'warning',
    check: (c) => {
      const modeConf = c.classification.modes[0]?.confidence || 0;
      const themeConf = c.classification.themes[0]?.confidence || 0;
      const typeConf = c.classification.challengeType.confidence;
      
      if (modeConf < 0.6 || themeConf < 0.6 || typeConf < 0.6) {
        return `Low classification confidence (mode: ${modeConf.toFixed(2)}, theme: ${themeConf.toFixed(2)}, type: ${typeConf.toFixed(2)}) - needs review`;
      }
      return null;
    },
  },

  // === CONSISTENCY VALIDATION ===
  {
    name: 'theme_mode_consistency',
    type: 'warning',
    check: (c) => {
      // If it's cross-modal, should probably have industry or planning theme
      if (c.modes.includes('Cross-modal') && 
          !c.strategicThemes.includes('Industry') && 
          !c.strategicThemes.includes('Hubs and Clusters')) {
        // Not necessarily wrong, just flag for review
      }
      return null;
    },
  },
  {
    name: 'policy_no_funding',
    type: 'warning',
    check: (c) => {
      if (c.challengeType === 'policy_regulatory' && c.funding && c.funding.max) {
        // Policy documents usually don't have per-project funding
        return 'Policy/regulatory challenge has project funding - verify this is a funding call not a policy document';
      }
      return null;
    },
  },

  // === PROBLEM STATEMENT VALIDATION ===
  {
    name: 'problem_statement_is_problem',
    type: 'warning',
    check: (c) => {
      if (c.problemStatement) {
        const solutionWords = ['develop', 'create', 'build', 'design', 'implement', 'deliver'];
        const lower = c.problemStatement.toLowerCase();
        const startsWithSolution = solutionWords.some(w => lower.startsWith(w));
        
        if (startsWithSolution) {
          return 'Problem statement may describe solution rather than problem (starts with action verb)';
        }
      }
      return null;
    },
  },

  // === KEY ENTITIES VALIDATION ===
  {
    name: 'key_entities_in_text',
    type: 'warning',
    check: (c, rawText) => {
      if (c.keyEntities && c.keyEntities.length > 0) {
        const textLower = rawText.toLowerCase();
        const missingEntities = c.keyEntities.filter(
          e => !textLower.includes(e.toLowerCase())
        );
        
        if (missingEntities.length > c.keyEntities.length / 2) {
          return `Many key entities not found in text: ${missingEntities.slice(0, 3).join(', ')}`;
        }
      }
      return null;
    },
  },

  // === SOURCE-SPECIFIC VALIDATION ===
  {
    name: 'iuk_has_deadline',
    type: 'warning',
    check: (c) => {
      if (c.source.name === 'Innovate UK' && !c.deadline) {
        return 'Innovate UK competition should have a deadline';
      }
      return null;
    },
  },
  {
    name: 'horizon_is_eur',
    type: 'error',
    check: (c) => {
      if (c.source.name === 'Horizon Europe' && c.funding && c.funding.currency !== 'EUR') {
        return 'Horizon Europe funding should be in EUR';
      }
      return null;
    },
  },
];

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

export function validateChallenge(
  challenge: ExtractedChallenge,
  rawText: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  for (const rule of VALIDATION_RULES) {
    const result = rule.check(challenge, rawText);
    if (result) {
      if (rule.type === 'error') {
        errors.push(`[${rule.name}] ${result}`);
        score -= 15;
      } else {
        warnings.push(`[${rule.name}] ${result}`);
        score -= 5;
      }
    }
  }

  // Bonus points for completeness
  if (challenge.funding) score = Math.min(100, score + 5);
  if (challenge.deadline) score = Math.min(100, score + 5);
  if (challenge.trl) score = Math.min(100, score + 5);
  if (challenge.eligibility && challenge.eligibility.length > 0) score = Math.min(100, score + 3);
  if (challenge.context.policyDrivers && challenge.context.policyDrivers.length > 0) score = Math.min(100, score + 2);

  return {
    passed: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, score),
  };
}

// ============================================================================
// BATCH VALIDATION REPORT
// ============================================================================

export interface BatchValidationReport {
  total: number;
  passed: number;
  failed: number;
  avgScore: number;
  commonErrors: { error: string; count: number }[];
  commonWarnings: { warning: string; count: number }[];
}

export function generateBatchReport(
  challenges: ExtractedChallenge[]
): BatchValidationReport {
  const errorCounts = new Map<string, number>();
  const warningCounts = new Map<string, number>();
  let totalScore = 0;
  let passed = 0;

  for (const challenge of challenges) {
    totalScore += challenge.validation.score || 0;
    if (challenge.validation.passed) passed++;

    for (const error of challenge.validation.errors) {
      const key = error.split(']')[0] + ']'; // Get rule name
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    }

    for (const warning of challenge.validation.warnings) {
      const key = warning.split(']')[0] + ']';
      warningCounts.set(key, (warningCounts.get(key) || 0) + 1);
    }
  }

  return {
    total: challenges.length,
    passed,
    failed: challenges.length - passed,
    avgScore: totalScore / challenges.length,
    commonErrors: Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    commonWarnings: Array.from(warningCounts.entries())
      .map(([warning, count]) => ({ warning, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}

// ============================================================================
// HUMAN REVIEW FLAGS
// ============================================================================

export function needsHumanReview(challenge: ExtractedChallenge): {
  needed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Low overall confidence
  if (challenge.extraction.confidence < 0.7) {
    reasons.push('Low extraction confidence');
  }

  // Low classification confidence
  const modeConf = challenge.classification.modes[0]?.confidence || 0;
  if (modeConf < 0.7) {
    reasons.push('Low mode classification confidence');
  }

  // Validation errors
  if (challenge.validation.errors.length > 0) {
    reasons.push(`Has ${challenge.validation.errors.length} validation error(s)`);
  }

  // Multiple warnings
  if (challenge.validation.warnings.length >= 3) {
    reasons.push('Multiple validation warnings');
  }

  // Low validation score
  if ((challenge.validation.score || 0) < 70) {
    reasons.push('Low validation score');
  }

  return {
    needed: reasons.length > 0,
    reasons,
  };
}

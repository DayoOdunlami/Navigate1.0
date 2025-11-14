/**
 * AI Configuration and Feature Flags
 * 
 * Controls which AI features are enabled and which provider to use.
 * OpenAI is the default provider, with Claude as an alternative.
 */

export type AIProvider = 'openai' | 'claude' | 'anthropic' | 'mock';

export interface AIProviderConfig {
  enabled: boolean;
  apiKey?: string;
  model: string;
  baseURL?: string;
}

export const AI_CONFIG = {
  default_provider: 'openai' as AIProvider,
  providers: {
    openai: {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o', // or 'gpt-4-turbo' for faster/cheaper
      baseURL: 'https://api.openai.com/v1',
    },
    claude: {
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-sonnet-4-20250514',
    },
    anthropic: { // Alias for claude
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-sonnet-4-20250514',
    },
    mock: {
      enabled: true, // Always available as fallback
      model: 'mock',
    }
  }
} as const;

export const AI_FEATURES = {
  static_insights: true,      // Rule-based insights, always on
  ai_insights: false,          // AI-generated insights (toggle)
  chat: false,                 // Text chat interface (toggle)
  voice: false,                 // Voice interface (Phase 2)
  actions: false,               // AI can control UI (Phase 2)
} as const;

/**
 * Get the configured provider
 */
export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_CONFIG.providers[provider];
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  const config = getProviderConfig(provider);
  if (!config.enabled) return false;
  if (provider === 'mock') return true;
  return !!config.apiKey;
}


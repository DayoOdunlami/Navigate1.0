/**
 * AI Provider Abstraction
 * 
 * Main entry point for AI functionality.
 * Automatically selects the configured provider (OpenAI by default).
 */

import { AI_CONFIG, AIProvider, isProviderAvailable } from './config';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';
import { MockProvider } from './providers/mock';

export type { Insight, ChatMessage, ChatResponse, GraphData, Context } from './providers/openai';

export interface AIProviderInterface {
  isAvailable(): boolean;
  generateInsights(graphData: any): Promise<any[]>;
  chat(message: string, context: any): Promise<any>;
  streamChat(message: string, context: any): AsyncGenerator<string, void, unknown>;
}

/**
 * Get AI provider instance
 */
export function getAIProvider(provider?: AIProvider): AIProviderInterface {
  const selected = provider || AI_CONFIG.default_provider;

  // Check if provider is available, fallback to mock
  if (!isProviderAvailable(selected) && selected !== 'mock') {
    console.warn(`Provider ${selected} not available, falling back to mock`);
    return new MockProvider();
  }

  switch (selected) {
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
    case 'anthropic':
      return new ClaudeProvider();
    case 'mock':
    default:
      return new MockProvider();
  }
}

/**
 * Default provider instance
 */
export const aiProvider = getAIProvider();

/**
 * React hook for AI provider (to be implemented in stores)
 */
export function useAIProvider(provider?: AIProvider) {
  // This will be implemented with Zustand store
  // For now, return the provider directly
  return getAIProvider(provider);
}

/**
 * Check which providers are available
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['mock']; // Mock is always available

  if (isProviderAvailable('openai')) {
    providers.push('openai');
  }

  if (isProviderAvailable('claude')) {
    providers.push('claude', 'anthropic');
  }

  return providers;
}


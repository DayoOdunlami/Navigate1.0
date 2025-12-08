// ============================================================================
// AI PROVIDER ABSTRACTION - Supports OpenAI (default), Anthropic, and more
// ============================================================================

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export type AIProvider = 'openai' | 'anthropic';

export interface ProviderConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string | null;
  toolCalls?: {
    name: string;
    arguments: Record<string, unknown>;
  }[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
  provider: AIProvider;
}

// ============================================================================
// PRICING (USD per 1M tokens, Dec 2024)
// ============================================================================

export const PRICING: Record<string, { input: number; output: number; name: string }> = {
  // OpenAI
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, name: 'GPT-4o Mini' },
  'gpt-4-turbo': { input: 10.00, output: 30.00, name: 'GPT-4 Turbo' },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, name: 'GPT-3.5 Turbo' },
  
  // Anthropic
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00, name: 'Claude Sonnet 4' },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, name: 'Claude 3.5 Sonnet' },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25, name: 'Claude 3 Haiku' },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model] || { input: 5.00, output: 15.00 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

// ============================================================================
// DEFAULT MODELS
// ============================================================================

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
};

export const AVAILABLE_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
};

// ============================================================================
// OPENAI PROVIDER
// ============================================================================

async function callOpenAI(
  messages: AIMessage[],
  options: {
    model: string;
    tools?: ToolDefinition[];
    toolChoice?: string;
    maxTokens?: number;
    apiKey?: string;
  }
): Promise<AIResponse> {
  const openai = new OpenAI({
    apiKey: options.apiKey || process.env.OPENAI_API_KEY,
  });

  // Convert tools to OpenAI format
  const openaiTools = options.tools?.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));

  const response = await openai.chat.completions.create({
    model: options.model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    tools: openaiTools,
    tool_choice: options.toolChoice 
      ? { type: 'function', function: { name: options.toolChoice } }
      : undefined,
    max_tokens: options.maxTokens || 4096,
  });

  const choice = response.choices[0];
  const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  // Extract tool calls if present
  const toolCalls = choice.message.tool_calls?.map(tc => ({
    name: tc.function.name,
    arguments: JSON.parse(tc.function.arguments),
  }));

  return {
    content: choice.message.content,
    toolCalls,
    usage: {
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    },
    cost: calculateCost(options.model, usage.prompt_tokens, usage.completion_tokens),
    model: options.model,
    provider: 'openai',
  };
}

// ============================================================================
// ANTHROPIC PROVIDER
// ============================================================================

async function callAnthropic(
  messages: AIMessage[],
  options: {
    model: string;
    tools?: ToolDefinition[];
    toolChoice?: string;
    maxTokens?: number;
    apiKey?: string;
  }
): Promise<AIResponse> {
  // Dynamic import - only loads if Anthropic is actually used
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  
  const anthropic = new Anthropic({
    apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
  });

  // Separate system message
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  // Convert tools to Anthropic format
  const anthropicTools = options.tools?.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));

  const response = await anthropic.messages.create({
    model: options.model,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages,
    tools: anthropicTools,
    tool_choice: options.toolChoice 
      ? { type: 'tool' as const, name: options.toolChoice }
      : undefined,
  });

  // Extract content and tool calls
  let content: string | null = null;
  const toolCalls: { name: string; arguments: Record<string, unknown> }[] = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      content = block.text;
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      });
    }
  }

  return {
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
    cost: calculateCost(options.model, response.usage.input_tokens, response.usage.output_tokens),
    model: options.model,
    provider: 'anthropic',
  };
}

// ============================================================================
// AI CLIENT CLASS
// ============================================================================

export interface CallOptions {
  tools?: ToolDefinition[];
  toolChoice?: string;
  maxTokens?: number;
}

export interface CostEntry {
  id: string;
  timestamp: Date;
  cost: number;
  model: string;
  provider: AIProvider;
  inputTokens: number;
  outputTokens: number;
  operation?: string;  // e.g., 'extraction', 'classification', 'enrichment'
}

export class AIClient {
  private provider: AIProvider;
  private model: string;
  private apiKey?: string;
  
  // Cost tracking
  private costHistory: CostEntry[] = [];

  constructor(config?: Partial<ProviderConfig>) {
    this.provider = config?.provider || 'openai';
    this.model = config?.model || DEFAULT_MODELS[this.provider];
    this.apiKey = config?.apiKey;
  }

  // Change provider/model on the fly
  setProvider(provider: AIProvider, model?: string) {
    this.provider = provider;
    this.model = model || DEFAULT_MODELS[provider];
  }

  getConfig() {
    return {
      provider: this.provider,
      model: this.model,
    };
  }

  async call(messages: AIMessage[], options?: CallOptions & { operation?: string }): Promise<AIResponse> {
    let response: AIResponse;

    switch (this.provider) {
      case 'openai':
        response = await callOpenAI(messages, {
          model: this.model,
          apiKey: this.apiKey,
          ...options,
        });
        break;
      
      case 'anthropic':
        response = await callAnthropic(messages, {
          model: this.model,
          apiKey: this.apiKey,
          ...options,
        });
        break;
      
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }

    // Track costs
    this.costHistory.push({
      id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      cost: response.cost,
      model: response.model,
      provider: response.provider,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      operation: options?.operation,
    });

    return response;
  }

  // ============================================================================
  // COST TRACKING METHODS
  // ============================================================================

  getCostSummary() {
    const totalCost = this.costHistory.reduce((sum, e) => sum + e.cost, 0);
    const totalTokens = this.costHistory.reduce((sum, e) => sum + e.inputTokens + e.outputTokens, 0);
    
    return {
      totalCost,
      totalCalls: this.costHistory.length,
      totalTokens,
      averageCostPerCall: this.costHistory.length > 0 ? totalCost / this.costHistory.length : 0,
      provider: this.provider,
      model: this.model,
    };
  }

  getCostHistory(): CostEntry[] {
    return [...this.costHistory];
  }

  getCostByOperation(): Record<string, { cost: number; calls: number }> {
    const byOp: Record<string, { cost: number; calls: number }> = {};
    
    for (const entry of this.costHistory) {
      const op = entry.operation || 'unknown';
      if (!byOp[op]) {
        byOp[op] = { cost: 0, calls: 0 };
      }
      byOp[op].cost += entry.cost;
      byOp[op].calls++;
    }
    
    return byOp;
  }

  getCostForPeriod(since: Date): number {
    return this.costHistory
      .filter(h => h.timestamp >= since)
      .reduce((sum, h) => sum + h.cost, 0);
  }

  getTodayCost(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getCostForPeriod(today);
  }

  getThisMonthCost(): number {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    return this.getCostForPeriod(firstOfMonth);
  }

  resetCostTracking() {
    this.costHistory = [];
  }

  // Export for persistence
  exportCostHistory(): string {
    return JSON.stringify(this.costHistory, null, 2);
  }

  // Import from persistence
  importCostHistory(json: string) {
    const data = JSON.parse(json);
    this.costHistory = data.map((e: CostEntry) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let defaultClient: AIClient | null = null;

export function getAIClient(config?: Partial<ProviderConfig>): AIClient {
  if (!defaultClient) {
    defaultClient = new AIClient(config);
  } else if (config) {
    // Update existing client config
    if (config.provider) {
      defaultClient.setProvider(config.provider, config.model);
    }
  }
  return defaultClient;
}

// ============================================================================
// UTILITY: Check available providers
// ============================================================================

export function getAvailableProviders(): { provider: AIProvider; available: boolean; reason?: string }[] {
  return [
    {
      provider: 'openai',
      available: !!process.env.OPENAI_API_KEY,
      reason: !process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY not set' : undefined,
    },
    {
      provider: 'anthropic',
      available: !!process.env.ANTHROPIC_API_KEY,
      reason: !process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY not set' : undefined,
    },
  ];
}

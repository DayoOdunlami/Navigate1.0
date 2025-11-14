/**
 * OpenAI Provider Implementation
 * 
 * Default AI provider using OpenAI's GPT-4o model.
 */

import OpenAI from 'openai';
import { AI_CONFIG, getProviderConfig } from '../config';

export interface Insight {
  id: string;
  type: 'gap' | 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  entities: string[]; // Entity IDs
  confidence: number;
  actionable: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  actions?: {
    highlight?: string[];
    filter?: Record<string, any>;
    switchView?: string;
  };
  insights?: Insight[];
}

export interface GraphData {
  stakeholders: any[];
  technologies: any[];
  fundingEvents: any[];
  projects: any[];
  relationships: any[];
}

export interface Context {
  currentView: string;
  selectedEntities: string[];
  filters: Record<string, any>;
  history: ChatMessage[];
}

export class OpenAIProvider {
  private client: OpenAI | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const config = getProviderConfig('openai');
    if (!config.enabled || !config.apiKey) {
      console.warn('OpenAI provider not configured. API key missing.');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
    }
  }

  /**
   * Check if provider is available
   */
  isAvailable(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Generate insights from graph data
   */
  async generateInsights(graphData: GraphData): Promise<Insight[]> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI provider not available');
    }

    const prompt = this.buildInsightPrompt(graphData);

    try {
      const response = await this.client!.chat.completions.create({
        model: AI_CONFIG.providers.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant analyzing the UK zero emission aviation ecosystem. Provide structured insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      return this.parseInsights(JSON.parse(content));
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  /**
   * Chat with AI assistant
   */
  async chat(message: string, context: Context): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI provider not available');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const response = await this.client!.chat.completions.create({
        model: AI_CONFIG.providers.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...context.history,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { message: 'No response generated' };
      }

      return this.parseChatResponse(JSON.parse(content));
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Stream chat responses
   */
  async *streamChat(
    message: string,
    context: Context
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI provider not available');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const stream = await this.client!.chat.completions.create({
        model: AI_CONFIG.providers.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...context.history,
          {
            role: 'user',
            content: message
          }
        ],
        stream: true,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Error in stream chat:', error);
      throw error;
    }
  }

  /**
   * Build insight generation prompt
   */
  private buildInsightPrompt(graphData: GraphData): string {
    return `Analyze the following UK zero emission aviation ecosystem data and identify key insights:

Stakeholders: ${graphData.stakeholders.length}
Technologies: ${graphData.technologies.length}
Funding Events: ${graphData.fundingEvents.length}
Projects: ${graphData.projects.length}
Relationships: ${graphData.relationships.length}

Identify:
1. Funding gaps (technologies with low funding relative to TRL)
2. Opportunities (underutilized relationships, potential collaborations)
3. Risks (technologies at risk of stagnation)
4. Trends (funding patterns, technology progression)

Return JSON with array of insights, each with: id, type, title, description, entities (array of IDs), confidence (0-1), actionable (boolean).`;
  }

  /**
   * Build system prompt for chat
   */
  private buildSystemPrompt(context: Context): string {
    return `You are an AI assistant for the NAVIGATE platform, analyzing the UK zero emission aviation ecosystem.

Current context:
- View: ${context.currentView}
- Selected entities: ${context.selectedEntities.length}
- Active filters: ${JSON.stringify(context.filters)}

You can:
- Answer questions about stakeholders, technologies, funding, and projects
- Suggest filters to explore specific aspects
- Highlight entities in the visualization
- Generate insights about the data

Always respond in JSON format with: message (string), actions (optional object with highlight, filter, switchView), insights (optional array).`;
  }

  /**
   * Parse insights from AI response
   */
  private parseInsights(data: any): Insight[] {
    if (!data.insights || !Array.isArray(data.insights)) {
      return [];
    }

    return data.insights.map((insight: any, index: number) => ({
      id: insight.id || `insight-${index}`,
      type: insight.type || 'trend',
      title: insight.title || 'Untitled Insight',
      description: insight.description || '',
      entities: insight.entities || [],
      confidence: insight.confidence || 0.5,
      actionable: insight.actionable || false,
    }));
  }

  /**
   * Parse chat response from AI
   */
  private parseChatResponse(data: any): ChatResponse {
    return {
      message: data.message || 'No response',
      actions: data.actions,
      insights: data.insights ? this.parseInsights({ insights: data.insights }) : undefined,
    };
  }
}


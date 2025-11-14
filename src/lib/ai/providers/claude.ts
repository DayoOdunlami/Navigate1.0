/**
 * Claude Provider Implementation
 * 
 * Alternative AI provider using Anthropic's Claude Sonnet 4.
 */

import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG, getProviderConfig } from '../config';
import type { Insight, ChatMessage, ChatResponse, GraphData, Context } from './openai';

export class ClaudeProvider {
  private client: Anthropic | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const config = getProviderConfig('claude');
    if (!config.enabled || !config.apiKey) {
      console.warn('Claude provider not configured. API key missing.');
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: config.apiKey,
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Claude client:', error);
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
      throw new Error('Claude provider not available');
    }

    const prompt = this.buildInsightPrompt(graphData);

    try {
      const response = await this.client!.messages.create({
        model: AI_CONFIG.providers.claude.model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return [];
      }

      return this.parseInsights(JSON.parse(content.text));
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
      throw new Error('Claude provider not available');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const response = await this.client!.messages.create({
        model: AI_CONFIG.providers.claude.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          ...this.convertMessages(context.history),
          {
            role: 'user',
            content: message
          }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return { message: 'No response generated' };
      }

      return this.parseChatResponse(JSON.parse(content.text));
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
      throw new Error('Claude provider not available');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const stream = await this.client!.messages.stream({
        model: AI_CONFIG.providers.claude.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          ...this.convertMessages(context.history),
          {
            role: 'user',
            content: message
          }
        ],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Error in stream chat:', error);
      throw error;
    }
  }

  /**
   * Convert chat messages to Claude format
   */
  private convertMessages(messages: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
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


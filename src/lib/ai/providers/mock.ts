/**
 * Mock Provider Implementation
 * 
 * Fallback provider for testing and when AI features are disabled.
 * Returns rule-based insights and simple responses.
 */

import type { Insight, ChatMessage, ChatResponse, GraphData, Context } from './openai';

export class MockProvider {
  /**
   * Check if provider is available (always true for mock)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Generate rule-based insights
   */
  async generateInsights(graphData: GraphData): Promise<Insight[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    const insights: Insight[] = [];

    // Rule 1: Check for low funding relative to TRL
    const lowFundedTechs = graphData.technologies.filter((tech: any) => {
      const funding = tech.funding_by_type?.total || 0;
      const trl = tech.trl_current || 0;
      return trl >= 6 && funding < 5000000; // TRL 6+ with < £5M
    });

    if (lowFundedTechs.length > 0) {
      insights.push({
        id: 'gap-1',
        type: 'gap',
        title: 'Funding Gap: High TRL Technologies',
        description: `${lowFundedTechs.length} technologies at TRL 6+ have less than £5M in funding. These may need additional support to reach commercialization.`,
        entities: lowFundedTechs.map((t: any) => t.id),
        confidence: 0.8,
        actionable: true,
      });
    }

    // Rule 2: Check for isolated stakeholders
    const isolatedStakeholders = graphData.stakeholders.filter((stakeholder: any) => {
      const relationships = graphData.relationships.filter(
        (r: any) => r.source_id === stakeholder.id || r.target_id === stakeholder.id
      );
      return relationships.length < 2;
    });

    if (isolatedStakeholders.length > 0) {
      insights.push({
        id: 'opportunity-1',
        type: 'opportunity',
        title: 'Collaboration Opportunity',
        description: `${isolatedStakeholders.length} stakeholders have few connections. Consider exploring potential collaborations.`,
        entities: isolatedStakeholders.map((s: any) => s.id),
        confidence: 0.6,
        actionable: true,
      });
    }

    // Rule 3: Check for recent funding trends
    const recentFunding = graphData.fundingEvents.filter((event: any) => {
      const date = new Date(event.date);
      const now = new Date();
      const monthsAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo < 6;
    });

    if (recentFunding.length > 0) {
      insights.push({
        id: 'trend-1',
        type: 'trend',
        title: 'Recent Funding Activity',
        description: `${recentFunding.length} funding events in the last 6 months. The ecosystem is actively being funded.`,
        entities: recentFunding.map((f: any) => f.id),
        confidence: 0.9,
        actionable: false,
      });
    }

    return insights;
  }

  /**
   * Simple chat responses
   */
  async chat(message: string, context: Context): Promise<ChatResponse> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 200));

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('funding') || lowerMessage.includes('fund')) {
      return {
        message: 'I can help you explore funding data. Try applying filters for specific funding types or time periods.',
        actions: {
          filter: { type: 'funding' },
        },
      };
    }

    if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
      return {
        message: 'I can help you explore technologies. Try filtering by TRL level or technology category.',
        actions: {
          switchView: 'technology',
        },
      };
    }

    if (lowerMessage.includes('stakeholder') || lowerMessage.includes('organization')) {
      return {
        message: 'I can help you explore stakeholders. Try viewing the network graph to see relationships.',
        actions: {
          switchView: 'network',
        },
      };
    }

    return {
      message: 'I\'m a mock AI assistant. In production, I would use OpenAI or Claude to provide detailed analysis. Try asking about funding, technologies, or stakeholders.',
    };
  }

  /**
   * Stream chat (mock - returns immediately)
   */
  async *streamChat(
    message: string,
    context: Context
  ): AsyncGenerator<string, void, unknown> {
    const response = await this.chat(message, context);
    
    // Simulate streaming by yielding words one at a time
    const words = response.message.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}


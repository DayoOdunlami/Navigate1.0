// ============================================================================
// API ROUTE: /api/atlas/extract
// ============================================================================
// Copy to: src/app/api/atlas/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractChallenge } from '@/lib/atlas/extractor';
import { needsHumanReview } from '@/lib/atlas/validator';
import { getAIClient, getAvailableProviders, AVAILABLE_MODELS } from '@/lib/atlas/ai-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      url, 
      provider = 'openai',  // Default to OpenAI
      model,
      skipEnrichment = false 
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Track stage costs for response
    const stageCosts: { stage: string; duration: number; cost: number }[] = [];

    // Extract challenge
    const result = await extractChallenge(url, {
      provider,
      model,
      firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
      skipEnrichment,
      onStageComplete: (stage, duration, cost) => {
        stageCosts.push({ stage, duration, cost });
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const challenge = result.challenge!;
    const review = needsHumanReview(challenge);

    return NextResponse.json({
      challenge,
      review,
      duration: result.duration,
      cost: {
        total: result.totalCost,
        stages: stageCosts,
        provider,
        model: model || (provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514'),
      },
    });
  } catch (error) {
    console.error('Atlas extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Return available providers and models
export async function GET() {
  const providers = getAvailableProviders();
  
  return NextResponse.json({
    providers,
    models: AVAILABLE_MODELS,
    default: {
      provider: 'openai',
      model: 'gpt-4o',
    },
  });
}


// ============================================================================
// API ROUTE: /api/atlas/costs
// ============================================================================
// Copy to: src/app/api/atlas/costs/route.ts

/*
import { NextResponse } from 'next/server';
import { getAIClient } from '@/lib/atlas/ai-provider';

export async function GET() {
  const client = getAIClient();
  
  return NextResponse.json({
    summary: client.getCostSummary(),
    history: client.getCostHistory(),
    byOperation: client.getCostByOperation(),
    today: client.getTodayCost(),
    thisMonth: client.getThisMonthCost(),
  });
}

export async function DELETE() {
  const client = getAIClient();
  client.resetCostTracking();
  
  return NextResponse.json({ success: true, message: 'Cost tracking reset' });
}
*/

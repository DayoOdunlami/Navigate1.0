// ============================================================================
// API ROUTE: /api/atlas/extract
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { extractChallenge } from '@/lib/atlas/extractor';
import { needsHumanReview } from '@/lib/atlas/validator';
import { getAIClient, getAvailableProviders, AVAILABLE_MODELS, type AIProvider } from '@/lib/atlas/ai-provider';

export async function POST(req: NextRequest) {
  let body: { url?: string; provider?: string; model?: string; skipEnrichment?: boolean } | null = null;
  try {
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }
    
    const { 
      url, 
      provider: providerInput = 'openai',  // Default to OpenAI
      model,
      skipEnrichment = false 
    } = body;
    
    // Validate and cast provider
    const provider: AIProvider = (providerInput === 'openai' || providerInput === 'anthropic') 
      ? providerInput 
      : 'openai';

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
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    const errorStack = error instanceof Error 
      ? error.stack 
      : undefined;
    
    // Log full error for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: errorStack,
      url: body?.url || 'unknown',
    });
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
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


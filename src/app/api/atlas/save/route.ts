// ============================================================================
// API ROUTE: /api/atlas/save
// Saves an Atlas-extracted challenge to the knowledge base
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import type { ExtractedChallenge } from '@/lib/atlas/types';
import { adaptAtlasChallengeToChallenge } from '@/lib/atlas/adapter';
import { saveChallenge } from '@/lib/atlas/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge }: { challenge: ExtractedChallenge } = body;

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge is required' },
        { status: 400 }
      );
    }

    // Convert Atlas challenge to existing Challenge format
    const adaptedChallenge = adaptAtlasChallengeToChallenge(challenge);

    // Save to Atlas challenges store (original Atlas format)
    await saveChallenge(challenge);
    
    // Invalidate unified data cache so new challenge appears in unified system
    const { invalidateAtlasCache } = await import('@/data/unified');
    invalidateAtlasCache();
    
    return NextResponse.json({
      success: true,
      message: 'Challenge saved to knowledge base and added to unified data',
      challenge: adaptedChallenge,
      atlasChallenge: challenge,
      note: 'This challenge is now available in unified visualizations',
    });
  } catch (error) {
    console.error('Atlas save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


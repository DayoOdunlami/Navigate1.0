// ============================================================================
// API ROUTE: /api/atlas/challenges
// ============================================================================

import { NextResponse } from 'next/server';
import { getChallenges } from '@/lib/atlas/store';

export async function GET() {
  try {
    const challenges = await getChallenges();
    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Failed to get challenges:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


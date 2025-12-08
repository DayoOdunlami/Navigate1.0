// ============================================================================
// API ROUTE: /api/atlas/history
// ============================================================================

import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/atlas/store';

export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to get history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


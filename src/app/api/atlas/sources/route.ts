// ============================================================================
// API ROUTE: /api/atlas/sources
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource, updateSource, deleteSource } from '@/lib/atlas/store';

export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Failed to get sources:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source = await addSource(body);
    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Failed to add source:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


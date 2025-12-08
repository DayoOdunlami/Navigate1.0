// ============================================================================
// API ROUTE: /api/atlas/sources/[id]
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSources, updateSource, deleteSource } from '@/lib/atlas/store';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const source = await updateSource(params.id, body);
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }
    return NextResponse.json(source);
  } catch (error) {
    console.error('Failed to update source:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteSource(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete source:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


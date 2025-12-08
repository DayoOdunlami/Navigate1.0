// ============================================================================
// API ROUTE: /api/atlas/sources/[id]
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSources, updateSource, deleteSource } from '@/lib/atlas/store';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const source = await updateSource(id, body);
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteSource(id);
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


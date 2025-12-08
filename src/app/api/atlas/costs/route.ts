// ============================================================================
// API ROUTE: /api/atlas/costs
// ============================================================================

import { NextResponse } from 'next/server';
import { getAIClient } from '@/lib/atlas/ai-provider';

export async function GET() {
  const client = getAIClient();
  
  return NextResponse.json({
    summary: client.getCostSummary(),
    history: client.getCostHistory().map(e => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
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


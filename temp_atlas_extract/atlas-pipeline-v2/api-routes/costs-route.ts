// ============================================================================
// API ROUTE: /api/atlas/costs
// ============================================================================
// Copy to: src/app/api/atlas/costs/route.ts

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

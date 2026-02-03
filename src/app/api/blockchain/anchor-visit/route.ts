import { NextResponse } from 'next/server';
import { runVisitAnchoringJob } from '@/lib/blockchain/anchorService';

export async function POST() {
  try {
    const result = await runVisitAnchoringJob();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Anchoring job failed:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Anchoring job failed',
      },
      { status: 500 }
    );
  }
}

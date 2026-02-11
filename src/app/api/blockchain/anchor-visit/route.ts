import { NextResponse } from 'next/server';
import { runVisitAnchoringJob } from '@/lib/blockchain/anchorService';

export async function POST(req: Request) {

  const isCron = req.headers.get("x-vercel-cron") === "1";

  console.log("Blockchain cron endpoint hit",new Date().toISOString());

  if (!isCron) {
    console.log("Blocked non-cron request");
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const result = await runVisitAnchoringJob();

    console.log("Blockchain cron completed successfully");

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

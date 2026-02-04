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

/*******COde that will be used for automation--------------------------------- */

// import { NextResponse } from 'next/server';
// import { runVisitAnchoringJob } from '@/lib/blockchain/anchorService';

// export async function POST(req: Request) {
//   try {
//     const cronSecret = req.headers.get('x-cron-secret');

//     if (cronSecret !== process.env.CRON_SECRET) {
//       return NextResponse.json(
//         { error: 'Unauthorized cron request' },
//         { status: 401 }
//       );
//     }

//     const result = await runVisitAnchoringJob();

//     return NextResponse.json({
//       success: true,
//       ...result,
//     });
//   } catch (err: any) {
//     console.error('Anchoring job failed:', err);

//     return NextResponse.json(
//       {
//         success: false,
//         error: err.message || 'Anchoring job failed',
//       },
//       { status: 500 }
//     );
//   }
// }

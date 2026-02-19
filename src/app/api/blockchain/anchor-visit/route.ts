// import { NextResponse } from 'next/server';
// import { runVisitAnchoringJob } from '@/lib/blockchain/anchorService';

// export async function POST(req: Request) {

//   const isCron = req.headers.get("x-vercel-cron") === "1";

//   console.log("Blockchain cron endpoint hit",new Date().toISOString());

//   if (!isCron) {
//     console.log("Blocked non-cron request");
//     return new Response("Forbidden", { status: 403 });
//   }

//   try {
//     const result = await runVisitAnchoringJob();

//     console.log("Blockchain cron completed successfully");

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

/***********************************************************************************/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runVisitAnchoringJob } from '@/lib/blockchain/anchorService';

export async function POST(req: Request) {

  const isCron = req.headers.get("x-vercel-cron") === "1";

  // Create server-side Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // IMPORTANT
  );

  if (!isCron) {
    // If not cron, check Authorization header (sent from frontend)
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (!userRow || userRow.role !== "regulator") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  try {
    const result = await runVisitAnchoringJob();

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Anchoring job failed",
      },
      { status: 500 }
    );
  }
}

// import { NextResponse } from 'next/server';
// import { getAnchoredRoot } from '@/lib/blockchain/contract';
// import { ethers } from 'ethers';

// export async function POST(req: Request) {
//   try {
//     const { trialId, periodStart } = await req.json();

//     if (!trialId || !periodStart) {
//       return NextResponse.json(
//         { error: 'trialId and periodStart are required' },
//         { status: 400 }
//       );
//     }

//     /* ----------------------------------
//        1️⃣ Compute day index (same as anchor job)
//     ---------------------------------- */

//     const dayIndex = Math.floor(
//       new Date(periodStart).getTime() / 86400000
//     );

//     /* ----------------------------------
//        2️⃣ Convert trialId → bytes32
//        (must match anchor job)
//     ---------------------------------- */

//     const trialIdBytes32 = ethers.keccak256(
//       ethers.toUtf8Bytes(trialId)
//     );

//     /* ----------------------------------
//        3️⃣ Read root from blockchain
//     ---------------------------------- */

//     const onChainRoot = await getAnchoredRoot(
//       trialIdBytes32,
//       dayIndex
//     );

//     return NextResponse.json({
//       onChainRoot,
//       dayIndex,
//     });

//   } catch (err: any) {
//     console.error('verify-anchor failed:', err);

//     return NextResponse.json(
//       { error: err.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { buildMerkleTree } from '@/lib/blockchain/merkle';
import { getAnchoredRoot } from '@/lib/blockchain/contract';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { anchorId } = await req.json();

    if (!anchorId) {
      return NextResponse.json(
        { error: 'anchorId is required' },
        { status: 400 }
      );
    }

    /* ----------------------------------
       1️⃣ Load anchor record
    ---------------------------------- */

    const { data: anchor, error: anchorErr } = await supabase
      .from('merkle_anchors')
      .select('trial_id, period_start, merkle_root')
      .eq('id', anchorId)
      .single();

    if (anchorErr || !anchor) {
      return NextResponse.json(
        { error: 'Anchor record not found' },
        { status: 404 }
      );
    }

    /* ----------------------------------
       2️⃣ Fetch visit hashes for anchor
    ---------------------------------- */

    const { data: visitHashes, error: visitErr } = await supabase
      .from('visit_hashes')
      .select('hash, visit_id')
      .eq('anchor_id', anchorId)
      .order('visit_id');

    if (visitErr || !visitHashes || visitHashes.length === 0) {
      return NextResponse.json(
        { error: 'No visit hashes found for anchor' },
        { status: 404 }
      );
    }

    /* ----------------------------------
       3️⃣ Rebuild Merkle root (authoritative)
    ---------------------------------- */

    const leafHashes = visitHashes.map(v => v.hash);
    const { root: recomputedRoot } = buildMerkleTree(leafHashes);

    /* ----------------------------------
       4️⃣ Fetch on-chain root
    ---------------------------------- */

    const dayIndex = Math.floor(
      new Date(anchor.period_start).getTime() / 86400000
    );

    const trialIdHash = ethers.keccak256(
      ethers.toUtf8Bytes(anchor.trial_id)
    );

    const onChainRoot = await getAnchoredRoot(
      trialIdHash,
      dayIndex
    );

    /* ----------------------------------
       5️⃣ Return full verification payload
    ---------------------------------- */

    return NextResponse.json({
      dbRoot: anchor.merkle_root,
      recomputedRoot,
      onChainRoot,
      match: recomputedRoot === onChainRoot==anchor.merkle_root,
      dayIndex,
    });

  } catch (err: any) {
    console.error('verify-anchor failed:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}


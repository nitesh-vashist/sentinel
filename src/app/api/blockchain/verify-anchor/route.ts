import { NextResponse } from 'next/server';
import { getAnchoredRoot } from '@/lib/blockchain/contract';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { trialId, periodStart } = await req.json();

    if (!trialId || !periodStart) {
      return NextResponse.json(
        { error: 'trialId and periodStart are required' },
        { status: 400 }
      );
    }

    /* ----------------------------------
       1️⃣ Compute day index (same as anchor job)
    ---------------------------------- */

    const dayIndex = Math.floor(
      new Date(periodStart).getTime() / 86400000
    );

    /* ----------------------------------
       2️⃣ Convert trialId → bytes32
       (must match anchor job)
    ---------------------------------- */

    const trialIdBytes32 = ethers.keccak256(
      ethers.toUtf8Bytes(trialId)
    );

    /* ----------------------------------
       3️⃣ Read root from blockchain
    ---------------------------------- */

    const onChainRoot = await getAnchoredRoot(
      trialIdBytes32,
      dayIndex
    );

    return NextResponse.json({
      onChainRoot,
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

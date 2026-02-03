import { supabase } from '@/lib/supabaseClient';
import { buildMerkleTree } from './merkle';
import { anchorMerkleRoot } from './contract';
import { ethers } from 'ethers';

/* ----------------------------------
   Config
---------------------------------- */

const ANCHOR_WINDOW_HOURS = 24;

/* ----------------------------------
   Types
---------------------------------- */

/**
 * Actual shape returned by Supabase at runtime
 * for visit_hashes joined with visits
 */
type VisitHashWithTrial = {
  id: string;
  visit_id: string;
  hash: string;
  created_at: string;
  visits: {
    trial_id: string;
  };
};

type VisitHashRow = {
  id: string;
  visit_id: string;
  trial_id: string;
  hash: string;
  created_at: string;
};

/* ----------------------------------
   Helpers
---------------------------------- */

function getTimeWindow() {
  const end = new Date();
  const start = new Date(
    end.getTime() - ANCHOR_WINDOW_HOURS * 60 * 60 * 1000
  );

  return { start, end };
}

/* ----------------------------------
   Main Anchoring Job
---------------------------------- */

export async function runVisitAnchoringJob() {
  const { start, end } = getTimeWindow();

  /* -----------------------------
     1️⃣ Fetch unanchored visit hashes
  ----------------------------- */

  const { data, error } = (await supabase
    .from('visit_hashes')
    .select(`
      id,
      visit_id,
      hash,
      created_at,
      visits!inner (
        trial_id
      )
    `)
    .is('anchor_id', null)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())) as {
      data: VisitHashWithTrial[] | null;
      error: any;
    };

  if (error) {
    throw new Error(`Failed to fetch visit hashes: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      anchoredTrials: 0,
      anchoredVisits: 0,
      message: 'No new visit hashes to anchor',
    };
  }

  /* -----------------------------
     2️⃣ Group hashes by trial
  ----------------------------- */

  const byTrial = new Map<string, VisitHashRow[]>();

  for (const row of data) {
    const trialId = row.visits.trial_id;

    if (!byTrial.has(trialId)) {
      byTrial.set(trialId, []);
    }

    byTrial.get(trialId)!.push({
      id: row.id,
      visit_id: row.visit_id,
      trial_id: trialId,
      hash: row.hash,
      created_at: row.created_at,
    });
  }

  /* -----------------------------
     3️⃣ Process each trial
  ----------------------------- */

  for (const [trialId, hashes] of byTrial.entries()) {
    /* ---- build merkle tree ---- */
    const leafHashes = hashes.map(h => h.hash);
    const { root } = buildMerkleTree(leafHashes);

    /* ---- store anchor record ---- */
    const { data: anchorRow, error: anchorErr } = await supabase
      .from('merkle_anchors')
      .insert({
        trial_id: trialId,
        merkle_root: root,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
      })
      .select()
      .single();

    if (anchorErr || !anchorRow) {
      throw new Error('Failed to create merkle anchor record');
    }

    /* ---- anchor on blockchain ---- */
    const dayIndex = Math.floor(
      new Date(anchorRow.period_start).getTime() / 86_400_000
    );

    // const { txHash } = await anchorMerkleRoot(
    //   ethers.encodeBytes32String(trialId),
    //   dayIndex,
    //   root
    // );/

    const trialIdHash = ethers.keccak256(
      ethers.toUtf8Bytes(trialId)
    );

    const { txHash } = await anchorMerkleRoot(
      trialIdHash,
      dayIndex,
      root
    );

    /* ---- update anchor with tx ---- */
    await supabase
      .from('merkle_anchors')
      .update({
        tx_hash: txHash,
        anchored_at: new Date().toISOString(),
      })
      .eq('id', anchorRow.id);

    /* ---- link visit hashes ---- */
    const visitHashIds = hashes.map(h => h.id);

    await supabase
      .from('visit_hashes')
      .update({ anchor_id: anchorRow.id })
      .in('id', visitHashIds);
  }

  return {
    anchoredTrials: byTrial.size,
    anchoredVisits: data.length,
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

/* ---------------- TYPES ---------------- */

type Visit = {
  id: string;
  visit_number: number;
  visit_date: string;
  status: 'submitted' | 'locked';
};

type VisitValue = {
  id: string;
  crf_field_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  trial_crf_fields: {
    field_label: string;
    field_type: string;
    unit: string | null;
  };
};

export default function RegulatorVisitPage() {
  const { trialId, visitId } = useParams() as {
    trialId: string;
    visitId: string;
  };

  const [visit, setVisit] = useState<Visit | null>(null);
  const [values, setValues] = useState<VisitValue[]>([]);
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [integrity, setIntegrity] = useState<
    'verified' | 'tampered' | null
  >(null);

const [chainStatus, setChainStatus] = useState<
  'verified' | 'tampered' | null
>(null);

const [verifyingChain, setVerifyingChain] = useState(false);
const [chainError, setChainError] = useState<string | null>(null);

const [dbMerkleRoot, setDbMerkleRoot] = useState<string | null>(null);
const [chainMerkleRoot, setChainMerkleRoot] = useState<string | null>(null);
const[recomputedMerkleRoot, setRecomputedMerkleRoot] = useState<string | null>(null);
const [chainDayIndex, setChainDayIndex] = useState<number | null>(null);

  /* ---------------- HASHING (DO NOT CHANGE) ---------------- */

  const generateVisitHash = (
    visitId: string,
    values: {
      crf_field_id: string;
      value_text: string | null;
      value_number: number | null;
      value_boolean: boolean | null;
    }[],
    previousHash: string | null
  ) => {
    const snapshot = {
      previous_hash: previousHash,
      visit_id: visitId,
      values: values
        .map(v => ({
          crf_field_id: v.crf_field_id,
          value_text: v.value_text,
          value_number: v.value_number,
          value_boolean: v.value_boolean,
        }))
        .sort((a, b) =>
          a.crf_field_id.localeCompare(b.crf_field_id)
        ),
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(snapshot))
      .digest('hex');
  };

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ Visit
      const { data: visitData } = await supabase
        .from('visits')
        .select('*')
        .eq('id', visitId)
        .single();

      // 2️⃣ Values + labels
      const { data: valuesData } = await supabase
        .from('visit_values')
        .select(`
          id,
          crf_field_id,
          value_text,
          value_number,
          value_boolean,
          trial_crf_fields!inner (
            field_label,
            field_type,
            unit
          )
        `)
        .eq('visit_id', visitId);
        const typedValues = (valuesData ?? []) as unknown as VisitValue[];

      // 3️⃣ Stored hash
      const { data: hashRow } = await supabase
        .from('visit_hashes')
        .select('hash, previous_hash')
        .eq('visit_id', visitId)
        .single();

      if (!visitData || !valuesData) return;

      setVisit(visitData);
      setValues(typedValues);
      setStoredHash(hashRow?.hash ?? null);

      // 4️⃣ Recompute hash (same input as hospital side)
      const recomputed = generateVisitHash(
        visitId,
        typedValues.map(v => ({
          crf_field_id: v.crf_field_id,
          value_text: v.value_text,
          value_number: v.value_number,
          value_boolean: v.value_boolean,
        })),
        hashRow?.previous_hash ?? null
      );

      setComputedHash(recomputed);

      if (hashRow?.hash) {
        setIntegrity(
          hashRow.hash === recomputed ? 'verified' : 'tampered'
        );
      }
    };

    load();
  }, [visitId]);

  if (!visit) {
    return <p className="p-10 text-gray-600">Loading visit…</p>;
  }

  const verifyOnBlockchain = async () => {
  try {
    setVerifyingChain(true);
    setChainError(null);
    setChainStatus(null);

    // 1️⃣ get anchor_id for this visit
    const { data: visitHashRow } = await supabase
      .from('visit_hashes')
      .select('anchor_id')
      .eq('visit_id', visitId)
      .single();

    if (!visitHashRow?.anchor_id) {
      setChainError('Visit not yet anchored on blockchain');
      return;
    }

    // 2️⃣ fetch anchor details
    const { data: anchor } = await supabase
      .from('merkle_anchors')
      .select('merkle_root, period_start')
      .eq('id', visitHashRow.anchor_id)
      .single();

    if (!anchor) {
      setChainError('Anchor record not found');
      return;
    }

    // 3️⃣ call backend API to fetch on-chain root
    const res = await fetch('/api/blockchain/verify-anchor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // trialId,
        // periodStart: anchor.period_start,
        anchorId: visitHashRow.anchor_id,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setChainError(result.error || 'Blockchain verification failed');
      return;
    }

    // 4️⃣ compare roots
    setDbMerkleRoot(anchor.merkle_root);
    setChainMerkleRoot(result.onChainRoot);
    setRecomputedMerkleRoot(result.recomputedRoot);
    setChainDayIndex(result.dayIndex);
    if (result.recomputedRoot === result.onChainRoot && result.onChainRoot === anchor.merkle_root) {
      setChainStatus('verified');
    } else {
      setChainStatus('tampered');
    }

  } catch (err) {
    console.error(err);
    setChainError('Unexpected verification error');
  } finally {
    setVerifyingChain(false);
  }
};


  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-gray-900">
          Visit #{visit.visit_number}
        </h1>

        {/* Integrity */}
        {integrity && (
          <div
            className={`border rounded-xl p-6 ${
              integrity === 'verified'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="font-medium mb-2 text-gray-900">
              Integrity Status:{' '}
              <span className="uppercase">{integrity}</span>
            </div>

            <div className="text-xs break-all text-gray-700">
              <div><b>Stored:</b> {storedHash}</div>
              <div><b>Computed:</b> {computedHash}</div>
            </div>
          </div>
        )}

        {/* Blockchain Verification */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900">
            Blockchain Verification
          </h3>

          <button
            onClick={verifyOnBlockchain}
            disabled={verifyingChain}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md
               disabled:opacity-60"
          >
            {verifyingChain ? 'Verifying…' : 'Verify on Blockchain'}
          </button>

          {chainStatus && (
            <div
              className={`mt-4 border rounded-lg p-4 text-sm break-all ${chainStatus === 'verified'
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-red-50 border-red-300 text-red-800'
                }`}
            >
              <div className="font-medium mb-2">
                Blockchain Status: {chainStatus.toUpperCase()}
              </div>

              {dbMerkleRoot && (
                <div>
                  <b>DB Merkle Root:</b> {dbMerkleRoot}
                </div>
              )}

              {chainMerkleRoot && (
                <div className="mt-1">
                  <b>On-chain Merkle Root:</b> {chainMerkleRoot}
                </div>
              )}

              {recomputedMerkleRoot && (
                <div className="mt-1">
                  <b>Recomputed Merkle Root:</b> {recomputedMerkleRoot}
                </div>
              )}

              {chainDayIndex !== null && (
                <div className="mt-1 text-xs opacity-80">
                  Day Index: {chainDayIndex}
                </div>
              )}
            </div>
          )}

          {chainError && (
            <div className="mt-4 text-sm text-red-600">
              {chainError}
            </div>
          )}
        </section>

        {/* Values */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900">
            Visit Values
          </h3>

          <div className="space-y-3">
            {values.map(v => {
              const displayValue =
                v.value_text ??
                v.value_number ??
                (v.value_boolean !== null
                  ? v.value_boolean.toString()
                  : '—');

              return (
                <div
                  key={v.id}
                  className="border rounded-md px-4 py-3"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {v.trial_crf_fields.field_label}
                  </div>

                  <div className="text-sm text-gray-700 mt-1">
                    {displayValue}
                    {v.trial_crf_fields.unit
                      ? ` ${v.trial_crf_fields.unit}`
                      : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

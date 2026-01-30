'use client';
// this file is for creating a new visit for a patient in a trial by a hospital user
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

type CRFField = {
  id: string;
  field_key: string;
  field_label: string;
  field_type: 'text' | 'number' | 'boolean' | 'enum';
  field_category: 'A' | 'B' | 'C';
  unit?: string | null;
  allowed_values?: string[] | null;
};

export default function NewVisitPage() {
  const { trialId, patientId } = useParams() as {
    trialId: string;
    patientId: string;
  };

  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [fields, setFields] = useState<CRFField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trialStatus, setTrialStatus] = useState<'draft' | 'active' | 'ended' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- LOAD & AUTHORIZE ---------------- */

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('hospital_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.hospital_id) {
        router.push('/hospital');
        return;
      }

      setHospitalId(userRow.hospital_id);

      // check trial acceptance
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', userRow.hospital_id)
        .single();

      if (!th || th.status !== 'accepted') {
        router.push('/hospital');
        return;
      }

      // fetch CRF fields (A + B + C)
      const { data: crf } = await supabase
        .from('trial_crf_fields')
        .select('*')
        .eq('trial_id', trialId)
        .order('field_category');

      setFields(crf || []);
      setLoading(false);

      const { data: trial } = await supabase
        .from('trials')
        .select('status')
        .eq('id', trialId)
        .single();

      setTrialStatus(trial?.status ?? null);
    };

    load();
  }, [trialId, router]);

  /* ---------------- FORM HANDLING ---------------- */

  const updateValue = (key: string, value: any) => {
    setFormValues(prev => {
      const next = { ...prev, [key]: value };

      // conditional logic for adverse events
      if (key === 'adverse_event' && value === false) {
        next.adverse_event_severity = null;
        next.adverse_event_description = null;
      }

      return next;
    });
  };

  /* ---------------- HASHING ---------------- */

  const generateVisitHash = (
  visitId: string,
  values: any[],
  previousHash: string | null
): string => {
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

  /* ---------------- SUBMIT VISIT ---------------- */

  const submitVisit = async () => {
  try {
    setSubmitting(true);
    setError(null);

    if (!hospitalId) return;

    // 🔒 BACKEND GUARD
    const { data: trial } = await supabase
      .from('trials')
      .select('status')
      .eq('id', trialId)
      .single();

    if (!trial || trial.status !== 'active') {
      setError('Trial has ended. New visits cannot be submitted.');
      return;
    }

    // 1️⃣ determine visit number
    const { data: lastVisit } = await supabase
      .from('visits')
      .select('id, visit_number')
      .eq('patient_id', patientId)
      .order('visit_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const visitNumber = lastVisit ? lastVisit.visit_number + 1 : 1;

    // 2️⃣ fetch previous hash (if any)
    let previousHash: string | null = null;

    if (lastVisit) {
      const { data: lastHash } = await supabase
        .from('visit_hashes')
        .select('hash')
        .eq('visit_id', lastVisit.id)
        .maybeSingle();

      previousHash = lastHash?.hash ?? null;
    }

    // 3️⃣ create visit (submitted)
    const { data: visit, error: visitErr } = await supabase
      .from('visits')
      .insert({
        patient_id: patientId,
        trial_id: trialId,
        hospital_id: hospitalId,
        visit_number: visitNumber,
        visit_date: new Date().toISOString(),
        status: 'submitted',
      })
      .select()
      .single();

    if (visitErr || !visit) throw visitErr;

    // 4️⃣ insert visit values
    const valuesToInsert = fields.map(f => ({
      visit_id: visit.id,
      crf_field_id: f.id,
      value_text:
        f.field_type === 'text' || f.field_type === 'enum'
          ? formValues[f.field_key] ?? null
          : null,
      value_number:
        f.field_type === 'number'
          ? formValues[f.field_key] ?? null
          : null,
      value_boolean:
        f.field_type === 'boolean'
          ? formValues[f.field_key] ?? null
          : null,
    }));

    const { error: valuesErr } = await supabase
      .from('visit_values')
      .insert(valuesToInsert);

    if (valuesErr) throw valuesErr;

    // 5️⃣ generate chained hash
    const hash = generateVisitHash(
      visit.id,
      valuesToInsert,
      previousHash
    );

    // 6️⃣ store hash
    const { error: hashErr } = await supabase
      .from('visit_hashes')
      .insert({
        visit_id: visit.id,
        hash,
        previous_hash: previousHash,
      });

    if (hashErr) throw hashErr;

    // 7️⃣ lock visit
    await supabase
      .from('visits')
      .update({ status: 'locked' })
      .eq('id', visit.id);

    // 8️⃣ redirect back
    router.push(
      `/hospital/trials/${trialId}/patients/${patientId}`
    );
  } catch (e) {
    console.error(e);
    setError('Failed to submit visit. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <p className="p-10 text-gray-600">Loading visit form…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-xl font-semibold text-gray-900">
          Add New Visit
        </h1>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          {fields.map(f => {
            // conditional adverse event fields
            if (
              (f.field_key === 'adverse_event_severity' ||
                f.field_key === 'adverse_event_description') &&
              formValues['adverse_event'] !== true
            ) {
              return null;
            }

            return (
              <div key={f.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.field_label}
                  {f.unit && ` (${f.unit})`}
                </label>

                {f.field_type === 'text' && (
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={e =>
                      updateValue(f.field_key, e.target.value)
                    }
                  />
                )}

                {f.field_type === 'number' && (
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={e =>
                      updateValue(
                        f.field_key,
                        Number(e.target.value)
                      )
                    }
                  />
                )}

                {f.field_type === 'boolean' && (
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={e =>
                      updateValue(
                        f.field_key,
                        e.target.value === 'true'
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}

                {f.field_type === 'enum' && (
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={e =>
                      updateValue(f.field_key, e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {f.allowed_values?.map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={submitVisit}
          disabled={submitting || trialStatus !== 'active'}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium
                     disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Visit'}
        </button>
        {trialStatus === 'ended' && (
          <p className="text-sm text-red-600 mt-2">
            This trial has ended. New visits cannot be submitted.
          </p>
        )}
      </div>
    </main>
  );
}

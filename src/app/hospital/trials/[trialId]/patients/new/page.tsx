'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPatientPage() {
  const { trialId } = useParams() as { trialId: string };
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- LOAD & AUTHORIZE ---------------- */

  useEffect(() => {
    const init = async () => {
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

      // ensure hospital accepted this trial
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

      setHospitalId(userRow.hospital_id);
    };

    init();
  }, [trialId, router]);

  /* ---------------- REGISTER PATIENT ---------------- */

  const registerPatient = async () => {
    if (!subjectCode.trim() || !hospitalId) return;

    try {
      setSubmitting(true);
      setError(null);

      const { error } = await supabase.from('patients').insert({
        trial_id: trialId,
        hospital_id: hospitalId,
        subject_code: subjectCode.trim(),
      });

      if (error) throw error;

      setSuccess(true);

      // auto-close modal after short delay
      setTimeout(() => {
        router.push(`/hospital/trials/${trialId}`);
      }, 1200);

    } catch (err: any) {
      if (err.code === '23505') {
        setError('Subject code already exists for this trial.');
      } else {
        setError('Failed to register patient. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-5">

        <h1 className="text-lg font-semibold text-gray-900">
          Register New Patient
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject Code
          </label>
          <input
            value={subjectCode}
            onChange={e => setSubjectCode(e.target.value)}
            placeholder="e.g. SUBJ-001"
            className="w-full rounded-md border px-3 py-2 text-sm
                       text-gray-900 caret-blue-600
                       placeholder:text-gray-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            ✅ Patient registered successfully. Redirecting…
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => router.push(`/hospital/trials/${trialId}`)}
            className="px-4 py-2 text-sm rounded-md border"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            onClick={registerPatient}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registering…' : 'Register Patient'}
          </button>
        </div>

      </div>
    </main>
  );
}

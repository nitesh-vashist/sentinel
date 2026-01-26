'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Trial = {
  id: string;
  title: string;
  description: string | null;
};

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
};

export default function HospitalTrialWorkspace() {
  const { trialId } = useParams() as { trialId: string };
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD & AUTHORIZE ---------------- */

  useEffect(() => {
    const loadWorkspace = async () => {
      // 1️⃣ Auth user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 2️⃣ Get hospital_id
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

      // 3️⃣ Check hospital accepted this trial
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', userRow.hospital_id)
        .single();

      if (!th || th.status !== 'accepted') {
        // Not authorized
        router.push('/hospital');
        return;
      }

      // 4️⃣ Load trial info
      const { data: trialData } = await supabase
        .from('trials')
        .select('id, title, description')
        .eq('id', trialId)
        .single();

      setTrial(trialData);

      // 5️⃣ Load patients
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, subject_code, enrolled_at')
        .eq('trial_id', trialId)
        .eq('hospital_id', userRow.hospital_id)
        .order('enrolled_at', { ascending: true });

      setPatients(patientData || []);
      setLoading(false);
    };

    loadWorkspace();
  }, [trialId, router]);

  if (loading) {
    return <p className="p-10 text-gray-600">Loading trial workspace…</p>;
  }

  if (!trial) {
    return <p className="p-10 text-red-600">Trial not found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TRIAL HEADER */}
        <section className="bg-white border rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {trial.title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {trial.description || 'No description provided'}
          </p>
        </section>

        {/* PATIENTS */}
        <section className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Patients
            </h2>

            <button
              onClick={() =>
                router.push(`/hospital/trials/${trialId}/patients/new`)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Register New Patient
            </button>
          </div>

          {patients.length === 0 ? (
            <p className="text-sm text-gray-500">
              No patients registered yet.
            </p>
          ) : (
            <div className="space-y-3">
              {patients.map(p => (
                <div
                  key={p.id}
                  className="border rounded-md px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    router.push(
                      `/hospital/trials/${trialId}/patients/${p.id}`
                    )
                  }
                >
                  <div className="text-sm font-medium text-gray-900">
                    Subject Code: {p.subject_code}
                  </div>
                  <div className="text-xs text-gray-600">
                    Enrolled on {new Date(p.enrolled_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
};

type Visit = {
  id: string;
  visit_number: number;
  visit_date: string;
  status: 'submitted' | 'locked';
};

export default function PatientVisitPage() {
  const { trialId, patientId } = useParams() as {
    trialId: string;
    patientId: string;
  };

  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD & AUTHORIZE ---------------- */

  useEffect(() => {
    const loadPage = async () => {
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

      const hospitalId = userRow.hospital_id;

      // 3️⃣ Check trial acceptance
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .single();

      if (!th || th.status !== 'accepted') {
        router.push('/hospital');
        return;
      }

      // 4️⃣ Load patient
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, subject_code, enrolled_at')
        .eq('id', patientId)
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .single();

      if (!patientData) {
        router.push(`/hospital/trials/${trialId}`);
        return;
      }

      setPatient(patientData);

      // 5️⃣ Load visits
      const { data: visitData } = await supabase
        .from('visits')
        .select('id, visit_number, visit_date, status')
        .eq('patient_id', patientId)
        .order('visit_number', { ascending: true });

      setVisits(visitData || []);
      setLoading(false);
    };

    loadPage();
  }, [trialId, patientId, router]);

  if (loading) {
    return <p className="p-10 text-gray-600">Loading patient visits…</p>;
  }

  if (!patient) {
    return <p className="p-10 text-red-600">Patient not found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* PATIENT HEADER */}
        <section className="bg-white border rounded-xl p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Patient: {patient.subject_code}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Enrolled on {new Date(patient.enrolled_at).toLocaleDateString()}
          </p>
        </section>

        {/* VISITS */}
        <section className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Visits
            </h2>

            <button
              onClick={() =>
                router.push(
                  `/hospital/trials/${trialId}/patients/${patientId}/visits/new`
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Add New Visit
            </button>
          </div>

          {visits.length === 0 ? (
            <p className="text-sm text-gray-500">
              No visits recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {visits.map(v => (
                <div
                  key={v.id}
                  className="border rounded-md px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    router.push(
                      `/hospital/trials/${trialId}/patients/${patientId}/visits/${v.id}`
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">
                      Visit #{v.visit_number}
                    </div>

                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      {v.status === 'locked' ? 'Locked' : 'Submitted'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Date: {new Date(v.visit_date).toLocaleDateString()}
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

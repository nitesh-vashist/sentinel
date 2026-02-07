'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---------------- TYPES ---------------- */

type Hospital = {
  id: string;
  name: string;
  registration_number: string;
};

type TrialHospital = {
  status: 'accepted' | 'pending' | 'rejected';
};

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
  visit_count: number;
};

/* ---------------- COMPONENT ---------------- */

export default function RegulatorHospitalPage() {
  const { trialId, hospitalId } = useParams() as {
    trialId: string;
    hospitalId: string;
  };

  const router = useRouter();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [trialHospital, setTrialHospital] = useState<TrialHospital | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiSummary, setAiSummary] = useState<{
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null>(null);
  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ fetch hospital info
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('id, name, registration_number')
        .eq('id', hospitalId)
        .single();

      // 2️⃣ verify hospital is part of this trial
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .single();

      if (!hospitalData || !th) {
        router.push('/regulator/trials');
        return;
      }

      // 3️⃣ fetch patients + visit count
      const { data: patientsData } = await supabase
        .from('patients')
        .select(
          `
          id,
          subject_code,
          enrolled_at,
          visits(count)
        `
        )
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('enrolled_at', { ascending: true });

      // 4️⃣ fetch latest AI risk summary
      const { data: aiData } = await supabase
        .from('ai_hospital_scores')
        .select('risk_score, risk_level')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (aiData) {
        setAiSummary(aiData);
      }


      const normalizedPatients: Patient[] =
        patientsData?.map((p: any) => ({
          id: p.id,
          subject_code: p.subject_code,
          enrolled_at: p.enrolled_at,
          visit_count: p.visits?.[0]?.count ?? 0,
        })) ?? [];

      setHospital(hospitalData);
      setTrialHospital(th);
      setPatients(normalizedPatients);
      setLoading(false);
    };

    load();
  }, [trialId, hospitalId, router]);

  if (loading || !hospital || !trialHospital) {
    return <p className="p-10 text-gray-600">Loading hospital…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {hospital.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Registration No: {hospital.registration_number}
            </p>
            <p className="text-sm mt-2">
              Trial Status:{' '}
              <span
                className={`font-medium ${trialHospital.status === 'accepted'
                    ? 'text-green-700'
                    : trialHospital.status === 'pending'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}
              >
                {trialHospital.status.toUpperCase()}
              </span>
            </p>
          </div>

          {/* AI Risk Summary */}
          {aiSummary && (
            <div className="bg-white border rounded-xl p-4 text-right space-y-2">
              <div
                className={`text-sm font-semibold ${aiSummary.risk_level === 'LOW'
                    ? 'text-green-700'
                    : aiSummary.risk_level === 'MEDIUM'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}
              >
                AI Risk: {aiSummary.risk_level}
              </div>

              <div className="text-xs text-gray-600">
                Score: {aiSummary.risk_score} / 100
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/regulator/trials/${trialId}/hospitals/${hospitalId}/ai-analysis`
                  )
                }
                className="text-xs text-blue-600 hover:underline"
              >
                Detailed AI Analysis →
              </button>
            </div>
          )}
        </div>


        {/* Patients */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            Enrolled Patients
          </h3>

          {patients.length === 0 ? (
            <p className="text-sm text-gray-600">
              No patients enrolled by this hospital.
            </p>
          ) : (
            <div className="space-y-3">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() =>
                    router.push(
                      `/regulator/trials/${trialId}/patients/${p.id}`
                    )
                  }
                  className="cursor-pointer border rounded-lg px-4 py-3
                             hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        Subject Code: {p.subject_code}
                      </div>
                      <div className="text-xs text-gray-600">
                        Enrolled on{' '}
                        {new Date(p.enrolled_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      Visits: {p.visit_count}
                    </div>
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

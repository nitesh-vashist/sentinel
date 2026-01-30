'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---------------- TYPES ---------------- */

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
  hospital_id: string;
};

type Hospital = {
  name: string;
};

type Visit = {
  id: string;
  visit_number: number;
  visit_date: string;
  status: 'submitted' | 'locked';
};

/* ---------------- COMPONENT ---------------- */

export default function RegulatorPatientPage() {
  const { trialId, patientId } = useParams() as {
    trialId: string;
    patientId: string;
  };

  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ fetch patient
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('trial_id', trialId)
        .single();

      if (!patientData) {
        router.push('/regulator/trials');
        return;
      }

      // 2️⃣ fetch hospital
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('name')
        .eq('id', patientData.hospital_id)
        .single();

      // 3️⃣ fetch visits
      const { data: visitsData } = await supabase
        .from('visits')
        .select('id, visit_number, visit_date, status')
        .eq('patient_id', patientId)
        .order('visit_number');

      setPatient(patientData);
      setHospitalName(hospitalData?.name ?? 'Unknown Hospital');
      setVisits(visitsData || []);
      setLoading(false);
    };

    load();
  }, [trialId, patientId, router]);

  if (loading || !patient) {
    return <p className="p-10 text-gray-600">Loading patient…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Patient {patient.subject_code}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Hospital: {hospitalName}
          </p>
          <p className="text-sm text-gray-600">
            Enrolled on{' '}
            {new Date(patient.enrolled_at).toLocaleDateString()}
          </p>
        </div>

        {/* Visits */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            Visits
          </h3>

          {visits.length === 0 ? (
            <p className="text-sm text-gray-600">
              No visits recorded for this patient.
            </p>
          ) : (
            <div className="space-y-3">
              {visits.map(v => (
                <div
                  key={v.id}
                  onClick={() =>
                    router.push(
                      `/regulator/trials/${trialId}/visits/${v.id}`
                    )
                  }
                  className="cursor-pointer border rounded-lg px-4 py-3
                             hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        Visit {v.visit_number}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(v.visit_date).toLocaleDateString()}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full
                        ${
                          v.status === 'locked'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      `}
                    >
                      {v.status.toUpperCase()}
                    </span>
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

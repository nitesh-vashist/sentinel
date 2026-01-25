'use client';
// this file is for selecting hospitals for a trial by the regulator after creating a new trial, and it adds entries to the trial_hospitals schema
// the trial_hospitals schema is:

// CREATE TABLE trial_hospitals (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
//   hospital_id UUID NOT NULL REFERENCES hospitals(id),
//   status trial_hospital_status NOT NULL DEFAULT 'pending',
//   decision_at TIMESTAMP,
//   UNIQUE (trial_id, hospital_id)
// );


import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

type Hospital = {
  id: string;
  name: string;
  registration_number: string;
};

export default function SelectHospitalsPage() {
  const router = useRouter();
  const params = useParams();
  const trialId = params.trialId as string;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, registration_number')
        .eq('verified', true);

      if (error) {
        setError(error.message);
        console.log('Error fetching hospitals:', error);
        setLoading(false);
        return;
      }

      setHospitals(data || []);
      setLoading(false);
    };

    fetchHospitals();
  }, []);

  const toggleHospital = (hospitalId: string) => {
    setSelectedHospitalIds(prev =>
      prev.includes(hospitalId)
        ? prev.filter(id => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (selectedHospitalIds.length === 0) {
      setError('Select at least one hospital');
      return;
    }

    const inserts = selectedHospitalIds.map(hospitalId => ({
      trial_id: trialId,
      hospital_id: hospitalId,
      status: 'pending',
    }));

    const { error: insertError } = await supabase
      .from('trial_hospitals')
      .insert(inserts);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // Next step: CRF definition (we’ll build this next)
    router.push(`/regulator/trial/${trialId}/crf`);
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading hospitals...</p>;
  }

  return (
    <main style={{ padding: 40, maxWidth: 700 }}>
      <h1>Select Hospitals for Trial</h1>

      {hospitals.length === 0 && (
        <p>No verified hospitals available.</p>
      )}

      <div style={{ marginTop: 20 }}>
        {hospitals.map(hospital => (
          <div
            key={hospital.id}
            style={{
              border: '1px solid #ccc',
              padding: 12,
              marginBottom: 10,
              borderRadius: 6,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={selectedHospitalIds.includes(hospital.id)}
                onChange={() => toggleHospital(hospital.id)}
              />
              <div>
                <strong>{hospital.name}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Reg No: {hospital.registration_number}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
      >
        Confirm & Continue
      </button>
    </main>
  );
}

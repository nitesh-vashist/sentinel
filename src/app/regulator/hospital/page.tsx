'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RegulatorHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('hospitals')
      .select('*')
      .eq('verified', false)
      .then(({ data }) => setHospitals(data || []));
  }, []);

  const approveHospital = async (id: string) => {
    await supabase
      .from('hospitals')
      .update({
        verified: true,
        verified_at: new Date(),
      })
      .eq('id', id);

    setHospitals(hospitals.filter(h => h.id !== id));
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Hospital Verification</h1>

      {hospitals.map(h => (
        <div key={h.id}>
          <p>{h.name} ({h.registration_number})</p>
          <button onClick={() => approveHospital(h.id)}>Approve</button>
        </div>
      ))}
    </main>
  );
}

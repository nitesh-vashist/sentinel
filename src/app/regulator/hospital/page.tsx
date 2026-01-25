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
  <main className="min-h-screen bg-gray-50 px-6 py-8">
    <div className="max-w-4xl mx-auto">
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Hospital Verification
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Review and approve hospitals requesting access to the system.
      </p>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {hospitals.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No hospitals pending verification.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium">
                  Hospital Name
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  Registration Number
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hospitals.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {h.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {h.registration_number}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => approveHospital(h.id)}
                      className="inline-flex items-center rounded-md bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </main>
);

}

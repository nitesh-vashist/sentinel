'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---------------- TYPES ---------------- */

type Trial = {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  status: 'draft' | 'active' | 'ended';
  created_at: string;
  start_date: string | null;
  expected_end_date: string | null;
};

type CRFField = {
  id: string;
  field_label: string;
  field_type: string;
  field_category: 'A' | 'B' | 'C';
  unit: string | null;
};

type HospitalRow = {
  hospital_id: string;
  status: 'accepted' | 'pending' | 'rejected';
  hospitals: {
    name: string;
    registration_number: string;
  } | null;
};

/* ---------------- COMPONENT ---------------- */

export default function RegulatorTrialPage() {
  const { trialId } = useParams() as { trialId: string };
  const router = useRouter();

  const [trial, setTrial] = useState<Trial | null>(null);
  const [fields, setFields] = useState<CRFField[]>([]);
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [activeTab, setActiveTab] = useState<'crf' | 'hospitals' | 'ai'>('crf');
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      const [{ data: trialData }, { data: crf }, { data: th }] =
        await Promise.all([
          supabase.from('trials').select('*').eq('id', trialId).single(),
          supabase
            .from('trial_crf_fields')
            .select('*')
            .eq('trial_id', trialId)
            .order('field_category'),
          supabase
            .from('trial_hospitals')
            .select(`
              hospital_id,
              status,
              hospitals (
                name,
                registration_number
              )
            `)
            .eq('trial_id', trialId),
        ]);

      setTrial(trialData);
      setFields(crf || []);

      // normalize hospital rows (important for TS sanity)
      const normalizedHospitals: HospitalRow[] = (th || []).map((h: any) => ({
        hospital_id: h.hospital_id,
        status: h.status,
        hospitals: h.hospitals
          ? {
              name: h.hospitals.name,
              registration_number: h.hospitals.registration_number,
            }
          : null,
      }));

      setHospitals(normalizedHospitals);
      setLoading(false);
    };

    load();
  }, [trialId]);

  /* ---------------- END TRIAL ---------------- */

  const endTrial = async () => {
    if (!confirm('Are you sure you want to end this trial?')) return;

    await supabase
      .from('trials')
      .update({ status: 'ended' })
      .eq('id', trialId);

    setTrial(prev => (prev ? { ...prev, status: 'ended' } : prev));
  };

  if (loading || !trial) {
    return <p className="p-10 text-gray-600">Loading trial…</p>;
  }

  const acceptedHospitals = hospitals.filter(h => h.status === 'accepted');
  const otherHospitals = hospitals.filter(h => h.status !== 'accepted');

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {trial.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {trial.phase} • Status: {trial.status.toUpperCase()}
            </p>
            {trial.description && (
              <p className="text-sm text-gray-700 mt-2">
                {trial.description}
              </p>
            )}
          </div>

          {trial.status === 'active' && (
            <button
              onClick={endTrial}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
            >
              End Trial
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton active={activeTab === 'crf'} onClick={() => setActiveTab('crf')}>
            CRF Fields
          </TabButton>
          <TabButton
            active={activeTab === 'hospitals'}
            onClick={() => setActiveTab('hospitals')}
          >
            Hospitals
          </TabButton>
          <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
            AI Analysis
          </TabButton>
        </div>

        {/* CRF TAB */}
        {activeTab === 'crf' && (
          <section className="bg-white border rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.id} className="border rounded-md px-4 py-3">
                  <div className="text-sm font-medium">{f.field_label}</div>
                  <div className="text-xs text-gray-600">
                    {f.field_category} • {f.field_type}
                    {f.unit && ` • ${f.unit}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HOSPITALS TAB */}
        {activeTab === 'hospitals' && (
          <section className="space-y-6">

            {/* Accepted */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-medium mb-6">
                Accepted Hospitals
              </h3>

              {acceptedHospitals.length === 0 ? (
                <p className="text-sm text-gray-900">
                  No hospitals have accepted this trial yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {acceptedHospitals.map(h => (
                    <div
                      key={h.hospital_id}
                      onClick={() =>
                        router.push(
                          `/regulator/trials/${trialId}/hospitals/${h.hospital_id}`
                        )
                      }
                      className="cursor-pointer border rounded-lg p-4
                                 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {h.hospitals?.name ?? 'Unknown Hospital'}
                          </div>
                          <div className="text-xs text-gray-900">
                            Reg No: {h.hospitals?.registration_number ?? '—'}
                          </div>
                        </div>

                        <span className="text-xs font-medium px-2 py-1
                                         rounded-full bg-green-100 text-green-700">
                          ACCEPTED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending / Rejected */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                Pending / Rejected Hospitals
              </h3>

              {otherHospitals.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No pending or rejected hospitals.
                </p>
              ) : (
                <div className="space-y-2">
                  {otherHospitals.map(h => (
                    <div
                      key={h.hospital_id}
                      className="border rounded-md px-4 py-3
                                 bg-gray-50 text-sm text-gray-700"
                    >
                      {h.hospitals?.name ?? 'Unknown Hospital'} —{' '}
                      <span className="capitalize">{h.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <section className="bg-white border rounded-xl p-6">
            <p className="text-gray-600">
              AI analysis will be available once sufficient visit data
              has been collected.
            </p>
          </section>
        )}

      </div>
    </main>
  );
}

/* ---------------- UI HELPERS ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium
        ${active ? 'bg-blue-600 text-white' : 'bg-white border'}
      `}
    >
      {children}
    </button>
  );
}

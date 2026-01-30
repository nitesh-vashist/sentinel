'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Trial = {
  id: string;
  title: string;
  phase: string;
  status: 'draft' | 'active';
  created_at: string;
  start_date: string | null;
  expected_end_date: string | null;
};

export default function RegulatorTrialsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'draft'>('active');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD TRIALS ---------------- */

  useEffect(() => {
    const loadTrials = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('trials')
        .select(`
          id,
          title,
          phase,
          status,
          created_at,
          start_date,
          expected_end_date
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        alert('Failed to load trials');
      }

      setTrials(data || []);
      setLoading(false);
    };

    loadTrials();
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Trials
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all Phase 3 clinical trials
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-700'}
            `}
          >
            Active Trials
          </button>

          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${activeTab === 'draft'
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-700'}
            `}
          >
            Draft Trials
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border rounded-xl p-6">
          {loading ? (
            <p className="text-gray-600">Loading trials…</p>
          ) : trials.length === 0 ? (
            <p className="text-gray-600">
              No {activeTab} trials found.
            </p>
          ) : (
            <div className="space-y-4">
              {trials.map(trial => (
                <div
                  key={trial.id}
                  onClick={() =>
                    router.push(`/regulator/trials/${trial.id}`)
                  }
                  className="border rounded-lg p-4 cursor-pointer
                             hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {trial.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {trial.phase} • Created{' '}
                        {new Date(trial.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full
                        ${trial.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'}
                      `}
                    >
                      {trial.status.toUpperCase()}
                    </span>
                  </div>

                  {(trial.start_date || trial.expected_end_date) && (
                    <p className="text-xs text-gray-500 mt-2">
                      {trial.start_date && `Start: ${trial.start_date}`}
                      {trial.start_date && trial.expected_end_date && ' • '}
                      {trial.expected_end_date &&
                        `Expected End: ${trial.expected_end_date}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

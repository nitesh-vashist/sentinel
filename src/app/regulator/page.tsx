'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegulatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [regulatorName, setRegulatorName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (!userRow || userRow.role !== 'regulator') {
        router.push('/redirect');
        return;
      }

      setRegulatorName(userRow.full_name);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return <p className="p-10 text-gray-600">Loading dashboard…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Regulator Dashboard
          </h1>
          {regulatorName && (
            <p className="text-sm text-gray-600 mt-1">
              Welcome, {regulatorName}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Hospital approvals */}
          <div
            onClick={() => router.push('/regulator/hospital')}
            className="cursor-pointer bg-white border rounded-xl p-6
                       hover:shadow-md transition"
          >
            <h3 className="text-lg font-medium text-gray-900">
              Hospital Approvals
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Review and approve newly registered hospitals.
            </p>
          </div>

          {/* Trials */}
          <div
            onClick={() => router.push('/regulator/trials')}
            className="cursor-pointer bg-white border rounded-xl p-6
                       hover:shadow-md transition"
          >
            <h3 className="text-lg font-medium text-gray-900">
              Trials
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              View and manage draft and active trials.
            </p>
          </div>

          {/* Create trial */}
          <div
            onClick={() => router.push('/regulator/trial/new')}
            className="cursor-pointer bg-blue-600 text-white
                       rounded-xl p-6 hover:bg-blue-700 transition"
          >
            <h3 className="text-lg font-medium">
              Create New Trial
            </h3>
            <p className="text-sm text-blue-100 mt-2">
              Start a new Phase 3 clinical trial.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

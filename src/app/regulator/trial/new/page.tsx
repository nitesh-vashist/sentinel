'use client';

// this file is for creating a new trial by the regulator and it only updates the trials schema, and it redirects to the hospital selection page after creation
// the trial schema is: 

// CREATE TABLE trials (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   title TEXT NOT NULL,
//   description TEXT,
//   phase TEXT NOT NULL CHECK (phase = 'Phase 3'),
//   status trial_status NOT NULL DEFAULT 'draft',
//   created_by UUID NOT NULL REFERENCES users(id),
//   created_at TIMESTAMP DEFAULT now(),
//   start_date DATE,
//   expected_end_date DATE
// );


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewTrialPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateTrial = async () => {
    setError(null);
    setLoading(true);

    // 1️⃣ Get logged-in user
    const { data: sessionData } =
      await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push('/login');
      return;
    }

    const userId = sessionData.session.user.id;

    // 2️⃣ Insert trial
    const { data: trial, error: insertError } =
      await supabase
        .from('trials')
        .insert({
          title,
          description,
          start_date: startDate,
          expected_end_date: endDate,
          phase: 'Phase 3',
          created_by: userId,
        })
        .select()
        .single();

    if (insertError || !trial) {
      setError(insertError?.message || 'Failed to create trial');
      setLoading(false);
      return;
    }

    // 3️⃣ Redirect to hospital selection (next step)
    router.push(`/regulator/trial/${trial.id}/hospitals`);
  };

return (
  <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border p-6">
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Create New Trial
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Define basic details for a new clinical trial.
      </p>

      <div className="space-y-4">
        {/* Trial Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trial Title
          </label>
          <input
            type="text"
            placeholder="e.g. Phase 3 Hypertension Study"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       placeholder:text-gray-600 text-gray-900 caret-blue-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Trial Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trial Description
          </label>
          <textarea
            placeholder="Briefly describe the purpose and scope of the trial"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none
                       placeholder:text-gray-600 text-gray-900 caret-blue-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleCreateTrial}
          disabled={loading}
          className="w-full mt-2 rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating trial…' : 'Create Trial'}
        </button>
      </div>
    </div>
  </main>
);

}

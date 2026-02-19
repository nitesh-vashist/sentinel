// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// type Trial = {
//   id: string;
//   title: string;
//   phase: string;
//   status: 'draft' | 'active' | 'ended';
//   created_at: string;
//   start_date: string | null;
//   expected_end_date: string | null;
// };

// export default function RegulatorTrialsPage() {
//   const router = useRouter();

//   const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'ended'>('active');
//   const [trials, setTrials] = useState<Trial[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- LOAD TRIALS ---------------- */

//   useEffect(() => {
//     const loadTrials = async () => {
//       setLoading(true);
//       fetch("/api/warmup-ai"); // no await
//       const { data, error } = await supabase
//         .from('trials')
//         .select(`
//           id,
//           title,
//           phase,
//           status,
//           created_at,
//           start_date,
//           expected_end_date
//         `)
//         .eq('status', activeTab)
//         .order('created_at', { ascending: false });

//       if (error) {
//         console.error(error);
//         alert('Failed to load trials');
//       }

//       setTrials(data || []);
//       setLoading(false);
//     };

//     loadTrials();
//   }, [activeTab]);

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-10">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* Header */}
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Trials
//           </h1>
//           <p className="text-sm text-gray-600 mt-1">
//             Manage all Phase 3 clinical trials
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-2">
//           <button
//             onClick={() => setActiveTab('active')}
//             className={`px-4 py-2 rounded-md text-sm font-medium
//               ${activeTab === 'active'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-white border text-gray-700'}
//             `}
//           >
//             Active Trials
//           </button>

//           <button
//             onClick={() => setActiveTab('draft')}
//             className={`px-4 py-2 rounded-md text-sm font-medium
//               ${activeTab === 'draft'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-white border text-gray-700'}
//             `}
//           >
//             Draft Trials
//           </button>

//           <button
//             onClick={() => setActiveTab('ended')}
//             className={`px-4 py-2 rounded-md text-sm font-medium
//             ${activeTab === 'ended'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-white border text-gray-700'}
//           `}
//           >
//             Ended Trials
//           </button>
//         </div>

//         {/* Content */}
//         <div className="bg-white border rounded-xl p-6">
//           {loading ? (
//             <p className="text-gray-600">Loading trials…</p>
//           ) : trials.length === 0 ? (
//             <p className="text-gray-600">
//               No {activeTab} trials found.
//             </p>
//           ) : (
//             <div className="space-y-4">
//               {trials.map(trial => (
//                 <div
//                   key={trial.id}
//                   onClick={() =>
//                     router.push(`/regulator/trials/${trial.id}`)
//                   }
//                   className="border rounded-lg p-4 cursor-pointer
//                              hover:bg-gray-50 transition"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h3 className="text-lg font-medium text-gray-900">
//                         {trial.title}
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {trial.phase} • Created{' '}
//                         {new Date(trial.created_at).toLocaleDateString()}
//                       </p>
//                     </div>

//                     <span
//                       className={`text-xs font-medium px-2 py-1 rounded-full
//                         ${trial.status === 'active'
//                           ? 'bg-green-100 text-green-700'
//                           : trial.status === 'draft'
//                             ? 'bg-yellow-100 text-yellow-700'
//                             : 'bg-gray-200 text-gray-700'}
//                       `}
//                     >
//                       {trial.status.toUpperCase()}
//                     </span>
//                   </div>

//                   {(trial.start_date || trial.expected_end_date) && (
//                     <p className="text-xs text-gray-500 mt-2">
//                       {trial.start_date && `Start: ${trial.start_date}`}
//                       {trial.start_date && trial.expected_end_date && ' • '}
//                       {trial.expected_end_date &&
//                         `Expected End: ${trial.expected_end_date}`}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

/************************************************************************************************/

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Trial = {
  id: string;
  title: string;
  phase: string;
  status: 'draft' | 'active' | 'ended';
  created_at: string;
  start_date: string | null;
  expected_end_date: string | null;
};

export default function RegulatorTrialsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'ended'>('active');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  const [anchoring, setAnchoring] = useState(false);
  const [anchorResult, setAnchorResult] = useState<null | {
    type: 'success' | 'info' | 'error';
    message: string;
  }>(null);

  /* ---------------- LOAD TRIALS ---------------- */

  useEffect(() => {
    const loadTrials = async () => {
      setLoading(true);
      fetch("/api/warmup-ai");

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

  /* ---------------- ANCHOR HANDLER ---------------- */

  const handleAnchor = async () => {
    try {
      setAnchoring(true);
      setAnchorResult(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      const res = await fetch("/api/blockchain/anchor-visit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Anchoring failed");
      }

      if (result.anchoredVisits > 0) {
        setAnchorResult({
          type: "success",
          message: `Anchored ${result.anchoredVisits} visits across ${result.anchoredTrials} trial(s).`,
        });
      } else {
        setAnchorResult({
          type: "info",
          message: "Visits already anchored today.",
        });
      }

    } catch (err: any) {
      setAnchorResult({
        type: "error",
        message: err.message || "Anchoring failed.",
      });
    } finally {
      setAnchoring(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-4">
          <button
            onClick={() => router.push('/regulator')}
            className="flex items-center gap-2 text-sm text-gray-600
                      hover:text-gray-900 transition"
          >
            <span className="text-lg">←</span>
            <span>Back</span>
          </button>
        </div>


        {/* Header + Anchor Button */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Trials
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all Phase 3 clinical trials
            </p>
          </div>

          <button
            onClick={handleAnchor}
            disabled={anchoring}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition
              ${anchoring
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            {anchoring ? "Anchoring..." : "Anchor New Visits"}
          </button>
        </div>

        {/* Anchor Result */}
        {anchorResult && (
          <div
            className={`relative p-4 pr-10 rounded-lg text-sm
              ${anchorResult.type === "success" && "bg-green-100 text-green-800"}
              ${anchorResult.type === "info" && "bg-blue-100 text-blue-800"}
              ${anchorResult.type === "error" && "bg-red-100 text-red-800"}
            `}
          >
            {/* Close Button */}
            <button
              onClick={() => setAnchorResult(null)}
              className="absolute top-2 right-3 text-lg font-semibold opacity-60 hover:opacity-100 transition"
            >
              ×
            </button>

            {anchorResult.message}
          </div>
        )}


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

          <button
            onClick={() => setActiveTab('ended')}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${activeTab === 'ended'
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-700'}
            `}
          >
            Ended Trials
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
                          : trial.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-200 text-gray-700'}
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

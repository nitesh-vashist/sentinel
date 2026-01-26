// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// export default function HospitalDashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkApproval = async () => {
//       const { data: sessionData } =
//         await supabase.auth.getSession();

//       if (!sessionData.session) {
//         router.push('/login');
//         return;
//       }

//       const userId = sessionData.session.user.id;

//       // 1️⃣ Fetch user
//       const { data: user, error: userError } = await supabase
//         .from('users')
//         .select('hospital_id')
//         .eq('id', userId)
//         .single();

//       if (userError || !user?.hospital_id) {
//         router.push('/login');
//         return;
//       }

//       // 2️⃣ Fetch hospital
//       const { data: hospital, error: hospitalError } = await supabase
//         .from('hospitals')
//         .select('verified')
//         .eq('id', user.hospital_id)
//         .single();

//       if (hospitalError || !hospital?.verified) {
//         router.push('/pending-approval');
//         return;
//       }

//       setLoading(false);
//     };

//     checkApproval();
//   }, [router]);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <main style={{ padding: 40 }}>
//       <h1>Hospital Dashboard</h1>
//       <p>Hospital verified. Access granted.</p>
//     </main>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Trial = {
  trial_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  trial_hospital_id: string;
};

export default function HospitalDashboard() {
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [acceptedTrials, setAcceptedTrials] = useState<Trial[]>([]);
  const [pendingTrials, setPendingTrials] = useState<Trial[]>([]);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD HOSPITAL & TRIALS ---------------- */

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 2️⃣ Get hospital_id
      const { data: userRow } = await supabase
        .from('users')
        .select('full_name,hospital_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.hospital_id) return;
      setHospitalName(userRow.full_name);
      setHospitalId(userRow.hospital_id);

      // 3️⃣ Fetch trial_hospitals with trial info
      const { data } = await supabase
        .from('trial_hospitals')
        .select(`
          id,
          status,
          trials (
            id,
            title,
            description
          )
        `)
        .eq('hospital_id', userRow.hospital_id);

      const accepted: Trial[] = [];
      const pending: Trial[] = [];

      (data || []).forEach((row: any) => {
        const trialData = {
          trial_id: row.trials.id,
          title: row.trials.title,
          description: row.trials.description,
          status: row.status,
          trial_hospital_id: row.id,
        };

        if (row.status === 'accepted') accepted.push(trialData);
        if (row.status === 'pending') pending.push(trialData);
      });

      setAcceptedTrials(accepted);
      setPendingTrials(pending);
      setLoading(false);
    };

    loadData();
  }, []);

  /* ---------------- ACCEPT / REJECT ---------------- */

  const handleDecision = async (
    trialHospitalId: string,
    trialId: string,
    decision: 'accepted' | 'rejected'
  ) => {
    // 1️⃣ Update trial_hospitals
    await supabase
      .from('trial_hospitals')
      .update({
        status: decision,
        decision_at: new Date().toISOString(),
      })
      .eq('id', trialHospitalId);

    // 2️⃣ If accepted → activate trial (idempotent)
    if (decision === 'accepted') {
      await supabase
        .from('trials')
        .update({ status: 'active' })
        .eq('id', trialId)
        .neq('status', 'active');
    }

    // 3️⃣ Refresh page data
    location.reload();
  };

  if (loading) {
    return <p className="p-10 text-gray-600">Loading hospital dashboard…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-2xl font-semibold text-gray-900">
          Hospital Dashboard for {hospitalName}
        </h1>

        {/* ACCEPTED TRIALS */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">
            My Trials
          </h2>

          {acceptedTrials.length === 0 ? (
            <p className="text-sm text-gray-500">
              No active trials yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acceptedTrials.map(trial => (
                <div
                  key={trial.trial_id}
                  className="border rounded-md p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    router.push(`/hospital/trials/${trial.trial_id}`)
                  }
                >
                  <div className="text-sm font-medium text-gray-900">
                    {trial.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {trial.description || 'No description'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PENDING INVITATIONS */}
        {pendingTrials.length > 0 && (
          <section className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">
              Trial Invitations
            </h2>

            <div className="space-y-4">
              {pendingTrials.map(trial => (
                <div
                  key={trial.trial_id}
                  className="border rounded-md p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {trial.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {trial.description || 'No description'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDecision(
                          trial.trial_hospital_id,
                          trial.trial_id,
                          'accepted'
                        )
                      }
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleDecision(
                          trial.trial_hospital_id,
                          trial.trial_id,
                          'rejected'
                        )
                      }
                      className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}


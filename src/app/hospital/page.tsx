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
import { 
  Building2, 
  LogOut, 
  Activity, 
  MailWarning, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

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
  
  // Track which invitation is currently being processed
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* ---------------- LOAD HOSPITAL & TRIALS ---------------- */

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Warmup AI in background
      fetch("/api/warmup-ai").catch(console.error);

      // 2️⃣ Get hospital_id
      const { data: userRow } = await supabase
        .from('users')
        .select('full_name,hospital_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.hospital_id) {
        router.push('/login');
        return;
      }

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
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/'); 
  };

  /* ---------------- ACCEPT / REJECT ---------------- */

  const handleDecision = async (
    trialHospitalId: string,
    trialId: string,
    decision: 'accepted' | 'rejected'
  ) => {
    setProcessingId(trialHospitalId);

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

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading site dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans">
      
      {/* Background flourish */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-100/50 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  Verified Clinical Site
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  <ShieldCheck className="w-3 h-3" /> Sentinel Protected
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {hospitalName}
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Secure Logout'}
          </button>
        </div>

        {/* ================= PENDING INVITATIONS ================= */}
        {pendingTrials.length > 0 && (
          <section className="bg-white border border-amber-200 rounded-3xl p-8 shadow-sm shadow-amber-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                <MailWarning className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pending Trial Invitations</h2>
                <p className="text-sm text-slate-500">Regulators have requested your site's participation.</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {pendingTrials.map(trial => (
                <div
                  key={trial.trial_id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div>
                    <div className="text-lg font-bold text-slate-900 mb-1">
                      {trial.title}
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {trial.description || 'No description provided by regulator.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleDecision(trial.trial_hospital_id, trial.trial_id, 'rejected')}
                      disabled={processingId !== null}
                      className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {processingId === trial.trial_hospital_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Decline
                    </button>

                    <button
                      onClick={() => handleDecision(trial.trial_hospital_id, trial.trial_id, 'accepted')}
                      disabled={processingId !== null}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {processingId === trial.trial_hospital_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Accept Protocol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= ACCEPTED TRIALS ================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Active Workspaces</h2>
              <p className="text-sm text-slate-500">Trials where your site is currently participating.</p>
            </div>
          </div>

          {acceptedTrials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Activity className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-900 font-medium">No Active Trials</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                You will see trials here once you accept a pending invitation from a Regulatory Authority.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {acceptedTrials.map(trial => (
                <div
                  key={trial.trial_id}
                  onClick={() => router.push(`/hospital/trials/${trial.trial_id}`)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col justify-between min-h-[180px] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {trial.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {trial.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      PARTICIPATING
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
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


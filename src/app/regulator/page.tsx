// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// export default function RegulatorDashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [regulatorName, setRegulatorName] = useState<string | null>(null);

//   useEffect(() => {
//     const load = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       fetch("/api/warmup-ai"); // no await


//       const { data: userRow } = await supabase
//         .from('users')
//         .select('role, full_name')
//         .eq('id', user.id)
//         .single();

//       if (!userRow || userRow.role !== 'regulator') {
//         router.push('/redirect');
//         return;
//       }

//       setRegulatorName(userRow.full_name);
//       setLoading(false);
//     };

//     load();
//   }, [router]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.replace('/'); // replace prevents back navigation
//   };


//   if (loading) {
//     return <p className="p-10 text-gray-600">Loading dashboard…</p>;
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-10">
//       <div className="max-w-5xl mx-auto space-y-8">

//         {/* Header */}
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">
//               Regulator Dashboard
//             </h1>
//             {regulatorName && (
//               <p className="text-sm text-gray-600 mt-1">
//                 Welcome, {regulatorName}
//               </p>
//             )}
//           </div>

//           <button
//             onClick={handleLogout}
//             className="bg-red-600 hover:bg-red-700 text-white
//                       px-4 py-2 rounded-lg text-sm font-medium transition"
//           >
//             Logout
//           </button>
//         </div>


//         {/* Actions */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

//           {/* Hospital approvals */}
//           <div
//             onClick={() => router.push('/regulator/hospital')}
//             className="cursor-pointer bg-white border rounded-xl p-6
//                        hover:shadow-md transition"
//           >
//             <h3 className="text-lg font-medium text-gray-900">
//               Hospital Approvals
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               Review and approve newly registered hospitals.
//             </p>
//           </div>

//           {/* Trials */}
//           <div
//             onClick={() => router.push('/regulator/trials')}
//             className="cursor-pointer bg-white border rounded-xl p-6
//                        hover:shadow-md transition"
//           >
//             <h3 className="text-lg font-medium text-gray-900">
//               Trials
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               View and manage draft and active trials.
//             </p>
//           </div>

//           {/* Create trial */}
//           <div
//             onClick={() => router.push('/regulator/trial/new')}
//             className="cursor-pointer bg-blue-600 text-white
//                        rounded-xl p-6 hover:bg-blue-700 transition"
//           >
//             <h3 className="text-lg font-medium">
//               Create New Trial
//             </h3>
//             <p className="text-sm text-blue-100 mt-2">
//               Start a new Phase 3 clinical trial.
//             </p>
//           </div>

//         </div>
//       </div>
//     </main>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ShieldCheck, 
  LogOut, 
  Building2, 
  Activity, 
  PlusCircle, 
  ArrowRight, 
  Loader2
} from 'lucide-react';

export default function RegulatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

      // Warmup AI in background
      fetch("/api/warmup-ai").catch(console.error); 

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/'); 
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading command center...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans">
      
      {/* Background flourish */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  Regulatory Authority
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  System Online
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {regulatorName || 'Inspector'}
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
            {isLoggingOut ? 'Ending Session...' : 'Secure Logout'}
          </button>
        </div>

        {/* ================= QUICK ACTIONS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Hospital Approvals Card */}
          <div
            onClick={() => router.push('/regulator/hospital')}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/5 transition-all duration-300 flex flex-col justify-between min-h-[240px]"
          >
            <div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Site Approvals
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Review pending registration requests and verify clinical trial site credentials.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-600 mt-6 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              Manage Queue <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Manage Trials Card */}
          <div
            onClick={() => router.push('/regulator/trials')}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col justify-between min-h-[240px]"
          >
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Trial Oversight
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Monitor active Phase 3 trials, review cryptographic anchors, and analyze AI risks.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 mt-6 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Create Trial Card (Primary) */}
          <div
            onClick={() => router.push('/regulator/trial/new')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:bg-blue-900 hover:border-blue-700 shadow-md hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col justify-between min-h-[240px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/30 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Create New Trial
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-blue-100 transition-colors">
                Define a new Phase 3 protocol, set CRF parameters, and invite verified hospitals.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-white mt-6 group-hover:translate-x-1 transition-all">
              Initialize Protocol <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
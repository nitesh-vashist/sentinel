// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// /* ---------------- TYPES ---------------- */

// type Hospital = {
//   id: string;
//   name: string;
//   registration_number: string;
// };

// type TrialHospital = {
//   status: 'accepted' | 'pending' | 'rejected';
// };

// type Patient = {
//   id: string;
//   subject_code: string;
//   enrolled_at: string;
//   visit_count: number;
// };

// /* ---------------- COMPONENT ---------------- */

// export default function RegulatorHospitalPage() {
//   const { trialId, hospitalId } = useParams() as {
//     trialId: string;
//     hospitalId: string;
//   };

//   const router = useRouter();

//   const [hospital, setHospital] = useState<Hospital | null>(null);
//   const [trialHospital, setTrialHospital] = useState<TrialHospital | null>(null);
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [runningAI, setRunningAI] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [aiSummary, setAiSummary] = useState<{
//   risk_score: number;
//   risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
//   } | null>(null);
//   /* ---------------- LOAD DATA ---------------- */

//   useEffect(() => {
//     const load = async () => {
//       // 1️⃣ fetch hospital info
//       const { data: hospitalData } = await supabase
//         .from('hospitals')
//         .select('id, name, registration_number')
//         .eq('id', hospitalId)
//         .single();

//       // 2️⃣ verify hospital is part of this trial
//       const { data: th } = await supabase
//         .from('trial_hospitals')
//         .select('status')
//         .eq('trial_id', trialId)
//         .eq('hospital_id', hospitalId)
//         .single();

//       if (!hospitalData || !th) {
//         router.push('/regulator/trials');
//         return;
//       }

//       // 3️⃣ fetch patients + visit count
//       const { data: patientsData } = await supabase
//         .from('patients')
//         .select(
//           `
//           id,
//           subject_code,
//           enrolled_at,
//           visits(count)
//         `
//         )
//         .eq('trial_id', trialId)
//         .eq('hospital_id', hospitalId)
//         .order('enrolled_at', { ascending: true });

//       // 4️⃣ fetch latest AI risk summary
//       const { data: aiData } = await supabase
//         .from('ai_hospital_scores')
//         .select('risk_score, risk_level')
//         .eq('trial_id', trialId)
//         .eq('hospital_id', hospitalId)
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (aiData) {
//         setAiSummary(aiData);
//       }


//       const normalizedPatients: Patient[] =
//         patientsData?.map((p: any) => ({
//           id: p.id,
//           subject_code: p.subject_code,
//           enrolled_at: p.enrolled_at,
//           visit_count: p.visits?.[0]?.count ?? 0,
//         })) ?? [];

//       setHospital(hospitalData);
//       setTrialHospital(th);
//       setPatients(normalizedPatients);
//       setLoading(false);
//     };

//     load();
//   }, [trialId, hospitalId, router]);

//   if (loading || !hospital || !trialHospital) {
//     return <p className="p-10 text-gray-600">Loading hospital…</p>;
//   }

//   const handleRunAI = async () => {
//     try {
//       setRunningAI(true);

//       await fetch("/api/run-ai", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ trialId }),
//       });

//       // Reload to fetch updated AI summary
//       router.refresh();
//     } catch (err) {
//       alert("Failed to run AI analysis");
//     } finally {
//       setRunningAI(false);
//     }

//   };

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-5xl mx-auto space-y-8">
//         <div className="mb-4">
//           <button
//             onClick={() => router.push(`/regulator/trials/${trialId}`)}
//             className="flex items-center gap-2 text-sm text-gray-600
//                       hover:text-gray-900 transition"
//           >
//             <span className="text-lg">←</span>
//             <span>Back</span>
//           </button>
//         </div>

//         {/* Header */}
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">
//               {hospital.name}
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               Registration No: {hospital.registration_number}
//             </p>
//             <p className="text-sm mt-2">
//               Trial Status:{' '}
//               <span
//                 className={`font-medium ${trialHospital.status === 'accepted'
//                     ? 'text-green-700'
//                     : trialHospital.status === 'pending'
//                       ? 'text-yellow-700'
//                       : 'text-red-700'
//                   }`}
//               >
//                 {trialHospital.status.toUpperCase()}
//               </span>
//             </p>
//           </div>

//           {/* AI Section */}
//           <div className="text-right space-y-3">

//             {/* If AI summary exists */}
//             {aiSummary ? (
//               <>
//                 <div className="bg-white border rounded-xl p-4 space-y-2">
//                   <div
//                     className={`text-sm font-semibold ${aiSummary.risk_level === 'LOW'
//                         ? 'text-green-700'
//                         : aiSummary.risk_level === 'MEDIUM'
//                           ? 'text-yellow-700'
//                           : 'text-red-700'
//                       }`}
//                   >
//                     AI Risk: {aiSummary.risk_level}
//                   </div>

//                   <div className="text-xs text-gray-600">
//                     Score: {aiSummary.risk_score} / 100
//                   </div>

//                   <button
//                     onClick={() =>
//                       router.push(
//                         `/regulator/trials/${trialId}/hospitals/${hospitalId}/ai-analysis`
//                       )
//                     }
//                     className="text-xs text-blue-600 hover:underline"
//                   >
//                     Detailed AI Analysis →
//                   </button>
//                 </div>

//                 {/* Re-run button */}
//                 <button
//                   onClick={handleRunAI}
//                   disabled={runningAI}
//                   className={`px-4 py-2 rounded-md text-sm font-medium transition
//           ${runningAI
//                       ? "bg-gray-400 text-white cursor-not-allowed"
//                       : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                     }`}
//                 >
//                   {runningAI ? "Running AI..." : "Re-Run AI Analysis"}
//                 </button>
//               </>
//             ) : (
//               /* If AI summary does NOT exist */
//               <button
//                 onClick={handleRunAI}
//                 disabled={runningAI}
//                 className={`px-5 py-2 rounded-md text-sm font-medium transition
//         ${runningAI
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                   }`}
//               >
//                 {runningAI ? "Running AI..." : "Run AI Analysis"}
//               </button>
//             )}
//           </div>

//         </div>


//         {/* Patients */}
//         <section className="bg-white border rounded-xl p-6">
//           <h3 className="text-lg font-medium mb-4">
//             Enrolled Patients
//           </h3>

//           {patients.length === 0 ? (
//             <p className="text-sm text-gray-600">
//               No patients enrolled by this hospital.
//             </p>
//           ) : (
//             <div className="space-y-3">
//               {patients.map(p => (
//                 <div
//                   key={p.id}
//                   onClick={() =>
//                     router.push(
//                       `/regulator/trials/${trialId}/patients/${p.id}`
//                     )
//                   }
//                   className="cursor-pointer border rounded-lg px-4 py-3
//                              hover:bg-gray-50 transition"
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Subject Code: {p.subject_code}
//                       </div>
//                       <div className="text-xs text-gray-600">
//                         Enrolled on{' '}
//                         {new Date(p.enrolled_at).toLocaleDateString()}
//                       </div>
//                     </div>

//                     <div className="text-sm text-gray-700">
//                       Visits: {p.visit_count}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//       </div>
//     </main>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Building2, 
  Hash, 
  BrainCircuit, 
  Users, 
  Calendar, 
  Activity, 
  ChevronRight, 
  RefreshCw, 
  Play,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  FileText
} from 'lucide-react';

/* ---------------- TYPES ---------------- */

type Hospital = {
  id: string;
  name: string;
  registration_number: string;
};

type TrialHospital = {
  status: 'accepted' | 'pending' | 'rejected';
};

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
  visit_count: number;
};

/* ---------------- COMPONENT ---------------- */

export default function RegulatorHospitalPage() {
  const { trialId, hospitalId } = useParams() as {
    trialId: string;
    hospitalId: string;
  };

  const router = useRouter();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [trialHospital, setTrialHospital] = useState<TrialHospital | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [runningAI, setRunningAI] = useState(false);
  const [loading, setLoading] = useState(true);

  const [aiSummary, setAiSummary] = useState<{
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ fetch hospital info
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('id, name, registration_number')
        .eq('id', hospitalId)
        .single();

      // 2️⃣ verify hospital is part of this trial
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .single();

      if (!hospitalData || !th) {
        router.push('/regulator/trials');
        return;
      }

      // 3️⃣ fetch patients + visit count
      const { data: patientsData } = await supabase
        .from('patients')
        .select(
          `
          id,
          subject_code,
          enrolled_at,
          visits(count)
        `
        )
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('enrolled_at', { ascending: true });

      // 4️⃣ fetch latest AI risk summary
      const { data: aiData } = await supabase
        .from('ai_hospital_scores')
        .select('risk_score, risk_level')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (aiData) {
        setAiSummary(aiData);
      }

      const normalizedPatients: Patient[] =
        patientsData?.map((p: any) => ({
          id: p.id,
          subject_code: p.subject_code,
          enrolled_at: p.enrolled_at,
          visit_count: p.visits?.[0]?.count ?? 0,
        })) ?? [];

      setHospital(hospitalData);
      setTrialHospital(th);
      setPatients(normalizedPatients);
      setLoading(false);
    };

    load();
  }, [trialId, hospitalId, router]);

  const handleRunAI = async () => {
    try {
      setRunningAI(true);

      await fetch("/api/run-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trialId }),
      });

      // Reload to fetch updated AI summary
      router.refresh();
    } catch (err) {
      alert("Failed to run AI analysis");
    } finally {
      setRunningAI(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTrialStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading || !hospital || !trialHospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading site profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Navigation */}
        <div>
          <button
            onClick={() => router.push(`/regulator/trials/${trialId}`)}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Trial Workspace
          </button>
        </div>

        {/* Top Header Section (Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Hospital Info */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10 opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {hospital.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                    <Hash className="w-3.5 h-3.5" />
                    Reg: {hospital.registration_number}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Site Trial Status:
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getTrialStatusColor(trialHospital.status)}`}>
                {trialHospital.status}
              </span>
            </div>
          </div>

          {/* Right: AI Summary Panel */}
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">TIIE Forensic Engine</h2>
              </div>

              {aiSummary ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm font-medium">System Risk Assessment</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getRiskColor(aiSummary.risk_level)}`}>
                        {aiSummary.risk_level}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {aiSummary.risk_score.toFixed(0)}
                      </span>
                      <span className="text-sm font-bold text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/regulator/trials/${trialId}/hospitals/${hospitalId}/ai-analysis`)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    View Detailed Signals
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 text-center">
                  <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">No analysis performed</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Run the AI engine to generate forensic risk scores.</p>
                </div>
              )}
            </div>

            {/* AI Action Button */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleRunAI}
                disabled={runningAI}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  runningAI
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02]'
                }`}
              >
                {runningAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Scan...
                  </>
                ) : (
                  <>
                    {aiSummary ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {aiSummary ? 'Re-run Analysis' : 'Execute AI Scan'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Patients Roster */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Enrolled Subjects
              </h3>
              <p className="text-sm text-slate-500 mt-1">Patients participating under this clinical site.</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              {patients.length} Total
            </div>
          </div>

          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-900 font-medium">No Subjects Enrolled</p>
              <p className="text-sm text-slate-500 mt-1">This hospital has not registered any patients to this trial yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/regulator/trials/${trialId}/patients/${p.id}`)}
                  className="group relative border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-900/5 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Subject Code</div>
                        <div className="font-bold text-slate-900 font-mono group-hover:text-blue-700 transition-colors">
                          {p.subject_code}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(p.enrolled_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        {p.visit_count} {p.visit_count === 1 ? 'Visit' : 'Visits'}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
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
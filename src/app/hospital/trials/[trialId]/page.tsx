// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// type Trial = {
//   id: string;
//   title: string;
//   description: string | null;
// };

// type Patient = {
//   id: string;
//   subject_code: string;
//   enrolled_at: string;
// };

// export default function HospitalTrialWorkspace() {
//   const { trialId } = useParams() as { trialId: string };
//   const router = useRouter();

//   const [hospitalId, setHospitalId] = useState<string | null>(null);
//   const [trial, setTrial] = useState<Trial | null>(null);
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- LOAD & AUTHORIZE ---------------- */

//   useEffect(() => {
//     const loadWorkspace = async () => {
//       // 1️⃣ Auth user
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       // 2️⃣ Get hospital_id
//       const { data: userRow } = await supabase
//         .from('users')
//         .select('hospital_id')
//         .eq('id', user.id)
//         .single();

//       if (!userRow?.hospital_id) {
//         router.push('/hospital');
//         return;
//       }

//       setHospitalId(userRow.hospital_id);

//       // 3️⃣ Check hospital accepted this trial
//       const { data: th } = await supabase
//         .from('trial_hospitals')
//         .select('status')
//         .eq('trial_id', trialId)
//         .eq('hospital_id', userRow.hospital_id)
//         .single();

//       if (!th || th.status !== 'accepted') {
//         // Not authorized
//         router.push('/hospital');
//         return;
//       }

//       // 4️⃣ Load trial info
//       const { data: trialData } = await supabase
//         .from('trials')
//         .select('id, title, description')
//         .eq('id', trialId)
//         .single();

//       setTrial(trialData);

//       // 5️⃣ Load patients
//       const { data: patientData } = await supabase
//         .from('patients')
//         .select('id, subject_code, enrolled_at')
//         .eq('trial_id', trialId)
//         .eq('hospital_id', userRow.hospital_id)
//         .order('enrolled_at', { ascending: true });

//       setPatients(patientData || []);
//       setLoading(false);
//     };

//     loadWorkspace();
//   }, [trialId, router]);

//   if (loading) {
//     return <p className="p-10 text-gray-600">Loading trial workspace…</p>;
//   }

//   if (!trial) {
//     return <p className="p-10 text-red-600">Trial not found.</p>;
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-6xl mx-auto space-y-8">
//         <div className="mb-4">
//           <button
//             onClick={() => router.push('/hospital')}
//             className="flex items-center gap-2 text-sm text-gray-600
//                       hover:text-gray-900 transition"
//           >
//             <span className="text-lg">←</span>
//             <span>Back</span>
//           </button>
//         </div>

//         {/* TRIAL HEADER */}
//         <section className="bg-white border rounded-xl p-6">
//           <h1 className="text-2xl font-semibold text-gray-900">
//             {trial.title}
//           </h1>
//           <p className="text-sm text-gray-600 mt-1">
//             {trial.description || 'No description provided'}
//           </p>
//         </section>

//         {/* PATIENTS */}
//         <section className="bg-white border rounded-xl p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium text-gray-900">
//               Patients
//             </h2>

//             <button
//               onClick={() =>
//                 router.push(`/hospital/trials/${trialId}/patients/new`)
//               }
//               className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
//             >
//               Register New Patient
//             </button>
//           </div>

//           {patients.length === 0 ? (
//             <p className="text-sm text-gray-500">
//               No patients registered yet.
//             </p>
//           ) : (
//             <div className="space-y-3">
//               {patients.map(p => (
//                 <div
//                   key={p.id}
//                   className="border rounded-md px-4 py-3 cursor-pointer hover:bg-gray-50"
//                   onClick={() =>
//                     router.push(
//                       `/hospital/trials/${trialId}/patients/${p.id}`
//                     )
//                   }
//                 >
//                   <div className="text-sm font-medium text-gray-900">
//                     Subject Code: {p.subject_code}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     Enrolled on {new Date(p.enrolled_at).toLocaleDateString()}
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
  Activity, 
  Users, 
  UserPlus, 
  Calendar, 
  ChevronRight, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';

type Trial = {
  id: string;
  title: string;
  description: string | null;
};

type Patient = {
  id: string;
  subject_code: string;
  enrolled_at: string;
};

export default function HospitalTrialWorkspace() {
  const { trialId } = useParams() as { trialId: string };
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD & AUTHORIZE ---------------- */

  useEffect(() => {
    const loadWorkspace = async () => {
      // 1️⃣ Auth user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 2️⃣ Get hospital_id
      const { data: userRow } = await supabase
        .from('users')
        .select('hospital_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.hospital_id) {
        router.push('/hospital');
        return;
      }

      setHospitalId(userRow.hospital_id);

      // 3️⃣ Check hospital accepted this trial
      const { data: th } = await supabase
        .from('trial_hospitals')
        .select('status')
        .eq('trial_id', trialId)
        .eq('hospital_id', userRow.hospital_id)
        .single();

      if (!th || th.status !== 'accepted') {
        // Not authorized
        router.push('/hospital');
        return;
      }

      // 4️⃣ Load trial info
      const { data: trialData } = await supabase
        .from('trials')
        .select('id, title, description')
        .eq('id', trialId)
        .single();

      setTrial(trialData);

      // 5️⃣ Load patients
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, subject_code, enrolled_at')
        .eq('trial_id', trialId)
        .eq('hospital_id', userRow.hospital_id)
        .order('enrolled_at', { ascending: true });

      setPatients(patientData || []);
      setLoading(false);
    };

    loadWorkspace();
  }, [trialId, router]);

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading trial workspace...</p>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-semibold text-slate-900">Workspace Not Found</p>
        <button
          onClick={() => router.push('/hospital')}
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Navigation */}
        <div>
          <button
            onClick={() => router.push('/hospital')}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Site Dashboard
          </button>
        </div>

        {/* ================= TRIAL HEADER ================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -z-10 opacity-60"></div>
          
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Activity className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  Active Workspace
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  ID: {trial.id.split('-')[0]}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {trial.title}
              </h1>
              <p className="text-slate-600 mt-2 max-w-3xl leading-relaxed text-lg">
                {trial.description || 'No specific protocol description provided by the Regulatory Authority.'}
              </p>
            </div>
          </div>
        </section>

        {/* ================= PATIENTS SECTION ================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Enrolled Subjects
              </h2>
              <p className="text-sm text-slate-500 mt-1">Manage and enter visit data for participating patients.</p>
            </div>

            <button
              onClick={() => router.push(`/hospital/trials/${trialId}/patients/new`)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow hover:-translate-y-0.5 transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Register New Subject
            </button>
          </div>

          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-900 font-medium text-lg">No Subjects Enrolled</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Begin data collection by registering your first trial subject. Patient identities are kept strictly anonymous.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/hospital/trials/${trialId}/patients/${p.id}`)}
                  className="group relative border border-slate-200 rounded-2xl p-5 bg-white hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-900/5 cursor-pointer transition-all overflow-hidden flex flex-col justify-between min-h-[160px]"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Subject Code</div>
                      <div className="font-bold text-slate-900 font-mono text-lg group-hover:text-emerald-700 transition-colors">
                        {p.subject_code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Enrolled: {new Date(p.enrolled_at).toLocaleDateString()}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:translate-x-1 transition-all">
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
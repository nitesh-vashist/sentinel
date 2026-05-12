// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// /* ---------------- TYPES ---------------- */

// type Trial = {
//   id: string;
//   title: string;
//   description: string | null;
//   phase: string;
//   status: 'draft' | 'active' | 'ended';
//   created_at: string;
//   start_date: string | null;
//   expected_end_date: string | null;
// };

// type CRFField = {
//   id: string;
//   field_label: string;
//   field_type: string;
//   field_category: 'A' | 'B' | 'C';
//   unit: string | null;
// };

// type HospitalRow = {
//   hospital_id: string;
//   status: 'accepted' | 'pending' | 'rejected';
//   hospitals: {
//     name: string;
//     registration_number: string;
//   } | null;
// };

// /* ---------------- COMPONENT ---------------- */

// export default function RegulatorTrialPage() {
//   const { trialId } = useParams() as { trialId: string };
//   const router = useRouter();

//   const [trial, setTrial] = useState<Trial | null>(null);
//   const [fields, setFields] = useState<CRFField[]>([]);
//   const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
//   const [activeTab, setActiveTab] = useState<'crf' | 'hospitals' | 'ai'>('crf');
//   const [loading, setLoading] = useState(true);

//   /* ---------------- LOAD DATA ---------------- */

//   useEffect(() => {
//     const load = async () => {
//       const [{ data: trialData }, { data: crf }, { data: th }] =
//         await Promise.all([
//           supabase.from('trials').select('*').eq('id', trialId).single(),
//           supabase
//             .from('trial_crf_fields')
//             .select('*')
//             .eq('trial_id', trialId)
//             .order('field_category'),
//           supabase
//             .from('trial_hospitals')
//             .select(`
//               hospital_id,
//               status,
//               hospitals (
//                 name,
//                 registration_number
//               )
//             `)
//             .eq('trial_id', trialId),
//         ]);

//       setTrial(trialData);
//       setFields(crf || []);

//       // normalize hospital rows (important for TS sanity)
//       const normalizedHospitals: HospitalRow[] = (th || []).map((h: any) => ({
//         hospital_id: h.hospital_id,
//         status: h.status,
//         hospitals: h.hospitals
//           ? {
//               name: h.hospitals.name,
//               registration_number: h.hospitals.registration_number,
//             }
//           : null,
//       }));

//       setHospitals(normalizedHospitals);
//       setLoading(false);
//     };

//     load();
//   }, [trialId]);

//   /* ---------------- END TRIAL ---------------- */

//   const endTrial = async () => {
//     if (!confirm('Are you sure you want to end this trial?')) return;

//     await supabase
//       .from('trials')
//       .update({ status: 'ended' })
//       .eq('id', trialId);

//     setTrial(prev => (prev ? { ...prev, status: 'ended' } : prev));
//   };

//   if (loading || !trial) {
//     return <p className="p-10 text-gray-600">Loading trial…</p>;
//   }

//   const acceptedHospitals = hospitals.filter(h => h.status === 'accepted');
//   const otherHospitals = hospitals.filter(h => h.status !== 'accepted');

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-6xl mx-auto space-y-8">
//         <div className="mb-4">
//           <button
//             onClick={() => router.push('/regulator/trials')}
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
//               {trial.title}
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               {trial.phase} • Status: {trial.status.toUpperCase()}
//             </p>
//             {trial.description && (
//               <p className="text-sm text-gray-700 mt-2">
//                 {trial.description}
//               </p>
//             )}
//           </div>

//           {trial.status === 'active' && (
//             <button
//               onClick={endTrial}
//               className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
//             >
//               End Trial
//             </button>
//           )}
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-2">
//           <TabButton active={activeTab === 'crf'} onClick={() => setActiveTab('crf')}>
//             CRF Fields
//           </TabButton>
//           <TabButton
//             active={activeTab === 'hospitals'}
//             onClick={() => setActiveTab('hospitals')}
//           >
//             Hospitals
//           </TabButton>
//           {/* <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
//             AI Analysis
//           </TabButton> */}
//         </div>

//         {/* CRF TAB */}
//         {activeTab === 'crf' && (
//           <section className="bg-white border rounded-xl p-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {fields.map(f => (
//                 <div key={f.id} className="border rounded-md px-4 py-3">
//                   <div className="text-sm font-medium">{f.field_label}</div>
//                   <div className="text-xs text-gray-600">
//                     {f.field_category} • {f.field_type}
//                     {f.unit && ` • ${f.unit}`}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* HOSPITALS TAB */}
//         {activeTab === 'hospitals' && (
//           <section className="space-y-6">

//             {/* Accepted */}
//             <div className="bg-white border rounded-xl p-6">
//               <h3 className="text-lg font-medium mb-6">
//                 Accepted Hospitals
//               </h3>

//               {acceptedHospitals.length === 0 ? (
//                 <p className="text-sm text-gray-900">
//                   No hospitals have accepted this trial yet.
//                 </p>
//               ) : (
//                 <div className="space-y-3">
//                   {acceptedHospitals.map(h => (
//                     <div
//                       key={h.hospital_id}
//                       onClick={() =>
//                         router.push(
//                           `/regulator/trials/${trialId}/hospitals/${h.hospital_id}`
//                         )
//                       }
//                       className="cursor-pointer border rounded-lg p-4
//                                  hover:bg-gray-50 transition"
//                     >
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {h.hospitals?.name ?? 'Unknown Hospital'}
//                           </div>
//                           <div className="text-xs text-gray-900">
//                             Reg No: {h.hospitals?.registration_number ?? '—'}
//                           </div>
//                         </div>

//                         <span className="text-xs font-medium px-2 py-1
//                                          rounded-full bg-green-100 text-green-700">
//                           ACCEPTED
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Pending / Rejected */}
//             <div className="bg-white border rounded-xl p-6">
//               <h3 className="text-lg font-medium mb-4">
//                 Pending / Rejected Hospitals
//               </h3>

//               {otherHospitals.length === 0 ? (
//                 <p className="text-sm text-gray-600">
//                   No pending or rejected hospitals.
//                 </p>
//               ) : (
//                 <div className="space-y-2">
//                   {otherHospitals.map(h => (
//                     <div
//                       key={h.hospital_id}
//                       className="border rounded-md px-4 py-3
//                                  bg-gray-50 text-sm text-gray-700"
//                     >
//                       {h.hospitals?.name ?? 'Unknown Hospital'} —{' '}
//                       <span className="capitalize">{h.status}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//           </section>
//         )}

//         {/* AI TAB */}
//         {/* {activeTab === 'ai' && (
//           <section className="bg-white border rounded-xl p-6">
//             <p className="text-gray-600">
//               AI analysis will be available once sufficient visit data
//               has been collected.
//             </p>
//           </section>
//         )} */}

//       </div>
//     </main>
//   );
// }

// /* ---------------- UI HELPERS ---------------- */

// function TabButton({
//   active,
//   onClick,
//   children,
// }: {
//   active: boolean;
//   onClick: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`px-4 py-2 rounded-md text-sm font-medium
//         ${active ? 'bg-blue-600 text-white' : 'bg-white border'}
//       `}
//     >
//       {children}
//     </button>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Activity, 
  Building2, 
  ClipboardList, 
  StopCircle, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Loader2,
  Database,
  Hash
} from 'lucide-react';

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
  const [isEnding, setIsEnding] = useState(false);

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
    if (!confirm('Are you absolutely sure you want to end this trial? This action will halt new data entry.')) return;
    setIsEnding(true);

    await supabase
      .from('trials')
      .update({ status: 'ended' })
      .eq('id', trialId);

    setTrial(prev => (prev ? { ...prev, status: 'ended' } : prev));
    setIsEnding(false);
  };

  /* ---------------- HELPERS ---------------- */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ended': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'A': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'B': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'C': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading || !trial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading trial parameters...</p>
      </div>
    );
  }

  const acceptedHospitals = hospitals.filter(h => h.status === 'accepted');
  const otherHospitals = hospitals.filter(h => h.status !== 'accepted');

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Navigation */}
        <div>
          <button
            onClick={() => router.push('/regulator/trials')}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Trials
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10 opacity-50"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {trial.phase}
                </span>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(trial.status)}`}>
                  {trial.status}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {trial.title}
              </h1>
              
              {trial.description && (
                <p className="text-slate-600 max-w-3xl leading-relaxed text-lg">
                  {trial.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Database className="w-4 h-4 text-slate-400" />
                  ID: <span className="font-mono text-slate-700">{trial.id.split('-')[0]}</span>
                </div>
                {(trial.start_date || trial.expected_end_date) && (
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {trial.start_date ? `Started: ${trial.start_date}` : 'Unscheduled'} 
                      {trial.expected_end_date && ` → Expected End: ${trial.expected_end_date}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {trial.status === 'active' && (
              <div className="shrink-0">
                <button
                  onClick={endTrial}
                  disabled={isEnding}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  {isEnding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StopCircle className="w-4 h-4" />
                  )}
                  {isEnding ? 'Halting Trial...' : 'Halt Trial Execution'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modern Segmented Tabs */}
        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setActiveTab('crf')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'crf'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Case Report Form (CRF)
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'hospitals'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Building2 className="w-4 h-4" /> Participating Sites
          </button>
        </div>

        <div className="transition-all duration-300">
          
          {/* ================= CRF TAB ================= */}
          {activeTab === 'crf' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Data Collection Schema</h3>
                  <p className="text-sm text-slate-500">The canonical fields required for every patient visit.</p>
                </div>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No CRF fields defined for this trial.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map(f => (
                    <div key={f.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getCategoryColor(f.field_category)}`}>
                          CAT {f.field_category}
                        </span>
                        {f.unit && (
                          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {f.unit}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{f.field_label}</div>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" /> {f.field_type.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ================= HOSPITALS TAB ================= */}
          {activeTab === 'hospitals' && (
            <section className="space-y-6">

              {/* Accepted Hospitals (Actionable) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900">Active Trial Sites</h3>
                </div>

                {acceptedHospitals.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500">No hospitals have accepted the invitation yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {acceptedHospitals.map(h => (
                      <div
                        key={h.hospital_id}
                        onClick={() => router.push(`/regulator/trials/${trialId}/hospitals/${h.hospital_id}`)}
                        className="group relative border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-900/5 cursor-pointer transition-all overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-center pl-2">
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {h.hospitals?.name ?? 'Unknown Hospital'}
                            </div>
                            <div className="text-sm text-slate-500 font-mono mt-0.5">
                              Reg: {h.hospitals?.registration_number ?? '—'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              PARTICIPATING
                            </span>
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:translate-x-1 transition-all">
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending / Rejected Hospitals (Read-only) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" /> Pending / Rejected
                </h3>

                {otherHospitals.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No pending or rejected invitations.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {otherHospitals.map(h => (
                      <div
                        key={h.hospital_id}
                        className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 bg-white"
                      >
                        <div className="truncate pr-3">
                          <div className="text-sm font-semibold text-slate-700 truncate">
                            {h.hospitals?.name ?? 'Unknown Hospital'}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {h.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>
          )}

        </div>
      </div>
    </main>
  );
}
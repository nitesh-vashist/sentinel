// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// export default function RegulatorHospitalsPage() {
//   const router = useRouter();
//   const [hospitals, setHospitals] = useState<any[]>([]);

//   useEffect(() => {
//     supabase
//       .from('hospitals')
//       .select('*')
//       .eq('verified', false)
//       .then(({ data }) => setHospitals(data || []));
//   }, []);

//   const approveHospital = async (id: string) => {
//     await supabase
//       .from('hospitals')
//       .update({
//         verified: true,
//         verified_at: new Date(),
//       })
//       .eq('id', id);

//     setHospitals(hospitals.filter(h => h.id !== id));
//   };

// return (
//   <main className="min-h-screen bg-gray-50 px-6 py-8">
//     <div className="max-w-4xl mx-auto">
//      <button
//       onClick={() => router.push('/regulator')}
//       className="flex items-center gap-2 text-sm text-gray-600
//                 hover:text-gray-900 transition"
//     >
//       <span className="text-lg">←</span>
//       <span>Back</span>
//     </button> 
//       <h1 className="text-2xl font-semibold text-gray-900 mb-1">
//         Hospital Verification
//       </h1>
//       <p className="text-sm text-gray-500 mb-6">
//         Review and approve hospitals requesting access to the system.
//       </p>

//       <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
//         {hospitals.length === 0 ? (
//           <div className="p-6 text-sm text-gray-500">
//             No hospitals pending verification.
//           </div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-gray-700">
//               <tr>
//                 <th className="text-left px-4 py-3 font-medium">
//                   Hospital Name
//                 </th>
//                 <th className="text-left px-4 py-3 font-medium">
//                   Registration Number
//                 </th>
//                 <th className="text-right px-4 py-3 font-medium">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {hospitals.map(h => (
//                 <tr key={h.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 text-gray-900">
//                     {h.name}
//                   </td>
//                   <td className="px-4 py-3 text-gray-700">
//                     {h.registration_number}
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <button
//                       onClick={() => approveHospital(h.id)}
//                       className="inline-flex items-center rounded-md bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700"
//                     >
//                       Approve
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   </main>
// );

// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Building2, 
  Hash, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  Clock
} from 'lucide-react';

/* ---------------- TYPES ---------------- */
type Hospital = {
  id: string;
  name: string;
  registration_number: string;
  created_at: string;
};

export default function RegulatorHospitalsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from('hospitals')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: true }) // Oldest requests first
      .then(({ data }) => {
        setHospitals(data || []);
        setIsLoading(false);
      });
  }, []);

  const approveHospital = async (id: string) => {
    // Set this specific row to a loading state
    setProcessingIds((prev) => new Set(prev).add(id));

    await supabase
      .from('hospitals')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Remove from UI and clear loading state
    setHospitals((prev) => prev.filter((h) => h.id !== id));
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Fetching verification queue...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Back Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/regulator')}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Dashboard
          </button>
        </div>

        {/* Page Title & Queue Counter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Action Required
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Site Verification Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve clinical trial sites requesting access to the Sentinel network.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Pending Requests</span>
            <div className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-sm font-bold">
              {hospitals.length}
            </div>
          </div>
        </div>

        {/* Verification Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Queue Empty</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                There are no hospitals pending verification at this time. All sites are up to date.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Institution Details</th>
                    <th className="px-6 py-4">Registration No.</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitals.map((h) => {
                    const isProcessing = processingIds.has(h.id);
                    
                    return (
                      <tr 
                        key={h.id} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Name Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {h.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Pending Review
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Registration Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            {h.registration_number}
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => approveHospital(h.id)}
                            disabled={isProcessing}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                              isProcessing
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Approve Site
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
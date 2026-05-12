// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// /* ---------------- TYPES ---------------- */

// type HospitalScore = {
//   id: string;
//   ai_run_id: string;
//   risk_score: number;
//   risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
//   statistical_score: number | null;
//   behavioral_score: number | null;
//   cross_patient_score: number | null;
//   peer_deviation_score: number | null;
//   created_at: string;
// };

// type AnomalySignal = {
//   id: string;
//   signal_type:
//     | 'statistical_abnormality'
//     | 'behavioral_anomaly'
//     | 'cross_patient_similarity'
//     | 'peer_deviation';
//   anomaly_score: number;
//   explanation: string;
// };

// /* ---------------- COMPONENT ---------------- */

// export default function RegulatorHospitalAIAnalysisPage() {
//   const { trialId, hospitalId } = useParams() as {
//     trialId: string;
//     hospitalId: string;
//   };

//   const router = useRouter();

//   const [score, setScore] = useState<HospitalScore | null>(null);
//   const [signals, setSignals] = useState<AnomalySignal[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- LOAD DATA ---------------- */

//   useEffect(() => {
//     const load = async () => {
//       // 1️⃣ fetch latest AI hospital score
//       const { data: scoreData } = await supabase
//         .from('ai_hospital_scores')
//         .select('*')
//         .eq('trial_id', trialId)
//         .eq('hospital_id', hospitalId)
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (!scoreData) {
//         setLoading(false);
//         return;
//       }

//       // 2️⃣ fetch anomaly signals for this AI run
//       const { data: signalData } = await supabase
//         .from('ai_anomaly_signals')
//         .select('id, signal_type, anomaly_score, explanation')
//         .eq('ai_run_id', scoreData.ai_run_id)
//         .eq('trial_id', trialId)
//         .eq('hospital_id', hospitalId)
//         .order('created_at', { ascending: true });

//       setScore(scoreData);
//       setSignals(signalData ?? []);
//       setLoading(false);
//     };

//     load();
//   }, [trialId, hospitalId]);

//   if (loading) {
//     return <p className="p-10 text-gray-600">Loading AI analysis…</p>;
//   }

//   if (!score) {
//     return (
//       <p className="p-10 text-gray-600">
//         No AI analysis available for this hospital.
//       </p>
//     );
//   }

//   /* ---------------- HELPERS ---------------- */

//   const sectionTitle = (title: string, subtitle: string) => (
//     <div className="mb-3">
//       <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//       <p className="text-xs text-gray-600">{subtitle}</p>
//     </div>
//   );

//   const scoreRow = (label: string, value: number | null) => (
//     <div className="flex justify-between text-sm">
//       <span className="text-gray-600">{label}</span>
//       <span className="font-medium">
//         {value !== null ? value.toFixed(2) : '—'}
//       </span>
//     </div>
//   );

//   /* ---------------- RENDER ---------------- */

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-5xl mx-auto space-y-8">

//         {/* Back */}
//         <button
//           onClick={() => router.back()}
//           className="text-sm text-blue-600 hover:underline"
//         >
//           ← Back to Hospital
//         </button>

//         {/* Overall Risk */}
//         <section className="bg-white border rounded-xl p-6">
//           {sectionTitle(
//             'Overall AI Risk Assessment',
//             'Unified integrity risk score for this hospital'
//           )}

//           <div className="flex items-center justify-between">
//             <div>
//               <div
//                 className={`text-2xl font-semibold ${
//                   score.risk_level === 'LOW'
//                     ? 'text-green-700'
//                     : score.risk_level === 'MEDIUM'
//                     ? 'text-yellow-700'
//                     : 'text-red-700'
//                 }`}
//               >
//                 {score.risk_level} RISK
//               </div>
//               <div className="text-sm text-gray-600 mt-1">
//                 Risk Score: {score.risk_score} / 100
//               </div>
//             </div>

//             <div className="text-xs text-gray-500 max-w-sm">
//               This score is computed by combining multiple independent
//               integrity signals derived from immutable trial data.
//             </div>
//           </div>
//         </section>

//         {/* Task-wise Breakdown */}
//         <section className="bg-white border rounded-xl p-6">
//           {sectionTitle(
//             'Integrity Dimension Breakdown',
//             'Contribution of each AI task to the overall risk'
//           )}

//           <div className="space-y-2">
//             {scoreRow('Statistical Abnormalities (WHAT)', score.statistical_score)}
//             {scoreRow('Behavioral Anomalies (HOW)', score.behavioral_score)}
//             {scoreRow('Cross-Patient Templating (WHO)', score.cross_patient_score)}
//             {scoreRow('Peer Deviation (HOSPITAL vs PEERS)', score.peer_deviation_score)}
//           </div>
//         </section>

//         {/* Detected Signals */}
//         <section className="bg-white border rounded-xl p-6">
//           {sectionTitle(
//             'Detected Anomaly Signals',
//             'Human-readable explanations generated by the AI engine'
//           )}

//           {signals.length === 0 ? (
//             <p className="text-sm text-gray-600">
//               No significant anomalies were detected for this hospital.
//             </p>
//           ) : (
//             <ul className="space-y-3">
//               {signals.map(sig => (
//                 <li
//                   key={sig.id}
//                   className="border rounded-lg p-4 bg-gray-50"
//                 >
//                   <div className="text-sm font-medium text-gray-900">
//                     {sig.signal_type.replace(/_/g, ' ').toUpperCase()}
//                   </div>
//                   <div className="text-xs text-gray-600 mt-1">
//                     {sig.explanation}
//                   </div>
//                   <div className="text-xs text-gray-500 mt-2">
//                     Anomaly Score: {sig.anomaly_score.toFixed(2)}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>

//         {/* Transparency */}
//         <section className="bg-white border rounded-xl p-6">
//           {sectionTitle(
//             'AI Transparency',
//             'How this analysis should be interpreted'
//           )}

//           <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
//             <li>
//               This system does not modify, block, or reject trial data.
//             </li>
//             <li>
//               All analysis is performed only on cryptographically locked visits.
//             </li>
//             <li>
//               Scores represent risk signals, not final regulatory decisions.
//             </li>
//             <li>
//               Human review is required before any enforcement action.
//             </li>
//           </ul>
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
  BrainCircuit, 
  ShieldAlert, 
  Info, 
  Activity, 
  Users, 
  Clock, 
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

/* ---------------- TYPES ---------------- */

type HospitalScore = {
  id: string;
  ai_run_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  statistical_score: number | null;
  behavioral_score: number | null;
  cross_patient_score: number | null;
  peer_deviation_score: number | null;
  created_at: string;
};

type AnomalySignal = {
  id: string;
  signal_type:
    | 'statistical_abnormality'
    | 'behavioral_anomaly'
    | 'cross_patient_similarity'
    | 'peer_deviation';
  anomaly_score: number;
  explanation: string;
};

/* ---------------- COMPONENT ---------------- */

export default function RegulatorHospitalAIAnalysisPage() {
  const { trialId, hospitalId } = useParams() as {
    trialId: string;
    hospitalId: string;
  };

  const router = useRouter();

  const [score, setScore] = useState<HospitalScore | null>(null);
  const [signals, setSignals] = useState<AnomalySignal[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ fetch latest AI hospital score
      const { data: scoreData } = await supabase
        .from('ai_hospital_scores')
        .select('*')
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!scoreData) {
        setLoading(false);
        return;
      }

      // 2️⃣ fetch anomaly signals for this AI run
      const { data: signalData } = await supabase
        .from('ai_anomaly_signals')
        .select('id, signal_type, anomaly_score, explanation')
        .eq('ai_run_id', scoreData.ai_run_id)
        .eq('trial_id', trialId)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: true });

      setScore(scoreData);
      setSignals(signalData ?? []);
      setLoading(false);
    };

    load();
  }, [trialId, hospitalId]);

  /* ---------------- HELPERS ---------------- */

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'statistical_abnormality': return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'behavioral_anomaly': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cross_patient_similarity': return <Users className="w-5 h-5 text-pink-500" />;
      case 'peer_deviation': return <GitCompare className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
  };

  // Converts 0-1 float to a 0-100 percentage for the UI bars
  const scoreRow = (label: string, rawValue: number | null, colorClass: string) => {
    const percentage = rawValue !== null ? Math.min(Math.max(rawValue * 100, 0), 100) : 0;
    
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 font-medium">{label}</span>
          <span className="font-bold text-slate-900">
            {rawValue !== null ? percentage.toFixed(1) : '—'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Running TIIE Forensic Engine...</p>
      </div>
    );
  }

  if (!score) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 flex flex-col items-center">
        <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">No AI Analysis Available</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center mb-6">
          The Trial Integrity Intelligence Engine has not yet processed data for this hospital, or no locked visits exist to analyze.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Hospital
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header & Back Action */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Hospital Details
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-600">
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            TIIE Engine v1.0
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Overall Risk & Dimensions */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Overall Risk Card */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 opacity-50"></div>
              
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Overall Risk Assessment
              </h3>

              <div className="flex flex-col items-center justify-center py-4">
                <div className={`text-sm font-bold px-4 py-1.5 rounded-full border mb-4 shadow-sm ${getRiskColor(score.risk_level)}`}>
                  {score.risk_level} RISK
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">
                    {score.risk_score.toFixed(0)}
                  </span>
                  <span className="text-lg font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center leading-relaxed">
                Unified integrity score synthesized from immutable trial data anchors.
              </div>
            </section>

            {/* Task-wise Breakdown */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Integrity Dimensions</h3>
                  <p className="text-xs text-slate-500">Sub-scores scaled to 100</p>
                </div>
              </div>

              <div className="space-y-5">
                {scoreRow('Statistical (WHAT)', score.statistical_score, 'bg-indigo-500')}
                {scoreRow('Behavioral (HOW)', score.behavioral_score, 'bg-orange-500')}
                {scoreRow('Relational (WHO)', score.cross_patient_score, 'bg-pink-500')}
                {scoreRow('Peer Deviation', score.peer_deviation_score, 'bg-blue-500')}
              </div>
            </section>

          </div>

          {/* Right Column: Signals & Transparency */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Detected Signals */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detected Anomalies</h3>
                  <p className="text-sm text-slate-500">Forensic explanations generated by the AI</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
              </div>

              {signals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                  <p className="text-slate-900 font-medium">No Significant Anomalies</p>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    The AI engine did not detect any high-confidence deviations in the current locked data.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {signals.map(sig => (
                    <li
                      key={sig.id}
                      className="group flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all"
                    >
                      <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          {getSignalIcon(sig.signal_type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-bold text-slate-900">
                            {sig.signal_type.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-xs font-mono font-bold px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 shadow-sm">
                            Score: {(sig.anomaly_score * 100).toFixed(1)}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {sig.explanation}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Transparency Disclaimer */}
            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-blue-900 mb-2">AI Transparency & Limitations</h3>
                  <ul className="text-sm text-blue-800 space-y-1.5 list-disc pl-4 marker:text-blue-400">
                    <li>This system does not modify, block, or reject trial data.</li>
                    <li>Analysis is performed strictly on cryptographically locked and anchored visits.</li>
                    <li>Risk scores represent statistical signals, not definitive proof of fraud.</li>
                    <li>Human regulatory review is required before initiating formal audits.</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
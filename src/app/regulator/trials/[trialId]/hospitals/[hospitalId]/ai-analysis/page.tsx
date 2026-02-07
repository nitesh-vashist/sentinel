'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

  if (loading) {
    return <p className="p-10 text-gray-600">Loading AI analysis…</p>;
  }

  if (!score) {
    return (
      <p className="p-10 text-gray-600">
        No AI analysis available for this hospital.
      </p>
    );
  }

  /* ---------------- HELPERS ---------------- */

  const sectionTitle = (title: string, subtitle: string) => (
    <div className="mb-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );

  const scoreRow = (label: string, value: number | null) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">
        {value !== null ? value.toFixed(2) : '—'}
      </span>
    </div>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Hospital
        </button>

        {/* Overall Risk */}
        <section className="bg-white border rounded-xl p-6">
          {sectionTitle(
            'Overall AI Risk Assessment',
            'Unified integrity risk score for this hospital'
          )}

          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-2xl font-semibold ${
                  score.risk_level === 'LOW'
                    ? 'text-green-700'
                    : score.risk_level === 'MEDIUM'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}
              >
                {score.risk_level} RISK
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Risk Score: {score.risk_score} / 100
              </div>
            </div>

            <div className="text-xs text-gray-500 max-w-sm">
              This score is computed by combining multiple independent
              integrity signals derived from immutable trial data.
            </div>
          </div>
        </section>

        {/* Task-wise Breakdown */}
        <section className="bg-white border rounded-xl p-6">
          {sectionTitle(
            'Integrity Dimension Breakdown',
            'Contribution of each AI task to the overall risk'
          )}

          <div className="space-y-2">
            {scoreRow('Statistical Abnormalities (WHAT)', score.statistical_score)}
            {scoreRow('Behavioral Anomalies (HOW)', score.behavioral_score)}
            {scoreRow('Cross-Patient Templating (WHO)', score.cross_patient_score)}
            {scoreRow('Peer Deviation (HOSPITAL vs PEERS)', score.peer_deviation_score)}
          </div>
        </section>

        {/* Detected Signals */}
        <section className="bg-white border rounded-xl p-6">
          {sectionTitle(
            'Detected Anomaly Signals',
            'Human-readable explanations generated by the AI engine'
          )}

          {signals.length === 0 ? (
            <p className="text-sm text-gray-600">
              No significant anomalies were detected for this hospital.
            </p>
          ) : (
            <ul className="space-y-3">
              {signals.map(sig => (
                <li
                  key={sig.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {sig.signal_type.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {sig.explanation}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Anomaly Score: {sig.anomaly_score.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Transparency */}
        <section className="bg-white border rounded-xl p-6">
          {sectionTitle(
            'AI Transparency',
            'How this analysis should be interpreted'
          )}

          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>
              This system does not modify, block, or reject trial data.
            </li>
            <li>
              All analysis is performed only on cryptographically locked visits.
            </li>
            <li>
              Scores represent risk signals, not final regulatory decisions.
            </li>
            <li>
              Human review is required before any enforcement action.
            </li>
          </ul>
        </section>

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type CRFField = {
  id: string;
  field_key: string;
  field_label: string;
  field_type: 'text' | 'number' | 'boolean' | 'enum';
  unit?: string | null;
};

type VisitValue = {
  crf_field_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
};

export default function VisitDetailPage() {
  const { trialId, patientId, visitId } = useParams() as {
    trialId: string;
    patientId: string;
    visitId: string;
  };

  const router = useRouter();

  const [visit, setVisit] = useState<any>(null);
  const [fields, setFields] = useState<CRFField[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD VISIT ---------------- */

  useEffect(() => {
    const load = async () => {
      // auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // fetch visit
      const { data: visitRow } = await supabase
        .from('visits')
        .select('id, visit_number, visit_date')
        .eq('id', visitId)
        .single();

      if (!visitRow) {
        router.push(`/hospital/trials/${trialId}/patients/${patientId}`);
        return;
      }

      setVisit(visitRow);

      // fetch CRF fields
      const { data: crfFields } = await supabase
        .from('trial_crf_fields')
        .select('id, field_key, field_label, field_type, unit')
        .eq('trial_id', trialId)
        .order('field_category');

      setFields(crfFields || []);

      // fetch visit values
      const { data: visitValues } = await supabase
        .from('visit_values')
        .select('*')
        .eq('visit_id', visitId);

      const mapped: Record<string, any> = {};

      (visitValues || []).forEach((v: VisitValue) => {
        mapped[v.crf_field_id] =
          v.value_text ??
          v.value_number ??
          v.value_boolean ??
          null;
      });

      setValues(mapped);
      setLoading(false);
    };

    load();
  }, [trialId, patientId, visitId, router]);

  if (loading) {
    return <p className="p-10 text-gray-600">Loading visit…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Visit {visit.visit_number}
          </h1>
          <p className="text-sm text-gray-600">
            {new Date(visit.visit_date).toLocaleDateString()}
          </p>
        </div>

        {/* Values */}
        <section className="bg-white border rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {fields.map(field => (
              <div
                key={field.id}
                className="border rounded-md px-4 py-3 bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900">
                  {field.field_label}
                </div>

                <div className="text-sm text-gray-700 mt-1">
                  {values[field.id] !== null && values[field.id] !== undefined
                    ? String(values[field.id])
                    : '—'}
                  {field.unit && (
                    <span className="text-xs text-gray-500 ml-1">
                      {field.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Back */}
        <button
          onClick={() =>
            router.push(
              `/hospital/trials/${trialId}/patients/${patientId}`
            )
          }
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to patient
        </button>

      </div>
    </main>
  );
}

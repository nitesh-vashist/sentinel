'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck,
  Building
} from 'lucide-react';

type Hospital = {
  id: string;
  name: string;
  registration_number: string;
};

export default function SelectHospitalsPage() {
  const router = useRouter();
  const params = useParams();
  const trialId = params.trialId as string;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, registration_number')
        .eq('verified', true);

      if (error) {
        setError(error.message);
        console.log('Error fetching hospitals:', error);
        setLoading(false);
        return;
      }

      setHospitals(data || []);
      setLoading(false);
    };

    fetchHospitals();
  }, []);

  const toggleHospital = (hospitalId: string) => {
    setSelectedHospitalIds((prev) =>
      prev.includes(hospitalId)
        ? prev.filter((id) => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (selectedHospitalIds.length === 0) {
      setError('Please select at least one verified hospital to participate.');
      return;
    }

    setIsSubmitting(true);

    const inserts = selectedHospitalIds.map((hospitalId) => ({
      trial_id: trialId,
      hospital_id: hospitalId,
      status: 'pending',
    }));

    const { error: insertError } = await supabase
      .from('trial_hospitals')
      .insert(inserts);

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    // Next step: CRF definition
    router.push(`/regulator/trial/${trialId}/crf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Retrieving verified clinical sites...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Stepper */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700">1</span>
            <span>Create Trial</span>
            <div className="w-8 h-px bg-slate-300"></div>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow-sm">2</span>
            <span className="text-slate-900">Select Sites</span>
            <div className="w-8 h-px bg-slate-300"></div>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500">3</span>
            <span>Define CRF</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Assign Clinical Sites
          </h1>
          <p className="mt-2 text-slate-600">
            Select the verified hospitals that will participate in this Phase 3 trial. 
            Selected sites will receive a secure invitation to join the trial workspace.
          </p>
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-slate-700">Participating Sites</span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {selectedHospitalIds.length} Selected
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Hospital Grid */}
        {hospitals.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No verified hospitals</h3>
            <p className="mt-1 text-slate-500">There are currently no fully verified sites available to participate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hospitals.map((hospital) => {
              const isSelected = selectedHospitalIds.includes(hospital.id);
              
              return (
                <div
                  key={hospital.id}
                  onClick={() => toggleHospital(hospital.id)}
                  className={`relative cursor-pointer group rounded-2xl p-5 border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-900/5' 
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-5 right-5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <div className="pr-10">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Verified Site
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold mb-1 transition-colors ${
                      isSelected ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {hospital.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Reg: {hospital.registration_number}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Footer */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedHospitalIds.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isSubmitting || selectedHospitalIds.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Assigning Sites...
              </>
            ) : (
              <>
                Confirm Selection & Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </main>
  );
}
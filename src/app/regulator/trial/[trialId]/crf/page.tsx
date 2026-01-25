// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// type CRFField = {
//   field_key: string;
//   field_label: string;
//   field_type: string;
//   field_category: 'A' | 'B' | 'C';
//   unit?: string | null;
//   allowed_values?: string[] | null;
// };

// const generateFieldKey = (label: string) =>
//   label
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, '_')
//     .replace(/^_|_$/g, '');

// export default function CRFPage() {
//   const { trialId } = useParams() as { trialId: string };

//   const [globalFields, setGlobalFields] = useState<CRFField[]>([]);
//   const [existingTypeC, setExistingTypeC] = useState<CRFField[]>([]);
//   const [pendingTypeC, setPendingTypeC] = useState<CRFField[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [newField, setNewField] = useState({
//     field_label: '',
//     field_type: 'text',
//     unit: '',
//     enumValues: '',
//   });

//   /* ---------------- LOAD FIELDS ---------------- */

//   useEffect(() => {
//     const loadCRF = async () => {
//       const [{ data: global }, { data: typeC }] = await Promise.all([
//         supabase.from('global_crf_fields').select('*').order('field_category'),
//         supabase
//           .from('trial_crf_fields')
//           .select('*')
//           .eq('trial_id', trialId)
//           .order('created_at'),
//       ]);

//       setGlobalFields(global || []);
//       setExistingTypeC(typeC || []);
//       setLoading(false);
//     };

//     loadCRF();
//   }, [trialId]);

//   /* ---------------- ADD TYPE C (TEMP) ---------------- */

//   const addTypeCFieldTemp = () => {
//     if (!newField.field_label) return;

//     const field_key = generateFieldKey(newField.field_label);

//     let allowed_values: string[] | null = null;
//     if (newField.field_type === 'enum') {
//       allowed_values = newField.enumValues
//         .split(',')
//         .map(v => v.trim())
//         .filter(Boolean);
//     }

//     setPendingTypeC(prev => [
//       ...prev,
//       {
//         field_key,
//         field_label: newField.field_label,
//         field_type: newField.field_type,
//         field_category: 'C',
//         unit: newField.unit || null,
//         allowed_values,
//       },
//     ]);

//     setNewField({
//       field_label: '',
//       field_type: 'text',
//       unit: '',
//       enumValues: '',
//     });
//   };

//   /* ---------------- SUBMIT TYPE C ---------------- */

//   const submitCRFFields = async () => {
//     if (pendingTypeC.length === 0) return;

//     const toInsert = pendingTypeC.map(f => ({
//       trial_id: trialId,
//       field_key: f.field_key,
//       field_label: f.field_label,
//       field_type: f.field_type,
//       field_category: 'C',
//       unit: f.unit,
//       allowed_values: f.allowed_values,
//       is_required: true,
//     }));

//     await supabase.from('trial_crf_fields').insert(toInsert);

//     const { data } = await supabase
//       .from('trial_crf_fields')
//       .select('*')
//       .eq('trial_id', trialId)
//       .order('created_at');

//     setExistingTypeC(data || []);
//     setPendingTypeC([]);
//   };

//   if (loading) {
//     return <p className="p-10 text-gray-600">Loading CRF…</p>;
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-5xl mx-auto space-y-8">

//         <h1 className="text-2xl font-semibold text-gray-900">
//           Define Case Report Form (CRF)
//         </h1>

//         {/* GLOBAL A & B */}
//         <section className="bg-white border rounded-xl p-6">
//           <h3 className="text-lg font-medium mb-4">
//             Global Fields (Type A & B)
//           </h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {globalFields.map(f => (
//               <div
//                 key={f.field_key}
//                 className="border rounded-md px-4 py-3 bg-gray-50"
//               >
//                 <div className="text-sm font-medium text-gray-900">
//                   {f.field_label}
//                 </div>
//                 <div className="text-xs text-gray-600">
//                   {f.field_type}
//                   {f.unit && ` • ${f.unit}`}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ADD TYPE C */}
//         <section className="bg-white border rounded-xl p-6">
//           <h3 className="text-lg font-medium mb-4">
//             Add Trial-Specific Field (Type C)
//           </h3>

//           <div className="space-y-3">
//             <input
//               placeholder="Field label"
//               value={newField.field_label}
//               onChange={e =>
//                 setNewField({ ...newField, field_label: e.target.value })
//               }
//               className="w-full rounded-md border px-3 py-2 text-sm
//                          text-gray-900 caret-blue-600
//                          placeholder:text-gray-600"
//             />

//             <select
//               value={newField.field_type}
//               onChange={e =>
//                 setNewField({ ...newField, field_type: e.target.value })
//               }
//               className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
//             >
//               <option value="text">Text</option>
//               <option value="number">Number</option>
//               <option value="boolean">Boolean</option>
//               <option value="enum">Enum</option>
//             </select>

//             {newField.field_type === 'enum' && (
//               <input
//                 placeholder="Allowed values (comma separated)"
//                 value={newField.enumValues}
//                 onChange={e =>
//                   setNewField({ ...newField, enumValues: e.target.value })
//                 }
//                 className="w-full rounded-md border px-3 py-2 text-sm
//                            text-gray-900 caret-blue-600
//                            placeholder:text-gray-600"
//               />
//             )}

//             <input
//               placeholder="Unit (optional)"
//               value={newField.unit}
//               onChange={e =>
//                 setNewField({ ...newField, unit: e.target.value })
//               }
//               className="w-full rounded-md border px-3 py-2 text-sm
//                          text-gray-900 caret-blue-600
//                          placeholder:text-gray-600"
//             />

//             <button
//               onClick={addTypeCFieldTemp}
//               className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
//             >
//               Add Field
//             </button>
//           </div>
//         </section>

//         {/* EXISTING TYPE C */}
//         {existingTypeC.length > 0 && (
//           <section className="bg-white border rounded-xl p-6">
//             <h3 className="text-lg font-medium mb-4">
//               Existing Trial-Specific Fields
//             </h3>

//             <div className="space-y-3">
//               {existingTypeC.map(f => (
//                 <div key={f.field_key} className="border rounded-md px-4 py-3">
//                   <div className="text-sm font-medium text-gray-900">
//                     {f.field_label}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     {f.field_type}
//                     {f.unit && ` • ${f.unit}`}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* PENDING TYPE C */}
//         {pendingTypeC.length > 0 && (
//           <section className="bg-white border rounded-xl p-6">
//             <h3 className="text-lg font-medium mb-4">
//               Pending Trial-Specific Fields
//             </h3>

//             <div className="space-y-3">
//               {pendingTypeC.map((f, idx) => (
//                 <div key={idx} className="border rounded-md px-4 py-3">
//                   <div className="text-sm font-medium text-gray-900">
//                     {f.field_label}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     {f.field_type}
//                     {f.unit && ` • ${f.unit}`}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* SUBMIT */}
//         <button
//           onClick={submitCRFFields}
//           className="bg-green-600 text-white px-6 py-3 rounded-md font-medium"
//         >
//           Submit CRF Fields
//         </button>

//       </div>
//     </main>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type CRFField = {
  field_key: string;
  field_label: string;
  field_type: string;
  field_category: 'A' | 'B' | 'C';
  unit?: string | null;
  allowed_values?: string[] | null;
};

const generateFieldKey = (label: string) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export default function CRFPage() {
  const { trialId } = useParams() as { trialId: string };
  const router = useRouter();

  const [globalFields, setGlobalFields] = useState<CRFField[]>([]);
  const [existingTypeC, setExistingTypeC] = useState<CRFField[]>([]);
  const [pendingTypeC, setPendingTypeC] = useState<CRFField[]>([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newField, setNewField] = useState({
    field_label: '',
    field_type: 'text',
    unit: '',
    enumValues: '',
  });

  /* ---------------- LOAD FIELDS ---------------- */

  useEffect(() => {
    const loadCRF = async () => {
      const [{ data: global }, { data: typeC }] = await Promise.all([
        supabase.from('global_crf_fields').select('*').order('field_category'),
        supabase
          .from('trial_crf_fields')
          .select('*')
          .eq('trial_id', trialId)
          .order('created_at'),
      ]);

      setGlobalFields(global || []);
      setExistingTypeC(typeC || []);
      setLoading(false);
    };

    loadCRF();
  }, [trialId]);

  /* ---------------- ADD TYPE C (TEMP) ---------------- */

  const addTypeCFieldTemp = () => {
    if (!newField.field_label) return;

    const field_key = generateFieldKey(newField.field_label);

    let allowed_values: string[] | null = null;
    if (newField.field_type === 'enum') {
      allowed_values = newField.enumValues
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }

    setPendingTypeC(prev => [
      ...prev,
      {
        field_key,
        field_label: newField.field_label,
        field_type: newField.field_type,
        field_category: 'C',
        unit: newField.unit || null,
        allowed_values,
      },
    ]);

    setNewField({
      field_label: '',
      field_type: 'text',
      unit: '',
      enumValues: '',
    });
  };

  /* ---------------- SUBMIT TYPE C ---------------- */

  const submitCRFFields = async () => {
    if (pendingTypeC.length === 0) return;

    try {
      setSubmitting(true);

      const toInsert = pendingTypeC.map(f => ({
        trial_id: trialId,
        field_key: f.field_key,
        field_label: f.field_label,
        field_type: f.field_type,
        field_category: 'C',
        unit: f.unit,
        allowed_values: f.allowed_values,
        is_required: true,
      }));

      const { error } = await supabase
        .from('trial_crf_fields')
        .insert(toInsert);

      if (error) throw error;

      setSuccess(true);

      setTimeout(() => {
        router.push('/regulator');
      }, 1500);

    } catch (err) {
      console.error('CRF submission failed:', err);
      alert('Failed to submit CRF fields. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-10 text-gray-600">Loading CRF…</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-gray-900">
          Define Case Report Form (CRF)
        </h1>

        {/* GLOBAL A & B */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            Global Fields (Type A & B)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {globalFields.map(f => (
              <div
                key={f.field_key}
                className="border rounded-md px-4 py-3 bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900">
                  {f.field_label}
                </div>
                <div className="text-xs text-gray-600">
                  {f.field_type}
                  {f.unit && ` • ${f.unit}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ADD TYPE C */}
        <section className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            Add Trial-Specific Field (Type C)
          </h3>

          <div className="space-y-3">
            <input
              placeholder="Field label"
              value={newField.field_label}
              onChange={e =>
                setNewField({ ...newField, field_label: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2 text-sm
                         text-gray-900 caret-blue-600
                         placeholder:text-gray-600"
            />

            <select
              value={newField.field_type}
              onChange={e =>
                setNewField({ ...newField, field_type: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="enum">Enum</option>
            </select>

            {newField.field_type === 'enum' && (
              <input
                placeholder="Allowed values (comma separated)"
                value={newField.enumValues}
                onChange={e =>
                  setNewField({ ...newField, enumValues: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2 text-sm
                           text-gray-900 caret-blue-600
                           placeholder:text-gray-600"
              />
            )}

            <input
              placeholder="Unit (optional)"
              value={newField.unit}
              onChange={e =>
                setNewField({ ...newField, unit: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2 text-sm
                         text-gray-900 caret-blue-600
                         placeholder:text-gray-600"
            />

            <button
              onClick={addTypeCFieldTemp}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Add Field
            </button>
          </div>
        </section>

        {/* EXISTING TYPE C */}
        {existingTypeC.length > 0 && (
          <section className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">
              Existing Trial-Specific Fields
            </h3>

            <div className="space-y-3">
              {existingTypeC.map(f => (
                <div key={f.field_key} className="border rounded-md px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {f.field_label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {f.field_type}
                    {f.unit && ` • ${f.unit}`}

                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PENDING TYPE C */}
        {pendingTypeC.length > 0 && (
          <section className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">
              Pending Trial-Specific Fields
            </h3>

            <div className="space-y-3">
              {pendingTypeC.map((f, idx) => (
                <div key={idx} className="border rounded-md px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {f.field_label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {f.field_type}
                    {f.unit && ` • ${f.unit}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          rounded-md px-4 py-3 text-sm">
            ✅ CRF successfully defined. Redirecting to dashboard…
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={submitCRFFields}
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-3 rounded-md font-medium
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving CRF…' : 'Submit CRF Fields'}
        </button>

      </div>
    </main>
  );
}

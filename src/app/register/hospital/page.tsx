// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// export default function HospitalRegisterPage() {
//   const router = useRouter();

//   const [name, setName] = useState('');
//   const [registrationNumber, setRegistrationNumber] = useState('');
//   const [country, setCountry] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const handleRegister = async () => {
//     setError(null);

//     // 1️⃣ Create auth user
//     const { data, error: authError } =
//       await supabase.auth.signUp({
//         email,
//         password,
//       });

//     if (authError || !data.user) {
//       setError(authError?.message || 'Signup failed');
//       return;
//     }

//     const userId = data.user.id;

//     // 2️⃣ Create hospital record
//     const { data: hospital, error: hospitalError } =
//       await supabase
//         .from('hospitals')
//         .insert({
//           name,
//           registration_number: registrationNumber,
//           country,
//         })
//         .select()
//         .single();

//     if (hospitalError || !hospital) {
//       setError(hospitalError?.message || 'Hospital creation failed');
//       return;
//     }

//     // 3️⃣ Create user profile
//     const { error: userError } =
//       await supabase.from('users').insert({
//         id: userId,
//         role: 'hospital',
//         hospital_id: hospital.id,
//         full_name: name,
//       });

//     if (userError) {
//       setError(userError.message);
//       return;
//     }

//     router.push('/pending-approval');
//   };

// return (
//   <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//     <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-6">
      
//       <h1 className="text-2xl font-semibold text-gray-900 mb-1">
//         Hospital Registration
//       </h1>
//       <p className="text-sm text-gray-500 mb-6">
//         Register your hospital to participate in approved clinical trials.
//       </p>

//       <div className="space-y-4">
//         {/* Hospital Name */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Hospital Name
//           </label>
//           <input
//             type="text"
//             placeholder="e.g. Apollo Medical Center"
//             onChange={e => setName(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                        text-gray-900 caret-blue-600
//                        placeholder:text-gray-600
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Registration Number */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Registration Number
//           </label>
//           <input
//             type="text"
//             placeholder="Official hospital registration ID"
//             onChange={e => setRegistrationNumber(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                        text-gray-900 caret-blue-600
//                        placeholder:text-gray-600
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Country */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Country
//           </label>
//           <input
//             type="text"
//             placeholder="e.g. India"
//             onChange={e => setCountry(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                        text-gray-900 caret-blue-600
//                        placeholder:text-gray-600
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Official Email
//           </label>
//           <input
//             type="email"
//             placeholder="admin@hospital.org"
//             onChange={e => setEmail(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                        text-gray-900 caret-blue-600
//                        placeholder:text-gray-600
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Password */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <input
//             type="password"
//             placeholder="Create a secure password"
//             onChange={e => setPassword(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                        text-gray-900 caret-blue-600
//                        placeholder:text-gray-600
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Error */}
//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </p>
//         )}

//         {/* Submit */}
//         <button
//           onClick={handleRegister}
//           className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700"
//         >
//           Register Hospital
//         </button>
//       </div>
//     </div>
//   </main>
// );

// }
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Mail, 
  Lock, 
  Globe, 
  Hash, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function HospitalRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // 1️⃣ Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message || 'Signup failed');
      setIsSubmitting(false);
      return;
    }

    const userId = data.user.id;

    // 2️⃣ Create hospital record
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .insert({
        name,
        registration_number: registrationNumber,
        country,
      })
      .select()
      .single();

    if (hospitalError || !hospital) {
      setError(hospitalError?.message || 'Hospital creation failed');
      setIsSubmitting(false);
      return;
    }

    // 3️⃣ Create user profile
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      role: 'hospital',
      hospital_id: hospital.id,
      full_name: name,
    });

    if (userError) {
      setError(userError.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/pending-approval');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-slate-50 -z-10"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-lg relative">
        
        {/* Back Navigation */}
        <Link 
          href="/login" 
          className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {/* Decorative shadow layer */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-200 to-indigo-100 rounded-[2rem] blur opacity-50"></div>

        <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
          
          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Site Registration
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Apply to join the Sentinel network as an approved clinical trial site.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Hospital Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Institution Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building2 className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Medical Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Registration Number & Country Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Registration ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Hash className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Official ID"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name || !email || !password || !country || !registrationNumber}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-2 ${
                isSubmitting || !name || !email || !password || !country || !registrationNumber
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Application...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
          </form>

          {/* Policy text */}
          <p className="text-center text-xs text-slate-400 mt-6 px-4">
            By registering, you agree to submit to cryptographic verification and Sentinel network policies.
          </p>

        </div>
      </div>
    </main>
  );
}
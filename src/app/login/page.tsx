// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const handleLogin = async () => {
//     setError(null);

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setError(error.message);
//       return;
//     }

//     router.push('/redirect');
//   };

// return (
//   <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
//     <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">

//       {/* ================= LEFT SIDE – DEMO CARDS ================= */}
//       <div className="space-y-6">

//         <div>
//           <h2 className="text-3xl font-semibold text-gray-900">
//             Sentinel Demo Access
//           </h2>
//           <p className="text-sm text-gray-600 mt-2">
//             Use the demo accounts below to explore regulator and hospital workflows.
//           </p>
//         </div>

//         <div className="space-y-6">

//           {/* Demo Regulator */}
//           <div
//             onClick={() => {
//               setEmail("demoregulator@gmail.com");
//               setPassword("demo123");
//             }}
//             className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500
//                        hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
//           >
//             <div className="bg-white rounded-2xl p-6">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg">
//                   🏛️
//                 </div>
//                 <div className="text-lg font-semibold text-gray-900">
//                   Demo Regulator
//                 </div>
//               </div>

//               <div className="text-sm text-gray-600 space-y-1">
//                 <div><span className="font-medium">Email:</span> demoregulator@gmail.com</div>
//                 <div><span className="font-medium">Password:</span> demo123</div>
//               </div>

//               <p className="text-xs text-blue-600 mt-3">
//                 Click to auto-fill credentials
//               </p>
//             </div>
//           </div>

//           {/* Demo Hospital */}
//           <div
//             onClick={() => {
//               setEmail("hospital1@gmail.com");
//               setPassword("hospital1");
//             }}
//             className="relative p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500
//                        hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
//           >
//             <div className="bg-white rounded-2xl p-6">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-lg">
//                   🏥
//                 </div>
//                 <div className="text-lg font-semibold text-gray-900">
//                   Demo Hospital
//                 </div>
//               </div>

//               <div className="text-sm text-gray-600 space-y-1">
//                 <div><span className="font-medium">Email:</span> hospital1@gmail.com</div>
//                 <div><span className="font-medium">Password:</span> hospital1</div>
//               </div>

//               <p className="text-xs text-emerald-600 mt-3">
//                 Click to auto-fill credentials
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ================= RIGHT SIDE – LOGIN FORM ================= */}
//       <div className="bg-white border rounded-2xl shadow-sm p-8">

//         <h1 className="text-2xl font-semibold text-gray-900 mb-1">
//           Login
//         </h1>
//         <p className="text-sm text-gray-500 mb-6">
//           Sign in to access the Sentinel dashboard
//         </p>

//         <div className="space-y-4">

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="you@hospital.org"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                          text-gray-900 caret-blue-600
//                          placeholder:text-gray-600
//                          focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
//                          text-gray-900 caret-blue-600
//                          placeholder:text-gray-600
//                          focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Error */}
//           {error && (
//             <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//               {error}
//             </p>
//           )}

//           {/* Login Button */}
//           <button
//             onClick={handleLogin}
//             className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 transition"
//           >
//             Login
//           </button>

//           {/* Register */}
//           <button
//             onClick={() => router.push('/register/hospital')}
//             className="w-full text-sm text-blue-600 hover:underline mt-2"
//           >
//             Register new hospital
//           </button>

//         </div>
//       </div>

//     </div>
//   </main>
// );



// }
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoggingIn(false);
      return;
    }

    router.push('/redirect');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-slate-50 -z-10"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* ================= LEFT SIDE – DEMO CARDS ================= */}
        <div className="space-y-8 lg:pr-8">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-4 border border-blue-200/50">
              <ShieldCheck className="w-3.5 h-3.5" /> Evaluator Access
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Explore Sentinel
            </h2>
            <p className="text-slate-600 mt-3 text-lg leading-relaxed">
              Use the configured demo accounts below to instantly experience the platform from different regulatory perspectives.
            </p>
          </div>

          <div className="space-y-4">
            {/* Demo Regulator */}
            <button
              type="button"
              onClick={() => {
                setEmail("demoregulator@gmail.com");
                setPassword("demo123");
                setError(null);
              }}
              className="w-full text-left group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 group-hover:bg-blue-500 transition-colors"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-900">Regulator Authority</h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Auto-fill
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-lg mt-2">
                    demoregulator@gmail.com
                  </div>
                </div>
              </div>
            </button>

            {/* Demo Hospital */}
            <button
              type="button"
              onClick={() => {
                setEmail("hospital1@gmail.com");
                setPassword("hospital1");
                setError(null);
              }}
              className="w-full text-left group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-900">Clinical Trial Site</h3>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Auto-fill
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-lg mt-2">
                    hospital1@gmail.com
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE – LOGIN FORM ================= */}
        <div className="relative">
          {/* Decorative subtle border glowing effect behind the card */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-200 to-indigo-100 rounded-[2rem] blur opacity-50"></div>
          
          <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
            
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Login
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Authenticate to access the Sentinel platform
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@institution.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn || !email || !password}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 ${
                  isLoggingIn || !email || !password
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Secure Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Are you a new clinical site?{' '}
                <Link
                  href="/register/hospital"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Request Registration
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
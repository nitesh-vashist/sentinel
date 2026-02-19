'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/redirect');
  };

return (
  <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">

      {/* ================= LEFT SIDE – DEMO CARDS ================= */}
      <div className="space-y-6">

        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            Sentinel Demo Access
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Use the demo accounts below to explore regulator and hospital workflows.
          </p>
        </div>

        <div className="space-y-6">

          {/* Demo Regulator */}
          <div
            onClick={() => {
              setEmail("demoregulator@gmail.com");
              setPassword("demo123");
            }}
            className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500
                       hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
          >
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg">
                  🏛️
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  Demo Regulator
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Email:</span> demoregulator@gmail.com</div>
                <div><span className="font-medium">Password:</span> demo123</div>
              </div>

              <p className="text-xs text-blue-600 mt-3">
                Click to auto-fill credentials
              </p>
            </div>
          </div>

          {/* Demo Hospital */}
          <div
            onClick={() => {
              setEmail("hospital1@gmail.com");
              setPassword("hospital1");
            }}
            className="relative p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500
                       hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
          >
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-lg">
                  🏥
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  Demo Hospital
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Email:</span> hospital1@gmail.com</div>
                <div><span className="font-medium">Password:</span> hospital1</div>
              </div>

              <p className="text-xs text-emerald-600 mt-3">
                Click to auto-fill credentials
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RIGHT SIDE – LOGIN FORM ================= */}
      <div className="bg-white border rounded-2xl shadow-sm p-8">

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Login
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to access the Sentinel dashboard
        </p>

        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         text-gray-900 caret-blue-600
                         placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         text-gray-900 caret-blue-600
                         placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Login
          </button>

          {/* Register */}
          <button
            onClick={() => router.push('/register/hospital')}
            className="w-full text-sm text-blue-600 hover:underline mt-2"
          >
            Register new hospital
          </button>

        </div>
      </div>

    </div>
  </main>
);



}

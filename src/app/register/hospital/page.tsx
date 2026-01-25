'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HospitalRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    // 1️⃣ Create auth user
    const { data, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (authError || !data.user) {
      setError(authError?.message || 'Signup failed');
      return;
    }

    const userId = data.user.id;

    // 2️⃣ Create hospital record
    const { data: hospital, error: hospitalError } =
      await supabase
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
      return;
    }

    // 3️⃣ Create user profile
    const { error: userError } =
      await supabase.from('users').insert({
        id: userId,
        role: 'hospital',
        hospital_id: hospital.id,
        full_name: name,
      });

    if (userError) {
      setError(userError.message);
      return;
    }

    router.push('/pending-approval');
  };

return (
  <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-6">
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Hospital Registration
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Register your hospital to participate in approved clinical trials.
      </p>

      <div className="space-y-4">
        {/* Hospital Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hospital Name
          </label>
          <input
            type="text"
            placeholder="e.g. Apollo Medical Center"
            onChange={e => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       text-gray-900 caret-blue-600
                       placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number
          </label>
          <input
            type="text"
            placeholder="Official hospital registration ID"
            onChange={e => setRegistrationNumber(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       text-gray-900 caret-blue-600
                       placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            placeholder="e.g. India"
            onChange={e => setCountry(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       text-gray-900 caret-blue-600
                       placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Official Email
          </label>
          <input
            type="email"
            placeholder="admin@hospital.org"
            onChange={e => setEmail(e.target.value)}
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
            placeholder="Create a secure password"
            onChange={e => setPassword(e.target.value)}
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

        {/* Submit */}
        <button
          onClick={handleRegister}
          className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700"
        >
          Register Hospital
        </button>
      </div>
    </div>
  </main>
);

}

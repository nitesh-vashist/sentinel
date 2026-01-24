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
    <main style={{ padding: 30, maxWidth: 400 }}>
      <h1>Hospital Registration</h1>

      <input placeholder="Hospital Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Registration Number" onChange={e => setRegistrationNumber(e.target.value)} />
      <input placeholder="Country" onChange={e => setCountry(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <button onClick={handleRegister}>Register</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}

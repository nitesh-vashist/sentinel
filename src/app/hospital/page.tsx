'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HospitalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const userId = sessionData.session.user.id;

      // 1️⃣ Fetch user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('hospital_id')
        .eq('id', userId)
        .single();

      if (userError || !user?.hospital_id) {
        router.push('/login');
        return;
      }

      // 2️⃣ Fetch hospital
      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('verified')
        .eq('id', user.hospital_id)
        .single();

      if (hospitalError || !hospital?.verified) {
        router.push('/pending-approval');
        return;
      }

      setLoading(false);
    };

    checkApproval();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ padding: 40 }}>
      <h1>Hospital Dashboard</h1>
      <p>Hospital verified. Access granted.</p>
    </main>
  );
}

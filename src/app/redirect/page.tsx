'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!userRow) {
        router.push('/login');
        return;
      }

      if (userRow.role === 'regulator') {
        router.push('/regulator');
        return;
      }

      if (userRow.role === 'hospital') {
        router.push('/hospital');
        return;
      }

      router.push('/login');
    };

    redirectUser();
  }, [router]);

  return <p>Redirecting...</p>;
}

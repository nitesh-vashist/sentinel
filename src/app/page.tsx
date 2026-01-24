import { supabase } from '@/lib/supabaseClient';

export default async function Home() {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    return <pre>Error: {error.message}</pre>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Supabase Connection Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

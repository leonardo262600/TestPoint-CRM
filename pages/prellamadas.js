import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const PrellamadasPage = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
  }, [router]);

  if (!session) return null;

  return (
    <Layout title="Prellamadas" session={session} onLogout={() => logout(router)}>
      <div className="card">
        <h2>Prellamadas</h2>
        <p>Espacio para organizar y preparar llamadas antes del contacto.</p>
      </div>
    </Layout>
  );
};

export default PrellamadasPage;

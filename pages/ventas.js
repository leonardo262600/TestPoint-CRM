import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const VentasPage = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) { router.replace('/login'); return; }
    setSession(current);
  }, [router]);

  if (!session) return null;

  return (
    <Layout title="Ventas" session={session} onLogout={() => logout(router)}>
      <div className="card">
        <h2>Ventas</h2>
        <p>Registro y seguimiento de ventas realizadas.</p>
      </div>
    </Layout>
  );
};

export default VentasPage;

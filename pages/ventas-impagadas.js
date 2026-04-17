import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const VentasImpagadasPage = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) { router.replace('/login'); return; }
    setSession(current);
  }, [router]);

  if (!session) return null;

  return (
    <Layout title="Ventas Impagadas" session={session} onLogout={() => logout(router)}>
      <div className="card">
        <h2>Ventas Impagadas</h2>
        <p>Ventas con pagos pendientes o rechazados.</p>
      </div>
    </Layout>
  );
};

export default VentasImpagadasPage;

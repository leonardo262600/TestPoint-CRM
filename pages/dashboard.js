import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const DashboardPage = () => {
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
    <Layout title="Dashboard" session={session} onLogout={() => logout(router)}>
      <div className="card">
        <h2>Dashboard</h2>
        <p>Resumen general de métricas y estadísticas.</p>
      </div>
    </Layout>
  );
};

export default DashboardPage;

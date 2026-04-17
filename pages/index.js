import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const DashboardPage = () => {
  const [session, setSession] = useState(null);
  const [counts, setCounts] = useState({ users: 0, clients: 0 });
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    if (current.role !== 'CEO' && current.role !== 'admin') {
      router.replace('/llamadas');
      return;
    }
    setSession(current);
    Promise.all([fetch('/api/users'), fetch('/api/clients')])
      .then(async ([usersRes, clientsRes]) => {
        const users = await usersRes.json();
        const clients = await clientsRes.json();
        setCounts({ users: users.length, clients: clients.length });
      })
      .catch(() => {});
  }, [router]);

  if (!session) {
    return null;
  }

  return (
    <Layout title="Panel de control" session={session} onLogout={() => logout(router)}>
      <div className="dashboard-grid">
        <div className="card card-dashboard">
          <h2>Bienvenido, {session.name}</h2>
          <p>Tu rol: <strong>{session.role}</strong></p>
          <p>Usa el menú para administrar usuarios, clientes y visibilidad.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Resumen</h3>
          <ul>
            <li>Usuarios: {counts.users}</li>
            <li>Clientes: {counts.clients}</li>
          </ul>
        </div>

        <div className="card card-dashboard">
          <h3>Accesos rápidos</h3>
          <ul>
            <li>Ver clientes</li>
            <li>Administrar plantilla</li>
          </ul>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 4</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 5</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 6</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 7</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 8</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>

        <div className="card card-dashboard">
          <h3>Caja 9</h3>
          <p>Contenido de ejemplo para completar la vista inicial.</p>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

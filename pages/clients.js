import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const ClientsPage = () => {
  const [session, setSession] = useState(null);
  const [clients, setClients] = useState([]);
  const [userConfig, setUserConfig] = useState(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', company: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
    setUserConfig(current.viewConfig || {});
    fetchClients();
  }, [router]);

  const fetchClients = async () => {
    const res = await fetch('/api/clients');
    const data = await res.json();
    setClients(data);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    });
    setNewClient({ name: '', email: '', phone: '', company: '' });
    setMessage('Cliente agregado.');
    fetchClients();
  };

  const canEdit = userConfig?.canEditClients;
  const visibleFields = userConfig?.clientFields || ['name', 'email', 'phone'];

  if (!session) {
    return null;
  }

  return (
    <Layout title="Clientes" session={session} onLogout={() => logout(router)}>
      <div className="page-grid">
        <div className="card">
          <h2>Clientes</h2>
          <p>Campos visibles para ti: {visibleFields.join(', ')}</p>
          {message && <p className="success">{message}</p>}
          {canEdit ? (
            <form onSubmit={handleCreate} className="form-card">
              <label>
                Nombre
                <input
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                />
              </label>
              <label>
                Teléfono
                <input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  required
                />
              </label>
              <label>
                Empresa
                <input
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                />
              </label>
              <button type="submit" className="button-primary">
                Agregar cliente
              </button>
            </form>
          ) : (
            <p className="info">No tienes permiso para crear clientes.</p>
          )}
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {visibleFields.includes('name') && <th>Nombre</th>}
                  {visibleFields.includes('email') && <th>Correo</th>}
                  {visibleFields.includes('phone') && <th>Teléfono</th>}
                  {visibleFields.includes('company') && <th>Empresa</th>}
                  {visibleFields.includes('status') && <th>Estado</th>}
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    {visibleFields.includes('name') && <td>{client.name}</td>}
                    {visibleFields.includes('email') && <td>{client.email}</td>}
                    {visibleFields.includes('phone') && <td>{client.phone}</td>}
                    {visibleFields.includes('company') && <td>{client.company}</td>}
                    {visibleFields.includes('status') && <td>{client.status}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientsPage;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const allClientFields = ['name', 'email', 'phone', 'company', 'status'];

const UsersPage = () => {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'seller' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    if (current.role !== 'admin') {
      router.replace('/');
      return;
    }
    setSession(current);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleFieldToggle = async (userId, field) => {
    const user = users.find((item) => item.id === userId);
    const currentFields = user.viewConfig?.clientFields || [];
    const updatedFields = currentFields.includes(field)
      ? currentFields.filter((item) => item !== field)
      : [...currentFields, field];

    const updated = { ...user, viewConfig: { ...user.viewConfig, clientFields: updatedFields } };
    await saveUser(updated);
  };

  const saveUser = async (user) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    setMessage('Usuario actualizado.');
    fetchUsers();
  };

  const addUser = async (event) => {
    event.preventDefault();
    const payload = {
      ...newUser,
      role: newUser.role,
      viewConfig: {
        clientFields: ['name', 'email', 'phone'],
        canEditClients: newUser.role === 'admin' || newUser.role === 'seller',
      },
    };
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setNewUser({ name: '', email: '', role: 'seller' });
    setMessage('Usuario agregado.');
    fetchUsers();
  };

  if (!session) {
    return null;
  }

  return (
    <Layout title="Usuarios" session={session} onLogout={() => logout(router)}>
      <div className="page-grid">
        <div className="card">
          <h2>Gestionar plantilla</h2>
          {message && <p className="success">{message}</p>}
          <form onSubmit={addUser} className="form-card">
            <label>
              Nombre
              <input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </label>
            <label>
              Rol
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="seller">Vendedor</option>
                <option value="admin">CEO</option>
              </select>
            </label>
            <button type="submit" className="button-primary">
              Crear usuario
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Usuarios existentes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Visibilidad clientes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <div className="field-grid">
                        {allClientFields.map((field) => (
                          <label key={`${user.id}-${field}`}>
                            <input
                              type="checkbox"
                              checked={user.viewConfig?.clientFields?.includes(field) || false}
                              onChange={() => handleFieldToggle(user.id, field)}
                            />
                            {field}
                          </label>
                        ))}
                      </div>
                    </td>
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

export default UsersPage;

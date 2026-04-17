import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, saveSession } from '../lib/auth';
import Layout from '../components/Layout';

const LoginPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace('/');
    }
    fetch('/api/users')
      .then(async (res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Debes ingresar correo y contraseña.');
      return;
    }

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Error de autenticación.');
      return;
    }

    const user = await res.json();
    saveSession(user);
    if (user.role === 'CEO' || user.role === 'admin') {
      router.push('/');
    } else {
      router.push('/llamadas');
    }
  };

  return (
    <Layout title="Login">
      <div className="card">
        <h1>CRM de Ventas</h1>
        <p>Ingresa con el correo y la contraseña que te asignó el administrador.</p>

        <form onSubmit={handleSubmit} className="form-card">
          <label>
            Correo
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name} — {user.role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary">
            Entrar
          </button>
        </form>

        <div className="hint">
          Si no ves usuarios, reinicia el servidor o crea `data/db.json` correctamente.
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

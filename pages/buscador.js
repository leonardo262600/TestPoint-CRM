import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';
import { callRows } from '../data/calls';

const BuscadorPage = () => {
  const [session, setSession] = useState(null);
  const [query, setQuery] = useState('');
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

  const q = query.trim().toLowerCase();
  const results = q.length === 0 ? [] : callRows.filter((row) => {
    return (
      row.llamada.toLowerCase().includes(q) ||
      row.contacto.toLowerCase().includes(q) ||
      row.telefono.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q)
    );
  });

  return (
    <Layout title="Buscador" session={session} onLogout={() => logout(router)}>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '12px' }}>Buscador de leads</h2>
        <input
          type="search"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '1rem',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            background: 'var(--surface)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {q.length > 0 && (
        <div className="card">
          {results.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No se encontraron leads para &quot;{query}&quot;.</p>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Registro</th>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Teléfono</th>
                      <th>Evento</th>
                      <th>Confirmación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link href={`/leads/${row.id}`} className="setter-registro-link">
                            {row.registro}
                          </Link>
                        </td>
                        <td>{row.llamada}</td>
                        <td>{row.contacto}</td>
                        <td>{row.telefono}</td>
                        <td>{row.evento}</td>
                        <td><span className="setter-status-text">{row.confirmacion}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default BuscadorPage;


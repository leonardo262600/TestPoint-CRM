import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const statusFilters = [
  'Todas',
  'Sin contactar',
  'Cont. pero no confirmada',
  'Llamada confirmada',
  'Cancelada',
  'Llamada conf. de prellamada',
  'Pendiente de reagendar',
  'En cont. pendiente de llamada',
  'Cancelada por protocolo',
  'Llamada rescatada',
  'Cont. no conf. de prellamada',
  'Llamada confirmada de registro',
];

const callRows = [
  {
    id: 'R-17820',
    confirmacion: 'Sin contactar',
    setter: '17/04 00:17',
    registro: '20/04 21:20',
    llamada: 'María Estela',
    contacto: 'gantusestela@gmail.com',
    telefono: '+5492612489824',
    evento: 'Curso de MacBook | Reparacion de Placas',
    closer: 'No',
    llamadas: 0,
    score: '2,60',
  },
  {
    id: 'R-17821',
    confirmacion: 'Llamada confirmada',
    setter: '17/04 00:16',
    registro: '20/04 13:00',
    llamada: 'Miriam López',
    contacto: 'miriam.lopez.salines78@gmail.com',
    telefono: '+34646792226',
    evento: 'Curso de MacBook | Reparacion de Placas',
    closer: 'No',
    llamadas: 0,
    score: '2,70',
  },
  {
    id: 'R-17822',
    confirmacion: 'Pendiente de reagendar',
    setter: '17/04 00:11',
    registro: '20/04 11:30',
    llamada: 'Belén',
    contacto: 'belenquero76@yahoo.com',
    telefono: '+34679107856',
    evento: 'Curso de MacBook | Reparacion de Placas',
    closer: 'No',
    llamadas: 0,
    score: '2,70',
  },
];

const LlamadasSetterPage = () => {
  const [session, setSession] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('Todas');
  const router = useRouter();

  const filteredCallRows =
    activeStatusFilter === 'Todas'
      ? callRows
      : callRows.filter((row) => row.confirmacion === activeStatusFilter);

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
    <Layout title="Llamadas" session={session} onLogout={() => logout(router)}>
      <section className="setter-calls-shell">
        <div className="card setter-calls-head">
          <div>
            <h2>Llamadas</h2>
            <p>Dashboard - Mis llamadas</p>
          </div>
        </div>

        <div className="card setter-calls-panel">
          <div className="setter-chip-row">
            {statusFilters.map((status) => (
              <button
                key={status}
                className={`setter-chip ${activeStatusFilter === status ? 'setter-chip-active' : ''}`}
                type="button"
                onClick={() => setActiveStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="setter-filter-row">
            <label className="setter-select-label">
              Filtro por confirmación
              <select>
                <option>Todas</option>
                <option>No contesta</option>
                <option>Confirmada</option>
                <option>Confirmada de prellamada</option>
              </select>
            </label>
            <label className="setter-checkbox">
              <input type="checkbox" />
              Autoactualizar
            </label>
          </div>

          <div className="setter-legend-row">
            <span className="setter-mini-badge setter-nc">NC</span> No contesta
            <span className="setter-mini-badge setter-c">C</span> Confirmada
            <span className="setter-mini-badge setter-cp">CP</span> Confirmada de prellamada
          </div>

          <div className="setter-table-toolbar">
            <label>
              Mostrar
              <select>
                <option>150</option>
                <option>100</option>
                <option>50</option>
              </select>
              registros
            </label>
            <label>
              Buscar:
              <input type="search" placeholder="" />
            </label>
          </div>

          <div className="table-container setter-calls-table">
            <table>
              <thead>
                <tr>
                  <th>Confirmación</th>
                  <th>Setter</th>
                  <th>Registro</th>
                  <th>Llamada</th>
                  <th>Contacto</th>
                  <th>Evento</th>
                  <th>C. Closer</th>
                  <th>Llamadas</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredCallRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="setter-status-text">{row.confirmacion}</span>
                    </td>
                    <td>{row.setter}</td>
                    <td>{row.registro}</td>
                    <td>{row.llamada}</td>
                    <td>
                      <div className="setter-contact-col">
                        <span>{row.contacto}</span>
                        <span>{row.telefono}</span>
                      </div>
                    </td>
                    <td>{row.evento}</td>
                    <td><span className="setter-pill-no">{row.closer}</span></td>
                    <td>{row.llamadas}</td>
                    <td><span className="setter-pill-score">{row.score}</span></td>
                  </tr>
                ))}
                {filteredCallRows.length === 0 && (
                  <tr>
                    <td colSpan={9}>No hay llamadas para el estado seleccionado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LlamadasSetterPage;

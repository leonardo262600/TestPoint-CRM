import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';
import { callRows, statusFilters } from '../data/calls';

const toCloserSlug = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const getFirstName = (fullName = '') => fullName.trim().split(/\s+/)[0] || '';

const toTitleCase = (value = '') =>
  value
    .toLowerCase()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());

const DEFAULT_CLOSER_NAMES = [
  'Nazaret',
  'Álvaro',
  'Lucía',
  'Marcos',
  'Paula',
  'Diego',
  'Carla',
  'Iván',
  'Sofía',
];

const getAutoCloserName = (leadId = '') => {
  const numeric = Number(String(leadId).replace(/\D/g, ''));
  const index = Number.isNaN(numeric) ? 0 : numeric % DEFAULT_CLOSER_NAMES.length;
  return DEFAULT_CLOSER_NAMES[index];
};

const getCloserNameFromSlug = (slug = '') => {
  const match = DEFAULT_CLOSER_NAMES.find((name) => toCloserSlug(name) === toCloserSlug(slug));
  return match || toTitleCase(slug);
};

const loadLeadTableState = () => {
  if (typeof window === 'undefined') {
    return {
      nextStatusById: {},
      nextCloserById: {},
      nextAsistenciaById: {},
      nextVentaById: {},
      nextNombreCloserById: {},
    };
  }

  const nextStatusById = {};
  const nextCloserById = {};
  const nextAsistenciaById = {};
  const nextVentaById = {};
  const nextNombreCloserById = {};

  callRows.forEach((row) => {
    const storedStatus = window.localStorage.getItem(`lead-status-${row.id}`);
    const storedCloser = window.localStorage.getItem(`lead-closer-${row.id}`);
    const storedAsistencia = window.localStorage.getItem(`lead-asistencia-${row.id}`);
    const storedVenta = window.localStorage.getItem(`lead-venta-${row.id}`);
    const storedNombreCloser = window.localStorage.getItem(`lead-nombreCloser-${row.id}`);

    if (storedStatus) {
      nextStatusById[row.id] = storedStatus;
    }
    if (storedCloser) {
      nextCloserById[row.id] = storedCloser;
    }
    if (storedAsistencia) {
      nextAsistenciaById[row.id] = storedAsistencia;
    }
    if (storedVenta) {
      nextVentaById[row.id] = storedVenta;
    }
    if (storedNombreCloser) {
      nextNombreCloserById[row.id] = storedNombreCloser;
    }
  });

  return {
    nextStatusById,
    nextCloserById,
    nextAsistenciaById,
    nextVentaById,
    nextNombreCloserById,
  };
};

const getNextToggleValue = (value) => {
  if (value === 'Si') return 'No';
  if (value === 'No') return 'S/R';
  return 'Si';
};

const normalizeYesNoValue = (value, fallback = 'No') => {
  if (value === 'Si' || value === 'Sí') return 'Si';
  if (value === 'No') return 'No';
  return fallback;
};

const getStatusSelectClassName = (status) => {
  if (status === 'Sin contactar') return 'setter-table-select-uncontacted';
  if (status === 'Llamada confirmada') return 'setter-table-select-confirmed';
  if (status === 'Cancelada') return 'setter-table-select-cancelled';
  if (status === 'Cont. pero no confirmada') return 'setter-table-select-contacted';
  if (status === 'En cont. pendiente de llamada') return 'setter-table-select-pending-call';
  if (status === 'Pendiente de reagendar') return 'setter-table-select-reschedule';
  return '';
};

const LlamadasPage = () => {
  const [session, setSession] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('Todas');
  const [statusById, setStatusById] = useState({});
  const [closerById, setCloserById] = useState({});
  const [asistenciaById, setAsistenciaById] = useState({});
  const [ventaById, setVentaById] = useState({});
  const [nombreCloserById, setNombreCloserById] = useState({});
  const [closerProfiles, setCloserProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const router = useRouter();

  const closerFromQuery = typeof router.query.closer === 'string' ? router.query.closer : '';
  const closerFromSession =
    session && session.role !== 'CEO' && session.role !== 'admin'
      ? getFirstName(session.name)
      : '';

  const activeCloserFilterSlug = toCloserSlug(closerFromQuery || closerFromSession);
  const activeCloserDisplayName = activeCloserFilterSlug
    ? getCloserNameFromSlug(closerFromQuery || closerFromSession)
    : '';

  const rowsWithCurrentStatus = callRows.map((row) => ({
    ...row,
    confirmacion: statusById[row.id] || row.confirmacion,
    closer: normalizeYesNoValue(closerById[row.id] || row.closer, 'No'),
    asistencia: asistenciaById[row.id] || row.asistencia || 'S/R',
    venta: ventaById[row.id] || row.venta || 'S/R',
    nombreCloser: nombreCloserById[row.id] || row.nombreCloser || getAutoCloserName(row.id),
  }));

  const updateBinaryField = (fieldName, rowId, value) => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(`lead-${fieldName}-${rowId}`, value);

    if (fieldName === 'asistencia') {
      setAsistenciaById((current) => ({ ...current, [rowId]: value }));
    }

    if (fieldName === 'venta') {
      setVentaById((current) => ({ ...current, [rowId]: value }));
    }

    if (fieldName === 'closer') {
      setCloserById((current) => ({ ...current, [rowId]: value }));
    }

    if (fieldName === 'status') {
      setStatusById((current) => ({ ...current, [rowId]: value }));
    }

    if (fieldName === 'nombreCloser') {
      setNombreCloserById((current) => ({ ...current, [rowId]: value }));
    }
  };

  const statusFiltered =
    activeStatusFilter === 'Todas'
      ? rowsWithCurrentStatus
      : rowsWithCurrentStatus.filter((row) => row.confirmacion === activeStatusFilter);

  const closerFiltered =
    activeCloserFilterSlug.length === 0
      ? statusFiltered
      : statusFiltered.filter((row) => toCloserSlug(row.nombreCloser || '') === activeCloserFilterSlug);

  const q = searchQuery.trim().toLowerCase();
  const filteredCallRows = q.length === 0 ? closerFiltered : closerFiltered.filter((row) =>
    row.llamada.toLowerCase().includes(q) ||
    row.contacto.toLowerCase().includes(q) ||
    row.telefono.toLowerCase().includes(q) ||
    (row.nombreCloser || '').toLowerCase().includes(q) ||
    row.id.toLowerCase().includes(q)
  );

  const isCloserSession = session && session.role !== 'CEO' && session.role !== 'admin';
  const showCloserKpis = isCloserSession || activeCloserFilterSlug.length > 0;
  const totalVentas = filteredCallRows.filter((row) => row.venta === 'Si').length;
  const cashCollected = totalVentas * 1350;
  const comisiones = Math.round(cashCollected * 0.15);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
    fetch('/api/profiles').then(r => r.json()).then(data => setCloserProfiles(data.filter(p => p.nombre))).catch(() => {});
  }, [router]);

  useEffect(() => {
    const {
      nextStatusById,
      nextCloserById,
      nextAsistenciaById,
      nextVentaById,
      nextNombreCloserById,
    } = loadLeadTableState();

    setStatusById(nextStatusById);
    setCloserById(nextCloserById);
    setAsistenciaById(nextAsistenciaById);
    setVentaById(nextVentaById);
    setNombreCloserById(nextNombreCloserById);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const {
        nextStatusById,
        nextCloserById,
        nextAsistenciaById,
        nextVentaById,
        nextNombreCloserById,
      } = loadLeadTableState();

      setStatusById(nextStatusById);
      setCloserById(nextCloserById);
      setAsistenciaById(nextAsistenciaById);
      setVentaById(nextVentaById);
      setNombreCloserById(nextNombreCloserById);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!session) return null;

  return (
    <Layout title={activeCloserDisplayName || 'Llamadas'} session={session} onLogout={() => logout(router)}>
      {showCloserKpis && (
        <section className="closer-kpi-grid" aria-label="Resumen de métricas">
          <div className="card card-dashboard closer-kpi-card">
            <h3>Ventas</h3>
            <p>{totalVentas}</p>
          </div>
          <div className="card card-dashboard closer-kpi-card">
            <h3>Cash Colleted</h3>
            <p>{cashCollected.toLocaleString('es-ES')} €</p>
          </div>
          <div className="card card-dashboard closer-kpi-card">
            <h3>Comisiones</h3>
            <p>{comisiones.toLocaleString('es-ES')} €</p>
          </div>
        </section>
      )}

      <section className="setter-calls-shell">
        <div className="card setter-calls-head">
          <div>
            <h2>Llamadas</h2>
            <p>
              Dashboard - Mis llamadas
              {activeCloserFilterSlug
                ? ` (${activeCloserDisplayName})`
                : ''}
            </p>
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
              Filtro por confirmacion
              <select
                value={activeStatusFilter}
                onChange={(e) => setActiveStatusFilter(e.target.value)}
              >
                {statusFilters.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="setter-checkbox">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Autoactualizar
            </label>
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
              <input
                type="search"
                placeholder="Nombre, correo o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="table-container setter-calls-table">
            <table>
              <thead>
                <tr>
                  <th>Registro</th>
                  <th className="setter-col-center">F. de la llamada</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Evento</th>
                  <th>Closer</th>
                  <th>C. Closer</th>
                  <th>Estado</th>
                  <th>Asistencia</th>
                  <th>Venta</th>
                </tr>
              </thead>
              <tbody>
                {filteredCallRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/leads/${row.id}`} className="setter-registro-link">
                        {row.registro}
                      </Link>
                    </td>
                    <td className="setter-col-center">{row.setter}</td>
                    <td>{row.llamada}</td>
                    <td>
                      <div className="setter-contact-col">
                        <span>{row.contacto}</span>
                        <span>{row.telefono}</span>
                      </div>
                    </td>
                    <td>{row.evento}</td>
                    <td style={{ fontWeight: 500 }}>{row.nombreCloser}</td>
                    <td>
                      <button
                        type="button"
                        className={`setter-binary-btn ${row.closer === 'Si' ? 'setter-binary-btn-yes' : 'setter-binary-btn-no'}`}
                        onClick={() => updateBinaryField('closer', row.id, row.closer === 'Si' ? 'No' : 'Si')}
                      >
                        {row.closer}
                      </button>
                    </td>
                    <td>
                      <select
                        className={`setter-table-select ${getStatusSelectClassName(row.confirmacion)}`.trim()}
                        value={row.confirmacion}
                        onChange={(event) => updateBinaryField('status', row.id, event.target.value)}
                      >
                        {statusFilters
                          .filter((status) => status !== 'Todas')
                          .map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`setter-binary-btn ${
                          row.asistencia === 'Si'
                            ? 'setter-binary-btn-yes'
                            : row.asistencia === 'No'
                              ? 'setter-binary-btn-no'
                              : 'setter-binary-btn-neutral'
                        }`}
                        onClick={() => updateBinaryField('asistencia', row.id, getNextToggleValue(row.asistencia))}
                      >
                        {row.asistencia}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`setter-binary-btn ${
                          row.venta === 'Si'
                            ? 'setter-binary-btn-yes'
                            : row.venta === 'No'
                              ? 'setter-binary-btn-no'
                              : 'setter-binary-btn-neutral'
                        }`}
                        onClick={() => updateBinaryField('venta', row.id, getNextToggleValue(row.venta))}
                      >
                        {row.venta}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCallRows.length === 0 && (
                  <tr>
                    <td colSpan={10}>No hay llamadas para el filtro seleccionado.</td>
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

export default LlamadasPage;

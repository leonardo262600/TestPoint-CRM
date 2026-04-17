import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHome, FaAddressBook, FaSearch, FaChartBar, FaPhone, FaUserTie, FaTicketAlt, FaCheckCircle, FaPlusCircle, FaDollarSign, FaExclamationCircle, FaUser } from "react-icons/fa";
import { useTheme } from "../pages/_app";

const Badge = ({ count }) =>
  count > 0 ? <span className="nav-badge">{count}</span> : null;

const Layout = ({ title, children, session, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const isCeo = session?.role === "CEO" || session?.role === "admin";
  const [newTickets, setNewTickets] = useState(0);
  const [unreadReplies, setUnreadReplies] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/tickets')
        .then(r => r.json())
        .then(data => {
          const all = Array.isArray(data) ? data : [];
          const count = all.filter(t => t.status === 'nuevo').length;
          setNewTickets(count);
          const mineUnread = session?.id
            ? all.filter((t) => t.createdBy?.id === session.id && t.reply && !t.creatorSeenAt).length
            : 0;
          setUnreadReplies(mineUnread);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [session?.id]);

  const ceoNav = (
    <>
      <div className="nav-section">
        <div className="nav-section-title">General</div>
        <Link href="/"><FaHome /> Inicio</Link>
        <Link href="/directorio"><FaUser /> Mi Perfil</Link>
        <Link href="/directorio-general"><FaAddressBook /> Directorio</Link>
        <Link href="/buscador"><FaSearch /> Buscador</Link>
        <Link href="/tickets"><FaTicketAlt /> Tickets <Badge count={newTickets} /></Link>
        <Link href="/dashboard"><FaChartBar /> Dashboard</Link>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Closers</div>
        <Link href="/llamadas"><FaPhone style={{ transform: 'scaleX(-1)' }} /> Llamadas</Link>
        <Link href="/closers"><FaUserTie /> Closers</Link>
        <Link href="/ventas"><FaDollarSign /> Ventas</Link>
        <Link href="/ventas-impagadas"><FaExclamationCircle /> Ventas Impagadas</Link>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Setter</div>
        <Link href="/llamadas"><FaPhone style={{ transform: 'scaleX(-1)' }} /> Llamadas</Link>
        <Link href="/prellamadas"><FaPhone style={{ transform: 'scaleX(-1)' }} /> Prellamadas</Link>
      </div>
    </>
  );

  const sellerNav = (
    <>
      <div className="nav-section">
        <div className="nav-section-title">General</div>
        <Link href="/directorio"><FaUser /> Mi Perfil</Link>
        <Link href="/directorio-general"><FaAddressBook /> Directorio</Link>
        <Link href="/buscador"><FaSearch /> Buscador</Link>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Closer</div>
        <Link href="/dashboard"><FaChartBar /> Dashboard</Link>
        <Link href="/llamadas"><FaPhone style={{ transform: 'scaleX(-1)' }} /> Llamadas</Link>
        <Link href="/ventas"><FaDollarSign /> Ventas</Link>
        <Link href="/ventas-impagadas"><FaExclamationCircle /> Ventas Impagadas</Link>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Soporte</div>
        <Link href="/tickets-pendientes"><FaTicketAlt /> Tickets Pendientes <Badge count={unreadReplies} /></Link>
        <Link href="/tickets-completados"><FaCheckCircle /> Tickets Completados</Link>
        <Link href="/nuevo-ticket"><FaPlusCircle /> Nuevo Ticket</Link>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} | CRM de Ventas` : "CRM de Ventas"}</title>
      </Head>
      <div className="page-shell">
        <aside className="sidebar">
          <div className="brand">TestPoint</div>
          <nav>
            {isCeo ? ceoNav : sellerNav}
          </nav>
          {session && (
            <div className="sidebar-footer">
              <p>{session.name}</p>
              <p>{session.role}</p>
              <button className="button-secondary logout-button" onClick={onLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </aside>
        <main className="content">
          <div className="page-header">
            <h1>{title}</h1>
            <button
              className="button-secondary theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
              }
              title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            >
              {theme === "light" ? "Oscuro" : "Claro"}
            </button>
          </div>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;

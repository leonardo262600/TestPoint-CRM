import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const TicketsPage = () => {
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState([]);
  const router = useRouter();

  const openTicketManagement = (status) => {
    router.push(`/tickets-pendientes?status=${status}`);
  };

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [router]);

  if (!session) return null;

  const ticketsNuevos = tickets.filter((t) => t.status === 'nuevo');
  const ticketsPendientes = tickets.filter((t) => t.status === 'pendiente');
  const ticketsFinalizados = tickets.filter((t) => t.status === 'finalizado');

  const nuevos = ticketsNuevos.length;
  const pendientes = ticketsPendientes.length;
  const finalizados = ticketsFinalizados.length;

  return (
    <Layout title="Tickets" session={session} onLogout={() => logout(router)}>
      <div className="tickets-kpi-grid">
        <div
          className="card card-dashboard tickets-kpi-nuevos tickets-kpi-card tickets-kpi-card-clickable"
          tabIndex={0}
          role="button"
          onClick={() => openTicketManagement('nuevo')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTicketManagement('nuevo');
            }
          }}
        >
          <h3>Tickets Nuevos</h3>
          <p>{nuevos}</p>
        </div>
        <div
          className="card card-dashboard tickets-kpi-pendientes tickets-kpi-card tickets-kpi-card-clickable"
          tabIndex={0}
          role="button"
          onClick={() => openTicketManagement('pendiente')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTicketManagement('pendiente');
            }
          }}
        >
          <h3>Tickets Pendientes</h3>
          <p>{pendientes}</p>
        </div>
        <div
          className="card card-dashboard tickets-kpi-finalizados tickets-kpi-card tickets-kpi-card-clickable"
          tabIndex={0}
          role="button"
          onClick={() => openTicketManagement('finalizado')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTicketManagement('finalizado');
            }
          }}
        >
          <h3>Tickets Finalizados</h3>
          <p>{finalizados}</p>
        </div>
      </div>
    </Layout>
  );
};

export default TicketsPage;

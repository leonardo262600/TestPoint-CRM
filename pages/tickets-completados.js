import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const TicketsCompletadosPage = () => {
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState([]);
  const router = useRouter();

  const isCeo = session?.role === 'CEO' || session?.role === 'admin';

  const markRepliesAsSeen = async (allTickets, currentSession) => {
    const isBoss = currentSession?.role === 'CEO' || currentSession?.role === 'admin';
    if (isBoss || !currentSession?.id) return;

    const unread = allTickets.filter(
      (t) => t.createdBy?.id === currentSession.id && t.status === 'finalizado' && t.reply && !t.creatorSeenAt
    );

    if (unread.length === 0) return;

    await Promise.all(
      unread.map((ticket) =>
        fetch(`/api/tickets/${ticket.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markCreatorSeen: true }),
        })
      )
    );
  };

  useEffect(() => {
    const current = getSession();
    if (!current) { router.replace('/login'); return; }
    setSession(current);
    fetch('/api/tickets')
      .then((r) => r.json())
      .then(async (all) => {
        await markRepliesAsSeen(all, current);
        setTickets(all.filter((t) => t.status === 'finalizado'));
      })
      .catch(() => {});
  }, [router]);

  if (!session) return null;

  const myTickets = isCeo ? tickets : tickets.filter((t) => t.createdBy?.id === session.id);

  return (
    <Layout title="Tickets Completados" session={session} onLogout={() => logout(router)}>
      {myTickets.length === 0 ? (
        <div className="card"><p>No hay tickets finalizados aún.</p></div>
      ) : (
        myTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card ticket-card-done">
            <div className="ticket-card-header">
              <span className="ticket-badge ticket-badge-finalizado">finalizado</span>
              <span className="ticket-id">{ticket.id}</span>
              <span className="ticket-author">Por: {ticket.createdBy?.name}</span>
              <span className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            <h3 className="ticket-title">{ticket.title}</h3>
            <p className="ticket-description">{ticket.description}</p>
            {ticket.reply && (
              <div className="ticket-reply-box">
                <strong>Respuesta:</strong>
                <p>{ticket.reply}</p>
              </div>
            )}
          </div>
        ))
      )}
    </Layout>
  );
};

export default TicketsCompletadosPage;


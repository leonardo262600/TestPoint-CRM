import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const TicketsPendientesPage = () => {
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const router = useRouter();

  const isCeo = session?.role === 'CEO' || session?.role === 'admin';

  const fetchTickets = () => {
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((all) => setTickets(Array.isArray(all) ? all : []))
      .catch(() => {});
  };

  const markRepliesAsSeen = async (allTickets, currentSession) => {
    const isBoss = currentSession?.role === 'CEO' || currentSession?.role === 'admin';
    if (isBoss || !currentSession?.id) return;

    const unread = allTickets.filter(
      (t) =>
        t.createdBy?.id === currentSession.id &&
        t.reply &&
        !t.creatorSeenAt
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
        const arr = Array.isArray(all) ? all : [];
        await markRepliesAsSeen(arr, current);
        setTickets(arr);
      })
      .catch(() => {});
  }, [router]);

  if (!session) return null;

  const handleStatusChange = async (ticket, newStatus) => {
    setLoadingMap((p) => ({ ...p, [ticket.id]: true }));
    await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTickets();
    setLoadingMap((p) => ({ ...p, [ticket.id]: false }));
  };

  const handleReply = async (ticket) => {
    const text = replyMap[ticket.id] || '';
    if (!text.trim()) return;
    setLoadingMap((p) => ({ ...p, [ticket.id]: true }));
    await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text.trim(), status: 'pendiente' }),
    });
    setReplyMap((p) => ({ ...p, [ticket.id]: '' }));
    fetchTickets();
    setLoadingMap((p) => ({ ...p, [ticket.id]: false }));
  };

  const handleQuickReply = async (ticket, mode) => {
    const isResolved = mode === 'resuelto';
    setLoadingMap((p) => ({ ...p, [ticket.id]: true }));
    await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reply: isResolved ? 'Resuelto' : 'Pendiente',
        status: isResolved ? 'finalizado' : 'pendiente',
      }),
    });
    fetchTickets();
    setLoadingMap((p) => ({ ...p, [ticket.id]: false }));
  };

  const statusFromQuery = typeof router.query.status === 'string' ? router.query.status : 'todos';
  const normalizedStatus = ['todos', 'nuevo', 'pendiente', 'finalizado'].includes(statusFromQuery)
    ? statusFromQuery
    : 'todos';

  const baseTickets = isCeo ? tickets : tickets.filter((t) => t.createdBy?.id === session.id);
  const myTickets =
    normalizedStatus === 'todos'
      ? baseTickets
      : baseTickets.filter((t) => t.status === normalizedStatus);

  const goToFilter = (status) => {
    router.push(`/tickets-pendientes?status=${status}`);
  };

  const pageTitle = normalizedStatus === 'todos'
    ? 'Gestión de Tickets'
    : `Gestión de Tickets - ${normalizedStatus}`;

  return (
    <Layout title={pageTitle} session={session} onLogout={() => logout(router)}>
      <div className="card tickets-manage-toolbar">
        <p>Filtrar por estado:</p>
        <div className="tickets-manage-filters">
          <button
            type="button"
            className={`ticket-filter-btn ${normalizedStatus === 'todos' ? 'ticket-filter-btn-active' : ''}`}
            onClick={() => goToFilter('todos')}
          >
            Todos
          </button>
          <button
            type="button"
            className={`ticket-filter-btn ${normalizedStatus === 'nuevo' ? 'ticket-filter-btn-active' : ''}`}
            onClick={() => goToFilter('nuevo')}
          >
            Nuevo
          </button>
          <button
            type="button"
            className={`ticket-filter-btn ${normalizedStatus === 'pendiente' ? 'ticket-filter-btn-active' : ''}`}
            onClick={() => goToFilter('pendiente')}
          >
            Pendiente
          </button>
          <button
            type="button"
            className={`ticket-filter-btn ${normalizedStatus === 'finalizado' ? 'ticket-filter-btn-active' : ''}`}
            onClick={() => goToFilter('finalizado')}
          >
            Finalizado
          </button>
        </div>
      </div>

      {myTickets.length === 0 ? (
        <div className="card"><p>No hay tickets para este filtro.</p></div>
      ) : (
        myTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-card-header">
              <span className={`ticket-badge ticket-badge-${ticket.status}`}>{ticket.status}</span>
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

            {isCeo && (
              <div className="ticket-actions">
                <div className="ticket-action-buttons">
                  <button
                    className="ticket-btn ticket-btn-reply"
                    onClick={() => handleQuickReply(ticket, 'pendiente')}
                    disabled={loadingMap[ticket.id]}
                  >
                    Respuesta rápida: Pendiente
                  </button>
                  <button
                    className="ticket-btn ticket-btn-finalizar"
                    onClick={() => handleQuickReply(ticket, 'resuelto')}
                    disabled={loadingMap[ticket.id]}
                  >
                    Respuesta rápida: Resuelto
                  </button>
                </div>

                <textarea
                  className="ticket-reply-input"
                  placeholder="Escribe tu respuesta..."
                  value={replyMap[ticket.id] || ''}
                  onChange={(e) => setReplyMap((p) => ({ ...p, [ticket.id]: e.target.value }))}
                  rows={3}
                />
                <div className="ticket-action-buttons">
                  <button
                    className="ticket-btn ticket-btn-reply"
                    onClick={() => handleReply(ticket)}
                    disabled={loadingMap[ticket.id]}
                  >
                    Responder
                  </button>
                  <button
                    className="ticket-btn ticket-btn-reply"
                    onClick={() => handleStatusChange(ticket, 'pendiente')}
                    disabled={loadingMap[ticket.id]}
                  >
                    Marcar Pendiente
                  </button>
                  <button
                    className="ticket-btn ticket-btn-finalizar"
                    onClick={() => handleStatusChange(ticket, 'finalizado')}
                    disabled={loadingMap[ticket.id]}
                  >
                    Marcar Finalizado
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </Layout>
  );
};

export default TicketsPendientesPage;


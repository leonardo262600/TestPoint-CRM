import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const NuevoTicketPage = () => {
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) { router.replace('/login'); return; }
    setSession(current);
  }, [router]);

  if (!session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          createdBy: { id: session.id, name: session.name },
        }),
      });
      if (!res.ok) throw new Error('Error al enviar el ticket');
      setSent(true);
      setTitle('');
      setDescription('');
    } catch {
      setError('No se pudo enviar el ticket. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="Nuevo Ticket" session={session} onLogout={() => logout(router)}>
      <div className="card ticket-form-card">
        <h2>Nuevo Ticket</h2>
        <p className="ticket-form-subtitle">Envíame un mensaje y te responderé lo antes posible.</p>

        {sent && (
          <div className="ticket-success">
            ✅ Ticket enviado correctamente. Recibirás respuesta pronto.
          </div>
        )}

        {error && <div className="ticket-error">{error}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="ticket-field">
            <label htmlFor="ticket-title">Asunto</label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Sobre qué trata tu consulta?"
              maxLength={120}
            />
          </div>
          <div className="ticket-field">
            <label htmlFor="ticket-desc">Descripción</label>
            <textarea
              id="ticket-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica tu consulta con detalle..."
              rows={5}
              maxLength={1000}
            />
          </div>
          <button type="submit" className="ticket-submit-btn" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar Ticket'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default NuevoTicketPage;


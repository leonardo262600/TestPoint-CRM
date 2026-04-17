import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getSession, logout } from '../../lib/auth';
import { callRows, statusFilters } from '../../data/calls';

const normalizeYesNoValue = (value, fallback = 'No') => {
  if (value === 'Si' || value === 'Sí') return 'Si';
  if (value === 'No') return 'No';
  return fallback;
};

const LeadDetailPage = () => {
  const [session, setSession] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [savedComment, setSavedComment] = useState('');
  const [leadStatus, setLeadStatus] = useState('Sin contactar');
  const [leadCloser, setLeadCloser] = useState('No');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
  }, [router]);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    const storedComment = window.localStorage.getItem(`lead-comment-${id}`) || '';
    const storedStatus = window.localStorage.getItem(`lead-status-${id}`);
    const storedCloser = window.localStorage.getItem(`lead-closer-${id}`);
    setSavedComment(storedComment);
    setCommentDraft(storedComment);
    setLeadStatus(storedStatus || lead?.confirmacion || 'Sin contactar');
    setLeadCloser(normalizeYesNoValue(storedCloser || lead?.closer, 'No'));
  }, [id]);

  const lead = useMemo(() => callRows.find((row) => row.id === id), [id]);

  const handleSaveComment = () => {
    if (!id || typeof window === 'undefined') return;
    window.localStorage.setItem(`lead-comment-${id}`, commentDraft);
    window.localStorage.setItem(`lead-status-${id}`, leadStatus);
    window.localStorage.setItem(`lead-closer-${id}`, leadCloser);
    setSavedComment(commentDraft);
    router.push('/llamadas');
  };

  const handleCancelComment = () => {
    setCommentDraft(savedComment);
    router.push('/llamadas');
  };

  if (!session) return null;

  return (
    <Layout title="Ficha de Lead" session={session} onLogout={() => logout(router)}>
      {!lead && (
        <div className="card">
          <h2>Lead no encontrado</h2>
          <p>No encontramos informacion para este registro.</p>
          <Link href="/llamadas" className="setter-registro-link">Volver a Llamadas</Link>
        </div>
      )}

      {lead && (
        <div className="card lead-detail-card">
          <div className="lead-detail-header">
            <h2>Ficha del Lead</h2>
            <label className="lead-status-control">
              Estado
              <select
                value={leadStatus}
                onChange={(event) => setLeadStatus(event.target.value)}
              >
                {statusFilters
                  .filter((status) => status !== 'Todas')
                  .map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="lead-detail-layout">
            <div className="lead-detail-rows">
              <div className="lead-detail-item">
                <p className="lead-detail-label">Fecha de registro</p>
                <p className="lead-detail-value">{lead.registro}</p>
              </div>

              <div className="lead-detail-item">
                <p className="lead-detail-label">Fecha de llamada</p>
                <p className="lead-detail-value">{lead.setter}</p>
              </div>

              <div className="lead-detail-item">
                <p className="lead-detail-label">Nombre del lead</p>
                <p className="lead-detail-value">{lead.llamada}</p>
              </div>

              <div className="lead-detail-item">
                <p className="lead-detail-label">Correo</p>
                <p className="lead-detail-value">{lead.contacto}</p>
              </div>

              <div className="lead-detail-item">
                <p className="lead-detail-label">Telefono</p>
                <p className="lead-detail-value">{lead.telefono}</p>
              </div>

              <div className="lead-detail-item">
                <p className="lead-detail-label">Evento</p>
                <p className="lead-detail-value">{lead.evento}</p>
              </div>
            </div>

            <div className="lead-comments-box">
              <label htmlFor="lead-comments" className="lead-detail-label">Comentario del closer</label>
              <textarea
                id="lead-comments"
                className="lead-comments-textarea"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Escribe aqui informacion importante del lead..."
              />
              <div className="lead-comments-actions">
                <button type="button" className="button-primary" onClick={handleSaveComment}>
                  Guardar
                </button>
                <button type="button" className="button-secondary" onClick={handleCancelComment}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default LeadDetailPage;

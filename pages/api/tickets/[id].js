import { getTickets, updateTicket } from '../../../lib/store';
import { requireAuth } from '../../../lib/security';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'PATCH') {
    const changes = { ...req.body };

    const tickets = await getTickets();
    const current = tickets.find((ticket) => ticket.id === id);
    if (!current) return res.status(404).json({ message: 'Ticket no encontrado' });

    const isAdmin = session.role === 'admin' || session.role === 'CEO';
    const isOwner = current.createdBy?.id === session.id;
    const isSupportAction = changes.reply !== undefined || changes.status !== undefined;
    if (!isAdmin && isSupportAction) {
      return res.status(403).json({ message: 'Solo administración puede responder o cerrar tickets' });
    }

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No puedes modificar tickets de otros usuarios' });
    }

    if (!isAdmin) {
      delete changes.createdBy;
      delete changes.title;
      delete changes.description;
      delete changes.status;
      delete changes.reply;
      delete changes.repliedAt;
    }

    if (changes.reply !== undefined) {
      changes.repliedAt = new Date().toISOString();
    }
    if (changes.markCreatorSeen === true) {
      changes.creatorSeenAt = new Date().toISOString();
      delete changes.markCreatorSeen;
    }
    const updated = await updateTicket(id, changes);
    if (!updated) return res.status(404).json({ message: 'Ticket no encontrado' });
    return res.status(200).json(updated);
  }

  res.status(405).json({ message: 'Method not allowed' });
}

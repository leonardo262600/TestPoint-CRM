import { getTickets, addTicket } from '../../lib/store';
import { requireAuth } from '../../lib/security';

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const tickets = await getTickets();
    const isAdmin = session.role === 'admin' || session.role === 'CEO';
    if (isAdmin) return res.status(200).json(tickets);
    return res.status(200).json(tickets.filter((ticket) => ticket.createdBy?.id === session.id));
  }

  if (req.method === 'POST') {
    const { title, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const ticket = await addTicket({
      title,
      description,
      createdBy: { id: session.id, name: session.name, role: session.role },
    });
    return res.status(201).json(ticket);
  }

  res.status(405).json({ message: 'Method not allowed' });
}

import { getAllClients, addClient } from '../../lib/sqlite-clients';
import { requireAuth } from '../../lib/security';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const clients = getAllClients();
    return res.status(200).json(clients);
  }

  if (req.method === 'POST') {
    const { name, email, phone, company, status } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'El nombre del cliente es obligatorio.' });
    }
    if (email && !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'El formato del correo no es válido.' });
    }

    const safeClient = {
      name: String(name).trim().slice(0, 200),
      email: email ? String(email).trim().toLowerCase().slice(0, 200) : '',
      phone: phone ? String(phone).trim().slice(0, 50) : '',
      company: company ? String(company).trim().slice(0, 200) : '',
      status: status ? String(status).trim().slice(0, 100) : 'Nuevo',
    };

    const clientId = addClient(safeClient);
    const client = { id: clientId, ...safeClient };
    return res.status(201).json(client);
  }

  res.status(405).json({ message: 'Method not allowed' });
}

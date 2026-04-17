import { getClients, addClient } from '../../lib/store';
import { requireAuth } from '../../lib/security';

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const clients = await getClients();
    return res.status(200).json(clients);
  }

  if (req.method === 'POST') {
    const client = await addClient(req.body);
    return res.status(201).json(client);
  }

  res.status(405).json({ message: 'Method not allowed' });
}

import { readSessionFromRequest } from '../../lib/security';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = readSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  return res.status(200).json({
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
  });
}

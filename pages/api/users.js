import { getUsers, addUser, updateUser } from '../../lib/store';
import { hashPassword, requireAuth } from '../../lib/security';

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export default async function handler(req, res) {
  const session = requireAuth(req, res, ['admin', 'CEO']);
  if (!session) return;

  if (req.method === 'GET') {
    const users = await getUsers();
    return res.status(200).json(users.map(sanitizeUser));
  }

  if (req.method === 'POST') {
    const payload = { ...req.body };
    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      return res.status(400).json({ message: 'Faltan campos obligatorios del usuario' });
    }

    payload.email = String(payload.email).trim().toLowerCase();
    payload.password = hashPassword(String(payload.password));
    const user = await addUser(payload);
    return res.status(201).json(sanitizeUser(user));
  }

  if (req.method === 'PUT') {
    const payload = { ...req.body };
    if (!payload.id) {
      return res.status(400).json({ message: 'id de usuario requerido' });
    }

    if (payload.email) {
      payload.email = String(payload.email).trim().toLowerCase();
    }
    if (payload.password) {
      payload.password = hashPassword(String(payload.password));
    }
    const user = await updateUser(payload);
    return res.status(200).json(sanitizeUser(user));
  }

  res.status(405).json({ message: 'Method not allowed' });
}

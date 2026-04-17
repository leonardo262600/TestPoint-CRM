import { getUsers, updateUser } from '../../lib/store';
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
  }

  const users = await getUsers();
  const user = users.find((item) => item.email === email.trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  // Migra contraseñas heredadas en texto plano al primer login válido.
  if (!String(user.password || '').startsWith('scrypt$')) {
    await updateUser({ ...user, password: hashPassword(password) });
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = createSessionToken(userWithoutPassword);
  setSessionCookie(res, token);
  return res.status(200).json(userWithoutPassword);
}

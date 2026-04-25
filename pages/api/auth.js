import { getUserByEmail, updateUser } from '../../lib/sqlite-users';
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from '../../lib/security';

// Rate limiter en memoria: max 5 intentos por IP en 5 minutos.
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  attempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return Math.ceil((entry.resetAt - now) / 1000);
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const waitSeconds = checkRateLimit(ip);
  if (waitSeconds) {
    return res
      .status(429)
      .json({ message: `Demasiados intentos. Espera ${waitSeconds} segundos.` });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
  }



  const user = getUserByEmail(email.trim().toLowerCase());
  console.log('Login intento:', { email, password });
  if (!user) {
    console.log('No existe usuario para ese email');
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }
  console.log('Usuario encontrado:', user);
  const verificacion = verifyPassword(password, user.password);
  console.log('Resultado verifyPassword:', verificacion);
  console.log('Password recibido:', password);
  console.log('Password almacenado:', user.password);
  if (!verificacion) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  // Migra contraseñas heredadas en texto plano al primer login válido.
  if (!String(user.password || '').startsWith('scrypt$')) {
    updateUser({ ...user, password: hashPassword(password) });
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = createSessionToken(userWithoutPassword);
  setSessionCookie(res, token);
  return res.status(200).json(userWithoutPassword);
}

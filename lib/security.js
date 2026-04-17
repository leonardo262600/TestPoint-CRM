import crypto from 'crypto';

const SESSION_COOKIE = 'crm_auth';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const PASSWORD_PREFIX = 'scrypt';

const getSecret = () => process.env.CRM_AUTH_SECRET || 'dev-insecure-change-me';

const toBase64Url = (value) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value) => Buffer.from(value, 'base64url').toString('utf8');

const signValue = (value) =>
  crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');

const safeEqual = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [name, ...value] = part.split('=');
      acc[name] = decodeURIComponent(value.join('='));
      return acc;
    }, {});
};

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${PASSWORD_PREFIX}$${salt}$${hash}`;
};

export const verifyPassword = (password, storedPassword = '') => {
  if (!storedPassword) return false;

  const [prefix, salt, storedHash] = storedPassword.split('$');
  if (prefix !== PASSWORD_PREFIX || !salt || !storedHash) {
    return safeEqual(password, storedPassword);
  }

  const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
  return safeEqual(calculated, storedHash);
};

export const createSessionToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const readSessionFromRequest = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;
  if (!safeEqual(signValue(encodedPayload), signature)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload?.id || !payload?.role || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};

export const setSessionCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);
};

export const clearSessionCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);
};

export const requireAuth = (req, res, allowedRoles = null) => {
  const session = readSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ message: 'No autenticado' });
    return null;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(session.role)) {
    res.status(403).json({ message: 'Sin permisos para esta acción' });
    return null;
  }

  return session;
};

const SESSION_KEY = 'crm-session';

export const saveSession = (user) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const logout = (router) => {
  if (typeof window === 'undefined') return;

  fetch('/api/logout', { method: 'POST' })
    .catch(() => {})
    .finally(() => {
      window.localStorage.removeItem(SESSION_KEY);
      if (router) {
        router.replace('/login');
      }
    });
};

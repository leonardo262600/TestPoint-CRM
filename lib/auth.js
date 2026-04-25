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

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
};

export const logout = (router) => {
  if (typeof window === 'undefined') return;

  fetch('/api/logout', { method: 'POST' })
    .catch(() => {})
    .finally(() => {
      clearSession();
      if (router) {
        router.replace('/login');
      }
    });
};

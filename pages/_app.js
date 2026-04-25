import '../styles/globals.css';
import { createContext, useContext, useEffect, useState } from 'react';
import { saveSession, clearSession } from '../lib/auth';

export const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('crm-theme');
    const preferredTheme =
      savedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    window.localStorage.setItem('crm-theme', theme);
  }, [theme]);

  // Sincroniza localStorage con la cookie del servidor en cada carga.
  // Si la cookie expiró, limpia la sesión local para forzar el re-login.
  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user) {
          saveSession(user);
        } else {
          clearSession();
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Component {...pageProps} />
    </ThemeContext.Provider>
  );
}

export default App;

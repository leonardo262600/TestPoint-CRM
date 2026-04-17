import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';
import { FaUser, FaBriefcase, FaMobileAlt, FaBuilding, FaCopy, FaCheck, FaEnvelope, FaUniversity, FaIdCard, FaGlobe, FaCreditCard } from 'react-icons/fa';

const fields = [
  { name: 'nombre',           label: 'Nombre y apellido',  placeholder: 'Ej. Ana García',       accent: '#6366f1' },
  { name: 'cargo',            label: 'Cargo',              placeholder: 'Ej. Closer',            accent: '#0ea5e9' },
  { name: 'correo',           label: 'Correo',             placeholder: 'Ej. ana@email.com',     accent: '#ec4899' },
  { name: 'telefonoEmpresa',  label: 'Número de empresa',  placeholder: 'Ej. +34 900 000 000',  accent: '#f59e0b' },
  { name: 'telefonoPersonal', label: 'Número personal',    placeholder: 'Ej. +34 600 000 000',  accent: '#10b981' },
];

const bankFields = [
  { name: 'nombreApellido', label: 'Nombre y apellido',  placeholder: 'Ej. Ana García',         accent: '#6366f1' },
  { name: 'iban',           label: 'IBAN',               placeholder: 'Ej. ES91 2100 0418 ...',  accent: '#0ea5e9' },
  { name: 'banco',          label: 'Banco',              placeholder: 'Ej. CaixaBank',           accent: '#f59e0b' },
  { name: 'documento',      label: 'Documento',          placeholder: 'Ej. 12345678A',           accent: '#10b981' },
  { name: 'swift',          label: 'SWIFT / BIC',        placeholder: 'Ej. CAIXESBBXXX',        accent: '#a78bfa' },
];

const emptyBank = { nombreApellido: '', iban: '', banco: '', documento: '', swift: '' };

const DirectorioPage = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  const [form, setForm] = useState({ nombre: '', cargo: '', correo: '', telefonoEmpresa: '', telefonoPersonal: '' });
  const [saved, setSaved] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);

  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankSaved, setBankSaved] = useState(false);

  const copyNumber = (number, key) => {
    navigator.clipboard.writeText(number);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const fetchProfiles = async () => {
    const res = await fetch('/api/profiles');
    if (res.ok) { const d = await res.json(); setProfiles(Array.isArray(d) ? d : []); }
  };

  useEffect(() => {
    const current = getSession();
    if (!current) { router.replace('/login'); return; }
    setSession(current);
    fetchProfiles().then(() => {});
    // Pre-fill form from existing profile
    fetch('/api/profiles').then(r => r.json()).then(data => {
      const mine = Array.isArray(data) ? data.find(p => p.userId === current.id) : null;
      if (mine) setForm({ nombre: mine.nombre || '', cargo: mine.cargo || '', correo: mine.correo || '', telefonoEmpresa: mine.telefonoEmpresa || '', telefonoPersonal: mine.telefonoPersonal || '' });
    });
    // Pre-fill bank form
    fetch('/api/banking').then(r => r.json()).then(data => {
      const mine = Array.isArray(data) ? data.find(b => b.userId === current.id) : null;
      if (mine) setBankForm({ nombreApellido: mine.nombreApellido || '', iban: mine.iban || '', banco: mine.banco || '', correoBank: mine.correoBank || '', documento: mine.documento || '', swift: mine.swift || '' });
    }).catch(() => {});
  }, [router]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleBankChange = (e) => {
    setBankForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setBankSaved(false);
  };

  const handleBankSave = async () => {
    await fetch('/api/banking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.id, ...bankForm }),
    });
    setBankSaved(true);
  };

  const handleSave = async () => {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.id, ...form }),
    });
    // Actualizar estado local de inmediato sin esperar otra petición
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.userId === session.id);
      const updated = { userId: session.id, ...form };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    setSaved(true);
  };

  if (!session) return null;

  const otherProfiles = profiles.filter(p => p.nombre);

  return (
    <Layout title="Mi Perfil" session={session} onLogout={() => logout(router)}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', paddingTop: 40 }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
          borderRadius: 18,
          padding: 32,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 760,
          boxShadow: '0 4px 32px rgba(37,99,235,0.18)',
        }}>
        {/* Mi perfil */}
        <div className="card dir-card" style={{ flex: '0 0 auto', minWidth: 300, maxWidth: 300 }}>
          <h2 className="dir-title">Mi perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map(({ name, label, placeholder, accent }) => (
              <div key={name}>
                <label className="dir-label" style={{ color: accent }}>{label}</label>
                <input
                  className="dir-input"
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  style={{ '--dir-accent': accent }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="dir-save-btn" onClick={handleSave}>Guardar</button>
            {saved && <span className="dir-saved-msg">✓ Guardado</span>}
          </div>
        </div>

        {/* Datos bancarios */}
        <div className="card dir-card" style={{ flex: '0 0 auto', minWidth: 300, maxWidth: 300 }}>
          <h2 className="dir-title">Datos Bancarios</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bankFields.map(({ name, label, placeholder, accent }) => (
              <div key={name}>
                <label className="dir-label" style={{ color: accent }}>{label}</label>
                <input
                  className="dir-input"
                  name={name}
                  placeholder={placeholder}
                  value={bankForm[name]}
                  onChange={handleBankChange}
                  style={{ '--dir-accent': accent }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="dir-save-btn" onClick={handleBankSave}>Guardar</button>
            {bankSaved && <span className="dir-saved-msg">✓ Guardado</span>}
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default DirectorioPage;

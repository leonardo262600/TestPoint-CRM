import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';
import { FaUser, FaBriefcase, FaMobileAlt, FaBuilding, FaCopy, FaCheck, FaEnvelope, FaUniversity, FaIdCard, FaGlobe } from 'react-icons/fa';

const DirectorioGeneralPage = () => {
  const [session, setSession] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [banking, setBanking] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
  }, [router]);

  useEffect(() => {
    const fetchAll = async () => {
      const [profRes, bankRes] = await Promise.all([fetch('/api/profiles'), fetch('/api/banking')]);
      if (profRes.ok) {
        const data = await profRes.json();
        setProfiles(data.filter(p => p.nombre));
      }
      if (bankRes.ok) setBanking(await bankRes.json());
    };
    fetchAll();
  }, []);

  const copyNumber = (number, key) => {
    navigator.clipboard.writeText(number);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!session) return null;

  return (
    <Layout title="Directorio General" session={session} onLogout={() => logout(router)}>
      <div className="card" style={{ padding: '24px' }}>
        <h1 className="dir-title" style={{ marginTop: 0, marginBottom: 24, background: 'linear-gradient(90deg,#6366f1,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Directorio General
        </h1>

        {profiles.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: 12 }}>
            No hay contactos registrados aún.
          </p>
        ) : (
          <div className="dir-general-grid">
            {profiles.map(p => (
              <div key={p.userId} className="dir-general-card">
                <div className="dir-general-avatar">
                  {(p.nombre || '?').charAt(0).toUpperCase()}
                </div>
                <div className="dir-general-content">
                  <div className="dir-general-name">{p.nombre}</div>
                  {p.cargo && <div className="dir-general-cargo">{p.cargo}</div>}
                  {p.correo && (
                    <div className="dir-general-correo">
                      {p.correo}
                    </div>
                  )}

                  {p.telefonoEmpresa && (
                    <div className="dir-general-item">
                      <FaBuilding style={{ color: '#f59e0b', marginRight: 8 }} />
                      <span className="dir-general-label">Empresa:</span>
                      <span className="dir-general-value">{p.telefonoEmpresa}</span>
                      <button className="dir-copy-btn-inline" onClick={() => copyNumber(p.telefonoEmpresa, p.userId + '-empresa')} title="Copiar">
                        {copiedKey === p.userId + '-empresa' ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                      </button>
                    </div>
                  )}

                  {p.telefonoPersonal && (
                    <div className="dir-general-item">
                      <FaMobileAlt style={{ color: '#10b981', marginRight: 8 }} />
                      <span className="dir-general-label">Personal:</span>
                      <span className="dir-general-value">{p.telefonoPersonal}</span>
                      <button className="dir-copy-btn-inline" onClick={() => copyNumber(p.telefonoPersonal, p.userId + '-personal')} title="Copiar">
                        {copiedKey === p.userId + '-personal' ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                      </button>
                    </div>
                  )}

                    {session?.role === 'CEO' && (() => {
                      const b = banking.find(b => b.userId === p.userId);
                      if (!b) return null;
                      return (
                        <div style={{ marginTop: 10, borderTop: '1px solid var(--surface-border)', paddingTop: 10 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}>DATOS BANCARIOS</div>
                          {b.nombreApellido && <div className="dir-general-item"><FaUser style={{ color: '#6366f1', marginRight: 6 }} /><span className="dir-general-value">{b.nombreApellido}</span><button className="dir-copy-btn-inline" onClick={() => copyNumber(b.nombreApellido, p.userId+'-bnombre')} title="Copiar">{copiedKey===p.userId+'-bnombre'?<FaCheck style={{color:'#10b981'}}/>:<FaCopy/>}</button></div>}
                          {b.iban && <div className="dir-general-item"><FaUniversity style={{ color: '#0ea5e9', marginRight: 6 }} /><span className="dir-general-value" style={{fontSize:'0.72rem'}}>{b.iban}</span><button className="dir-copy-btn-inline" onClick={() => copyNumber(b.iban, p.userId+'-iban')} title="Copiar">{copiedKey===p.userId+'-iban'?<FaCheck style={{color:'#10b981'}}/>:<FaCopy/>}</button></div>}
                          {b.banco && <div className="dir-general-item"><FaBuilding style={{ color: '#f59e0b', marginRight: 6 }} /><span className="dir-general-value">{b.banco}</span></div>}
                          {b.documento && <div className="dir-general-item"><FaIdCard style={{ color: '#10b981', marginRight: 6 }} /><span className="dir-general-value">{b.documento}</span><button className="dir-copy-btn-inline" onClick={() => copyNumber(b.documento, p.userId+'-doc')} title="Copiar">{copiedKey===p.userId+'-doc'?<FaCheck style={{color:'#10b981'}}/>:<FaCopy/>}</button></div>}
                          {b.swift && <div className="dir-general-item"><FaGlobe style={{ color: '#a78bfa', marginRight: 6 }} /><span className="dir-general-value">{b.swift}</span><button className="dir-copy-btn-inline" onClick={() => copyNumber(b.swift, p.userId+'-swift')} title="Copiar">{copiedKey===p.userId+'-swift'?<FaCheck style={{color:'#10b981'}}/>:<FaCopy/>}</button></div>}
                        </div>
                      );
                    })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DirectorioGeneralPage;

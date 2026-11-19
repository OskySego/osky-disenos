import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const AVATAR_POR_DEFECTO = '/img/Logo_for_Osky_Diseños.svg';

const obtenerAvatar = (miembro) => {
  const valor = miembro.avatar || miembro.fotoURL || '';
  const ruta = typeof valor === 'string' ? valor.trim() : '';
  if (!ruta) return AVATAR_POR_DEFECTO;
  if (/^https?:\/\//i.test(ruta) || ruta.startsWith('/')) return ruta;
  if (/^(?:data:|javascript:)/i.test(ruta)) return AVATAR_POR_DEFECTO;
  return `/${ruta}`;
};

// Los enlaces del equipo se restringen a direcciones reales de LinkedIn.
const obtenerLinkedIn = (valor) => {
  if (typeof valor !== 'string' || !valor.trim()) return null;
  try {
    const texto = valor.trim();
    const url = new URL(/^www\.linkedin\.com\//i.test(texto) ? `https://${texto}` : texto);
    const esLinkedIn = url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com');
    return url.protocol === 'https:' && esLinkedIn ? url.href : null;
  } catch {
    return null;
  }
};

export const Footer = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    let activo = true;
    getDocs(collection(db, 'equipo'))
      .then((respuesta) => {
        if (!activo) return;
        setTeamMembers(
          respuesta.docs
            .map((documento) => ({ ...documento.data(), id: documento.id }))
            .filter((miembro) => typeof miembro.nombre === 'string' && miembro.nombre.trim())
        );
      })
      .catch((error) => {
        if (activo) console.error('No se pudo cargar el equipo:', error);
      });
    return () => { activo = false; };
  }, []);

  return (
    <footer className="main-footer">
      <div className="footer-info">
        <h3>Osky Diseños</h3>
        <p>Diseño web y gráfico profesional desde Argentina.</p>
      </div>

      <section
        aria-label="Comenzá tu proyecto"
        style={{
          width: 'min(100%, 900px)',
          margin: '0 auto 32px',
          padding: '22px 18px',
          borderRadius: '18px',
          background: 'linear-gradient(140deg, rgba(138,43,226,.18), rgba(30,11,54,.48))',
          border: '1px solid rgba(204,255,0,.23)',
        }}
      >
        <h4 style={{ color: '#F2F0F7', marginBottom: '8px', fontSize: '1.25rem' }}>
          Tu próximo proyecto merece destacarse
        </h4>
        <p style={{ marginBottom: '20px' }}>
          Conocé nuestros servicios o contanos qué necesitás. Estamos para escucharte.
        </p>
        <nav
          aria-label="Enlaces del pie de página"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
        >
          <Link to="/productos" className="secondary-cta" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Ver servicios
          </Link>
          <Link to="/contacto" className="cta-button main-cta" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Hablemos de tu proyecto
          </Link>
        </nav>
      </section>

      {teamMembers.length > 0 && (
        <section aria-labelledby="osky-footer-equipo-titulo">
          <h4 id="osky-footer-equipo-titulo" className="team-section-title">Nuestro Equipo</h4>
          <div className="team-grid">
            {teamMembers.map((miembro) => {
              const linkedin = obtenerLinkedIn(miembro.linkedinURL);
              return (
                <article key={miembro.id} className="team-card">
                  <div className="team-avatar-wrapper">
                    <img
                      src={obtenerAvatar(miembro)}
                      alt={`Foto de ${miembro.nombre}`}
                      className="team-avatar"
                      loading="lazy"
                      decoding="async"
                      onError={(evento) => {
                        evento.currentTarget.onerror = null;
                        evento.currentTarget.src = AVATAR_POR_DEFECTO;
                      }}
                    />
                  </div>
                  <h5 className="team-name">{miembro.nombre}</h5>
                  {miembro.rol && <span className="team-role">{miembro.rol}</span>}
                  {miembro.descripcion && <p className="team-bio">{miembro.descripcion}</p>}
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="team-link">
                      Ver LinkedIn
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <p style={{ marginTop: '30px', fontSize: '.88rem', opacity: .85 }}>
        © {new Date().getFullYear()} Osky Diseños · Todos los derechos reservados.
      </p>
    </footer>
  );
};

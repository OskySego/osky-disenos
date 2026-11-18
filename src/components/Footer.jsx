import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const Footer = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const equipoRef = collection(db, 'equipo');
    getDocs(equipoRef)
      .then((resp) => {
        setTeamMembers(
          resp.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
          }))
        );
      })
      .catch((err) => console.error('Error al cargar el equipo:', err));
  }, []);

  const obtenerAvatar = (member) => {
    const ruta = (member.avatar || member.fotoURL || '').trim();
    if (!ruta) return '/img/Logo_for_Osky_Diseños.svg';
    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('/')) {
      return ruta;
    }
    return `/${ruta}`;
  };

  return (
    <footer className="main-footer">
      <div className="footer-info">
        <h3>Osky Diseños</h3>
        <p>© 2026 Osky Diseños • Diseño web y gráfico profesional desde Argentina.</p>
      </div>

      <h4 className="team-section-title">Nuestro Equipo</h4>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <article key={member.id} className="team-card">
            <div className="team-avatar-wrapper">
              <img
                src={obtenerAvatar(member)}
                alt={member.nombre}
                className="team-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/img/Logo_for_Osky_Diseños.svg';
                }}
              />
            </div>

            <h5 className="team-name">{member.nombre}</h5>
            <span className="team-role">{member.rol}</span>
            <p className="team-bio">{member.descripcion}</p>

            {member.linkedinURL && (
              <a
                href={member.linkedinURL}
                target="_blank"
                rel="noreferrer"
                className="team-link"
              >
                Ver LinkedIn
              </a>
            )}
          </article>
        ))}
      </div>
    </footer>
  );
};
import React from 'react';

export const Footer = () => {
  const teamMembers = [
    {
      nombre: "Oscar Segovia",
      rol: "Fundador & Lead Designer",
      descripcion: "Especialista en desarrollo web y branding con más de 5 años de experiencia.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar"
    },
    {
      nombre: "Joni",
      rol: "Soporte & Logística",
      descripcion: "Encargado de la atención personalizada y coordinación de entregas.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joni"
    },
    {
      nombre: "Sofía Martínez",
      rol: "Diseñadora UI/UX",
      descripcion: "Creadora de experiencias digitales enfocadas en la conversión del cliente.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"
    }
  ];

  return (
    <footer className="main-footer" style={{ padding: '30px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="footer-info" style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h3>Osky Diseños</h3>
        <p>© 2025 Osky Diseños • Diseño web y gráfico profesional desde Argentina.</p>
      </div>

      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Nuestro Equipo</h4>
      <div className="team-grid" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', maxWidth: '220px', textAlign: 'center' }}>
            <img src={member.avatar} alt={member.nombre} style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '10px' }} />
            <h5 style={{ margin: '5px 0' }}>{member.nombre}</h5>
            <span style={{ fontSize: '0.85rem', color: '#ffd700', display: 'block', marginBottom: '5px' }}>{member.rol}</span>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{member.descripcion}</p>
          </div>
        ))}
      </div>
    </footer>
  );
};
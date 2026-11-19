import React from 'react';
import { Link } from 'react-router-dom';
import '../css/PortadaOsky.css';

const servicios = [
  {
    categoria: 'DESARROLLO WEB',
    titulo: 'Diseño Web',
    descripcion: 'Sitios modernos y adaptables que generan confianza y convierten visitas en clientes.',
    imagen: '/img/osky/osky-laptop.webp',
    clase: 'web',
  },
  {
    categoria: 'IDENTIDAD DE MARCA',
    titulo: 'Branding',
    descripcion: 'Creamos identidades visuales memorables que comunican la esencia de tu proyecto.',
    imagen: '/img/osky/osky-branding.webp',
    clase: 'branding',
  },
  {
    categoria: 'MARKETING VISUAL',
    titulo: 'Contenido para Redes',
    descripcion: 'Diseños estratégicos para que tu marca destaque y conecte en redes sociales.',
    imagen: '/img/osky/osky-redes.webp',
    clase: 'redes',
  },
];

/**
 * Portada independiente. Todas las acciones navegan por React Router.
 * No toca el catálogo Firestore, CartContext, ni las rutas de administración.
 */
export default function PortadaOsky() {
  return (
    <div className="osky-cyber">
      {/* Ornamentación no interactiva: recursos visuales independientes. */}
      <div className="osky-vines osky-vines--left" aria-hidden="true" />
      <div className="osky-vines osky-vines--right" aria-hidden="true" />
      <div className="osky-rocks osky-rocks--left" aria-hidden="true" />
      <div className="osky-rocks osky-rocks--right" aria-hidden="true" />

      <div className="osky-shell">
        <section className="osky-hero" aria-labelledby="osky-hero-title">
          <div className="osky-copy">
            <p className="osky-eyebrow">
              <span className="osky-bars" aria-hidden="true"><i /><i /><i /></span>
              DISEÑO WEB <b>·</b> DISEÑO GRÁFICO <b>·</b> IDENTIDAD DE MARCA
            </p>

            <h1 id="osky-hero-title">
              ¡Hola! Bienvenido a <span>Osky Diseños</span>
            </h1>

            <div className="osky-intro">
              <p>Diseño web y gráfico que convierte ideas en marcas reales.</p>
              <p>
                Más de 5 años ayudando a{' '}
                <strong>emprendedores argentinos</strong> a crecer con diseños
                únicos, modernos y efectivos.
              </p>
            </div>

            <div className="osky-cta-group">
              <Link to="/productos" className="osky-cta osky-cta--primary">
                Ver Mis Servicios <span aria-hidden="true">→</span>
              </Link>
              <Link to="/contacto" className="osky-cta osky-cta--secondary">
                Hablemos de tu proyecto <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="osky-trust" aria-label="Nuestra propuesta">
              <span><b aria-hidden="true">🇦🇷</b> Emprendedores<br />argentinos</span>
              <span><b aria-hidden="true">ϟ</b> Diseños únicos<br />y modernos</span>
              <span><b aria-hidden="true">✧</b> Enfoque real<br />en tu crecimiento</span>
            </div>
          </div>

          <div className="osky-emblem-area">
            <div className="osky-ring osky-ring--outer" aria-hidden="true" />
            <div className="osky-ring osky-ring--inner" aria-hidden="true" />
            <span className="osky-circuit osky-circuit--left" aria-hidden="true" />
            <span className="osky-circuit osky-circuit--right" aria-hidden="true" />
            <img
              className="osky-emblem"
              src="/img/osky/fenix-osky.webp"
              alt="Emblema de Osky Diseños: ave fénix en colores violeta, terracota y lima"
              width="900"
              height="900"
              fetchPriority="high"
            />
          </div>
        </section>

        <section className="osky-services" aria-label="Servicios destacados">
          {servicios.map((servicio) => (
            <article className={`osky-service osky-service--${servicio.clase}`} key={servicio.titulo}>
              <div className="osky-service-copy">
                <span className="osky-tag">{servicio.categoria}</span>
                <h2>{servicio.titulo}</h2>
                <p>{servicio.descripcion}</p>
                <Link to="/productos" className="osky-service-link">
                  Ver más <span aria-hidden="true">→</span>
                </Link>
              </div>
              <img className="osky-service-image" src={servicio.imagen} alt="" aria-hidden="true" loading="lazy" />
            </article>
          ))}
        </section>

        <Link className="osky-scroll" to="/productos" aria-label="Explorar todos los servicios">
          <span aria-hidden="true">⌄</span>
        </Link>
      </div>
    </div>
  );
}

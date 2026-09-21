import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <>
      <section className="hero parallax">
        <div className="hero-content">
          <div className="hero-image-container">
            <img src="/img/Logo_for_Osky_Diseños.svg" alt="Logo de Osky Diseños" className="hero-main-image" />
          </div>
          <h1 className="typewriter">¡Hola! Bienvenido a Osky Diseños</h1>
          <p className="subtitle fade-in delay-1">Diseño web y gráfico que convierte ideas en marcas reales</p>
          <p className="highlight-text fade-in delay-2">
            Más de 5 años ayudando a emprendedores argentinos a crecer con diseños únicos, modernos y efectivos
          </p>
          <div className="hero-buttons fade-in delay-3">
            <Link to="/productos" className="cta-button main-cta">
              <span>Ver Mis Servicios</span>
            </Link>
            <Link to="/contacto" className="cta-button secondary-cta">
              <span>Hablemos de tu proyecto</span>
            </Link>
          </div>
          <div className="floating-stars" id="stars-container"></div>
        </div>
      </section>

      <section className="summary-section">
        <h2>¿Por Qué Elegir Osky Diseños?</h2>
        <div className="card-grid">
          <div className="box-card violet">
            <h3>Diseños 100% Personalizados</h3>
            <p>Olvídate de plantillas genéricas; creamos experiencias únicas adaptadas a tu visión.</p>
          </div>
          <div className="box-card green">
            <h3>Entregas Rápidas y Eficientes</h3>
            <p>Flyers en 24 horas, sitios web en 7 días. Tiempo es dinero, y lo respetamos.</p>
          </div>
          <div className="box-card gold">
            <h3>Soporte Personalizado 24/7</h3>
            <p>Estamos contigo en cada paso, asegurando que tu proyecto brille.</p>
          </div>
        </div>
      </section>
    </>
  );
};
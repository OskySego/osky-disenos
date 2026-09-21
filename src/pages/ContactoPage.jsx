import React from 'react';

export const ContactoPage = () => {
  return (
    <>
      <section className="hero parallax">
        <div className="hero-content">
          <div className="hero-image-container">
            <img src="/img/Logo_for_Osky_Diseños.svg" alt="Logo de Osky Diseños" className="hero-main-image" />
          </div>
          <h1 className="typewriter">Hablemos de tu Proyecto</h1>
          <p className="subtitle fade-in delay-2">Diseño web y gráfico que convierte ideas en marcas reales</p>
          <p className="subtitle fade-in delay-3">¡No dejes para mañana el diseño que podés tener hoy!</p>
        </div>
      </section>

      <section className="contact-section-page">
        <div className="contact-container">
          <h2>¡Empecemos tu proyecto hoy!</h2>
          <form action="https://formspree.io/f/xvgwzvnj" method="POST" className="contact-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input type="text" id="nombre" name="nombre" required placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" name="email" required placeholder="juan@ejemplo.com" />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input type="tel" id="telefono" name="telefono" placeholder="+54 9 11 1234-5678" />
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">¿En qué puedo ayudarte?</label>
              <textarea id="mensaje" name="mensaje" rows="6" required placeholder="Quiero un sitio web para mi emprendimiento..."></textarea>
            </div>
            <button type="submit" className="cta-button main-cta">
              <i className="fas fa-paper-plane"></i> Enviar Consulta
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
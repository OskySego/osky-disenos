import React from 'react';
import PortadaOsky from '../components/PortadaOsky';

/**
 * Página principal de la ruta `/`. La cabecera y el pie de página
 * siguen siendo administrados por Layout.jsx.
 */
export const Home = () => (
  <>
    <PortadaOsky />

    <section className="why-us-section" aria-labelledby="por-que-osky">
      <h2 className="why-us-title" id="por-que-osky">
        ¿Por qué elegir Osky Diseños?
      </h2>
      <div className="cards-container">
        <article className="box-card violet">
          <h3>Diseños personalizados</h3>
          <p>Una identidad que representa tu proyecto, en lugar de depender de soluciones genéricas.</p>
        </article>
        <article className="box-card green">
          <h3>Una propuesta clara</h3>
          <p>Desde una pieza para redes hasta una página web: elegí lo que necesita tu emprendimiento.</p>
        </article>
        <article className="box-card gold">
          <h3>Acompañamiento</h3>
          <p>Conversamos sobre tus objetivos para crear una solución alineada con tu marca.</p>
        </article>
      </div>
    </section>
  </>
);

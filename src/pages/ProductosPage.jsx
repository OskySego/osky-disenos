import React from 'react';
import { ItemListContainer } from '../components/ItemListContainer';

export const ProductosPage = () => {
  return (
    <>
      <section className="hero parallax">
        <div className="hero-content">
          <div className="hero-image-container">
            <img src="/img/Logo_for_Osky_Diseños.svg" alt="Logo de Osky Diseños" className="hero-main-image" />
          </div>
          <h1 className="typewriter">
            <span className="greeting" id="greeting-text">Nuestra Tienda De Diseños</span>
          </h1>
          <p className="subtitle fade-in delay-1">Combos pensados para emprendedores</p>
          <p className="highlight-text fade-in delay-2">Que buscan impacto real y resultados rápidos</p>
          <p className="highlight-text fade-in delay-3">Y también pensamos en los diseños particulares</p>
        </div>
      </section>

      <ItemListContainer />
    </>
  );
};
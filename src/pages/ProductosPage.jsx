import React from 'react';
import { Link } from 'react-router-dom';
import { ItemListContainer } from '../components/ItemListContainer';
// Este componente usa las rutas reales de App.jsx: /productos y /contacto.
export const ProductosPage = () => {
  return (
    <div className="catalogo-premium">
      <section className="catalogo-hero" aria-labelledby="catalogo-titulo">
        <div className="catalogo-hero__halo" aria-hidden="true" />
        <div className="catalogo-hero__inner">
          <div className="catalogo-hero__texto">
            <p className="catalogo-hero__etiqueta">
              <span className="catalogo-hero__marca" aria-hidden="true">✦</span>
              OSKY DISEÑOS · ESTUDIO CREATIVO
            </p>

            <h1 id="catalogo-titulo">
              Diseño que impulsa<br />
              <span>tu próxima gran idea.</span>
            </h1>

            <p className="catalogo-hero__descripcion">
              Diseño web, identidad visual y contenido para redes.
              Soluciones pensadas para que tu emprendimiento se destaque,
              comunique mejor y genere confianza.
            </p>

            <div className="catalogo-hero__acciones">
              <a className="catalogo-boton catalogo-boton--principal" href="#catalogo-listado">
                Explorar servicios <span aria-hidden="true">↗</span>
              </a>
              <Link className="catalogo-boton catalogo-boton--secundario" to="/contacto">
                Hablemos de tu proyecto
              </Link>
            </div>

            <div className="catalogo-hero__beneficios" aria-label="Nuestro enfoque">
              <span><b aria-hidden="true">✧</b> Diseño personalizado</span>
              <span><b aria-hidden="true">⌁</b> Identidad memorable</span>
              <span><b aria-hidden="true">✦</b> Acompañamiento cercano</span>
            </div>
          </div>

          <div className="catalogo-hero__visual" aria-hidden="true">
            <div className="catalogo-hero__aro catalogo-hero__aro--externo" />
            <div className="catalogo-hero__aro catalogo-hero__aro--interno" />
            <img
              className="catalogo-hero__fenix"
              src="/img/osky/fenix-osky.webp"
              alt=""
              loading="eager"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/img/Logo_for_Osky_Diseños.svg';
              }}
            />
          </div>
        </div>
      </section>

      <ItemListContainer />
    </div>
  );
};

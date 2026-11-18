// src/components/Item.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const Item = ({ item }) => {
  const { addToCart, getCantidadActual } = useContext(CartContext);
  const [agregado, setAgregado] = useState(false);

  const cantidadActual = getCantidadActual(item.id);

  const handleAddToCart = () => {
    addToCart(item, 1);
    setAgregado(true);

    setTimeout(() => {
      setAgregado(false);
    }, 2000);
  };

  // Normaliza URLs externas (http/data) y rutas locales (/img/... o img/...) sin duplicar la barra
  const rutaLimpia = item.imagen?.trim() || '';
  const imgSrc =
    rutaLimpia.startsWith('http') ||
    rutaLimpia.startsWith('data:') ||
    rutaLimpia.startsWith('/')
      ? rutaLimpia
      : rutaLimpia
      ? `/${rutaLimpia}`
      : '/img/Logo_for_Osky_Diseños.svg';

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={imgSrc} alt={item.nombre} className="product-img" />
      </div>

      <div className="product-card-body">
        <h4 className="product-title">{item.nombre}</h4>
        <p className="product-description">{item.descripcion}</p>

        <div className="product-card-footer">
          <span className="product-price">
            ${Number(item.precio).toLocaleString('es-AR')} ARS
          </span>

          <div className="product-card-actions">
            <Link to={`/producto/${item.id}`} className="btn-detail">
              Ver detalle
            </Link>

            <button
              onClick={handleAddToCart}
              className={`cta-button btn-add-cart ${agregado ? 'btn-success-added' : ''}`}
              disabled={agregado}
            >
              {agregado
                ? '✓ ¡Añadido!'
                : cantidadActual > 0
                ? `🛒 Añadir (${cantidadActual})`
                : '🛒 Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
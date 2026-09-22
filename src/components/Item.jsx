import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const Item = ({ item }) => {
  const { addToCart } = useContext(CartContext);
  const [agregado, setAgregado] = useState(false);

  const handleAddToCart = () => {
    addToCart(item, 1);
    setAgregado(true);

    // Vuelve al estado normal después de 2 segundos
    setTimeout(() => {
      setAgregado(false);
    }, 2000);
  };

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={`/${item.imagen}`} alt={item.nombre} className="product-img" />
      </div>

      <div className="product-card-body">
        <h4 className="product-title">{item.nombre}</h4>
        <p className="product-description">{item.descripcion}</p>

        <div className="product-card-footer">
          <span className="product-price">
            ${item.precio.toLocaleString('es-AR')} ARS
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
              {agregado ? '✓ ¡Añadido!' : '🛒 Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
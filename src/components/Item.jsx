import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const Item = ({ item }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <article className="box-card">
      <div className="card-image">
        <img src={item.imagen} alt={item.nombre} />
      </div>
      <div className="card-head">
        <h4>{item.nombre}</h4>
        <div className="price">
          <span className="amount">${item.precio.toLocaleString('es-AR')}</span>
          <small>ARS</small>
        </div>
      </div>
      <p className="card-lead">{item.descripcion}</p>
      {item.caracteristicas && (
        <ul className="card-features">
          {item.caracteristicas.map((feat, idx) => (
            <li key={idx}>{feat}</li>
          ))}
        </ul>
      )}
      <div className="card-cta" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button onClick={() => addToCart(item, 1)} className="cta-button">
          Añadir al carrito
        </button>
        <Link to={`/producto/${item.id}`} className="secondary-cta" style={{ textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
};
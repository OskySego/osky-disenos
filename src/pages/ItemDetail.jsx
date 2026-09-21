import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const ItemDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch('/productos.json')
      .then((res) => res.json())
      .then((data) => {
        const itemEncontrado = data.find((p) => p.id === parseInt(id));
        setProducto(itemEncontrado);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Cargando detalle del servicio...</p>;
  if (!producto) return <p style={{ textAlign: 'center', padding: '50px' }}>Servicio no encontrado.</p>;

  return (
    <section className="detail-container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/productos" className="secondary-cta" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Volver a Servicios
      </Link>
      <div className="box-card" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', padding: '25px' }}>
        <img src={`/${producto.imagen}`} alt={producto.nombre} style={{ width: '100%', maxWidth: '350px', borderRadius: '10px', objectFit: 'cover' }} />
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2>{producto.nombre}</h2>
          <p style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${producto.precio.toLocaleString('es-AR')} ARS
          </p>
          <p>{producto.descripcion}</p>
          
          {producto.caracteristicas && (
            <ul>
              {producto.caracteristicas.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Cantidad:</label>
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="cta-button" style={{ padding: '5px 12px' }}>-</button>
            <span>{cantidad}</span>
            <button onClick={() => setCantidad(cantidad + 1)} className="cta-button" style={{ padding: '5px 12px' }}>+</button>
          </div>

          <button onClick={() => addToCart(producto, cantidad)} className="cta-button main-cta">
            Añadir {cantidad} al carrito
          </button>
        </div>
      </div>
    </section>
  );
};
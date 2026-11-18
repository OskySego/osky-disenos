import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartContext } from '../context/CartContext';

export const ItemDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const docRef = doc(db, 'productos', id);

    getDoc(docRef)
      .then((resp) => {
        if (!resp.exists()) {
          throw new Error('El servicio o producto solicitado no existe.');
        }
        setProducto({ ...resp.data(), id: resp.id });
      })
      .catch((err) => {
        setError(err.message || 'No se pudo cargar el detalle del servicio.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(producto, cantidad);
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#ffd700' }}>⏳ Cargando detalle del servicio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', color: '#ff6b6b' }}>⚠️ {error}</p>
        <Link to="/productos" className="secondary-cta" style={{ marginTop: '15px', display: 'inline-block' }}>
          ← Volver a Servicios
        </Link>
      </div>
    );
  }

  const imgSrc = producto.imagen?.startsWith('http') ? producto.imagen : `/${producto.imagen}`;

  return (
    <section className="detail-container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/productos" className="secondary-cta" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Volver a Servicios
      </Link>

      <div className="product-card" style={{ padding: '25px', flexDirection: 'row', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: '320px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px' }}>
          <img src={imgSrc} alt={producto.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#ffd700', fontSize: '0.85rem', textTransform: 'uppercase' }}>{producto.categoria}</span>
          <h2>{producto.nombre}</h2>
          <p style={{ color: '#ffd700', fontSize: '1.6rem', fontWeight: 'bold', margin: '10px 0' }}>
            ${Number(producto.precio).toLocaleString('es-AR')} ARS
          </p>
          <p style={{ color: '#ccc', lineHeight: '1.5' }}>{producto.descripcion}</p>
          {producto.stock !== undefined && (
            <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '8px' }}>
              Stock disponible: {producto.stock}
            </p>
          )}

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 'bold' }}>Cantidad:</label>
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="cta-button" style={{ padding: '4px 12px' }}>-</button>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{cantidad}</span>
            <button
              onClick={() => setCantidad((prev) => (!producto.stock || prev < producto.stock ? prev + 1 : prev))}
              className="cta-button"
              style={{ padding: '4px 12px' }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`cta-button main-cta ${agregado ? 'btn-success-added' : ''}`}
            disabled={agregado}
            style={{ padding: '12px 20px', fontSize: '1rem', width: '100%', maxWidth: '300px' }}
          >
            {agregado ? '✓ ¡Añadido con éxito!' : `🛒 Añadir ${cantidad} al carrito`}
          </button>
        </div>
      </div>
    </section>
  );
};
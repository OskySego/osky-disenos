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
    setCantidad(1);

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
        <p style={{ fontSize: '1.2rem', color: '#FFD700' }}>⏳ Cargando detalle del servicio...</p>
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

  // Normaliza URLs externas y rutas locales sin duplicar barras
  const rutaLimpia = producto.imagen?.trim() || '';
  const imgSrc =
    rutaLimpia.startsWith('http') ||
    rutaLimpia.startsWith('data:') ||
    rutaLimpia.startsWith('/')
      ? rutaLimpia
      : rutaLimpia
      ? `/${rutaLimpia}`
      : '/img/Logo_for_Osky_Diseños.svg';

  // Soporta características guardadas como array o como texto separado por comas
  const listaCaracteristicas = Array.isArray(producto.caracteristicas)
    ? producto.caracteristicas
    : typeof producto.caracteristicas === 'string' && producto.caracteristicas.trim() !== ''
    ? producto.caracteristicas.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const sinStock = producto.stock !== undefined && Number(producto.stock) <= 0;

  return (
    <section className="detail-container" style={{ padding: '45px 20px', maxWidth: '880px', margin: '0 auto' }}>
      <Link to="/productos" className="secondary-cta" style={{ marginBottom: '24px', display: 'inline-flex' }}>
        ← Volver a Servicios
      </Link>

      <div className="product-card" style={{ padding: '30px', flexDirection: 'row', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Contenedor de imagen con resplandor radial violeta */}
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, rgba(120, 81, 169, 0.45) 0%, rgba(24, 0, 48, 0.88) 78%)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(120, 81, 169, 0.4)',
            boxShadow: '0 0 30px rgba(120, 81, 169, 0.35)'
          }}
        >
          <img
            src={imgSrc}
            alt={producto.nombre}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/img/Logo_for_Osky_Diseños.svg';
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 18px rgba(120, 81, 169, 0.65))'
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          <span
            style={{
              color: '#FFD700',
              fontSize: '0.82rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px'
            }}
          >
            {producto.categoria}
          </span>

          <h2 style={{ color: '#E6E6FA', fontSize: '1.85rem', marginBottom: '8px' }}>
            {producto.nombre}
          </h2>

          <p style={{ color: '#FFD700', fontSize: '1.65rem', fontWeight: '800', margin: '6px 0 14px' }}>
            ${Number(producto.precio).toLocaleString('es-AR')} ARS
          </p>

          <p style={{ color: 'rgba(230, 230, 250, 0.8)', lineHeight: '1.6', marginBottom: '16px' }}>
            {producto.descripcion}
          </p>

          {/* Listado de características incluidas */}
          {listaCaracteristicas.length > 0 && (
            <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(120, 81, 169, 0.16)', border: '1px solid rgba(120, 81, 169, 0.35)' }}>
              <strong style={{ display: 'block', color: '#E6E6FA', fontSize: '0.92rem', marginBottom: '8px' }}>
                ¿Qué incluye este servicio?
              </strong>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {listaCaracteristicas.map((item, index) => (
                  <li key={index} style={{ fontSize: '0.9rem', color: 'rgba(230, 230, 250, 0.85)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {producto.stock !== undefined && (
            <p style={{ fontSize: '0.88rem', color: sinStock ? '#ff6b6b' : 'rgba(230, 230, 250, 0.7)', marginBottom: '14px' }}>
              {sinStock ? 'Sin disponibilidad momentánea' : `Cupos / stock disponible: ${producto.stock}`}
            </p>
          )}

          {!sinStock && (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: 'bold', color: '#E6E6FA' }}>Cantidad:</label>
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="btn-qty"
                  style={{ border: '1px solid rgba(120, 81, 169, 0.6)' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#E6E6FA', minWidth: '24px', textAlign: 'center' }}>
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad((prev) => (!producto.stock || prev < producto.stock ? prev + 1 : prev))}
                  className="btn-qty"
                  style={{ border: '1px solid rgba(120, 81, 169, 0.6)' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`cta-button main-cta ${agregado ? 'btn-success-added' : ''}`}
                disabled={agregado}
                style={{ padding: '14px 24px', fontSize: '1rem', width: '100%', maxWidth: '320px' }}
              >
                {agregado ? '✓ ¡Añadido con éxito!' : `🛒 Añadir ${cantidad} al carrito`}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
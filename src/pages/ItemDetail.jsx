import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartContext } from '../context/CartContext';

export const ItemDetail = () => {
  const { id } = useParams();
  // Al cambiar de servicio se reinicia el estado del detalle.
  return <ItemDetailContenido key={id} id={id} />;
};

const ItemDetailContenido = ({ id }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let activo = true;
    getDoc(doc(db, 'productos', id))
      .then((resp) => {
        if (!activo) return;
        if (!resp.exists()) {
          throw new Error('El servicio o producto solicitado no existe.');
        }
        setProducto({ ...resp.data(), id: resp.id });
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudo cargar el detalle del servicio.');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => { activo = false; };
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
      <section className="detail-section">
        <p style={{ fontSize: '1.2rem', color: '#FFD700', textAlign: 'center' }}>
          ⏳ Cargando detalle del servicio...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-section" style={{ flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '1.2rem', color: '#ff6b6b' }}>⚠️ {error}</p>
        <Link to="/productos" className="secondary-cta">
          ← Volver a Servicios
        </Link>
      </section>
    );
  }

  const rutaLimpia = producto.imagen?.trim() || '';
  const imgSrc =
    rutaLimpia.startsWith('http') ||
    rutaLimpia.startsWith('data:') ||
    rutaLimpia.startsWith('/')
      ? rutaLimpia
      : rutaLimpia
      ? `/${rutaLimpia}`
      : '/img/Logo_for_Osky_Diseños.svg';

  const caracteristicasGuardadas = Array.isArray(producto.caracteristicas)
    ? producto.caracteristicas
    : typeof producto.caracteristicas === 'string' && producto.caracteristicas.trim() !== ''
    ? producto.caracteristicas.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const beneficiosMostrar =
    caracteristicasGuardadas.length > 0
      ? caracteristicasGuardadas
      : [
          'Diseño 100% personalizado a medida de tu marca',
          'Atención directa y seguimiento por WhatsApp',
          'Entrega de archivos finales listos para usar'
        ];

  const sinStock = producto.stock !== undefined && Number(producto.stock) <= 0;

  return (
    <section className="detail-section">
      <div className="detail-wrapper">
        {/* Barra superior alineada a la izquierda de la tarjeta */}
        <div className="detail-topbar">
          <Link to="/productos" className="detail-back-link">
            ← Volver a Servicios
          </Link>
        </div>

        <article className="detail-card">
          {/* Columna izquierda: Vitrina de imagen con resplandor violeta */}
          <div className="detail-media">
            <div className="detail-media-glow" />
            <img
              src={imgSrc}
              alt={producto.nombre}
              className="detail-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/img/Logo_for_Osky_Diseños.svg';
              }}
            />
          </div>

          {/* Columna derecha: Jerarquía de información y compra */}
          <div className="detail-info">
            <span className="detail-badge">{producto.categoria}</span>

            <h1 className="detail-title">{producto.nombre}</h1>

            <div className="detail-price-box">
              <span className="detail-price">
                ${Number(producto.precio).toLocaleString('es-AR')}
              </span>
              <span className="detail-currency">ARS</span>
            </div>

            <p className="detail-desc">{producto.descripcion}</p>

            {/* Bloque de características / beneficios incluidos */}
            <div className="detail-features">
              <span className="detail-features-title">¿Qué incluye este servicio?</span>
              <ul className="detail-features-list">
                {beneficiosMostrar.map((item, idx) => (
                  <li key={idx}>
                    <span className="detail-check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {producto.stock !== undefined && (
              <div className={`detail-stock ${sinStock ? 'out' : ''}`}>
                <span className="stock-dot" />
                <span>
                  {sinStock
                    ? 'Sin cupos disponibles por el momento'
                    : `Disponible • ${producto.stock} cupo(s) activo(s)`}
                </span>
              </div>
            )}

            {/* Barra unificada de Cantidad + Botón principal */}
            {!sinStock && (
              <div className="detail-purchase-bar">
                <div className="detail-qty-box" aria-label="Selector de cantidad">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="detail-qty-btn"
                    title="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="detail-qty-value">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad((prev) =>
                        !producto.stock || prev < producto.stock ? prev + 1 : prev
                      )
                    }
                    className="detail-qty-btn"
                    title="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`cta-button main-cta detail-cta ${
                    agregado ? 'btn-success-added' : ''
                  }`}
                  disabled={agregado}
                >
                  {agregado ? (
                    '✓ ¡Añadido al carrito!'
                  ) : (
                    <>
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>Añadir {cantidad} al carrito</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
};
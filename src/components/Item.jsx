import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const IMAGEN_POR_DEFECTO = '/img/Logo_for_Osky_Diseños.svg';

const resolverImagen = (ruta) => {
  const limpia = typeof ruta === 'string' ? ruta.trim() : '';
  if (!limpia) return IMAGEN_POR_DEFECTO;
  if (/^https?:\/\//i.test(limpia) || /^data:image\//i.test(limpia)) return limpia;
  if (limpia.startsWith('/')) return limpia;
  return `/${limpia.replace(/^\.\//, '')}`;
};

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const Item = ({ item }) => {
  const { addToCart, getCantidadActual } = useContext(CartContext);
  const [agregado, setAgregado] = useState(false);
  const cantidadEnCarrito = getCantidadActual(item.id);

  const stockDefinido = item.stock !== null && item.stock !== undefined && item.stock !== '' && Number.isFinite(Number(item.stock));
  const stock = stockDefinido ? Number(item.stock) : null;
  const agotado = stockDefinido && stock <= 0;
  const limiteAlcanzado = stockDefinido && cantidadEnCarrito >= stock;
  const precio = item.precio === '' || item.precio === undefined || item.precio === null ? NaN : Number(item.precio);
  const precioValido = Number.isFinite(precio) && precio > 0;
  const noPuedeAgregar = agotado || limiteAlcanzado || !precioValido || agregado;

  useEffect(() => {
    if (!agregado) return undefined;
    const timeoutId = window.setTimeout(() => setAgregado(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [agregado]);

  const agregarAlCarrito = () => {
    if (noPuedeAgregar) return;
    addToCart(item, 1);
    setAgregado(true);
  };

  const textoBoton = agotado
    ? 'Sin disponibilidad'
    : !precioValido
    ? 'Precio a consultar'
    : limiteAlcanzado
    ? 'Cupo alcanzado'
    : agregado
    ? '✓ Agregado'
    : 'Añadir al carrito';

  return (
    <article className="catalogo-tarjeta">
      <div className="catalogo-tarjeta__imagen">
        <span className="catalogo-tarjeta__categoria">{item.categoria || 'Osky Diseños'}</span>
        <img
          src={resolverImagen(item.imagen)}
          alt={item.nombre ? `Imagen de ${item.nombre}` : 'Servicio de Osky Diseños'}
          loading="lazy"
          onError={(evento) => {
            evento.currentTarget.onerror = null;
            evento.currentTarget.src = IMAGEN_POR_DEFECTO;
          }}
        />
      </div>

      <div className="catalogo-tarjeta__contenido">
        <div className="catalogo-tarjeta__estado">
          <span className={agotado ? 'catalogo-tarjeta__punto catalogo-tarjeta__punto--agotado' : 'catalogo-tarjeta__punto'} aria-hidden="true" />
          {agotado ? 'Sin cupos o stock' : stockDefinido ? `${stock} ${stock === 1 ? 'cupo / unidad' : 'cupos / unidades'}` : 'Consultá disponibilidad'}
        </div>
        <h3>{item.nombre || 'Servicio sin nombre'}</h3>
        <p className="catalogo-tarjeta__descripcion">{item.descripcion || 'Conocé todos los detalles de este servicio.'}</p>

        <div className="catalogo-tarjeta__pie">
          <div>
            <span className="catalogo-tarjeta__precio-etiqueta">Inversión</span>
            <strong className="catalogo-tarjeta__precio">
              {precioValido ? formatoPrecio.format(precio) : 'A consultar'}
            </strong>
          </div>

          <div className="catalogo-tarjeta__acciones">
            <Link to={`/producto/${item.id}`} className="catalogo-tarjeta__detalle">
              Ver detalle <span aria-hidden="true">↗</span>
            </Link>
            <button
              type="button"
              className={agregado ? 'catalogo-tarjeta__comprar catalogo-tarjeta__comprar--agregado' : 'catalogo-tarjeta__comprar'}
              onClick={agregarAlCarrito}
              disabled={noPuedeAgregar}
              aria-label={`${textoBoton}: ${item.nombre || 'servicio'}`}
            >
              {textoBoton}
              {!noPuedeAgregar && <span aria-hidden="true">＋</span>}
            </button>
          </div>
          {cantidadEnCarrito > 0 && (
            <span className="catalogo-tarjeta__en-carrito" aria-live="polite">
              {cantidadEnCarrito} {cantidadEnCarrito === 1 ? 'unidad en' : 'unidades en'} tu carrito
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

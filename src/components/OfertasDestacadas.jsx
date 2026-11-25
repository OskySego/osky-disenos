import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import styled from 'styled-components';
import { FiArrowUpRight, FiShoppingCart, FiTag } from 'react-icons/fi';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { descuentoDeOferta, itemParaCarrito, precioVigente, stockOfertaDisponible } from '../utils/ofertas';

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const dinero = (numero) => moneda.format(Number(numero) || 0);
const IMAGEN_POR_DEFECTO = '/img/Logo_for_Osky_Diseños.svg';
const imagenProducto = (producto) => {
  const valor = String(producto?.imagen || '').trim();
  if (!valor) return IMAGEN_POR_DEFECTO;
  if (/^https?:\/\//i.test(valor) || valor.startsWith('data:image/') || valor.startsWith('/')) return valor;
  return '/' + valor.replace(/^\.\//, '');
};

const Seccion = styled.section`
  width: 100%; padding: 64px 20px 76px;
  color: #f2f0f7; background: radial-gradient(ellipse at top, #351252 0%, #1e0b36 70%);
  * { box-sizing: border-box; }
  .od-contenedor { width: min(1170px, 100%); margin-inline: auto; }
  .od-eyebrow { color: #ccff00; font-size: .76rem; font-weight: 850; letter-spacing: .14em; }
  .od-cabecera { display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 20px; margin-bottom: 27px; }
  h2 { margin: 9px 0; font-size: clamp(1.7rem, 4vw, 2.7rem); color: #fff; }
  .od-cabecera p { color: #cfc3dc; margin: 0; }
  .od-ver-todos { color: #ccff00; font-weight: 800; display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
  .od-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .od-tarjeta { overflow: hidden; border-radius: 22px; border: 1px solid rgba(172, 100, 240, .45);
    background: linear-gradient(160deg, #371a58, #1a0b2d); box-shadow: 0 20px 38px rgba(3, 0, 12, .24); }
  .od-visual { position: relative; aspect-ratio: 16 / 10; background: #241038; overflow: hidden; }
  .od-visual img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .od-chip { position: absolute; z-index: 1; top: 13px; left: 13px; background: #ccff00; color: #1e0b36;
    font-size: .86rem; font-weight: 950; padding: 8px 13px; border-radius: 100px; }
  .od-cuerpo { padding: 21px; }
  .od-categoria { color: #bd9fe3; font-size: .72rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
  h3 { color: #fff; margin: 8px 0 13px; font-size: 1.16rem; line-height: 1.35; min-height: 2.7em; }
  .od-precio-antes { color: #b9a9ce; text-decoration: line-through; font-size: .88rem; }
  .od-precio-ahora { display: block; color: #ccff00; font-size: 1.58rem; font-weight: 950; margin-top: 4px; }
  .od-cupos { display: inline-flex; gap: 8px; align-items: center; margin: 15px 0; color: #e8ddf0; font-size: .87rem; }
  .od-botones { display: flex; flex-wrap: wrap; gap: 8px; }
  .od-boton { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 12px;
    border: 1px solid #ccff00; background: #ccff00; color: #1e0b36; font-size: .84rem; font-weight: 900;
    padding: 11px 13px; min-height: 44px; cursor: pointer; text-decoration: none; }
  .od-boton--detalle { background: transparent; color: #f2f0f7; border-color: #8f54c7; }
  .od-boton:disabled { opacity: .55; cursor: not-allowed; }
  .od-boton:focus-visible, .od-ver-todos:focus-visible { outline: 3px solid #ccff00; outline-offset: 4px; }
  @media (max-width: 900px) { .od-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 580px) { .od-grid { grid-template-columns: 1fr; } }
`;

export const OfertasDestacadas = () => {
  const { addToCart, getCantidadActual } = useCart();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    // Catálogo actual pequeño: consulta simple, sin índice compuesto adicional.
    getDocs(collection(db, 'productos'))
      .then((respuesta) => {
        if (!activo) return;
        const ofertas = respuesta.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((producto) => descuentoDeOferta(producto) > 0)
          .sort((a, b) => descuentoDeOferta(b) - descuentoDeOferta(a))
          .slice(0, 6);
        setProductos(ofertas);
      })
      .catch((err) => {
        if (!activo) return;
        console.error('Error al cargar ofertas:', err);
        setError('Las promociones no están disponibles en este momento.');
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  // Sin ofertas, no ocupamos espacio en la portada.
  if (!cargando && !error && productos.length === 0) return null;

  return (
    <Seccion aria-label="Promociones y descuentos">
      <div className="od-contenedor">
        <div className="od-cabecera">
          <div><span className="od-eyebrow"><FiTag aria-hidden="true" /> OPORTUNIDADES ESPECIALES</span>
            <h2>Ofertas destacadas</h2><p>Servicios con descuento y cupos promocionales configurados.</p></div>
          <Link className="od-ver-todos" to="/productos">Ver todos los servicios <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
        {cargando && <p role="status">Buscando ofertas disponibles…</p>}
        {error && <p role="alert">{error}</p>}
        <div className="od-grid">
          {productos.map((p) => {
            const descuento = descuentoDeOferta(p);
            const cupos = stockOfertaDisponible(p);
            const enCarrito = getCantidadActual(p.id);
            const alcanzado = enCarrito >= cupos;
            return (
              <article key={p.id} className="od-tarjeta">
                <div className="od-visual"><span className="od-chip">{descuento}% OFF</span>
                  <img src={imagenProducto(p)} alt={`Imagen de ${p.nombre || 'servicio'}`} loading="lazy"
                    onError={(evento) => { evento.currentTarget.onerror = null; evento.currentTarget.src = IMAGEN_POR_DEFECTO; }} /></div>
                <div className="od-cuerpo">
                  <span className="od-categoria">{p.categoria || 'Osky Diseños'}</span>
                  <h3>{p.nombre || 'Servicio'}</h3>
                  <span className="od-precio-antes">{dinero(p.precio)}</span>
                  <strong className="od-precio-ahora">{dinero(precioVigente(p))}</strong>
                  <div className="od-cupos"><FiShoppingCart aria-hidden="true" /> {cupos} {cupos === 1 ? 'cupo promocional' : 'cupos promocionales'}</div>
                  <div className="od-botones">
                    <button type="button" className="od-boton" disabled={alcanzado}
                      onClick={() => addToCart(itemParaCarrito(p), 1)}>
                      <FiShoppingCart aria-hidden="true" /> {alcanzado ? 'Cupo alcanzado' : 'Agregar al carrito'}
                    </button>
                    <Link className="od-boton od-boton--detalle" to={`/producto/${p.id}`}>
                      Ver detalle <FiArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Seccion>
  );
};

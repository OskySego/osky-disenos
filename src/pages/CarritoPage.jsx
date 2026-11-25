import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartContext } from '../context/CartContext';
import '../css/CarritoPremium.css';
import { CheckoutFinal } from '../components/CheckoutFinal';


const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const dinero = (valor) => moneda.format(Number(valor) || 0);

const obtenerImagen = (imagen) => {
  const ruta = typeof imagen === 'string' ? imagen.trim() : '';
  if (!ruta) return '/img/logo-osky.png';
  if (/^(https?:\/\/|data:|blob:|\/)/i.test(ruta)) return ruta;
  return `/${ruta}`;
};

export const CarritoPage = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useContext(CartContext);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const cantidadProductos = cart.reduce((acum, item) => acum + (Number(item.quantity) || 0), 0);
  const descuentoPorcentaje = Number(cuponAplicado?.descuento) || 0;
  const descuento = (totalPrice * descuentoPorcentaje) / 100;
  const total = Math.max(0, totalPrice - descuento);

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setErrorCupon('');
  };

  const aplicarCupon = async (evento) => {
    evento.preventDefault();
    if (validandoCupon) return;
    const codigo = codigoCupon.trim().toUpperCase();
    setErrorCupon('');
    if (!codigo) {
      setErrorCupon('Ingresá un código de descuento.');
      return;
    }

    setValidandoCupon(true);
    try {
      const consulta = query(
        collection(db, 'cupones'),
        where('codigo', '==', codigo),
        where('activo', '==', true),
      );
      const respuesta = await getDocs(consulta);
      if (respuesta.empty) {
        setCuponAplicado(null);
        setErrorCupon('El cupón no existe o no está activo.');
        return;
      }

      const cupon = respuesta.docs[0].data();
      const porcentaje = Number(cupon.descuento);
      if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
        setCuponAplicado(null);
        setErrorCupon('El descuento configurado no es válido.');
        return;
      }

      setCuponAplicado({ codigo, descuento: porcentaje });
    } catch (error) {
      console.error('Error al consultar el cupón:', error);
      setErrorCupon('No pudimos comprobar el cupón. Probá nuevamente.');
    } finally {
      setValidandoCupon(false);
    }
  };

  const mensajeProductos = cart.map((item) => {
    const cantidad = Number(item.quantity) || 1;
    const subtotal = (Number(item.precio) || 0) * cantidad;
    return `• *${item.nombre}* (x${cantidad}) — ${dinero(subtotal)}`;
  }).join('\n');

  const mensajeCupon = cuponAplicado
    ? `\nSubtotal: ${dinero(totalPrice)}\n🎟️ Cupón ${cuponAplicado.codigo} (${descuentoPorcentaje}%): -${dinero(descuento)}\n`
    : '\n';

  const mensajeWhatsApp = `¡Hola Osky Diseños! 👋\n\nQuisiera consultar por este pedido:\n\n${mensajeProductos}\n${mensajeCupon}\n*Total estimado:* ${dinero(total)}\n\nQuedo a la espera para coordinar disponibilidad, detalles y forma de pago. ¡Muchas gracias!`;
  const whatsappHref = `https://wa.me/5491123230175?text=${encodeURIComponent(mensajeWhatsApp)}`;

  const vaciar = () => {
    clearCart();
    quitarCupon();
    setConfirmarVaciar(false);
  };

  return (
    <section className="osky-checkout">
      <div className="osky-checkout__contenedor">
        <div className="osky-checkout__encabezado">
          <div>
            <span className="osky-checkout__eyebrow">TU SELECCIÓN · OSKY DISEÑOS</span>
            <h1>Tu carrito <span>de proyectos</span></h1>
            <p>Revisá los servicios, ajustá las cantidades y enviá tu consulta cuando estés listo.</p>
          </div>
          <Link className="osky-checkout__seguir" to="/productos">← Seguir explorando</Link>
        </div>

        {cart.length === 0 ? (
          <div className="osky-checkout__vacio">
            <span className="osky-checkout__vacio-icono" aria-hidden="true">✧</span>
            <h2>Tu próxima gran idea empieza acá</h2>
            <p>Por ahora no agregaste servicios. Explorá el catálogo y elegí los que necesitás para tu marca.</p>
            <Link className="osky-checkout__boton osky-checkout__boton--primario" to="/productos">
              Explorar servicios <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          <div className="osky-checkout__columnas">
            <div className="osky-checkout__listado">
              <div className="osky-checkout__seccion-head">
                <div>
                  <span className="osky-checkout__eyebrow">SERVICIOS ELEGIDOS</span>
                  <h2>Tu selección <span>({cantidadProductos})</span></h2>
                </div>
                <button type="button" className="osky-checkout__vaciar" onClick={() => setConfirmarVaciar(true)}>
                  Vaciar carrito
                </button>
              </div>

              <div className="osky-checkout__items">
                {cart.map((item) => {
                  const cantidad = Number(item.quantity) || 1;
                  const precio = Number(item.precio) || 0;
                  const stock = Number(item.stock);
                  const hayLimite = item.stock !== null && item.stock !== undefined && item.stock !== '' && Number.isFinite(stock);
                  return (
                    <article className="osky-checkout__item" key={item.id}>
                      <Link className="osky-checkout__item-img" to={`/producto/${item.id}`} aria-label={`Ver ${item.nombre}`}>
                        <img
                          src={obtenerImagen(item.imagen)}
                          alt={item.nombre}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/logo-osky.png'; }}
                        />
                      </Link>
                      <div className="osky-checkout__item-detalles">
                        <span className="osky-checkout__categoria">{item.categoria || 'Servicio creativo'}</span>
                        <h3><Link to={`/producto/${item.id}`}>{item.nombre}</Link></h3>
                        <p>{dinero(precio)} por unidad</p>
                        <button className="osky-checkout__quitar" type="button" onClick={() => removeFromCart(item.id)}>
                          Quitar de mi selección
                        </button>
                      </div>
                      <div className="osky-checkout__item-controles">
                        <strong>{dinero(precio * cantidad)}</strong>
                        <div className="osky-checkout__cantidad" aria-label={`Cantidad para ${item.nombre}`}>
                          <button type="button" onClick={() => decreaseQuantity(item.id)} disabled={cantidad <= 1} aria-label={`Restar una unidad de ${item.nombre}`}>−</button>
                          <span aria-live="polite">{cantidad}</span>
                          <button type="button" onClick={() => increaseQuantity(item.id)} disabled={hayLimite && cantidad >= stock} aria-label={`Agregar una unidad de ${item.nombre}`}>+</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="osky-checkout__nota"><span aria-hidden="true">✦</span> La disponibilidad de los servicios se confirma al coordinar el pedido.</div>
            </div>

            <aside className="osky-checkout__resumen" aria-labelledby="osky-resumen-title">
              <span className="osky-checkout__eyebrow">RESUMEN DE TU PROYECTO</span>
              <h2 id="osky-resumen-title">Tu presupuesto</h2>
              <div className="osky-checkout__precio-renglon"><span>Subtotal</span><strong>{dinero(totalPrice)}</strong></div>
              {cuponAplicado && (
                <div className="osky-checkout__precio-renglon osky-checkout__descuento">
                  <span>Descuento ({descuentoPorcentaje}%)</span><strong>−{dinero(descuento)}</strong>
                </div>
              )}

              <form className="osky-checkout__cupon" onSubmit={aplicarCupon}>
                <label htmlFor="osky-cupon">¿Tenés un cupón de descuento?</label>
                <div className="osky-checkout__cupon-fila">
                  <input id="osky-cupon" value={codigoCupon} onChange={(e) => { setCodigoCupon(e.target.value); setErrorCupon(''); }} placeholder="Ej.: OSKY15" disabled={Boolean(cuponAplicado) || validandoCupon} autoComplete="off" />
                  {cuponAplicado ? (
                    <button type="button" onClick={quitarCupon}>Quitar</button>
                  ) : (
                    <button type="submit" disabled={validandoCupon}>{validandoCupon ? '...' : 'Aplicar'}</button>
                  )}
                </div>
                {errorCupon && <p className="osky-checkout__error" role="alert">{errorCupon}</p>}
                {cuponAplicado && <p className="osky-checkout__cupon-ok" role="status">✓ Cupón {cuponAplicado.codigo} aplicado</p>}
              </form>

              <div className="osky-checkout__total">
                <span>Total estimado</span>
                <strong>{dinero(total)}</strong>
              </div>
              <p className="osky-checkout__aclaracion">El importe y el descuento quedan sujetos a la confirmación final del negocio.</p>
              <CheckoutFinal
                cart={cart}
                totalEstimado={total}
                codigoCupon={cuponAplicado?.codigo || ''}
                whatsappHref={whatsappHref}
              />
              <p className="osky-checkout__privacidad">El carrito se conserva al abrir WhatsApp. Podés volver sin perder tu selección.</p>
            </aside>
          </div>
        )}
      </div>

      {confirmarVaciar && (
        <div className="osky-checkout__modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmarVaciar(false); }}>
          <div className="osky-checkout__modal" role="dialog" aria-modal="true" aria-labelledby="osky-confirmar-titulo">
            <span className="osky-checkout__vacio-icono" aria-hidden="true">!</span>
            <h2 id="osky-confirmar-titulo">¿Vaciar tu carrito?</h2>
            <p>Se quitarán todos los servicios seleccionados. Esta acción no se puede deshacer.</p>
            <div className="osky-checkout__modal-botones">
              <button type="button" onClick={() => setConfirmarVaciar(false)} autoFocus>Cancelar</button>
              <button type="button" className="osky-checkout__boton-peligro" onClick={vaciar}>Sí, vaciar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

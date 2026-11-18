import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartContext } from '../context/CartContext';

export const CarritoPage = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalPrice } = useContext(CartContext);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);

  const montoDescuento = cuponAplicado ? (totalPrice * cuponAplicado.descuento) / 100 : 0;
  const totalConDescuento = totalPrice - montoDescuento;

  const handleAplicarCupon = async (e) => {
    e.preventDefault();
    setErrorCupon('');

    const codigoLimpio = codigoCupon.trim().toUpperCase();
    if (!codigoLimpio) {
      setErrorCupon('Ingresá un código de cupón.');
      return;
    }

    setValidandoCupon(true);
    try {
      const q = query(
        collection(db, 'cupones'),
        where('codigo', '==', codigoLimpio),
        where('activo', '==', true)
      );
      const resp = await getDocs(q);

      if (resp.empty) {
        setCuponAplicado(null);
        setErrorCupon('Cupón inválido o inactivo.');
        return;
      }

      setCuponAplicado(resp.docs[0].data());
      setErrorCupon('');
    } catch (err) {
      console.error('Error al validar cupón:', err);
      setErrorCupon('No se pudo verificar el cupón. Intentá nuevamente.');
    } finally {
      setValidandoCupon(false);
    }
  };

  const handleQuitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setErrorCupon('');
  };

  const handleVaciarCarrito = () => {
    handleQuitarCupon();
    clearCart();
  };

  const handleFinalizarCompra = () => {
    if (cart.length === 0) return;

    const mensajeServicios = cart
      .map(
        (item) =>
          `• *${item.nombre}* (x${item.quantity}) - $${(item.precio * item.quantity).toLocaleString('es-AR')} ARS`
      )
      .join('\n');

    const detalleDescuento = cuponAplicado
      ? `\nSubtotal: $${totalPrice.toLocaleString('es-AR')} ARS\n🎟️ *Cupón (${cuponAplicado.codigo} - ${cuponAplicado.descuento}% OFF):* -$${montoDescuento.toLocaleString('es-AR')} ARS\n`
      : '\n';

    const textoWhatsApp = `¡Hola Osky Diseños! 👋\n\nQuiero finalizar la compra de los siguientes servicios:\n\n${mensajeServicios}\n${detalleDescuento}💰 *Total a pagar:* $${totalConDescuento.toLocaleString('es-AR')} ARS\n\nQuedo a la espera para coordinar el pago y los detalles del proyecto. ¡Muchas gracias!`;

    const numeroTelefono = "5491123230175";
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(textoWhatsApp)}`;

    window.open(urlWhatsApp, '_blank');
    handleVaciarCarrito();
  };

  if (cart.length === 0) {
    return (
      <section className="cart-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Tu carrito está vacío 🛒</h2>
        <p style={{ margin: '15px 0', opacity: 0.8 }}>Todavía no agregaste ningún servicio a tu pedido.</p>
        <Link to="/productos" className="cta-button main-cta" style={{ display: 'inline-block', marginTop: '10px' }}>
          Explorar Servicios
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-page-container">
      <div className="cart-header">
        <h2>Tu Carrito de Compras</h2>
        <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{cart.length} servicio(s) seleccionado(s)</span>
      </div>

      <div className="cart-items-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item-card">
            <div className="cart-item-img-container">
              <img
                src={item.imagen?.startsWith('http') ? item.imagen : `/${item.imagen}`}
                alt={item.nombre}
              />
            </div>

            <div className="cart-item-info">
              <h4 className="cart-item-title">{item.nombre}</h4>
              <p className="cart-item-price">${item.precio.toLocaleString('es-AR')} ARS c/u</p>
            </div>

            <div className="cart-qty-controls">
              <button onClick={() => decreaseQuantity(item.id)} className="btn-qty" title="Restar">-</button>
              <span className="qty-num">{item.quantity}</span>
              <button onClick={() => increaseQuantity(item.id)} className="btn-qty" title="Sumar">+</button>
            </div>

            <div style={{ textAlign: 'right', minWidth: '110px' }}>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.05rem', display: 'block' }}>
                ${(item.precio * item.quantity).toLocaleString('es-AR')}
              </span>
            </div>

            <button onClick={() => removeFromCart(item.id)} className="btn-delete-item" title="Eliminar servicio">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary-box">
        {/* Formulario para canjear cupón de descuento */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleAplicarCupon} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value)}
              placeholder="Código de cupón (ej: OSKY15)"
              aria-label="Código de cupón de descuento"
              disabled={Boolean(cuponAplicado)}
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.25)',
                color: '#fff',
                flex: '1',
                minWidth: '200px'
              }}
            />
            {!cuponAplicado ? (
              <button type="submit" className="secondary-cta" disabled={validandoCupon}>
                {validandoCupon ? 'Validando...' : 'Aplicar Cupón'}
              </button>
            ) : (
              <button type="button" onClick={handleQuitarCupon} className="btn-delete-item" style={{ padding: '10px 14px' }}>
                Quitar Cupón
              </button>
            )}
          </form>

          {errorCupon && (
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '8px' }}>
              ⚠️ {errorCupon}
            </p>
          )}

          {cuponAplicado && (
            <p style={{ color: '#4ade80', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '8px' }}>
              ✓ Cupón {cuponAplicado.codigo} aplicado ({cuponAplicado.descuento}% OFF — Ahorrás ${montoDescuento.toLocaleString('es-AR')} ARS)
            </p>
          )}
        </div>

        {cuponAplicado && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: 0.85 }}>
            <span>Subtotal:</span>
            <span>${totalPrice.toLocaleString('es-AR')} ARS</span>
          </div>
        )}

        <div className="cart-total-row">
          <span>Total a Pagar:</span>
          <span className="cart-total-amount">${totalConDescuento.toLocaleString('es-AR')} ARS</span>
        </div>

        <div className="cart-actions">
          <button
            onClick={handleFinalizarCompra}
            className="cta-button main-cta"
            style={{ background: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '1.4rem' }}></i>
            Finalizar Compra
          </button>

          <button onClick={handleVaciarCarrito} className="clear-cart-btn-secondary">
            Vaciar todo el carrito
          </button>
        </div>
      </div>
    </section>
  );
};
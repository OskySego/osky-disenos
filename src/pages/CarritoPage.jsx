import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const CarritoPage = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalPrice } = useContext(CartContext);

  const handleFinalizarCompra = () => {
    if (cart.length === 0) return;

    const mensajeServicios = cart
      .map(
        (item) =>
          `• *${item.nombre}* (x${item.quantity}) - $${(item.precio * item.quantity).toLocaleString('es-AR')} ARS`
      )
      .join('\n');

    const textoWhatsApp = `¡Hola Osky Diseños! 👋\n\nQuiero finalizar la compra de los siguientes servicios:\n\n${mensajeServicios}\n\n💰 *Total:* $${totalPrice.toLocaleString('es-AR')} ARS\n\nQuedo a la espera para coordinar el pago y los detalles del proyecto. ¡Muchas gracias!`;

    const numeroTelefono = "5491123230175";
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(textoWhatsApp)}`;

    window.open(urlWhatsApp, '_blank');
    clearCart();
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
              <img src={`/${item.imagen}`} alt={item.nombre} />
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
        <div className="cart-total-row">
          <span>Total a Pagar:</span>
          <span className="cart-total-amount">${totalPrice.toLocaleString('es-AR')} ARS</span>
        </div>

        <div className="cart-actions">
          <button onClick={handleFinalizarCompra} className="cta-button main-cta" style={{ background: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fab fa-whatsapp" style={{ fontSize: '1.4rem' }}></i>
            Finalizar Compra
          </button>

          <button onClick={clearCart} className="clear-cart-btn-secondary">
            Vaciar todo el carrito
          </button>
        </div>
      </div>
    </section>
  );
};
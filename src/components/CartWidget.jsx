import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const CartWidget = () => {
  const { totalQuantity } = useContext(CartContext);

  return (
    <Link to="/carrito" style={{ textDecoration: 'none' }}>
      <button id="open-cart-btn" className="cart-icon">
        🛒 <span id="cart-quantity">{totalQuantity}</span>
      </button>
    </Link>
  );
};
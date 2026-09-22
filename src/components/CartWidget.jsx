import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const CartWidget = () => {
  const { totalItems } = useContext(CartContext);

  return (
    <Link to="/carrito" className="cart-widget">
      <span className="cart-icon">🛒</span>
      
      {totalItems > 0 && (
        <span className="cart-count">{totalItems}</span>
      )}
    </Link>
  );
};
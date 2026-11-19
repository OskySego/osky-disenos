import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export const CartWidget = () => {
  const { totalItems } = useContext(CartContext);
  const cantidad = Number.isFinite(Number(totalItems)) ? Math.max(0, Number(totalItems)) : 0;
  const descripcion = cantidad === 0
    ? 'Ver el carrito de compras, vacío'
    : `Ver el carrito de compras, ${cantidad} ${cantidad === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}`;

  return (
    <Link to="/carrito" className="cart-widget" aria-label={descripcion} title={descripcion}>
      <span className="cart-icon" aria-hidden="true">🛒</span>
      {cantidad > 0 && (
        <span className="cart-count" aria-hidden="true">{cantidad}</span>
      )}
    </Link>
  );
};

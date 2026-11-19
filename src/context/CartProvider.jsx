import { useEffect, useRef, useState } from 'react';
import { CartContext } from './CartContext';

const CLAVE_CARRITO = 'osky_cart';

const cantidadEntera = (valor, porDefecto = 1) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : porDefecto;
};

// null significa que el servicio no tiene un límite de cupos declarado.
const limiteDeStock = (item) => {
  if (item?.stock === null || item?.stock === undefined || item?.stock === '') {
    return null;
  }
  const stock = Number(item.stock);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : null;
};

const cargarCarritoGuardado = () => {
  try {
    const guardado = window.localStorage.getItem(CLAVE_CARRITO);
    if (!guardado) return [];

    const datos = JSON.parse(guardado);
    if (!Array.isArray(datos)) return [];

    return datos
      .filter((item) => item && typeof item === 'object' && item.id != null)
      .map((item) => ({ ...item, quantity: cantidadEntera(item.quantity) }));
  } catch (error) {
    console.warn('No se pudo recuperar el carrito guardado:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(cargarCarritoGuardado);
  const [mensajeToast, setMensajeToast] = useState(null);
  const timeoutToast = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(cart));
    } catch (error) {
      console.warn('No se pudo guardar el carrito en el navegador:', error);
    }
  }, [cart]);

  useEffect(() => () => {
    if (timeoutToast.current !== null) window.clearTimeout(timeoutToast.current);
  }, []);

  const avisar = (mensaje) => {
    if (timeoutToast.current !== null) window.clearTimeout(timeoutToast.current);
    setMensajeToast(mensaje);
    timeoutToast.current = window.setTimeout(() => {
      setMensajeToast(null);
      timeoutToast.current = null;
    }, 3000);
  };

  const addToCart = (item, quantity = 1) => {
    if (!item || item.id == null) return;

    const cantidadSolicitada = cantidadEntera(quantity);
    const existente = cart.find((producto) => producto.id === item.id);
    const limite = limiteDeStock(item);
    const actual = existente ? cantidadEntera(existente.quantity) : 0;

    if (limite !== null && actual >= limite) {
      avisar(`No hay más cupos disponibles para «${item.nombre || 'este servicio'}».`);
      return;
    }

    setCart((prevCart) => {
      const productoActual = prevCart.find((p) => p.id === item.id);
      const cantidadActual = productoActual ? cantidadEntera(productoActual.quantity) : 0;
      const maximo = limiteDeStock(item);
      const siguiente = maximo === null
        ? cantidadActual + cantidadSolicitada
        : Math.min(maximo, cantidadActual + cantidadSolicitada);

      if (siguiente <= cantidadActual) return prevCart;

      if (productoActual) {
        return prevCart.map((p) => p.id === item.id
          ? { ...p, quantity: siguiente }
          : p);
      }
      return [...prevCart, { ...item, quantity: siguiente }];
    });

    avisar(`¡«${item.nombre || 'Servicio'}» se añadió al carrito! 🛒`);
  };

  const removeFromCart = (id) => {
    setCart((actual) => actual.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart((actual) => actual.map((item) => {
      if (item.id !== id) return item;
      const cantidad = cantidadEntera(item.quantity);
      const limite = limiteDeStock(item);
      if (limite !== null && cantidad >= limite) return item;
      return { ...item, quantity: cantidad + 1 };
    }));
  };

  const decreaseQuantity = (id) => {
    setCart((actual) => actual.map((item) => {
      if (item.id !== id) return item;
      const cantidad = cantidadEntera(item.quantity);
      return cantidad > 1 ? { ...item, quantity: cantidad - 1 } : item;
    }));
  };

  const clearCart = () => setCart([]);
  const getCantidadActual = (productId) => {
    const item = cart.find((p) => p.id === productId);
    return item ? cantidadEntera(item.quantity) : 0;
  };
  const isInCart = (productId) => cart.some((p) => p.id === productId);

  const totalItems = cart.reduce((total, item) => total + cantidadEntera(item.quantity), 0);
  const totalPrice = cart.reduce((total, item) => {
    const precio = Number(item.precio);
    return total + (Number.isFinite(precio) && precio > 0 ? precio : 0) * cantidadEntera(item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeItem: removeFromCart, // Compatibilidad con los componentes existentes.
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getCantidadActual,
        isInCart,
        totalItems,
        totalPrice,
        mensajeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

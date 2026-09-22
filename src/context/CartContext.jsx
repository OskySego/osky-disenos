import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('osky_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Estado para controlar el mensaje del cartel de aviso
  const [mensajeToast, setMensajeToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('osky_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const itemExist = prevCart.find((p) => p.id === item.id);
      if (itemExist) {
        return prevCart.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prevCart, { ...item, quantity }];
    });

    // Activar el cartel flotante de aviso
    setMensajeToast(`¡"${item.nombre}" se añadió al carrito! 🛒`);

    // Ocultar el cartel automáticamente después de 3 segundos
    setTimeout(() => {
      setMensajeToast(null);
    }, 3000);
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
        mensajeToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
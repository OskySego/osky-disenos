import { createContext, useContext } from 'react';

// Contexto y hook. Mantienen los imports existentes en los componentes.
export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget'; // <-- Importamos de nuevo el carrito
import { CartContext } from '../context/CartContext';

export const Header = () => {
  const { mensajeToast } = useContext(CartContext);

  return (
    <header className="main-header">
      {/* 1. Logo que redirige al inicio */}
      <Link to="/" className="header-logo-container">
        <img 
          src="/img/logo.png" 
          alt="Osky Diseños Logo" 
          className="header-logo" 
        />
      </Link>

      {/* 2. Menú de navegación principal */}
      <NavBar />

      {/* 3. Ícono del Carrito de compras */}
      <CartWidget />

      {/* 4. Cartel flotante de aviso al agregar productos */}
      {mensajeToast && (
        <div className="toast-notification">
          <span>{mensajeToast}</span>
        </div>
      )}
    </header>
  );
};
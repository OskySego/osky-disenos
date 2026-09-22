import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget';
import { CartContext } from '../context/CartContext';

export const Header = () => {
  const { mensajeToast } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="main-header">
      {/* Logo */}
      <Link to="/" className="header-logo-container">
        <img src="public\img\Logo_for_Osky_Diseños.svg" alt="Osky Diseños Logo" className="header-logo" />
      </Link>

      {/* Botón hamburguesa visible solo en celulares */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
        {menuOpen ? '✖' : '☰'}
      </button>

      {/* Menú de navegación */}
      <NavBar isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />

      {/* Carrito de compras */}
      <CartWidget />

      {/* Notificación flotante */}
      {mensajeToast && (
        <div className="toast-notification">
          <span>{mensajeToast}</span>
        </div>
      )}
    </header>
  );
};
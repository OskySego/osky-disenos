import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget';
import { CartContext } from '../context/CartContext';

export const Header = () => {
  const { mensajeToast } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Menú Hamburguesa (Mobile)
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Toggle Pantalla Completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <header className="main-header">
      {/* 1. Logo con ruta corregida para Vite (/img/... en lugar de /public/img/...) */}
      <Link to="/" className="header-logo-container">
        <img 
          src="/img/Logo_for_Osky_Diseños.svg" 
          alt="Osky Diseños Logo" 
          className="header-logo" 
        />
      </Link>

      {/* 2. Botón menú hamburguesa (visibilidad mobile) */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
        {menuOpen ? '✖' : '☰'}
      </button>

      {/* 3. Navegación principal */}
      <NavBar isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />

      {/* 4. Acciones del Header (Pantalla completa + Carrito) */}
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={toggleFullscreen} className="btn-fullscreen" title="Pantalla completa">
          {isFullscreen ? '🗗' : '⛶'}
        </button>
        <CartWidget />
      </div>

      {/* 5. Cartel flotante de aviso */}
      {mensajeToast && (
        <div className="toast-notification">
          <span>{mensajeToast}</span>
        </div>
      )}
    </header>
  );
};
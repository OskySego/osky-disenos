import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget';
import { CartContext } from '../context/CartContext';
import '../css/HeaderPremium.css';

export const Header = () => {
  const { mensajeToast } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('No se pudo cambiar a pantalla completa:', error);
    }
  };

  return (
    <header className="main-header osky-premium-header">
      <div className="osky-header-inner">
        <Link to="/" className="header-logo-container" onClick={() => setMenuOpen(false)} aria-label="Osky Diseños — inicio">
          <img
            src="/img/osky/fenix-osky.webp"
            alt=""
            className="header-logo"
            width="54"
            height="54"
          />
          <span className="osky-header-wordmark" aria-hidden="true">
            <strong>OSKY</strong><small>DISEÑOS</small>
          </span>
        </Link>

        {menuOpen && (
          <button className="osky-menu-backdrop" type="button" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
        )}

        <NavBar isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />

        <div className="header-actions">
          <button
            type="button"
            className="btn-fullscreen"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <span aria-hidden="true">{isFullscreen ? '🗗' : '⛶'}</span>
          </button>
          <CartWidget />
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mensajeToast && (
        <div className="toast-notification" role="status">
          <span>{mensajeToast}</span>
        </div>
      )}
    </header>
  );
};

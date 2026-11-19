import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget';
import { CartContext } from '../context/CartContext';
import '../css/HeaderPremium.css';

export const Header = () => {
  const { mensajeToast } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const botonMenuRef = useRef(null);

  const cerrarMenu = () => setMenuOpen(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  // Mantener el menú móvil accesible: foco inicial, Escape y bloqueo de fondo.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const primerEnlace = document.querySelector('#osky-menu-principal a');
    primerEnlace?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        setMenuOpen(false);
        botonMenuRef.current?.focus();
        return;
      }

      if (evento.key !== 'Tab') return;

      const menu = document.getElementById('osky-menu-principal');
      const enlaces = Array.from(menu?.querySelectorAll('a[href]') ?? []);
      const primero = enlaces[0];
      const ultimo = enlaces[enlaces.length - 1];
      const boton = botonMenuRef.current;
      if (!primero || !ultimo || !boton) return;

      const activo = document.activeElement;
      // El menú funciona como panel modal: solo los enlaces y el botón de cierre
      // participan del recorrido con Tab, evitando ir al contenido de fondo.
      if (evento.shiftKey) {
        if (activo === primero) {
          evento.preventDefault();
          boton.focus();
        } else if (activo === boton || !menu.contains(activo)) {
          evento.preventDefault();
          ultimo.focus();
        }
      } else if (activo === ultimo) {
        evento.preventDefault();
        boton.focus();
      } else if (activo === boton || !menu.contains(activo)) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', manejarTeclado);
    return () => {
      document.removeEventListener('keydown', manejarTeclado);
      document.body.style.overflow = overflowAnterior;
    };
  }, [menuOpen]);

  // Al volver al tamaño de escritorio, liberar el menú y el scroll del fondo.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1161px)');
    const alCambiarTamano = (evento) => {
      if (evento.matches) setMenuOpen(false);
    };
    media.addEventListener('change', alCambiarTamano);
    return () => media.removeEventListener('change', alCambiarTamano);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('No se pudo cambiar a pantalla completa:', error);
    }
  };

  return (
    <header className="main-header osky-premium-header">
      <a className="osky-skip-link" href="#contenido-principal">
        Saltar al contenido principal
      </a>
      <div className="osky-header-inner">
        <Link
          to="/"
          className="header-logo-container"
          onClick={cerrarMenu}
          aria-label="Osky Diseños — ir al inicio"
        >
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
          <button
            className="osky-menu-backdrop"
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={() => {
              cerrarMenu();
              botonMenuRef.current?.focus();
            }}
            tabIndex={-1}
          />
        )}

        <NavBar isOpen={menuOpen} closeMenu={cerrarMenu} />

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
          ref={botonMenuRef}
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={menuOpen}
          aria-controls="osky-menu-principal"
          onClick={() => setMenuOpen((abierto) => !abierto)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {mensajeToast && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span>{mensajeToast}</span>
        </div>
      )}
    </header>
  );
};

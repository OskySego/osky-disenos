import React from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from './NavBar';
import { CartWidget } from './CartWidget';

export const Header = () => {
  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">
          <img src="/img/Logo_for_Osky_Diseños.svg" alt="Osky Diseños" className="header-logo" />
        </Link>
      </div>

      <NavBar />

      <button className="menu-toggle" id="menu-toggle" aria-label="Abrir menú">
        <i className="fas fa-bars"></i>
      </button>

      <CartWidget />
    </header>
  );
};
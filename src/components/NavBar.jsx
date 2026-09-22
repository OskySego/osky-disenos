import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavBar = ({ isOpen, closeMenu }) => {
  return (
    <nav className={`main-nav ${isOpen ? 'open' : ''}`}>
      <ul>
        <li>
          <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
        </li>
        <li>
          <NavLink to="/productos" onClick={closeMenu}>Servicios</NavLink>
        </li>
        <li>
          <NavLink to="/resenas" onClick={closeMenu}>Reseñas</NavLink>
        </li>
        <li>
          <NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink>
        </li>
      </ul>
    </nav>
  );
};
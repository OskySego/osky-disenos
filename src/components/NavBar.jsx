import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavBar = () => {
  return (
    <nav className="main-nav" id="main-nav" aria-label="Menú principal">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/productos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Servicios
          </NavLink>
        </li>
        <li>
          <NavLink to="/resenas" className={({ isActive }) => (isActive ? 'active' : '')}>
            Reseñas
          </NavLink>
        </li>
        <li>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'active' : '')}>
            Contacto
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
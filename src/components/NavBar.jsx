import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NavBar = ({ isOpen, closeMenu }) => {
  const { user, rol } = useAuth();

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

        {/* Enlaces visibles solo para administradores */}
        {rol === 'admin' && (
          <>
            <li>
              <NavLink to="/gestion" onClick={closeMenu} style={{ color: '#ffd700' }}>
                Gestión
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/cupones" onClick={closeMenu} style={{ color: '#ffd700' }}>
                Cupones
              </NavLink>
            </li>
          </>
        )}

        {/* Enlace dinámico según sesión */}
        {user ? (
          <li>
            <NavLink to="/perfil" onClick={closeMenu}>Mi Perfil</NavLink>
          </li>
        ) : (
          <li>
            <NavLink to="/login" onClick={closeMenu}>Ingresar</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
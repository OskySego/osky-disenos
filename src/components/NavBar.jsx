import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NavBar = ({ isOpen, closeMenu }) => {
  const { user, rol } = useAuth();

  return (
    <nav
      id="osky-menu-principal"
      className={`main-nav ${isOpen ? 'open' : ''}`}
      aria-label="Navegación principal"
    >
      <ul>
        <li><NavLink to="/" end onClick={closeMenu}>Inicio</NavLink></li>
        <li><NavLink to="/productos" onClick={closeMenu}>Servicios</NavLink></li>
        <li><NavLink to="/resenas" onClick={closeMenu}>Reseñas</NavLink></li>
        <li><NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink></li>

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

        {user ? (
          <li><NavLink to="/perfil" onClick={closeMenu}>Mi Perfil</NavLink></li>
        ) : (
          <li><NavLink to="/login" onClick={closeMenu}>Ingresar</NavLink></li>
        )}
      </ul>
    </nav>
  );
};

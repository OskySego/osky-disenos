import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PerfilPage = () => {
  const { user, rol, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const inicialUsuario = user?.email ? user.email.charAt(0).toUpperCase() : 'O';

  return (
    <section className="profile-page-section">
      <div className="profile-card">
        {/* Avatar con resplandor violeta */}
        <div className="profile-avatar-circle">
          <span>{inicialUsuario}</span>
        </div>

        <h2 className="profile-title">Mi Perfil</h2>
        <p className="profile-subtitle">Panel de cuenta de Osky Diseños</p>

        {/* Datos de la cuenta */}
        <div className="profile-info-box">
          <div className="profile-info-row">
            <span className="profile-label">Correo electrónico</span>
            <span className="profile-value">{user?.email}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-label">Nivel de acceso</span>
            <span className={`profile-role-badge ${rol === 'admin' ? 'is-admin' : ''}`}>
              {rol === 'admin' ? '★ Administrador' : 'Cliente'}
            </span>
          </div>
        </div>

        {/* Accesos directos exclusivos para Administrador */}
        {rol === 'admin' && (
          <div className="profile-admin-panel">
            <span className="profile-admin-heading">Herramientas de Administración</span>
            <div className="profile-admin-actions">
              <Link to="/gestion" className="cta-button main-cta">
                ⚙️ Gestionar Productos
              </Link>
              <Link to="/admin/cupones" className="secondary-cta">
                🎟️ Gestionar Cupones
              </Link>
            </div>
          </div>
        )}

        {/* Acción de cierre de sesión */}
        <div className="profile-footer-actions">
          <button onClick={handleLogout} className="btn-logout-profile">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </section>
  );
};
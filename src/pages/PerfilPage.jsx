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

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto', padding: '50px 20px', textAlign: 'center' }}>
      <div className="box-card" style={{ padding: '30px' }}>
        <h2>Mi Perfil</h2>
        <p style={{ margin: '15px 0', fontSize: '1.1rem' }}>
          <strong>Correo:</strong> {user?.email}
        </p>
        <p style={{ marginBottom: '25px' }}>
          <strong>Rol de cuenta:</strong>{' '}
          <span style={{ color: '#ffd700', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {rol}
          </span>
        </p>

        {rol === 'admin' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
            <Link to="/gestion" className="cta-button main-cta">
              ⚙️ Gestionar Productos
            </Link>
            <Link to="/admin/cupones" className="cta-button secondary-cta">
              🎟️ Gestionar Cupones
            </Link>
          </div>
        )}

        <button onClick={handleLogout} className="btn-delete-item" style={{ padding: '10px 20px' }}>
          Cerrar Sesión
        </button>
      </div>
    </section>
  );
};
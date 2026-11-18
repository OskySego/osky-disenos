import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const { user, rol, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#ffd700' }}>⏳ Verificando permisos...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ color: '#ff6b6b' }}>⛔ Acceso Denegado</h2>
        <p style={{ margin: '15px 0' }}>No tenés permisos de administrador para ver esta sección.</p>
      </div>
    );
  }

  return children;
};

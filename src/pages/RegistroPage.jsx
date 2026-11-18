import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegistroPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await signup(email, password, nombre);
      navigate('/perfil');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado. Probá iniciar sesión.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError('No se pudo completar el registro. Intentá nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="contact-section-page" style={{ padding: '40px 20px' }}>
      <div className="contact-container" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2>Crear Cuenta</h2>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</p>}

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="reg-nombre">Nombre completo</label>
            <input id="reg-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Oscar Segovia" />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>

          <div className="form-group">
            <label htmlFor="reg-pass">Contraseña (mínimo 6 caracteres)</label>
            <input id="reg-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
          </div>

          <button type="submit" className="cta-button main-cta" disabled={cargando} style={{ width: '100%' }}>
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          ¿Ya tenés cuenta? <Link to="/login" style={{ color: '#ffd700' }}>Iniciá sesión acá</Link>
        </p>
      </div>
    </section>
  );
};
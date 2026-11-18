import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
      navigate('/perfil');
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="contact-section-page" style={{ padding: '40px 20px' }}>
      <div className="contact-container" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2>Iniciar Sesión</h2>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</p>}

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>

          <div className="form-group">
            <label htmlFor="login-pass">Contraseña</label>
            <input id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
          </div>

          <button type="submit" className="cta-button main-cta" disabled={cargando} style={{ width: '100%' }}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          ¿No tenés cuenta? <Link to="/registro" style={{ color: '#ffd700' }}>Registrate gratis</Link>
        </p>
      </div>
    </section>
  );
};
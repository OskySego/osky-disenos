import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiCheck, FiCreditCard, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Panel = styled.div`
  margin-top: 16px; padding: 17px; border-radius: 15px;
  border: 1px solid rgba(177,99,255,.48);
  background: rgba(138,43,226,.13); color: #f2f0f7;
  p { color: #d1c4df; font-size: .86rem; margin: 0 0 12px; line-height: 1.5; }
  a { color: #ccff00; }
  button { display: flex; justify-content: center; align-items: center; gap: 9px;
    width: 100%; min-height: 48px; border-radius: 12px;
    background: #8a2be2; border: 1px solid #ba8cf0; color: white;
    font: inherit; font-weight: 800; cursor: pointer; }
  button:hover:not(:disabled) { background: #9e3ef7; }
  button:disabled { opacity: .65; cursor: wait; }
  button:focus-visible { outline: 3px solid #ccff00; outline-offset: 3px; }
  .mp-confirmar { background: #ccff00; color: #1e0b36; border-color: #ccff00; }
  .mp-confirmar:hover:not(:disabled) { background: #ddff65; }
  .mp-error { color: #ffb1bf; margin-top: 12px; }
  .mp-cancelar { background: transparent; margin-top: 9px; }
`;

const dinero = new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
});
const urlValida = (url) => {
  try {
    const destino = new URL(url);
    return destino.protocol === 'https:' && (
      destino.hostname === 'mercadopago.com'
      || destino.hostname.endsWith('.mercadopago.com')
      || destino.hostname === 'mercadopago.com.ar'
      || destino.hostname.endsWith('.mercadopago.com.ar')
    );
  } catch { return false; }
};

export const BotonMercadoPago = ({ cart = [], codigoCupon = '' }) => {
  const { user } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(null);
  const [checkoutKey, setCheckoutKey] = useState(() => crypto.randomUUID());

  // El botón está oculto hasta configurar y publicar el backend de prueba.
  if (import.meta.env.VITE_MP_SHOW_BUTTON !== 'true') return null;

  const firma = JSON.stringify({
    items: cart.map((p) => [String(p.id), Number(p.quantity)]),
    codigoCupon,
  });
  const pendienteValido = pendiente?.firma === firma;

  const preparar = async () => {
    if (!user || cargando || !cart.length) return;
    setError('');
    setPendiente(null);
    setCargando(true);
    try {
      const token = await user.getIdToken();
      const respuesta = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          checkoutKey,
          items: cart.map((item) => ({ id: String(item.id), quantity: Number(item.quantity) })),
          codigoCupon,
        }),
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || 'No pudimos preparar el pago.');
      if (!urlValida(datos.url) || !Number.isSafeInteger(datos.total) || datos.total <= 0) {
        throw new Error('La respuesta del servidor no contiene un checkout válido.');
      }
      // No redirigimos de inmediato: el usuario confirma el total autoritativo.
      setPendiente({ ...datos, firma });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el pago.');
      // Una falla permite un nuevo intento, nunca reutilizamos un checkout fallido.
      setCheckoutKey(crypto.randomUUID());
    } finally {
      setCargando(false);
    }
  };

  return <Panel aria-label="Pago con Mercado Pago">
    <p><strong>Mercado Pago · modo de prueba</strong></p>
    {!user ? (
      <p>Para preparar el pago, <Link to="/login">iniciá sesión</Link>.</p>
    ) : pendienteValido ? (
      <>
        <p>Importe calculado por el servidor, con ofertas y cupón vigentes:</p>
        <p><strong style={{ color: '#ccff00', fontSize: '1.45rem' }}>{dinero.format(pendiente.total)}</strong></p>
        <button type="button" className="mp-confirmar"
          onClick={() => window.location.assign(pendiente.url)}>
          <FiCheck aria-hidden="true" /> Confirmar y continuar a Mercado Pago
        </button>
        <button type="button" className="mp-cancelar" onClick={() => {
          setPendiente(null);
          setCheckoutKey(crypto.randomUUID());
        }}>Cancelar este intento</button>
      </>
    ) : (
      <>
        <p>El servidor verificará precios, descuentos y cupos antes de abrir el checkout externo.</p>
        <button type="button" onClick={preparar} disabled={cargando || cart.length === 0}>
          {cargando ? <FiLoader aria-hidden="true" /> : <FiCreditCard aria-hidden="true" />}
          {cargando ? 'Calculando importe…' : 'Preparar pago seguro'}
        </button>
      </>
    )}
    {error && <p role="alert" className="mp-error">{error}</p>}
  </Panel>;
};

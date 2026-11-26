import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Vista = styled.section`
  min-height:70vh; padding:75px 20px; background:radial-gradient(ellipse at top,#351252,#1e0b36);
  color:#f2f0f7;text-align:center; h1{color:white;}
  .rp-card{max-width:680px;margin:0 auto;padding:36px;border:1px solid rgba(177,99,255,.4);border-radius:20px;background:rgba(40,13,68,.9);}
  strong{color:#ccff00;} p{color:#c9bed7;}
  .rp-acciones{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:24px;}
  .rp-btn{padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;background:#ccff00;color:#1e0b36;}
  .rp-link{padding:12px 22px;border-radius:10px;border:1px solid rgba(204,255,0,.4);color:#ccff00;text-decoration:none;}
`;

export const ResultadoPagoPage = () => {
  const [parametros] = useSearchParams();
  const solicitudId = parametros.get('solicitud') || '';
  const resultadoUrl = parametros.get('resultado') || '';
  const { user } = useAuth();
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !/^[a-zA-Z0-9_-]{1,128}$/.test(solicitudId)) return;
    const cancelar = onSnapshot(doc(db, 'solicitudes', solicitudId), (snap) => {
      if (snap.exists() && (snap.data().uid === user.uid)) setEstado(snap.data().estadoPago || 'sin_confirmar');
      else setError('No encontramos un pago vinculado a tu cuenta.');
    }, (err) => { console.error('Error al consultar pago:', err); setError('No se pudo consultar el pago.'); });
    return cancelar;
  }, [user, solicitudId]);

  const aprobado = estado === 'approved';
  const canceladoOFallido = !aprobado && (
    resultadoUrl === 'failure' || ['rejected', 'cancelled', 'checkout_error'].includes(estado)
  );

  const titulo = aprobado
    ? 'Pago confirmado'
    : canceladoOFallido
      ? 'El pago no se completó'
      : 'Estamos verificando tu pago';

  return (
    <Vista>
      <div className="rp-card">
        <h1>{titulo}</h1>
        {!user ? (
          <p>Iniciá sesión para consultar tu pago. <Link to="/login">Iniciar sesión</Link></p>
        ) : (
          <>
            <p>Estado verificado en la base de datos: <strong>{estado || 'Esperando notificación de Mercado Pago'}</strong></p>
            {canceladoOFallido && (
              <p>No se realizó ningún cobro. Tu selección sigue guardada para que puedas volver a intentarlo cuando quieras.</p>
            )}
            {error && <p role="alert">{error}</p>}
            {!canceladoOFallido && (
              <p>No se confirma un pago únicamente por la URL de retorno. El estado se actualiza tras la verificación segura del servidor.</p>
            )}
            <div className="rp-acciones">
              {!aprobado && <Link to="/carrito" className="rp-btn">Volver al carrito</Link>}
              <Link to="/solicitudes" className="rp-link">Ver mi historial</Link>
            </div>
          </>
        )}
      </div>
    </Vista>
  );
};
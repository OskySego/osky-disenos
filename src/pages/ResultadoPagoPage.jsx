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
  strong{color:#ccff00;} p{color:#c9bed7;} a{color:#ccff00;}
`;

export const ResultadoPagoPage = () => {
  const [parametros] = useSearchParams();
  const solicitudId = parametros.get('solicitud') || '';
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
  const titulo = aprobado ? 'Pago confirmado' : 'Estamos verificando tu pago';
  return <Vista><div className="rp-card">
    <h1>{titulo}</h1>
    {!user ? <p>Iniciá sesión para consultar tu pago. <Link to="/login">Iniciar sesión</Link></p> :
      <><p>Estado verificado en la base de datos: <strong>{estado || 'Esperando notificación de Mercado Pago'}</strong></p>
      {error && <p role="alert">{error}</p>}
      <p>No se confirma un pago únicamente por la URL de retorno. El estado se actualiza tras la verificación segura del servidor.</p>
      <Link to="/solicitudes">Ver mi historial</Link></>}
  </div></Vista>;
};

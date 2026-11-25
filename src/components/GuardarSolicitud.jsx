import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import styled from 'styled-components';
import { FiBookmark, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Contenedor = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(138,43,226,.12);
  border: 1px solid rgba(177,99,255,.35);
  border-radius: 14px;
  color: #f2f0f7;
  p { font-size: .85rem; margin: 0 0 12px; color: #c9bed7; }
  a { color: #ccff00; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; padding: 10px 16px; border-radius: 10px; cursor: pointer;
    font-weight: 800; background: #ccff00; color: #1e0b36; border: none; }
  button:disabled { opacity: .6; cursor: wait; }
  .os-aviso { margin: 10px 0 0; color: #ccff00; overflow-wrap: anywhere; }
  .os-error { color: #ffb4bd; }
`;

export const GuardarSolicitud = ({ cart, totalEstimado, codigoCupon = '' }) => {
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [ultimaGuardada, setUltimaGuardada] = useState(null);
  const firmaCarrito = JSON.stringify({
    items: (cart || []).map((i) => [i.id, i.quantity, i.precio]),
    codigoCupon, totalEstimado,
  });
  const guardadaId = ultimaGuardada?.firma === firmaCarrito ? ultimaGuardada.id : '';
  const [error, setError] = useState('');

  const guardar = async () => {
    if (!user || guardando || guardadaId || !Array.isArray(cart) || cart.length === 0) return;
    setError('');
    const items = cart.slice(0, 25).map((item) => ({
      productoId: String(item.id),
      nombre: String(item.nombre || 'Servicio').slice(0, 120),
      cantidad: Number(item.quantity),
    }));
    if (cart.length > 25 || items.some((item) => !Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 100)) {
      setError('Revisá las cantidades antes de guardar la solicitud.');
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await addDoc(collection(db, 'solicitudes'), {
        uid: user.uid,
        tipo: 'presupuesto',
        estadoGestion: 'iniciada',
        items,
        totalEstimado: Math.max(0, Math.round(Number(totalEstimado) || 0)),
        codigoCupon: String(codigoCupon || '').slice(0, 40),
        creadoEn: serverTimestamp(),
      });
      setUltimaGuardada({ firma: firmaCarrito, id: respuesta.id });
    } catch (err) {
      const codigo = err?.code || 'desconocido';
      console.error('Error al guardar solicitud en Firestore:', {
        codigo,
        mensaje: err?.message,
        proyecto: db.app.options.projectId,
      });

      if (codigo === 'permission-denied') {
        setError('Firebase rechazó el guardado (permission-denied). Revisá las reglas de la colección solicitudes.');
      } else if (codigo === 'unauthenticated') {
        setError('Tu sesión venció. Volvé a iniciar sesión e intentá otra vez.');
      } else if (codigo === 'unavailable') {
        setError('Firestore no está disponible en este momento. Revisá tu conexión.');
      } else {
        setError(`No se pudo guardar (${codigo}). Revisá la consola del navegador para ver el detalle.`);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Contenedor>
      <p>Guardá tu presupuesto en tu cuenta para consultarlo más adelante. También podés enviar la consulta por WhatsApp como siempre.</p>
      {!user ? (
        <p>Para guardar el historial, <Link to="/login">iniciá sesión</Link>.</p>
      ) : (
        <button type="button" onClick={guardar} disabled={guardando || Boolean(guardadaId) || !Array.isArray(cart) || cart.length === 0}>
          {guardadaId ? <FiCheckCircle /> : guardando ? <FiLoader /> : <FiBookmark />}
          {guardadaId ? 'Presupuesto guardado' : guardando ? 'Guardando…' : 'Guardar en mi historial'}
        </button>
      )}
      {guardadaId && <p className="os-aviso" role="status">Solicitud guardada. <Link to="/solicitudes">Ver historial</Link>. Importe sujeto a confirmación.</p>}
      {error && <p className="os-aviso os-error" role="alert">{error}</p>}
    </Contenedor>
  );
};

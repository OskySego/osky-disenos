import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import styled from 'styled-components';
import { FiClipboard, FiRefreshCw } from 'react-icons/fi';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const ESTADOS = ['iniciada', 'en_revision', 'presupuestada', 'finalizada'];
const ETIQUETAS = { iniciada: 'Iniciada', en_revision: 'En revisión', presupuestada: 'Presupuestada', finalizada: 'Finalizada' };
const dinero = (cantidad) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(cantidad) || 0);
const fecha = (valor) => valor?.toDate?.()?.toLocaleString('es-AR') || 'Fecha pendiente';

const Vista = styled.section`
  width: 100%; min-height: 70vh; padding: clamp(35px,5vw,72px) 18px;
  color: #f2f0f7; background: radial-gradient(ellipse at top, #351252, #1e0b36 60%, #130821);
  h1, h2 { color: #f2f0f7; }
  .os-contenedor { max-width: 1100px; margin: auto; }
  .os-etiqueta { font-size: .76rem; color: #ccff00; font-weight: 800; letter-spacing: .12em; }
  .os-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
  .os-grilla { display: grid; gap: 14px; }
  .os-card { background: linear-gradient(150deg,rgba(58,20,94,.9),rgba(25,9,45,.96)); border: 1px solid rgba(177,99,255,.38); border-radius: 18px; padding: 20px; }
  .os-fila { display:flex; align-items:center; justify-content:space-between; flex-wrap: wrap; gap: 12px; }
  .os-dato { color: #c9bed7; font-size: .86rem; }
  .os-lista { margin: 13px 0; padding-left: 21px; color: #efebf3; }
  .os-status { color: #ccff00; font-weight: 750; }
  .os-boton, .os-select { border: 1px solid rgba(177,99,255,.6); border-radius: 10px; padding: 10px 14px; background: #34154d; color: #fff; }
  .os-boton { cursor: pointer; display: inline-flex; align-items:center; gap: 8px; }
  .os-boton:hover { border-color: #ccff00; }
  .os-select { max-width:100%; }
  .os-total { font-weight:800; color:#ccff00; }
  .os-nota { color:#c9bed7; font-size:.82rem; margin-top:10px; }
  a { color:#ccff00; }
  @media(max-width:600px) { .os-card { padding:15px; } }
`;

export const SolicitudesPage = () => {
  const { user, rol } = useAuth();
  const admin = rol === 'admin';
  const uid = user?.uid;
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState('');

  const cargar = useCallback(async () => {
    if (!uid) return;
    setCargando(true); setError('');
    try {
      const referencia = collection(db, 'solicitudes');
      const consulta = admin ? referencia : query(referencia, where('uid', '==', uid));
      const respuesta = await getDocs(consulta);
      const listado = respuesta.docs.map((d) => ({ id: d.id, ...d.data() }));
      listado.sort((a, b) => (b.creadoEn?.toMillis?.() || 0) - (a.creadoEn?.toMillis?.() || 0));
      setSolicitudes(listado);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      setError('No pudimos consultar las solicitudes. Revisá los permisos de Firestore.');
    } finally { setCargando(false); }
  }, [uid, admin]);

  // Carga inicial separada del botón «Actualizar» para que el efecto
  // no provoque actualizaciones de estado sincrónicas.
  useEffect(() => {
    if (!uid) return undefined;
    let activo = true;

    const referencia = collection(db, 'solicitudes');
    const consulta = admin ? referencia : query(referencia, where('uid', '==', uid));
    getDocs(consulta)
      .then((respuesta) => {
        if (!activo) return;
        const listado = respuesta.docs.map((d) => ({ id: d.id, ...d.data() }));
        listado.sort((a, b) => (b.creadoEn?.toMillis?.() || 0) - (a.creadoEn?.toMillis?.() || 0));
        setSolicitudes(listado);
      })
      .catch((err) => {
        if (!activo) return;
        console.error('Error al cargar solicitudes:', err);
        setError('No pudimos consultar las solicitudes. Revisá los permisos de Firestore.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, [uid, admin]);

  const cambiarEstado = async (solicitud, nuevoEstado) => {
    if (!admin || actualizando || !ESTADOS.includes(nuevoEstado)) return;
    setActualizando(solicitud.id); setError('');
    try {
      await updateDoc(doc(db, 'solicitudes', solicitud.id), { estadoGestion: nuevoEstado, actualizadoEn: serverTimestamp() });
      setSolicitudes((actuales) => actuales.map((s) => s.id === solicitud.id ? { ...s, estadoGestion: nuevoEstado } : s));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('No se pudo actualizar el estado de gestión.');
    } finally { setActualizando(''); }
  };

  return (
    <Vista><div className="os-contenedor">
      <div className="os-header">
        <div><span className="os-etiqueta">OSKY DISEÑOS · GESTIÓN</span><h1>{admin ? 'Solicitudes recibidas' : 'Mis solicitudes'}</h1><p>Historial de presupuestos y pagos registrados.</p></div>
        <button type="button" className="os-boton" onClick={cargar} disabled={cargando}><FiRefreshCw /> Actualizar</button>
      </div>
      {cargando && <p role="status">Cargando solicitudes…</p>}
      {error && <p role="alert" style={{ color: '#ffb4bd' }}>{error}</p>}
      {!cargando && !error && solicitudes.length === 0 && <div className="os-card"><FiClipboard /> Todavía no hay solicitudes. <Link to="/productos">Explorar servicios</Link>.</div>}
      {!cargando && <div className="os-grilla">
        {solicitudes.map((s) => (
          <article key={s.id} className="os-card">
            <div className="os-fila">
              <div><strong>{s.tipo === 'pago' ? 'Pago en Mercado Pago' : 'Solicitud de presupuesto'}</strong><div className="os-dato">{fecha(s.creadoEn)} · Ref. {s.id.slice(0, 9)}</div></div>
              <span className="os-status">{ETIQUETAS[s.estadoGestion] || 'Registrada'}</span>
            </div>
            <ul className="os-lista">{(Array.isArray(s.items) ? s.items : []).map((item, i) => <li key={`${item.productoId || i}-${i}`}>{item.nombre || 'Servicio'} × {item.cantidad}</li>)}</ul>
            <div className="os-fila">
              <span>Importe {s.tipo === 'pago' ? 'calculado por el servidor' : 'estimado'}: <strong className="os-total">{dinero(s.tipo === 'pago' ? s.totalCalculado : s.totalEstimado)}</strong></span>
              {s.tipo === 'pago' && <span className="os-dato">Pago: {s.estadoPago || 'Sin confirmar'}</span>}
            </div>
            {admin && <div style={{ marginTop: 15 }}><label htmlFor={`estado-${s.id}`} className="os-dato">Estado de gestión: </label>{' '}<select className="os-select" id={`estado-${s.id}`} value={s.estadoGestion || 'iniciada'} disabled={Boolean(actualizando)} onChange={(e) => cambiarEstado(s, e.target.value)}>{ESTADOS.map((estado) => <option key={estado} value={estado}>{ETIQUETAS[estado]}</option>)}</select></div>}
            <p className="os-nota">{s.tipo === 'pago' ? 'El estado del pago solo se confirma por Mercado Pago.' : 'El importe es orientativo. Guardar una solicitud no confirma envío de WhatsApp, aceptación ni pago.'}</p>
          </article>
        ))}
      </div>}
    </div></Vista>
  );
};

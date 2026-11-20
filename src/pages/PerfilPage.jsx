// src/pages/PerfilPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
import {
  FiArrowUpRight, FiEdit2, FiLock, FiLogOut,
  FiMail, FiPackage, FiSave, FiSettings, FiShield,
  FiShoppingBag, FiTag, FiUser, FiX,
} from 'react-icons/fi';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Estilos aislados: no se modifica ninguna hoja CSS global.
const Perfil = styled.section`
  width: 100%;
  min-height: 70vh;
  padding: clamp(32px, 5vw, 76px) 18px;
  background: radial-gradient(ellipse at 50% 0%, #351252 0%, #1e0b36 55%, #130821 100%);
  color: #f2f0f7;
  font-family: 'Montserrat', sans-serif;

  *, *::before, *::after { box-sizing: border-box; }
  h1, h2, h3, p { margin: 0; }
  h1, h2, h3 { color: #f2f0f7; }
  p { color: #c9bed7; }
  button, input { font: inherit; }
  a { text-decoration: none; }
  :is(a, button, input):focus-visible { outline: 3px solid #ccff00; outline-offset: 4px; }

  .op-contenedor { width: min(1100px, 100%); margin-inline: auto; }
  .op-eyebrow { color: #ccff00; font-size: .72rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
  .op-titulo { margin: 7px 0 24px; font-size: clamp(1.7rem, 3.6vw, 2.7rem); line-height: 1.15; }
  .op-titulo em { font-style: normal; color: #ccff00; }

  .op-portada {
    display: flex; align-items: center; gap: 22px; flex-wrap: wrap;
    padding: clamp(22px, 4vw, 35px); border-radius: 24px;
    border: 1px solid rgba(177, 99, 255, .45);
    background: linear-gradient(125deg, rgba(138,43,226,.35), rgba(26,9,46,.96));
    box-shadow: 0 22px 54px rgba(6,3,15,.35), inset 0 1px rgba(255,255,255,.06);
  }
  .op-avatar {
    flex: 0 0 88px; width: 88px; height: 88px; border-radius: 26px;
    display: grid; place-items: center; font-weight: 900; font-size: 2.6rem;
    color: #1e0b36; background: linear-gradient(135deg, #ccff00, #8a2be2);
    box-shadow: 0 0 30px rgba(138,43,226,.35);
  }
  .op-presentacion { flex: 1 1 250px; min-width: 0; }
  .op-presentacion h2 { font-size: clamp(1.3rem, 2.7vw, 2rem); overflow-wrap: anywhere; }
  .op-presentacion p { margin-top: 7px; overflow-wrap: anywhere; }
  .op-rol { display: inline-flex; align-items: center; gap: 7px; padding: 9px 13px; border-radius: 99px; background: rgba(204,255,0,.12); border: 1px solid rgba(204,255,0,.35); color: #ccff00; font-size: .82rem; font-weight: 800; }

  .op-grilla { display: grid; grid-template-columns: 1.06fr .94fr; gap: 18px; margin-top: 20px; }
  .op-tarjeta {
    min-width: 0; padding: clamp(20px, 3vw, 29px); border-radius: 20px;
    background: linear-gradient(150deg, rgba(57,23,89,.87), rgba(26,10,46,.97));
    border: 1px solid rgba(158,93,226,.3); box-shadow: 0 15px 36px rgba(8,3,20,.24);
  }
  .op-cabecera { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 21px; }
  .op-cabecera h3 { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; }
  .op-cabecera h3 svg { color: #ccff00; }
  .op-dato { padding-block: 14px; border-bottom: 1px solid rgba(222,195,255,.12); }
  .op-dato:last-of-type { border-bottom: 0; }
  .op-etiqueta { display: block; color: #b3a4c7; font-size: .79rem; margin-bottom: 7px; }
  .op-valor { color: #f2f0f7; font-size: .96rem; font-weight: 650; overflow-wrap: anywhere; }
  .op-input {
    width: 100%; min-height: 46px; padding: 11px 13px;
    border: 1px solid rgba(174,124,231,.6); border-radius: 11px;
    background: rgba(15,5,29,.75); color: #fff;
  }
  .op-botones { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 17px; }
  .op-btn {
    display: inline-flex; justify-content: center; align-items: center; gap: 8px;
    min-height: 42px; padding: 10px 15px; border: 1px solid rgba(177,99,255,.55);
    border-radius: 12px; background: rgba(138,43,226,.14);
    color: #f2f0f7; font-size: .84rem; font-weight: 750; cursor: pointer;
    transition: background .2s, border-color .2s, transform .2s;
  }
  .op-btn:hover:not(:disabled) { border-color: #ccff00; background: rgba(138,43,226,.3); transform: translateY(-2px); }
  .op-btn:disabled { opacity: .55; cursor: not-allowed; }
  .op-btn--lima { color: #1e0b36; border-color: #ccff00; background: #ccff00; }
  .op-btn--lima:hover:not(:disabled) { background: #dfff61; color: #1e0b36; }

  .op-accesos { display: grid; gap: 11px; }
  .op-acceso {
    display: flex; align-items: center; gap: 13px; min-width: 0;
    padding: 14px; border-radius: 14px; border: 1px solid rgba(164,93,237,.3);
    background: rgba(17,7,34,.48); color: #f2f0f7;
    transition: background .2s, border-color .2s, transform .2s;
  }
  .op-acceso:hover { border-color: rgba(204,255,0,.6); background: rgba(138,43,226,.2); transform: translateY(-2px); color: #fff; }
  .op-acceso > svg:first-child { flex: 0 0 auto; color: #ccff00; font-size: 1.3rem; }
  .op-acceso > svg:last-child { margin-left: auto; flex: 0 0 auto; color: #bdb0d1; }
  .op-acceso strong { display: block; font-size: .89rem; }
  .op-acceso small { display: block; margin-top: 4px; color: #b9accb; font-size: .75rem; }
  .op-acceso span { min-width: 0; }

  .op-extra { margin-top: 20px; }
  .op-extra > p { font-size: .9rem; line-height: 1.6; margin-bottom: 15px; }
  .op-enlaces { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
  .op-aviso { margin-top: 16px; border-radius: 12px; padding: 13px 15px; background: rgba(204,255,0,.09); color: #e8fbbb; border: 1px solid rgba(204,255,0,.3); line-height: 1.5; font-size: .88rem; }
  .op-aviso--error { background: rgba(255,100,110,.09); color: #ffb4bd; border-color: rgba(255,100,110,.4); }
  .op-pie { display: flex; justify-content: flex-end; margin-top: 22px; }
  .op-desconectar { color: #ffb6be; border-color: rgba(255,140,150,.35); }

  @media (max-width: 760px) {
    .op-grilla, .op-enlaces { grid-template-columns: 1fr; }
    .op-portada { align-items: flex-start; }
    .op-rol { margin-top: 5px; }
  }
  @media (max-width: 420px) {
    .op-avatar { width: 68px; height: 68px; flex-basis: 68px; border-radius: 20px; font-size: 2rem; }
    .op-cabecera { align-items: flex-start; flex-wrap: wrap; }
    .op-btn { width: 100%; }
    .op-pie .op-btn { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .op-btn, .op-acceso { transition: none; }
    .op-btn:hover, .op-acceso:hover { transform: none; }
  }
`;

export const PerfilPage = () => {
  const { user, rol, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [nombreEditar, setNombreEditar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!user?.uid) return undefined;
    let activo = true;
    getDoc(doc(db, 'usuarios', user.uid))
      .then((resultado) => {
        if (!activo) return;
        if (resultado.exists()) {
          const nombreGuardado = String(resultado.data().nombre ?? '');
          setNombre(nombreGuardado);
          setNombreEditar(nombreGuardado);
        } else {
          setAviso({ tipo: 'error', texto: 'Tu perfil no existe en Firestore. Consultá al administrador.' });
        }
      })
      .catch((error) => {
        console.error('Error al consultar perfil:', error);
        if (activo) setAviso({ tipo: 'error', texto: 'No pudimos cargar tu nombre. Verificá la conexión e intentá ingresar nuevamente.' });
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [user?.uid]);

  const nombreVisible = nombre.trim() || user?.displayName || user?.email?.split('@')[0] || 'Tu cuenta';
  const inicial = nombreVisible.charAt(0).toLocaleUpperCase('es-AR');
  const fechaAlta = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    : 'No disponible';

  const guardarNombre = async (evento) => {
    evento.preventDefault();
    if (guardando || !user?.uid) return;
    const nuevoNombre = nombreEditar.trim();
    if (nuevoNombre.length < 2 || nuevoNombre.length > 80) {
      setAviso({ tipo: 'error', texto: 'El nombre debe tener entre 2 y 80 caracteres.' });
      return;
    }
    setGuardando(true);
    setAviso(null);
    try {
      // Firestore permite modificar SOLO el nombre en el perfil propio.
      await updateDoc(doc(db, 'usuarios', user.uid), { nombre: nuevoNombre });
      setNombre(nuevoNombre);
      setEditando(false);
      setAviso({ tipo: 'ok', texto: 'Tu nombre se actualizó correctamente.' });
    } catch (error) {
      console.error('Error al guardar nombre:', error);
      setAviso({ tipo: 'error', texto: 'No pudimos guardar el nombre. Verificá tus permisos y conexión.' });
    } finally {
      setGuardando(false);
    }
  };

  const recuperarContrasena = async () => {
    if (!user?.email || enviandoCorreo) return;
    setEnviandoCorreo(true);
    setAviso(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setAviso({ tipo: 'ok', texto: 'Te enviamos las instrucciones para cambiar tu contraseña. Revisá también el correo no deseado.' });
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      setAviso({ tipo: 'error', texto: 'No se pudo enviar el correo. Probá nuevamente más tarde.' });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const cerrarSesion = async () => {
    if (cerrandoSesion) return;
    setCerrandoSesion(true);
    setAviso(null);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setAviso({ tipo: 'error', texto: 'No se pudo cerrar sesión. Intentá de nuevo.' });
      setCerrandoSesion(false);
    }
  };

  return (
    <Perfil>
      <div className="op-contenedor">
        <span className="op-eyebrow">MI ESPACIO · OSKY DISEÑOS</span>
        <h1 className="op-titulo">Tu cuenta, <em>a tu manera.</em></h1>

        <header className="op-portada">
          <div className="op-avatar" aria-hidden="true">{inicial}</div>
          <div className="op-presentacion">
            <h2>¡Hola, {nombreVisible}!</h2>
            <p>Bienvenido a tu espacio personal. Administrá tus datos y servicios en un solo lugar.</p>
          </div>
          <div className="op-rol"><FiShield aria-hidden="true" /> {rol === 'admin' ? 'Administrador' : 'Cliente'}</div>
        </header>

        {aviso && (
          <div className={`op-aviso ${aviso.tipo === 'error' ? 'op-aviso--error' : ''}`}
            role={aviso.tipo === 'error' ? 'alert' : 'status'}>
            {aviso.texto}
          </div>
        )}

        <div className="op-grilla">
          <section className="op-tarjeta" aria-labelledby="op-datos-titulo">
            <div className="op-cabecera">
              <h3 id="op-datos-titulo"><FiUser aria-hidden="true" /> Mis datos</h3>
              {!editando && (
                <button className="op-btn" type="button" disabled={cargando}
                  onClick={() => { setNombreEditar(nombre); setEditando(true); setAviso(null); }}>
                  <FiEdit2 aria-hidden="true" /> Editar
                </button>
              )}
            </div>

            {editando ? (
              <form onSubmit={guardarNombre}>
                <label className="op-etiqueta" htmlFor="op-nombre">Nombre completo</label>
                <input id="op-nombre" className="op-input" value={nombreEditar}
                  onChange={(evento) => setNombreEditar(evento.target.value)}
                  maxLength={80} autoComplete="name" required />
                <div className="op-botones">
                  <button className="op-btn op-btn--lima" type="submit" disabled={guardando}>
                    <FiSave aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  <button className="op-btn" type="button" disabled={guardando}
                    onClick={() => { setNombreEditar(nombre); setEditando(false); setAviso(null); }}>
                    <FiX aria-hidden="true" /> Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="op-dato">
                <span className="op-etiqueta">Nombre completo</span>
                <span className="op-valor">{cargando ? 'Cargando…' : nombreVisible}</span>
              </div>
            )}
            <div className="op-dato">
              <span className="op-etiqueta">Correo electrónico</span>
              <span className="op-valor">{user?.email || 'No disponible'}</span>
            </div>
            <div className="op-dato">
              <span className="op-etiqueta">Miembro desde</span>
              <span className="op-valor">{fechaAlta}</span>
            </div>
          </section>

          <section className="op-tarjeta" aria-labelledby="op-accesos-titulo">
            <div className="op-cabecera"><h3 id="op-accesos-titulo"><FiPackage aria-hidden="true" /> Accesos rápidos</h3></div>
            <div className="op-accesos">
              <Link className="op-acceso" to="/carrito">
                <FiShoppingBag aria-hidden="true" />
                <span><strong>Mi carrito</strong><small>{totalItems} {totalItems === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}</small></span>
                <FiArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="op-acceso" to="/productos">
                <FiTag aria-hidden="true" />
                <span><strong>Explorar servicios</strong><small>Diseño web, branding y más</small></span>
                <FiArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="op-acceso" to="/contacto">
                <FiMail aria-hidden="true" />
                <span><strong>Contactar al estudio</strong><small>Contanos tu próximo proyecto</small></span>
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        {rol === 'admin' && (
          <section className="op-tarjeta op-extra" aria-labelledby="op-admin-titulo">
            <div className="op-cabecera"><h3 id="op-admin-titulo"><FiSettings aria-hidden="true" /> Herramientas de administración</h3></div>
            <p>Gestioná los productos y cupones con los permisos de tu cuenta de administrador.</p>
            <div className="op-enlaces">
              <Link className="op-acceso" to="/gestion">
                <FiPackage aria-hidden="true" /><span><strong>Gestión de productos</strong><small>Crear, editar y eliminar servicios</small></span><FiArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="op-acceso" to="/admin/cupones">
                <FiTag aria-hidden="true" /><span><strong>Gestión de cupones</strong><small>Administrar descuentos</small></span><FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        <section className="op-tarjeta op-extra" aria-labelledby="op-seguridad-titulo">
          <div className="op-cabecera"><h3 id="op-seguridad-titulo"><FiLock aria-hidden="true" /> Seguridad de la cuenta</h3></div>
          <p>Para cambiar tu contraseña, te enviamos un enlace seguro al correo de tu cuenta.</p>
          <button className="op-btn" type="button" onClick={recuperarContrasena} disabled={enviandoCorreo || !user?.email}>
            <FiMail aria-hidden="true" /> {enviandoCorreo ? 'Enviando correo…' : 'Enviar enlace para cambiar contraseña'}
          </button>
        </section>

        <div className="op-pie">
          <button className="op-btn op-desconectar" type="button" onClick={cerrarSesion} disabled={cerrandoSesion}>
            <FiLogOut aria-hidden="true" /> {cerrandoSesion ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </Perfil>
  );
};

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
import { FiArrowLeft, FiRefreshCw, FiSave } from 'react-icons/fi';
import { db } from '../firebase/config';
import { descuentoDeOferta, precioVigente, stockOfertaDisponible } from '../utils/ofertas';

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
});
const dinero = (importe) => formatoPrecio.format(Number(importe) || 0);

const Vista = styled.section`
  min-height: 70vh; padding: clamp(32px, 5vw, 70px) 18px;
  color: #f2f0f7; background: radial-gradient(ellipse at top, #351252, #1e0b36 60%, #130821);
  * { box-sizing: border-box; }
  .oa-contenedor { max-width: 1080px; margin: auto; }
  .oa-eyebrow { color: #ccff00; letter-spacing: .16em; font-weight: 800; font-size: .76rem; }
  h1 { color: #fff; font-size: clamp(1.9rem, 4vw, 2.6rem); margin: 7px 0 10px; }
  h2 { color: #fff; font-size: 1.12rem; margin: 0 0 7px; }
  p { color: #cfc3dc; line-height: 1.5; }
  .oa-barra { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; margin: 23px 0; }
  .oa-barra a { color: #ccff00; font-weight: 750; display: inline-flex; align-items: center; gap: 7px; }
  .oa-lista { display: grid; gap: 15px; }
  .oa-card { display: grid; grid-template-columns: minmax(230px, 1fr) minmax(280px, 1fr); gap: 24px;
    padding: clamp(18px, 3vw, 26px); background: rgba(47, 18, 78, .86);
    border: 1px solid rgba(177, 99, 255, .42); border-radius: 20px; }
  .oa-resumen { display: grid; gap: 5px; }
  .oa-resumen p { margin: 0; font-size: .88rem; }
  .oa-precio { color: #ccff00; font-size: 1.1rem; font-weight: 800; }
  .oa-chip { display: inline-flex; width: fit-content; padding: 5px 10px;
    border: 1px solid rgba(204,255,0,.4); border-radius: 99px; background: rgba(204,255,0,.09);
    color: #ccff00; font-size: .77rem; font-weight: 800; }
  .oa-campos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; align-content: start; }
  label { display: block; margin-bottom: 7px; font-weight: 700; font-size: .84rem; }
  input { width: 100%; min-height: 47px; border-radius: 12px; padding: 10px 12px;
    color: #fff; background: #1a0b30; border: 1px solid #8450af; font: inherit; }
  input:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid #ccff00; outline-offset: 3px; }
  input:disabled { opacity: .55; }
  .oa-boton { display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    min-height: 44px; padding: 10px 17px; color: #1e0b36; background: #ccff00;
    border: 1px solid #ccff00; border-radius: 12px; cursor: pointer; font: inherit; font-weight: 850; }
  .oa-boton--secundario { color: #f2f0f7; background: rgba(138,43,226,.24); border-color: #9e5ae1; }
  .oa-boton:disabled { opacity: .55; cursor: wait; }
  .oa-guardar { grid-column: 1 / -1; justify-self: start; }
  .oa-nota { font-size: .82rem; margin: 12px 0 0; }
  .oa-alerta { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(204,255,0,.3); color: #ecffbd; }
  @media(max-width: 730px) { .oa-card { grid-template-columns: 1fr; } }
  @media(max-width: 430px) { .oa-campos { grid-template-columns: 1fr; } }
`;

const preparar = (datos) => {
  const productos = datos.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
  return {
    productos,
    formulario: Object.fromEntries(productos.map((p) => [
      p.id,
      { descuento: String(p.descuentoOferta ?? 0), stockOferta: String(p.stockOferta ?? 0) },
    ])),
  };
};

export const OfertasAdminPage = () => {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true); setAviso('');
    try {
      const datos = preparar(await getDocs(collection(db, 'productos')));
      setProductos(datos.productos);
      setFormulario(datos.formulario);
    } catch (error) {
      console.error('Error al consultar ofertas:', error);
      setAviso('No pudimos consultar los productos. Revisá los permisos de Firestore.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    getDocs(collection(db, 'productos'))
      .then((respuesta) => {
        if (!activo) return;
        const datos = preparar(respuesta);
        setProductos(datos.productos);
        setFormulario(datos.formulario);
      })
      .catch((error) => {
        if (!activo) return;
        console.error('Error de carga inicial:', error);
        setAviso('No pudimos consultar los productos.');
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const cambiarCampo = (id, campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [id]: { ...anterior[id], [campo]: valor },
    }));
  };

  const guardar = async (producto) => {
    if (guardando) return;
    const descuento = Number(formulario[producto.id]?.descuento);
    const stockOferta = Number(formulario[producto.id]?.stockOferta);
    if (!Number.isSafeInteger(descuento) || descuento < 0 || descuento > 90) {
      setAviso('El descuento debe ser un número entero entre 0 y 90 %.');
      return;
    }
    if (!Number.isSafeInteger(stockOferta) || stockOferta < 0) {
      setAviso('Los cupos de oferta deben ser un número entero igual o mayor que cero.');
      return;
    }
    const stockGeneral = producto.stock == null || producto.stock === '' ? null : Number(producto.stock);
    if (stockGeneral !== null && Number.isSafeInteger(stockGeneral) && stockOferta > stockGeneral) {
      setAviso(`Los cupos de oferta de «${producto.nombre}» no pueden superar su stock general (${stockGeneral}).`);
      return;
    }
    const precio = Number(producto.precio);
    if (descuento > 0 && (!Number.isSafeInteger(precio) || precio <= 0)) {
      setAviso('Este servicio necesita un precio regular válido para poder promocionarse.');
      return;
    }
    const nuevosDatos = {
      descuentoOferta: descuento,
      stockOferta,
      ofertaActiva: descuento > 0 && stockOferta > 0,
    };
    setGuardando(producto.id); setAviso('');
    try {
      await updateDoc(doc(db, 'productos', producto.id), nuevosDatos);
      setProductos((anterior) => anterior.map((p) =>
        p.id === producto.id ? { ...p, ...nuevosDatos } : p));
      setAviso(`Promoción actualizada correctamente: ${producto.nombre}.`);
    } catch (error) {
      console.error('No se pudo guardar la oferta:', error);
      setAviso('No se pudo guardar. Comprobá que tu cuenta tenga rol de administrador.');
    } finally {
      setGuardando('');
    }
  };

  return (
    <Vista>
      <div className="oa-contenedor">
        <span className="oa-eyebrow">OSKY DISEÑOS · ADMINISTRACIÓN</span>
        <h1>Ofertas y promociones</h1>
        <p>Elegí el descuento y los cupos promocionales de cada servicio. El precio original y el stock general no se modifican.</p>
        <div className="oa-barra">
          <Link to="/perfil"><FiArrowLeft /> Volver al panel de administrador</Link>
          <button type="button" className="oa-boton oa-boton--secundario" onClick={cargar} disabled={cargando || Boolean(guardando)}><FiRefreshCw /> Actualizar</button>
        </div>
        {aviso && <p className="oa-alerta" role="status">{aviso}</p>}
        {cargando && <p role="status">Cargando productos…</p>}
        {!cargando && !productos.length && <p>No hay productos cargados para promocionar.</p>}
        <div className="oa-lista">
          {productos.map((producto) => {
            const activo = descuentoDeOferta(producto) > 0;
            const cupos = stockOfertaDisponible(producto);
            return (
              <article key={producto.id} className="oa-card">
                <div className="oa-resumen">
                  <h2>{producto.nombre || 'Servicio sin nombre'}</h2>
                  <p>Precio regular: {dinero(producto.precio)}</p>
                  <p>Stock general: {producto.stock ?? 'Sin límite definido'}</p>
                  {activo ? (
                    <>
                      <span className="oa-chip">OFERTA PUBLICADA · {descuentoDeOferta(producto)} % OFF</span>
                      <strong className="oa-precio">{dinero(precioVigente(producto))}</strong>
                      <p>{cupos} cupos promocionales configurados</p>
                    </>
                  ) : (
                    <span className="oa-chip">SIN OFERTA ACTIVA</span>
                  )}
                </div>
                <div className="oa-campos">
                  <div>
                    <label htmlFor={`oa-desc-${producto.id}`}>Descuento (%)</label>
                    <input type="number" min="0" max="90" step="1"
                      id={`oa-desc-${producto.id}`}
                      value={formulario[producto.id]?.descuento ?? '0'}
                      onChange={(evento) => cambiarCampo(producto.id, 'descuento', evento.target.value)}
                      disabled={Boolean(guardando)} />
                  </div>
                  <div>
                    <label htmlFor={`oa-cupos-${producto.id}`}>Cupos de la oferta</label>
                    <input type="number" min="0" max={producto.stock ?? undefined} step="1"
                      id={`oa-cupos-${producto.id}`}
                      value={formulario[producto.id]?.stockOferta ?? '0'}
                      onChange={(evento) => cambiarCampo(producto.id, 'stockOferta', evento.target.value)}
                      disabled={Boolean(guardando)} />
                  </div>
                  <button className="oa-boton oa-guardar" type="button"
                    onClick={() => guardar(producto)} disabled={Boolean(guardando)}>
                    <FiSave /> {guardando === producto.id ? 'Guardando…' : 'Guardar oferta'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="oa-nota">Un descuento de 0 % o cero cupos desactiva la promoción. Los cupos se administran manualmente por ahora: agregarlos al carrito o guardar un presupuesto no los descuenta. La actualización automática requiere integrar la confirmación de pagos con control de concurrencia.</p>
      </div>
    </Vista>
  );
};

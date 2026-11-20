// src/components/ResumenAdmin.jsx
import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import styled from 'styled-components';
import { FiAlertCircle, FiPackage, FiRefreshCw, FiTag, FiUsers } from 'react-icons/fi';
import { db } from '../firebase/config';

const Seccion = styled.section`
  margin-top: 20px;
  padding: clamp(20px, 3vw, 29px);
  border: 1px solid rgba(158, 93, 226, .3);
  border-radius: 20px;
  background: linear-gradient(150deg, rgba(57, 23, 89, .87), rgba(26, 10, 46, .97));
  box-shadow: 0 15px 36px rgba(8, 3, 20, .24);
  color: #f2f0f7;

  *, *::before, *::after { box-sizing: border-box; }
  h3, h4, p { margin: 0; }
  h3 { color: #f2f0f7; font-size: 1.15rem; }
  p { color: #c9bed7; }

  .ra-encabezado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
  }
  .ra-encabezado h3 { display: flex; align-items: center; gap: 10px; }
  .ra-encabezado h3 svg { color: #ccff00; }
  .ra-actualizar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(177, 99, 255, .55);
    background: rgba(138, 43, 226, .14);
    color: #f2f0f7;
    font: 700 .84rem 'Montserrat', sans-serif;
    cursor: pointer;
  }
  .ra-actualizar:hover:not(:disabled) {
    border-color: #ccff00;
    background: rgba(138, 43, 226, .3);
  }
  .ra-actualizar:focus-visible { outline: 3px solid #ccff00; outline-offset: 3px; }
  .ra-actualizar:disabled { cursor: wait; opacity: .65; }

  .ra-grilla {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .ra-tarjeta {
    min-width: 0;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(164, 93, 237, .3);
    background: rgba(17, 7, 34, .48);
  }
  .ra-icono { color: #ccff00; font-size: 1.45rem; }
  .ra-numero {
    display: block;
    margin-block: 12px 7px;
    color: #f2f0f7;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    line-height: 1;
    font-weight: 850;
    font-variant-numeric: tabular-nums;
  }
  .ra-etiqueta { color: #c9bed7; font-size: .85rem; line-height: 1.35; }
  .ra-aviso { margin-top: 15px; display: flex; gap: 8px; align-items: flex-start; color: #ffc5cb; font-size: .87rem; }
  .ra-fecha { margin-top: 15px; font-size: .78rem; }

  @media (max-width: 760px) { .ra-grilla { grid-template-columns: 1fr; } }
  @media (prefers-reduced-motion: reduce) { .ra-actualizar { transition: none; } }
`;

const indicadores = [
  { clave: 'productos', etiqueta: 'Productos y servicios', icono: FiPackage },
  { clave: 'cupones', etiqueta: 'Cupones activos', icono: FiTag },
  { clave: 'perfiles', etiqueta: 'Perfiles en Firestore', icono: FiUsers },
];

const consultarEstadisticas = async () => {
  const resultados = await Promise.allSettled([
    getCountFromServer(collection(db, 'productos')),
    getCountFromServer(query(collection(db, 'cupones'), where('activo', '==', true))),
    getCountFromServer(collection(db, 'usuarios')),
  ]);

  const valores = Object.fromEntries(
    indicadores.map((indicador, indice) => [
      indicador.clave,
      resultados[indice].status === 'fulfilled'
        ? resultados[indice].value.data().count
        : null,
    ])
  );

  resultados.forEach((resultado, indice) => {
    if (resultado.status === 'rejected') {
      console.error(`No se pudo consultar ${indicadores[indice].clave}:`, resultado.reason);
    }
  });

  return {
    valores,
    incompleto: resultados.some((resultado) => resultado.status === 'rejected'),
  };
};

export const ResumenAdmin = () => {
  const [valores, setValores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [incompleto, setIncompleto] = useState(false);
  const [actualizado, setActualizado] = useState(null);

  useEffect(() => {
    let activo = true;
    consultarEstadisticas()
      .then((resultado) => {
        if (!activo) return;
        setValores(resultado.valores);
        setIncompleto(resultado.incompleto);
        setActualizado(new Date());
      })
      .catch((error) => {
        console.error('Error al cargar el resumen administrativo:', error);
        if (activo) setIncompleto(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, []);

  const actualizar = async () => {
    if (cargando) return;
    setCargando(true);
    try {
      const resultado = await consultarEstadisticas();
      setValores(resultado.valores);
      setIncompleto(resultado.incompleto);
      setActualizado(new Date());
    } catch (error) {
      console.error('Error al actualizar el resumen:', error);
      setIncompleto(true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Seccion aria-labelledby="ra-titulo">
      <div className="ra-encabezado">
        <h3 id="ra-titulo"><FiUsers aria-hidden="true" /> Resumen del negocio</h3>
        <button className="ra-actualizar" type="button" onClick={actualizar} disabled={cargando}>
          <FiRefreshCw aria-hidden="true" /> {cargando ? 'Consultando…' : 'Actualizar datos'}
        </button>
      </div>

      <div className="ra-grilla" aria-live="polite" aria-busy={cargando}>
        {indicadores.map(({ clave, etiqueta, icono: Icono }) => (
          <div className="ra-tarjeta" key={clave}>
            <Icono className="ra-icono" aria-hidden="true" />
            <strong className="ra-numero">
              {valores?.[clave] == null ? '—' : valores[clave].toLocaleString('es-AR')}
            </strong>
            <p className="ra-etiqueta">{etiqueta}</p>
          </div>
        ))}
      </div>

      {incompleto && (
        <p className="ra-aviso" role="alert">
          <FiAlertCircle aria-hidden="true" /> Algunas estadísticas no están disponibles. Revisá la conexión o los permisos de administrador.
        </p>
      )}
      {actualizado && !cargando && (
        <p className="ra-fecha">Última consulta: {actualizado.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>
      )}
    </Seccion>
  );
};

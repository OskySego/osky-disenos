import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLOR = {
  fondo: '#1E0B36',
  superficie: '#291343',
  violeta: '#8A2BE2',
  lima: '#CCFF00',
  terracota: '#D97757',
  texto: '#F2F0F7',
  secundario: 'rgba(242, 240, 247, 0.77)',
  borde: 'rgba(138, 43, 226, 0.38)',
};

const formatearFecha = (fecha) => {
  if (!fecha) return null;
  const valor = typeof fecha?.toDate === 'function' ? fecha.toDate() : new Date(fecha);
  if (Number.isNaN(valor.getTime())) return null;
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(valor);
};

const instante = (fecha) => {
  if (!fecha) return 0;
  const valor = typeof fecha?.toMillis === 'function'
    ? fecha.toMillis()
    : new Date(fecha).getTime();
  return Number.isFinite(valor) ? valor : 0;
};

const normalizarResena = (documento) => {
  const datos = documento.data();
  const puntuacion = Number(datos.calificacion ?? datos.rating);
  const comentario = String(datos.comentario ?? '').trim();
  const nombre = String(datos.nombre ?? '').trim();

  // Solo se presentan opiniones publicadas y con los datos mínimos válidos.
  if (datos.publicada !== true || !nombre || !comentario ||
      !Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return null;
  }

  return {
    id: documento.id,
    nombre,
    comentario,
    puntuacion,
    servicio: String(datos.servicio ?? '').trim(),
    fecha: datos.fecha ?? null,
  };
};

const Estrellas = ({ puntuacion }) => (
  <span role="img" aria-label={`${puntuacion} de 5 estrellas`} style={{ color: COLOR.lima, letterSpacing: '0.12em' }}>
    {'★'.repeat(puntuacion)}<span style={{ color: 'rgba(242,240,247,0.24)' }}>{'★'.repeat(5 - puntuacion)}</span>
  </span>
);

const Beneficio = ({ titulo, texto, simbolo }) => (
  <div style={{
    padding: '22px 20px',
    borderRadius: 18,
    background: 'rgba(41, 19, 67, 0.72)',
    border: `1px solid ${COLOR.borde}`,
    minWidth: 0,
  }}>
    <span aria-hidden="true" style={{ color: COLOR.lima, fontSize: 25 }}>{simbolo}</span>
    <h3 style={{ color: COLOR.texto, fontSize: '1.05rem', margin: '10px 0 8px' }}>{titulo}</h3>
    <p style={{ color: COLOR.secundario, lineHeight: 1.65, margin: 0 }}>{texto}</p>
  </div>
);

export const ResenasPage = () => {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [orden, setOrden] = useState('recientes');

  useEffect(() => {
    let activo = true;

    // La colección debe permitir leer documentos aprobados.
    // No se habilitan escrituras públicas desde el navegador.
    const consulta = query(
      collection(db, 'resenas'),
      where('publicada', '==', true),
      limit(24),
    );

    getDocs(consulta)
      .then((respuesta) => {
        if (!activo) return;
        setResenas(respuesta.docs.map(normalizarResena).filter(Boolean));
      })
      .catch((fallo) => {
        if (!activo) return;
        console.error('No se pudieron cargar las reseñas publicadas:', fallo);
        setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, []);

  const opinionesOrdenadas = useMemo(() => {
    return [...resenas].sort((a, b) => orden === 'valoradas'
      ? b.puntuacion - a.puntuacion || instante(b.fecha) - instante(a.fecha)
      : instante(b.fecha) - instante(a.fecha));
  }, [resenas, orden]);

  const promedio = resenas.length
    ? resenas.reduce((acumulado, opinion) => acumulado + opinion.puntuacion, 0) / resenas.length
    : null;

  return (
    <main style={{
      background: `radial-gradient(ellipse at 85% 5%, rgba(138,43,226,0.22), transparent 45%),
        radial-gradient(ellipse at 10% 50%, rgba(217,119,87,0.09), transparent 48%), ${COLOR.fondo}`,
      color: COLOR.texto,
      minHeight: '70vh',
      padding: 'clamp(48px, 7vw, 92px) 20px 88px',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <header style={{ maxWidth: 820, marginBottom: 42 }}>
          <p style={{ color: COLOR.lima, fontWeight: 800, letterSpacing: '0.18em', fontSize: 12, marginBottom: 16 }}>
            CONFIANZA QUE SE CONSTRUYE
          </p>
          <h1 style={{
            color: COLOR.texto,
            fontSize: 'clamp(2.1rem, 5vw, 4.3rem)',
            lineHeight: 1.13,
            letterSpacing: '-0.045em',
            margin: '0 0 18px',
            fontWeight: 800,
          }}>
            Cada proyecto tiene una <span style={{ color: COLOR.lima }}>historia.</span>
          </h1>
          <p style={{ color: COLOR.secundario, fontSize: 'clamp(1rem, 1.8vw, 1.18rem)', lineHeight: 1.75, maxWidth: 690 }}>
            Nos importa tanto lo que diseñamos como la experiencia de trabajar juntos.
            Acá compartimos opiniones que nuestros clientes hayan autorizado a publicar.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 26 }}>
            <Link className="cta-button main-cta" to="/contacto" style={{ textDecoration: 'none' }}>
              Contanos tu proyecto
            </Link>
            <Link className="cta-button secondary-cta" to="/productos" style={{ textDecoration: 'none' }}>
              Explorar servicios
            </Link>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 255px), 1fr))',
          gap: 16,
          marginBottom: 56,
        }}>
          <Beneficio simbolo="✦" titulo="Opiniones auténticas" texto="Solo publicamos experiencias autorizadas, sin cifras inventadas ni testimonios de ejemplo." />
          <Beneficio simbolo="◇" titulo="Atención cercana" texto="Cada consulta comienza escuchando las necesidades de tu marca y sus objetivos." />
          <Beneficio simbolo="↗" titulo="Diseño con propósito" texto="Buscamos que cada pieza comunique mejor y resulte útil para tu negocio." />
        </div>

        <section aria-labelledby="titulo-resenas">
          <div style={{
            display: 'flex', alignItems: 'end', justifyContent: 'space-between',
            gap: 20, flexWrap: 'wrap', marginBottom: 22,
          }}>
            <div>
              <p style={{ color: COLOR.terracota, letterSpacing: '0.14em', fontSize: 12, fontWeight: 800, margin: '0 0 8px' }}>
                VOCES DE NUESTROS CLIENTES
              </p>
              <h2 id="titulo-resenas" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: 0, color: COLOR.texto }}>
                Experiencias compartidas
              </h2>
            </div>
            {!cargando && !error && resenas.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                {promedio !== null && (
                  <span style={{ fontSize: 14, color: COLOR.secundario }}>
                    <strong style={{ color: COLOR.lima, fontSize: 22 }}>{promedio.toFixed(1).replace('.', ',')}</strong>
                    {' '}/ 5 · {resenas.length} {resenas.length === 1 ? 'opinión mostrada' : 'opiniones mostradas'}
                  </span>
                )}
                <label htmlFor="orden-resenas" style={{ color: COLOR.secundario, fontSize: 14 }}>
                  Ordenar{' '}
                  <select
                    id="orden-resenas"
                    value={orden}
                    onChange={(evento) => setOrden(evento.target.value)}
                    style={{
                      color: COLOR.texto, background: COLOR.superficie,
                      border: `1px solid ${COLOR.borde}`, borderRadius: 10,
                      padding: '9px 12px', marginLeft: 6,
                    }}
                  >
                    <option value="recientes">Más recientes</option>
                    <option value="valoradas">Mayor valoración</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          {cargando ? (
            <div role="status" aria-live="polite" style={{ padding: 36, border: `1px solid ${COLOR.borde}`, borderRadius: 20, color: COLOR.secundario }}>
              Cargando opiniones publicadas...
            </div>
          ) : error ? (
            <div role="alert" style={{ padding: 32, border: `1px solid ${COLOR.borde}`, borderRadius: 20, background: 'rgba(41,19,67,0.72)' }}>
              <h3 style={{ color: COLOR.texto, marginTop: 0 }}>Las opiniones no están disponibles por el momento</h3>
              <p style={{ color: COLOR.secundario, lineHeight: 1.7 }}>
                No pudimos acceder a las reseñas. Podés explorar nuestros servicios o escribirnos directamente.
              </p>
              <Link to="/contacto" style={{ color: COLOR.lima, fontWeight: 700 }}>Contactarnos</Link>
            </div>
          ) : opinionesOrdenadas.length === 0 ? (
            <div style={{
              border: `1px solid ${COLOR.borde}`, borderRadius: 22, padding: 'clamp(25px, 5vw, 48px)',
              background: 'linear-gradient(125deg, rgba(41,19,67,0.96), rgba(30,11,54,0.92))',
            }}>
              <span aria-hidden="true" style={{ color: COLOR.lima, fontSize: 32 }}>✧</span>
              <h3 style={{ fontSize: '1.45rem', color: COLOR.texto, margin: '12px 0' }}>Muy pronto, experiencias para compartir</h3>
              <p style={{ color: COLOR.secundario, maxWidth: 620, lineHeight: 1.75 }}>
                Todavía no hay opiniones publicadas. Preferimos mostrar testimonios auténticos
                antes que valoraciones de ejemplo. ¿Trabajaste con nosotros? Escribinos para compartir tu experiencia.
              </p>
              <Link to="/contacto" style={{ display: 'inline-block', color: COLOR.lima, fontWeight: 800, marginTop: 12 }}>
                Quiero dejar mi opinión
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: 18 }}>
              {opinionesOrdenadas.map((resena) => (
                <article key={resena.id} style={{
                  background: 'linear-gradient(155deg, rgba(50,25,78,0.92), rgba(30,11,54,0.95))',
                  border: `1px solid ${COLOR.borde}`, borderRadius: 22, padding: '27px 25px',
                  display: 'flex', flexDirection: 'column', gap: 15, minWidth: 0,
                }}>
                  <Estrellas puntuacion={resena.puntuacion} />
                  <p style={{ color: COLOR.texto, lineHeight: 1.75, margin: 0, overflowWrap: 'anywhere', flex: 1 }}>
                    “{resena.comentario}”
                  </p>
                  <div style={{ paddingTop: 15, borderTop: '1px solid rgba(242,240,247,0.12)' }}>
                    <strong style={{ display: 'block', color: COLOR.texto }}>{resena.nombre}</strong>
                    {(resena.servicio || formatearFecha(resena.fecha)) && (
                      <span style={{ display: 'block', color: COLOR.secundario, marginTop: 4, fontSize: 13 }}>
                        {[resena.servicio, formatearFecha(resena.fecha)].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

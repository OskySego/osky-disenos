import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FormularioProducto } from '../components/FormularioProducto';
import "../css/GestionPage.css";

const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const formatearPrecio = (valor) => {
  if (valor === '' || valor === null || valor === undefined) return 'Precio a consultar';
  const numero = Number(valor);
  return Number.isFinite(numero) ? moneda.format(numero) : 'Precio a consultar';
};

const obtenerImagen = (producto) =>
  [producto.imagen, producto.imagenUrl, producto.urlImagen, producto.imageUrl]
    .find((valor) => typeof valor === 'string' && valor.trim().length > 0);

export const GestionPage = () => {
  const [productos, setProductos] = useState([]);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setErrorCarga('');
    try {
      const respuesta = await getDocs(collection(db, 'productos'));
      setProductos(respuesta.docs.map((item) => ({ ...item.data(), id: item.id })));
      return true;
    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
      setErrorCarga('No se pudo cargar el catálogo. Revisá tu conexión y volvé a intentar.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // La carga inicial es asíncrona; se omiten resultados si se desmonta la página.
  // La función cargarProductos se conserva para los botones y las acciones de gestión.
  useEffect(() => {
    let activo = true;
    getDocs(collection(db, 'productos'))
      .then((respuesta) => {
        if (!activo) return;
        setProductos(respuesta.docs.map((item) => ({ ...item.data(), id: item.id })));
      })
      .catch((error) => {
        if (!activo) return;
        console.error('Error al cargar el catálogo:', error);
        setErrorCarga('No se pudo cargar el catálogo. Revisá tu conexión y volvé a intentar.');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (!confirmarEliminar) return undefined;
    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape' && !eliminando) setConfirmarEliminar(null);
    };
    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [confirmarEliminar, eliminando]);

  const categorias = useMemo(
    () => [...new Set(productos.map((p) => String(p.categoria || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es')),
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    return productos.filter((p) => {
      const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
      const contenido = `${p.nombre || ''} ${p.categoria || ''} ${p.descripcion || ''}`
        .toLocaleLowerCase('es-AR');
      return coincideCategoria && (!texto || contenido.includes(texto));
    });
  }, [productos, busqueda, categoria]);

  const disponibles = productos.filter((p) => p.stock !== undefined && p.stock !== null && Number(p.stock) > 0).length;

  const editarProducto = (producto) => {
    setProductoAEditar(producto);
    setMensaje(null);
    document.getElementById('gestion-formulario')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const guardarProducto = async () => {
    setProductoAEditar(null);
    const actualizado = await cargarProductos();
    setMensaje(actualizado
      ? { tipo: 'exito', texto: 'El catálogo se actualizó correctamente.' }
      : { tipo: 'error', texto: 'Se completó el formulario, pero no pudimos refrescar el catálogo.' });
  };

  const eliminarProducto = async () => {
    if (!confirmarEliminar || eliminando) return;
    const { id, nombre } = confirmarEliminar;
    setEliminando(true);
    setMensaje(null);
    try {
      await deleteDoc(doc(db, 'productos', id));
      setProductos((actuales) => actuales.filter((producto) => producto.id !== id));
      if (productoAEditar?.id === id) setProductoAEditar(null);
      setConfirmarEliminar(null);
      setMensaje({ tipo: 'exito', texto: `Se eliminó «${nombre || 'el producto'}» del catálogo.` });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setConfirmarEliminar(null);
      setMensaje({ tipo: 'error', texto: 'No se pudo eliminar el producto. Volvé a intentar.' });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <main className="gestion-dashboard">
      <div className="gestion-container">
        <header className="gestion-encabezado">
          <div>
            <span className="gestion-eyebrow">OSKY DISEÑOS · ADMINISTRACIÓN</span>
            <h1>Gestión del catálogo</h1>
            <p>Creá, actualizá y organizá tus productos y servicios desde un solo lugar.</p>
          </div>
          <a className="gestion-ver-catalogo" href="#gestion-titulo-catalogo">Ir al catálogo actual <span aria-hidden="true">↗</span></a>
        </header>

        <div className="gestion-resumen" aria-label="Resumen del catálogo">
          <div className="gestion-resumen-card">
            <span className="gestion-resumen-icono" aria-hidden="true">▦</span>
            <div><span>Total de publicaciones</span><strong>{productos.length}</strong></div>
          </div>
          <div className="gestion-resumen-card">
            <span className="gestion-resumen-icono" aria-hidden="true">▤</span>
            <div><span>Categorías</span><strong>{categorias.length}</strong></div>
          </div>
          <div className="gestion-resumen-card">
            <span className="gestion-resumen-icono" aria-hidden="true">✓</span>
            <div><span>Con stock o cupos</span><strong>{disponibles}</strong></div>
          </div>
        </div>

        {mensaje && (
          <div className={`gestion-aviso gestion-aviso--${mensaje.tipo}`} role="status">
            <span>{mensaje.texto}</span>
            <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar aviso">×</button>
          </div>
        )}

        <section className="gestion-area-edicion" id="gestion-formulario" aria-labelledby="gestion-titulo-formulario">
          <div className="gestion-form-panel">
            <div className="gestion-panel-encabezado">
              <div>
                <span className="gestion-seccion-etiqueta">{productoAEditar ? 'MODO EDICIÓN' : 'NUEVA PUBLICACIÓN'}</span>
                <h2 id="gestion-titulo-formulario">
                  {productoAEditar ? 'Editar publicación' : 'Agregar producto o servicio'}
                </h2>
                <p>{productoAEditar
                  ? `Modificá los datos de «${productoAEditar.nombre || 'este producto'}».`
                  : 'Completá la información que se mostrará en tu catálogo.'}</p>
              </div>
              {productoAEditar && (
                <button type="button" className="gestion-btn-salir" onClick={() => setProductoAEditar(null)}>
                  Salir de edición
                </button>
              )}
            </div>
            <FormularioProducto
              key={productoAEditar?.id ?? 'nuevo'}
              modoEdicion={Boolean(productoAEditar)}
              productoAEditar={productoAEditar}
              onGuardar={guardarProducto}
              onCancelarEdicion={() => setProductoAEditar(null)}
            />
          </div>

          <aside className="gestion-aside" aria-label="Recomendaciones de carga">
            <div className="gestion-ayuda-card">
              <span className="gestion-seccion-etiqueta">GUÍA RÁPIDA</span>
              <h3>Una publicación que vende mejor</h3>
              <ol>
                <li><strong>Nombre claro.</strong> Contá qué ofrecés en pocas palabras.</li>
                <li><strong>Descripción útil.</strong> Incluí qué recibe el cliente.</li>
                <li><strong>Precio actualizado.</strong> Revisá los valores antes de publicar.</li>
                <li><strong>Imagen de calidad.</strong> Usá una foto o diseño legible.</li>
              </ol>
            </div>
            <div className="gestion-nota-card">
              <span aria-hidden="true">✦</span>
              <div>
                <strong>Consejo para servicios</strong>
                <p>Si ofrecés diseño web, branding u otros trabajos a pedido, indicá la disponibilidad como cupos y no como unidades físicas.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="gestion-catalogo" aria-labelledby="gestion-titulo-catalogo">
          <div className="gestion-catalogo-header">
            <div>
              <span className="gestion-seccion-etiqueta">PUBLICACIONES</span>
              <h2 id="gestion-titulo-catalogo">Catálogo actual <span>({productos.length})</span></h2>
            </div>
            <button type="button" className="gestion-btn-actualizar" onClick={cargarProductos} disabled={loading}>
              {loading ? <FiLoader className="gestion-spinner" aria-hidden="true" /> : <span aria-hidden="true">↻</span>}
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          <div className="gestion-filtros">
            <label className="gestion-busqueda">
              <span className="gestion-sr-only">Buscar por nombre, categoría o descripción</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos o servicios..."
              />
            </label>
            <label className="gestion-filtro-categoria">
              <span className="gestion-sr-only">Filtrar por categoría</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="todas">Todas las categorías</option>
                {categorias.map((nombre) => <option value={nombre} key={nombre}>{nombre}</option>)}
              </select>
            </label>
          </div>

          {errorCarga && (
            <div className="gestion-estado gestion-estado--error" role="alert">
              <p>{errorCarga}</p>
              <button type="button" onClick={cargarProductos}>Reintentar</button>
            </div>
          )}

          {!errorCarga && loading && (
            <div className="gestion-estado" role="status" aria-live="polite" aria-busy="true">
              <FiLoader className="gestion-spinner" aria-hidden="true" />
              <span>Cargando publicaciones...</span>
            </div>
          )}

          {!errorCarga && !loading && productosFiltrados.length === 0 && (
            <div className="gestion-estado">
              <span aria-hidden="true">▧</span>
              <h3>{productos.length === 0 ? 'Tu catálogo todavía está vacío' : 'No encontramos coincidencias'}</h3>
              <p>{productos.length === 0
                ? 'Agregá tu primer producto o servicio desde el formulario superior.'
                : 'Probá con otra búsqueda o seleccioná todas las categorías.'}</p>
              {productos.length > 0 && (
                <button type="button" onClick={() => { setBusqueda(''); setCategoria('todas'); }}>Limpiar filtros</button>
              )}
            </div>
          )}

          {!errorCarga && !loading && productosFiltrados.length > 0 && (
            <>
              <p className="gestion-resultado-cantidad">
                Mostrando {productosFiltrados.length} de {productos.length} publicaciones
              </p>
              <div className="gestion-lista">
                {productosFiltrados.map((producto) => {
                  const imagen = obtenerImagen(producto);
                  const cantidad = Number(producto.stock);
                  const tieneCantidad = producto.stock !== undefined && producto.stock !== null && producto.stock !== '' && Number.isFinite(cantidad);
                  return (
                    <article className="gestion-item" key={producto.id}>
                      <div className="gestion-item-imagen">
                        <span aria-hidden="true">✦</span>
                        {imagen && <img src={imagen} alt={`Imagen de ${producto.nombre || 'producto'}`} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                      </div>
                      <div className="gestion-item-detalle">
                        <span className="gestion-categoria">{producto.categoria || 'Sin categoría'}</span>
                        <h3>{producto.nombre || 'Sin nombre'}</h3>
                        {producto.descripcion && <p>{producto.descripcion}</p>}
                      </div>
                      <div className="gestion-item-datos">
                        <strong>{formatearPrecio(producto.precio)}</strong>
                        <span className={`gestion-stock ${tieneCantidad && cantidad === 0 ? 'gestion-stock--cero' : ''}`}>
                          {tieneCantidad ? `Stock / cupos: ${cantidad}` : 'Disponibilidad sin definir'}
                        </span>
                      </div>
                      <div className="gestion-item-acciones">
                        <button type="button" className="gestion-btn-editar" onClick={() => editarProducto(producto)}>Editar</button>
                        <button type="button" className="gestion-btn-eliminar" onClick={() => setConfirmarEliminar(producto)} aria-label={`Eliminar ${producto.nombre || 'producto'}`}>Eliminar</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {confirmarEliminar && (
        <div className="gestion-modal-fondo">
          <div className="gestion-modal" role="dialog" aria-modal="true" aria-labelledby="gestion-modal-titulo" aria-describedby="gestion-modal-descripcion">
            <span className="gestion-modal-icono" aria-hidden="true">!</span>
            <h2 id="gestion-modal-titulo">¿Eliminar publicación?</h2>
            <p id="gestion-modal-descripcion">
              Vas a eliminar <strong>{confirmarEliminar.nombre || 'este producto'}</strong> del catálogo.
              Esta acción no se puede deshacer.
            </p>
            <div className="gestion-modal-acciones">
              <button type="button" className="gestion-btn-editar" onClick={() => setConfirmarEliminar(null)} disabled={eliminando} autoFocus>Cancelar</button>
              <button type="button" className="gestion-btn-eliminar gestion-btn-confirmar" onClick={eliminarProducto} disabled={eliminando}>
                {eliminando && <FiLoader className="gestion-spinner" aria-hidden="true" />}
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

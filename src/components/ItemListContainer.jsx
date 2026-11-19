import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Item } from './Item';

const CANTIDAD_INICIAL = 9;

const normalizarTexto = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es-AR');

const nombreCategoria = (producto) =>
  String(producto.categoria ?? '').trim() || 'Sin categoría';

const tieneDisponibilidad = (producto) => {
  if (producto.stock === null || producto.stock === undefined || producto.stock === '') {
    return true; // Un servicio sin cupos definidos no se marca como agotado.
  }
  const stock = Number(producto.stock);
  return !Number.isFinite(stock) || stock > 0;
};

const precioNumerico = (producto) => {
  if (producto.precio === '' || producto.precio === null || producto.precio === undefined) return null;
  const valor = Number(producto.precio);
  return Number.isFinite(valor) ? valor : null;
};

const obtenerProductos = async () => {
  const respuesta = await getDocs(collection(db, 'productos'));
  return respuesta.docs.map((documento) => ({
    ...documento.data(),
    id: documento.id,
  }));
};

export const ItemListContainer = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [orden, setOrden] = useState('nombre');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [cantidadVisible, setCantidadVisible] = useState(CANTIDAD_INICIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carga el catálogo completo para que la búsqueda contemple todos los servicios.
  // Es adecuado para catálogos pequeños o medianos; para miles de registros,
  // conviene pasar a búsqueda indexada en servidor.
  // Solo se invoca desde el botón Reintentar (evento del usuario).
  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProductos(await obtenerProductos());
    } catch (err) {
      console.error('Error al cargar el catálogo de Osky Diseños:', err);
      setError('No pudimos cargar los servicios. Revisá tu conexión e intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // La consulta inicial no actualiza estado sincrónicamente dentro del efecto.
  // La bandera evita actualizar un componente que ya fue desmontado.
  useEffect(() => {
    let activo = true;

    obtenerProductos()
      .then((datos) => {
        if (activo) setProductos(datos);
      })
      .catch((err) => {
        if (!activo) return;
        console.error('Error al cargar el catálogo de Osky Diseños:', err);
        setError('No pudimos cargar los servicios. Revisá tu conexión e intentá nuevamente.');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => { activo = false; };
  }, []);

  // Reiniciar la cantidad visible desde los eventos, no desde useEffect.
  const actualizarBusqueda = (valor) => {
    setBusqueda(valor);
    setCantidadVisible(CANTIDAD_INICIAL);
  };
  const actualizarCategoria = (valor) => {
    setCategoria(valor);
    setCantidadVisible(CANTIDAD_INICIAL);
  };
  const actualizarOrden = (valor) => {
    setOrden(valor);
    setCantidadVisible(CANTIDAD_INICIAL);
  };
  const actualizarDisponibilidad = (valor) => {
    setSoloDisponibles(valor);
    setCantidadVisible(CANTIDAD_INICIAL);
  };

  const categorias = useMemo(() => {
    return [...new Set(productos.map(nombreCategoria))]
      .sort((a, b) => a.localeCompare(b, 'es-AR', { sensitivity: 'base' }));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim());
    const filtrados = productos.filter((producto) => {
      const coincideBusqueda = !texto || normalizarTexto([
        producto.nombre,
        producto.categoria,
        producto.descripcion,
      ].join(' ')).includes(texto);
      const coincideCategoria = categoria === 'todas' || nombreCategoria(producto) === categoria;
      const coincideStock = !soloDisponibles || tieneDisponibilidad(producto);
      return coincideBusqueda && coincideCategoria && coincideStock;
    });

    filtrados.sort((a, b) => {
      if (orden === 'precio-asc' || orden === 'precio-desc') {
        const precioA = precioNumerico(a);
        const precioB = precioNumerico(b);
        if (precioA === null && precioB !== null) return 1;
        if (precioB === null && precioA !== null) return -1;
        if (precioA !== null && precioB !== null && precioA !== precioB) {
          return orden === 'precio-asc' ? precioA - precioB : precioB - precioA;
        }
      }
      return String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es-AR', {
        sensitivity: 'base',
        numeric: true,
      });
    });
    return filtrados;
  }, [productos, busqueda, categoria, soloDisponibles, orden]);

  const visibles = productosFiltrados.slice(0, cantidadVisible);
  const hayMas = cantidadVisible < productosFiltrados.length;
  const filtrosActivos = Boolean(busqueda.trim()) || categoria !== 'todas' || soloDisponibles || orden !== 'nombre';

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoria('todas');
    setSoloDisponibles(false);
    setOrden('nombre');
    setCantidadVisible(CANTIDAD_INICIAL);
  };

  return (
    <section className="catalogo-listado" id="catalogo-listado" aria-labelledby="catalogo-listado-titulo">
      <div className="catalogo-listado__encabezado">
        <div>
          <span className="catalogo-listado__eyebrow">EXPLORÁ LO QUE CREAMOS</span>
          <h2 id="catalogo-listado-titulo">Nuestros <em>servicios</em></h2>
          <p>Encontrá la solución que mejor se adapte a tu proyecto.</p>
        </div>
        {!loading && !error && (
          <span className="catalogo-listado__total" aria-label={`${productos.length} publicaciones en total`}>
            {productos.length} {productos.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        )}
      </div>

      <div className="catalogo-filtros" role="search" aria-label="Filtros del catálogo">
        <label className="catalogo-filtros__buscar">
          <span className="catalogo-filtros__label">Buscar servicio</span>
          <span className="catalogo-filtros__input-wrap">
            <span className="catalogo-filtros__lupa" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => actualizarBusqueda(evento.target.value)}
              placeholder="Diseño web, logos, redes sociales..."
            />
          </span>
        </label>

        <label className="catalogo-filtros__campo">
          <span className="catalogo-filtros__label">Categoría</span>
          <select value={categoria} onChange={(evento) => actualizarCategoria(evento.target.value)}>
            <option value="todas">Todas las categorías</option>
            {categorias.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </select>
        </label>

        <label className="catalogo-filtros__campo">
          <span className="catalogo-filtros__label">Ordenar por</span>
          <select value={orden} onChange={(evento) => actualizarOrden(evento.target.value)}>
            <option value="nombre">Nombre (A a Z)</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
          </select>
        </label>
      </div>

      <div className="catalogo-filtros__inferior">
        <label className="catalogo-disponibles">
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={(evento) => actualizarDisponibilidad(evento.target.checked)}
          />
          <span>Solo con stock o cupos</span>
        </label>
        {filtrosActivos && (
          <button type="button" className="catalogo-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="catalogo-cuadricula" aria-label="Cargando catálogo" role="status">
          {Array.from({ length: 6 }, (_, indice) => (
            <div className="catalogo-esqueleto" key={indice} aria-hidden="true">
              <div className="catalogo-esqueleto__imagen" />
              <div className="catalogo-esqueleto__linea" />
              <div className="catalogo-esqueleto__linea catalogo-esqueleto__linea--corta" />
              <div className="catalogo-esqueleto__linea" />
            </div>
          ))}
          <span className="catalogo-solo-lector">Cargando servicios de Osky Diseños...</span>
        </div>
      ) : error ? (
        <div className="catalogo-vacio" role="alert">
          <span className="catalogo-vacio__icono" aria-hidden="true">!</span>
          <h3>No se pudo cargar el catálogo</h3>
          <p>{error}</p>
          <button type="button" className="catalogo-boton catalogo-boton--principal" onClick={cargarProductos}>Reintentar</button>
        </div>
      ) : (
        <>
          <p className="catalogo-resultados" aria-live="polite">
            {productosFiltrados.length === 0
              ? 'No hay resultados con estos filtros.'
              : `Mostrando ${visibles.length} de ${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'servicio' : 'servicios'}`}
          </p>

          {productosFiltrados.length === 0 ? (
            <div className="catalogo-vacio">
              <span className="catalogo-vacio__icono" aria-hidden="true">✧</span>
              <h3>{productos.length === 0 ? 'Pronto vas a encontrar nuestros servicios acá' : 'No encontramos coincidencias'}</h3>
              <p>{productos.length === 0 ? 'Estamos preparando el catálogo.' : 'Probá con otra palabra o cambiá los filtros.'}</p>
              {filtrosActivos && <button type="button" className="catalogo-boton catalogo-boton--secundario" onClick={limpiarFiltros}>Mostrar todos</button>}
            </div>
          ) : (
            <div className="catalogo-cuadricula">
              {visibles.map((producto) => <Item key={producto.id} item={producto} />)}
            </div>
          )}

          {hayMas && (
            <div className="catalogo-cargar-mas">
              <button
                type="button"
                className="catalogo-boton catalogo-boton--secundario"
                onClick={() => setCantidadVisible((actual) => actual + CANTIDAD_INICIAL)}
              >
                Mostrar más servicios <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

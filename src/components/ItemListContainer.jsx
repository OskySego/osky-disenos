import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Item } from './Item';

const LIMITE_POR_PAGINA = 6;

export const ItemListContainer = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [hayMas, setHayMas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(null);

  const cargarProductos = async (esSiguientePagina = false) => {
    if (esSiguientePagina) {
      setCargandoMas(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const productosRef = collection(db, 'productos');
      const consulta = esSiguientePagina && ultimoDoc
        ? query(productosRef, orderBy('nombre'), startAfter(ultimoDoc), limit(LIMITE_POR_PAGINA))
        : query(productosRef, orderBy('nombre'), limit(LIMITE_POR_PAGINA));

      const resp = await getDocs(consulta);
      const nuevosDocs = resp.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));

      setUltimoDoc(resp.docs[resp.docs.length - 1] || null);
      setHayMas(resp.docs.length === LIMITE_POR_PAGINA);

      if (esSiguientePagina) {
        setProductos((prev) => [...prev, ...nuevosDocs]);
      } else {
        setProductos(nuevosDocs);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudo conectar con el catálogo en la nube.');
    } finally {
      setLoading(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarProductos(false);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#ffd700' }}>⏳ Cargando catálogo de servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', color: '#ff6b6b' }}>⚠️ {error}</p>
        <button onClick={() => cargarProductos(false)} className="cta-button main-cta" style={{ marginTop: '15px' }}>
          Reintentar Cargar
        </button>
      </div>
    );
  }

  // Filtrado en tiempo real por nombre, categoría o descripción
  const termino = busqueda.trim().toLowerCase();
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
  );

  const categorias = [...new Set(productosFiltrados.map((p) => p.categoria))];

  return (
    <section id="productos-container">
      {/* Barra de búsqueda en tiempo real */}
      <div style={{ maxWidth: '500px', margin: '0 auto 35px', padding: '0 20px' }}>
        <input
          type="search"
          aria-label="Buscar servicios o productos"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar servicio, categoría o palabra clave..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,215,0,0.4)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '1rem'
          }}
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '30px', opacity: 0.8 }}>
          No se encontraron servicios que coincidan con "{busqueda}".
        </p>
      ) : (
        categorias.map((cat) => (
          <section key={cat} className="product-group" style={{ marginBottom: '40px' }}>
            <h3 className="group-title">{cat}</h3>
            <div className="card-grid">
              {productosFiltrados
                .filter((p) => p.categoria === cat)
                .map((producto) => (
                  <Item key={producto.id} item={producto} />
                ))}
            </div>
          </section>
        ))
      )}

      {/* Botón de paginación */}
      {hayMas && !termino && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button
            onClick={() => cargarProductos(true)}
            className="cta-button secondary-cta"
            disabled={cargandoMas}
          >
            {cargandoMas ? 'Cargando más...' : 'Cargar más servicios'}
          </button>
        </div>
      )}
    </section>
  );
};
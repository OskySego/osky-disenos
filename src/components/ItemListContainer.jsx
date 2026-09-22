import React, { useState, useEffect } from 'react';
import { Item } from './Item';

export const ItemListContainer = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = () => {
    setLoading(true);
    setError(null);

    fetch('/productos.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('No se pudo conectar con el catálogo de servicios.');
        }
        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar productos:', err);
        setError(err.message || 'Ocurrió un error inesperado al cargar el catálogo.');
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 1. Estado de Carga
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#ffd700' }}>⏳ Cargando catálogo de servicios...</p>
      </div>
    );
  }

  // 2. Estado de Error
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', color: '#ff6b6b' }}>⚠️ {error}</p>
        <button onClick={cargarProductos} className="cta-button main-cta" style={{ marginTop: '15px' }}>
          Reintentar Cargar
        </button>
      </div>
    );
  }

  // 3. Renderizado de Datos
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <section id="productos-container">
      {categorias.map((cat) => (
        <section key={cat} className="product-group" style={{ marginBottom: '40px' }}>
          <h3 className="group-title">{cat}</h3>
          <div className="card-grid">
            {productos
              .filter((p) => p.categoria === cat)
              .map((producto) => (
                <Item key={producto.id} item={producto} />
              ))}
          </div>
        </section>
      ))}
    </section>
  );
};
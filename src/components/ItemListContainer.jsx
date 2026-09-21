import React, { useState, useEffect } from 'react';
import { Item } from './Item';

export const ItemListContainer = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/productos.json')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar los productos:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '50px' }}>Cargando catálogo de servicios...</p>;
  }

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
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FormularioProducto } from '../components/FormularioProducto';

export const GestionPage = () => {
  const [productos, setProductos] = useState([]);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const resp = await getDocs(collection(db, 'productos'));
      setProductos(resp.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (err) {
      console.error('Error al obtener productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar "${nombre}"?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'productos', id));
      if (productoAEditar?.id === id) setProductoAEditar(null);
      cargarProductos();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Panel de Gestión de Productos</h1>

      <FormularioProducto
        modoEdicion={Boolean(productoAEditar)}
        productoAEditar={productoAEditar}
        onGuardar={() => {
          setProductoAEditar(null);
          cargarProductos();
        }}
        onCancelarEdicion={() => setProductoAEditar(null)}
      />

      <hr style={{ margin: '40px 0', opacity: 0.2 }} />

      <h2>Catálogo Actual ({productos.length})</h2>
      {loading ? (
        <p>⏳ Cargando listado...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {productos.map((prod) => (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <strong>{prod.nombre}</strong> <span style={{ color: '#ffd700' }}>({prod.categoria})</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Precio: ${Number(prod.precio).toLocaleString('es-AR')} ARS • Stock: {prod.stock}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="secondary-cta"
                  onClick={() => {
                    setProductoAEditar(prod);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-delete-item"
                  onClick={() => handleEliminar(prod.id, prod.nombre)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const FormularioProducto = ({ modoEdicion = false, productoAEditar = null, onGuardar, onCancelarEdicion }) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (modoEdicion && productoAEditar) {
      setNombre(productoAEditar.nombre || '');
      setCategoria(productoAEditar.categoria || '');
      setDescripcion(productoAEditar.descripcion || '');
      setPrecio(productoAEditar.precio ?? '');
      setStock(productoAEditar.stock ?? '');
      setImagen(productoAEditar.imagen || '');
    } else {
      limpiarCampos();
    }
  }, [modoEdicion, productoAEditar]);

  const limpiarCampos = () => {
    setNombre('');
    setCategoria('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setImagen('');
    setErrorForm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!nombre.trim() || !categoria.trim()) {
      setErrorForm('El nombre y la categoría son obligatorios.');
      return;
    }

    if (Number(precio) <= 0 || Number.isNaN(Number(precio))) {
      setErrorForm('El precio debe ser mayor a 0.');
      return;
    }

    if (Number(stock) < 0 || Number.isNaN(Number(stock))) {
      setErrorForm('El stock no puede ser negativo.');
      return;
    }

    setEnviando(true);

    const datosProducto = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio),
      stock: Number(stock),
      imagen: imagen.trim() || 'img/Logo_for_Osky_Diseños.svg'
    };

    try {
      if (modoEdicion && productoAEditar?.id) {
        const docRef = doc(db, 'productos', productoAEditar.id);
        await updateDoc(docRef, datosProducto);
      } else {
        await addDoc(collection(db, 'productos'), datosProducto);
      }

      limpiarCampos();
      if (onGuardar) onGuardar();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setErrorForm('Ocurrió un error al guardar en Firestore.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
      <h3>{modoEdicion ? `Editando: ${productoAEditar?.nombre}` : 'Agregar Nuevo Servicio / Producto'}</h3>

      {errorForm && <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>⚠️ {errorForm}</p>}

      <div className="form-group">
        <label htmlFor="prod-nombre">Nombre *</label>
        <input id="prod-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Landing Page Profesional" />
      </div>

      <div className="form-group">
        <label htmlFor="prod-categoria">Categoría *</label>
        <input id="prod-categoria" type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Desarrollo Web" />
      </div>

      <div className="form-group">
        <label htmlFor="prod-descripcion">Descripción</label>
        <textarea id="prod-descripcion" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalle del servicio o producto..." />
      </div>

      <div className="form-group">
        <label htmlFor="prod-precio">Precio (ARS) *</label>
        <input id="prod-precio" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="45000" />
      </div>

      <div className="form-group">
        <label htmlFor="prod-stock">Stock / Cupos disponibles *</label>
        <input id="prod-stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" />
      </div>

      <div className="form-group">
        <label htmlFor="prod-imagen">Ruta de imagen o URL</label>
        <input id="prod-imagen" type="text" value={imagen} onChange={(e) => setImagen(e.target.value)} placeholder="img/web.png o https://..." />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button type="submit" className="cta-button main-cta" disabled={enviando}>
          {enviando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
        </button>

        {modoEdicion && (
          <button
            type="button"
            className="secondary-cta"
            onClick={() => {
              limpiarCampos();
              if (onCancelarEdicion) onCancelarEdicion();
            }}
          >
            Cancelar Edición
          </button>
        )}
      </div>
    </form>
  );
};
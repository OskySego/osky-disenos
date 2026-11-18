import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const GestionCuponesPage = () => {
  const [cupones, setCupones] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [descuento, setDescuento] = useState('');

  const cargarCupones = async () => {
    const resp = await getDocs(collection(db, 'cupones'));
    setCupones(resp.docs.map((d) => ({ ...d.data(), id: d.id })));
  };

  useEffect(() => {
    cargarCupones();
  }, []);

  const handleCrearCupon = async (e) => {
    e.preventDefault();
    if (!codigo.trim() || Number(descuento) <= 0 || Number(descuento) > 100) return;

    await addDoc(collection(db, 'cupones'), {
      codigo: codigo.trim().toUpperCase(),
      descuento: Number(descuento),
      activo: true
    });

    setCodigo('');
    setDescuento('');
    cargarCupones();
  };

  const handleEliminarCupon = async (id) => {
    await deleteDoc(doc(db, 'cupones', id));
    cargarCupones();
  };

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Gestión de Cupones de Descuento</h1>

      <form onSubmit={handleCrearCupon} className="contact-form" style={{ margin: '25px 0' }}>
        <div className="form-group">
          <label htmlFor="cupon-codigo">Código del cupón</label>
          <input
            id="cupon-codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="EJ: OSKY15"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cupon-desc">Porcentaje de descuento (%)</label>
          <input
            id="cupon-desc"
            type="number"
            min="1"
            max="100"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            placeholder="15"
            required
          />
        </div>

        <button type="submit" className="cta-button main-cta">
          Crear Cupón
        </button>
      </form>

      <div>
        {cupones.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 15px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}
          >
            <span>
              <strong>{c.codigo}</strong> — {c.descuento}% OFF
            </span>
            <button onClick={() => handleEliminarCupon(c.id)} className="btn-delete-item">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
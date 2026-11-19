import { useState } from 'react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const CATEGORIAS_SUGERIDAS = [
  'Diseño Web',
  'Diseño Gráfico',
  'Branding',
  'Social Media',
  'Volantes & Flyers',
  'Tarjetas Personales',
];

const ESTADO_INICIAL = {
  nombre: '',
  categoria: '',
  precio: '',
  stock: '50',
  imagen: '',
  descripcion: '',
  caracteristicas: '',
};

// Prepara el formulario para crear o editar sin actualizar el estado desde useEffect.
const crearEstadoFormulario = (producto) => {
  if (!producto) return { ...ESTADO_INICIAL };

  const caracteristicas = Array.isArray(producto.caracteristicas)
    ? producto.caracteristicas.join(', ')
    : producto.caracteristicas || '';

  return {
    nombre: producto.nombre || '',
    categoria: producto.categoria || '',
    precio: producto.precio !== undefined ? String(producto.precio) : '',
    stock: producto.stock !== undefined ? String(producto.stock) : '50',
    imagen: producto.imagen || '',
    descripcion: producto.descripcion || '',
    caracteristicas,
  };
};

export const FormularioProducto = ({
  modoEdicion = false,
  productoAEditar = null,
  onGuardar,
  onCancelarEdicion,
}) => {
  // El estado se calcula una sola vez al montar el formulario.
  // GestionPage usa una key distinta al seleccionar otro producto.
  const [form, setForm] = useState(() => crearEstadoFormulario(
    modoEdicion && productoAEditar ? productoAEditar : null
  ));
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [previewValida, setPreviewValida] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'imagen') {
      setPreviewValida(true);
    }
  };

  const rutaPreview = (() => {
    const limpia = form.imagen.trim();
    if (!limpia) return '';
    if (limpia.startsWith('http') || limpia.startsWith('data:') || limpia.startsWith('/')) {
      return limpia;
    }
    return `/${limpia}`;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');

    const nombreLimpio = form.nombre.trim();
    const categoriaLimpia = form.categoria.trim();
    const precioNumero = Number(String(form.precio).replace(/\./g, '').trim());
    const stockNumero = form.stock === '' ? 50 : Number(form.stock);

    if (!nombreLimpio || !categoriaLimpia) {
      setErrorForm('El nombre y la categoría son obligatorios.');
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero < 0) {
      setErrorForm('Ingresá un precio válido en números enteros (ej: 135000).');
      return;
    }

    if (!Number.isFinite(stockNumero) || stockNumero < 0) {
      setErrorForm('Ingresá una cantidad de cupos/stock válida.');
      return;
    }

    const arrayCaracteristicas = form.caracteristicas
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      nombre: nombreLimpio,
      categoria: categoriaLimpia,
      precio: Math.round(precioNumero),
      stock: Math.round(stockNumero),
      imagen: form.imagen.trim(),
      descripcion: form.descripcion.trim(),
      caracteristicas: arrayCaracteristicas,
    };

    setGuardando(true);
    try {
      if (modoEdicion && productoAEditar?.id) {
        await updateDoc(doc(db, 'productos', productoAEditar.id), payload);
      } else {
        await addDoc(collection(db, 'productos'), payload);
      }

      setForm(ESTADO_INICIAL);
      if (onGuardar) await onGuardar();
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      setErrorForm('No se pudo guardar en Firebase. Verificá tus permisos de administrador.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      {errorForm && (
        <p style={{ color: '#ff6b6b', fontWeight: '600', textAlign: 'left' }}>
          ⚠️ {errorForm}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="prod-nombre">Nombre del servicio o producto *</label>
        <input
          id="prod-nombre"
          name="nombre"
          type="text"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Landing Page Express"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="prod-categoria">Categoría *</label>
        <input
          id="prod-categoria"
          name="categoria"
          list="categorias-osky"
          type="text"
          value={form.categoria}
          onChange={handleChange}
          placeholder="Seleccioná o escribí una categoría"
          required
        />
        <datalist id="categorias-osky">
          {CATEGORIAS_SUGERIDAS.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="form-group">
          <label htmlFor="prod-precio">Precio ARS (sin puntos) *</label>
          <input
            id="prod-precio"
            name="precio"
            type="number"
            min="0"
            step="1"
            value={form.precio}
            onChange={handleChange}
            placeholder="Ej: 135000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prod-stock">Cupos / Stock disponible</label>
          <input
            id="prod-stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            placeholder="50"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="prod-imagen">Ruta o URL de imagen</label>
        <input
          id="prod-imagen"
          name="imagen"
          type="text"
          value={form.imagen}
          onChange={handleChange}
          placeholder="img/Landing Page Express.jpg"
        />

        {rutaPreview && (
          <div className="gestion-preview-box">
            {previewValida ? (
              <img
                src={rutaPreview}
                alt="Vista previa"
                onError={() => setPreviewValida(false)}
              />
            ) : (
              <span className="gestion-preview-error">
                ⚠️ No se encontró <code>{rutaPreview}</code> en <code>public/</code>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="prod-descripcion">Descripción breve</label>
        <textarea
          id="prod-descripcion"
          name="descripcion"
          rows="3"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Página rápida y efectiva para captar leads y presentar tu servicio..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="prod-caracteristicas">
          Características incluidas (separadas por coma)
        </label>
        <textarea
          id="prod-caracteristicas"
          name="caracteristicas"
          rows="3"
          value={form.caracteristicas}
          onChange={handleChange}
          placeholder="Diseño 100% a medida, Responsive (móvil y desktop), Integración WhatsApp, Formulario de contacto"
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
        <button type="submit" className="cta-button main-cta" disabled={guardando}>
          {guardando
            ? 'Guardando...'
            : modoEdicion
            ? 'Guardar cambios'
            : '+ Publicar servicio'}
        </button>

        {modoEdicion && onCancelarEdicion && (
          <button
            type="button"
            className="secondary-cta"
            onClick={onCancelarEdicion}
            disabled={guardando}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
import { useState } from 'react';

// Se conserva el endpoint existente del proyecto.
// Confirmá en Formspree que pertenece a tu cuenta y recibe consultas.
const FORM_ENDPOINT = 'https://formspree.io/f/xvgwzvnj';

export const ContactoPage = () => {
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState(null);

  const enviarConsulta = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const formulario = evento.currentTarget;
    setEnviando(true);
    setEstado(null);

    try {
      const respuesta = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(formulario),
        headers: {
          Accept: 'application/json',
        },
      });

      if (!respuesta.ok) {
        throw new Error(`No se pudo enviar la consulta (${respuesta.status}).`);
      }

      // Limpiar el formulario solo después de una respuesta exitosa.
      formulario.reset();
      setEstado({
        tipo: 'exito',
        mensaje: '¡Consulta enviada! Gracias por escribirnos. Te responderemos por el medio que nos indicaste.',
      });
    } catch (error) {
      console.error('Error al enviar el formulario de contacto:', error);
      setEstado({
        tipo: 'error',
        mensaje: 'No se pudo enviar la consulta. Revisá tu conexión e intentá nuevamente. Tus datos siguen en el formulario.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <section className="hero parallax">
        <div className="hero-content">
          <div className="hero-image-container">
            <img
              src="public\img\osky\fenix-osky.webp"
              alt="Logo de Osky Diseños"
              className="hero-main-image"
            />
          </div>
          <h1 className="typewriter">Hablemos de tu Proyecto</h1>
          <p className="subtitle fade-in delay-2">
            Diseño web y gráfico que convierte ideas en marcas reales
          </p>
          <p className="subtitle fade-in delay-3">
            ¡No dejes para mañana el diseño que podés tener hoy!
          </p>
        </div>
      </section>

      <section className="contact-section-page">
        <div className="contact-container">
          <h2>¡Empecemos tu proyecto hoy!</h2>

          <form
            action={FORM_ENDPOINT}
            method="POST"
            className="contact-form"
            onSubmit={enviarConsulta}
            aria-busy={enviando}
          >
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                autoComplete="name"
                maxLength={120}
                placeholder="Juan Pérez"
                disabled={enviando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="juan@ejemplo.com"
                disabled={enviando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                autoComplete="tel"
                maxLength={40}
                placeholder="+54 9 11 1234-5678"
                disabled={enviando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensaje">¿En qué puedo ayudarte?</label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                required
                minLength={10}
                maxLength={3000}
                placeholder="Quiero un sitio web para mi emprendimiento..."
                disabled={enviando}
              />
            </div>

            {estado && (
              <p
                role={estado.tipo === 'error' ? 'alert' : 'status'}
                aria-live={estado.tipo === 'error' ? 'assertive' : 'polite'}
                style={{
                  color: estado.tipo === 'error' ? '#FFB4B4' : '#CCFF00',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {estado.mensaje}
              </p>
            )}

            <button
              type="submit"
              className="cta-button main-cta"
              disabled={enviando}
              aria-disabled={enviando}
            >
              <i className="fas fa-paper-plane" aria-hidden="true" />
              {' '}{enviando ? 'Enviando consulta...' : 'Enviar consulta'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

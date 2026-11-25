import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiBookmark,
  FiCheckCircle,
  FiCreditCard,
  FiLoader,
  FiLock,
  FiMessageCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { GuardarSolicitud } from './GuardarSolicitud';

const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const esURLMercadoPago = (valor) => {
  try {
    const url = new URL(valor);
    return url.protocol === 'https:' && [
      'mercadopago.com', 'mercadopago.com.ar',
    ].some((dominio) => url.hostname === dominio || url.hostname.endsWith(`.${dominio}`));
  } catch {
    return false;
  }
};

const Seccion = styled.section`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
  margin-top: 24px;
  color: #f2f0f7;

  &, * { box-sizing: border-box; }

  .cf-etiqueta {
    margin: 0 0 2px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: #bba9d2;
  }

  .cf-pago, .cf-whatsapp {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 52px;
    padding: 12px 14px;
    margin: 0;
    border-radius: 11px;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 800;
    line-height: 1.35;
    text-align: center;
    white-space: normal;
    text-decoration: none;
    box-shadow: none;
    transform: none;
    aspect-ratio: auto;
    cursor: pointer;
  }

  .cf-pago {
    background: #ccff00;
    border: 1px solid #ccff00;
    color: #1e0b36;
  }
  .cf-pago:hover:not(:disabled) { background: #e0ff66; color: #1e0b36; }
  .cf-pago:disabled { cursor: not-allowed; opacity: 0.77; }

  .cf-whatsapp {
    background: rgba(138, 43, 226, 0.09);
    border: 1px solid #8450ba;
    color: #f2f0f7;
  }
  .cf-whatsapp:hover { background: rgba(138, 43, 226, 0.26); color: #fff; }

  .cf-guardar {
    margin: 0;
    border: 0;
    background: transparent;
    color: #cdbce0;
  }
  .cf-guardar summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    cursor: pointer;
    list-style: none;
    font-size: 0.80rem;
    text-align: center;
  }
  .cf-guardar summary::-webkit-details-marker { display: none; }
  .cf-guardar summary:hover { color: #ccff00; }
  .cf-guardar-contenido { margin-top: 4px; }
  .cf-guardar-contenido > div { margin: 0; }

  .cf-nota, .cf-error {
    margin: 0;
    text-align: center;
    font-size: 0.72rem;
    line-height: 1.55;
    color: #baa9d2;
  }
  .cf-error { color: #ffb4bd; }

  .cf-confirmacion {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border: 1px solid #8450ba;
    border-radius: 11px;
    background: rgba(138, 43, 226, 0.13);
  }
  .cf-confirmacion p { margin: 0; color: #e0d3ec; font-size: .82rem; }
  .cf-confirmacion strong { font-size: 1.35rem; color: #ccff00; }
  .cf-cancelar {
    border: 0;
    background: transparent;
    color: #d9c8ed;
    cursor: pointer;
    padding: 8px;
    font: inherit;
    font-size: 0.78rem;
    text-decoration: underline;
  }
  :is(a, button, summary):focus-visible { outline: 2px solid #ccff00; outline-offset: 3px; }
`;

/** Acciones separadas: nunca anidar GuardarSolicitud dentro del enlace de WhatsApp. */
export const CheckoutFinal = ({ cart = [], codigoCupon = '', whatsappHref, totalEstimado }) => {
  const { user } = useAuth();
  const pagoHabilitado = import.meta.env.VITE_MP_SHOW_BUTTON === 'true';
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(null);
  const [checkoutKey, setCheckoutKey] = useState(() => crypto.randomUUID());
  const [firmaIntento, setFirmaIntento] = useState('');

  const firma = JSON.stringify({
    items: cart.map((producto) => [String(producto.id), Number(producto.quantity)]),
    codigoCupon,
  });
  const pagoPreparado = pendiente?.firma === firma;

  const prepararPago = async () => {
    if (!pagoHabilitado || !user || procesando || cart.length === 0) return;
    setProcesando(true);
    setError('');
    setPendiente(null);
    try {
      const token = await user.getIdToken();
      // Un cambio de cantidades o cupón exige una nueva clave de checkout.
      const claveActual = firmaIntento === firma ? checkoutKey : crypto.randomUUID();
      if (firmaIntento !== firma) {
        setFirmaIntento(firma);
        setCheckoutKey(claveActual);
      }
      const respuesta = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checkoutKey: claveActual,
          items: cart.map((item) => ({
            id: String(item.id),
            quantity: Number(item.quantity),
          })),
          codigoCupon,
        }),
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo preparar el pago.');
      if (!esURLMercadoPago(datos.url) || !Number.isSafeInteger(datos.total) || datos.total <= 0) {
        throw new Error('El servidor devolvió datos de pago inválidos.');
      }
      setPendiente({ ...datos, firma });
    } catch (err) {
      setError(err.message || 'No fue posible preparar el pago.');
      setCheckoutKey(crypto.randomUUID());
    } finally {
      setProcesando(false);
    }
  };

  const cancelarPago = () => {
    setPendiente(null);
    setError('');
    setCheckoutKey(crypto.randomUUID());
  };

  return (
    <Seccion aria-label="Finalizar pedido">
      <p className="cf-etiqueta">Osky Diseños · Finalizar pedido</p>

      {!pagoHabilitado ? (
        <>
          <button className="cf-pago" type="button" disabled title="Pago online en configuración">
            <FiLock aria-hidden="true" /> Pagar con Mercado Pago
          </button>
          <p className="cf-nota">Pago online pendiente de activar y probar en el servidor.</p>
        </>
      ) : !user ? (
        <>
          <Link className="cf-pago" to="/login"><FiCreditCard aria-hidden="true" /> Pagar con Mercado Pago</Link>
          <p className="cf-nota">Iniciá sesión para pagar con seguridad.</p>
        </>
      ) : pagoPreparado ? (
        <div className="cf-confirmacion">
          <p>Importe calculado y validado por el servidor:</p>
          <strong>{moneda.format(pendiente.total)}</strong>
          <button className="cf-pago" type="button" onClick={() => window.location.assign(pendiente.url)}>
            <FiCheckCircle aria-hidden="true" /> Confirmar y continuar a Mercado Pago
          </button>
          <button className="cf-cancelar" type="button" onClick={cancelarPago}>Cancelar</button>
        </div>
      ) : (
        <button className="cf-pago" type="button" disabled={procesando || cart.length === 0} onClick={prepararPago}>
          {procesando ? <FiLoader aria-hidden="true" /> : <FiCreditCard aria-hidden="true" />}
          {procesando ? 'Comprobando importe…' : 'Pagar con Mercado Pago'}
        </button>
      )}

      {error && <p className="cf-error" role="alert">{error}</p>}

      <a className="cf-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
        <FiMessageCircle aria-hidden="true" /> Solicitar presupuesto por WhatsApp
      </a>

      <details className="cf-guardar">
        <summary><FiBookmark aria-hidden="true" /> Guardar presupuesto para después</summary>
        <div className="cf-guardar-contenido">
          <GuardarSolicitud cart={cart} codigoCupon={codigoCupon} totalEstimado={totalEstimado} />
        </div>
      </details>
    </Seccion>
  );
};

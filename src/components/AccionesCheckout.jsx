import styled from 'styled-components';
import {
  FiArrowUpRight,
  FiBookmark,
  FiCreditCard,
  FiMessageCircle,
  FiShield,
} from 'react-icons/fi';
import { BotonMercadoPago } from './BotonMercadoPago';
import { GuardarSolicitud } from './GuardarSolicitud';

const Seccion = styled.section`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 12px;
  margin-top: 22px;
  color: #f2f0f7;

  &, * { box-sizing: border-box; }

  .oa-titulo {
    margin: 0 0 2px;
    font-size: 0.92rem;
    line-height: 1.4;
    font-weight: 800;
    color: #f2f0f7;
  }

  /* El componente de MP conserva sus validaciones y el segundo clic
     de confirmación, pero su contenedor no duplica las tarjetas. */
  .oa-mp > div {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    border-radius: 0;
  }

  .oa-mp > div > button:not(.mp-cancelar) {
    width: 100%;
    min-width: 0;
    min-height: 54px;
    padding: 12px 16px;
    border-radius: 12px;
    background: #ccff00;
    border: 1px solid #ccff00;
    color: #1e0b36;
    font-size: 0.87rem;
    font-weight: 800;
    line-height: 1.3;
    white-space: normal;
  }
  .oa-mp > div > button:not(.mp-cancelar):hover:not(:disabled) {
    background: #dcff57;
  }
  .oa-mp > div > p:first-child { margin-bottom: 9px; }

  .oa-whatsapp {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 11px;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 59px;
    margin: 0;
    padding: 12px 14px;
    border: 1px solid rgba(191, 145, 243, 0.65);
    border-radius: 12px;
    background: rgba(138, 43, 226, 0.14);
    color: #f2f0f7;
    text-decoration: none;
    text-align: left;
    font: inherit;
    box-shadow: none;
    transform: none;
    transition: background 0.2s, border-color 0.2s;
  }
  .oa-whatsapp:hover {
    background: rgba(138, 43, 226, 0.3);
    border-color: #ccff00;
    color: #fff;
    box-shadow: none;
    transform: none;
  }
  .oa-whatsapp.oa-principal {
    background: #ccff00;
    border-color: #ccff00;
    color: #1e0b36;
  }
  .oa-whatsapp.oa-principal:hover { background: #dcff57; }
  .oa-whatsapp strong, .oa-whatsapp small { display: block; }
  .oa-whatsapp strong { font-size: 0.86rem; line-height: 1.35; }
  .oa-whatsapp small { font-size: 0.72rem; line-height: 1.4; opacity: 0.84; margin-top: 3px; }
  .oa-icono { flex: 0 0 21px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.12rem; }
  .oa-texto { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
  .oa-flecha { flex: 0 0 16px; }

  .oa-historial {
    min-width: 0;
    border: 1px solid rgba(191, 145, 243, 0.25);
    border-radius: 12px;
    background: rgba(23, 9, 38, 0.35);
    overflow: hidden;
  }
  .oa-historial summary {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 56px;
    padding: 12px 14px;
    color: #e4d8ee;
    cursor: pointer;
    user-select: none;
  }
  .oa-historial summary::-webkit-details-marker { display: none; }
  .oa-historial summary:hover { background: rgba(138, 43, 226, 0.12); }
  .oa-historial summary strong, .oa-historial summary small { display: block; }
  .oa-historial summary strong { font-size: 0.82rem; }
  .oa-historial summary small { font-size: 0.71rem; opacity: 0.8; margin-top: 2px; }
  .oa-historial summary .oa-flecha { transition: transform 0.2s; }
  .oa-historial[open] summary .oa-flecha { transform: rotate(90deg); }
  .oa-historial-contenido { padding: 0 12px 12px; }
  .oa-historial-contenido > div {
    margin: 0;
    border: 0;
    background: rgba(138, 43, 226, 0.08);
    padding: 12px;
  }
  .oa-historial-contenido button {
    width: 100%;
    min-height: 44px;
    white-space: normal;
  }
  .oa-aclaracion {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 4px 0 0;
    color: #bfb0ce;
    font-size: 0.71rem;
    line-height: 1.55;
  }
  .oa-aclaracion svg { flex-shrink: 0; margin-top: 2px; }
  .oa-no-disponible {
    border-left: 2px solid rgba(204, 255, 0, 0.5);
    margin: 0;
    padding: 7px 12px;
    font-size: 0.76rem;
    line-height: 1.5;
    color: #d0c5de;
  }
  :is(a, button, summary):focus-visible {
    outline: 2px solid #ccff00;
    outline-offset: 3px;
  }
`;

/**
 * Organiza tres caminos independientes, sin anidar botones ni componentes
 * dentro del enlace de WhatsApp. No cobra nada desde React.
 * Mercado Pago se muestra solo si el backend está habilitado explícitamente.
 */
export const AccionesCheckout = ({
  cart = [],
  whatsappHref,
  totalEstimado,
  codigoCupon = '',
}) => {
  const pagoVisible = import.meta.env.VITE_MP_SHOW_BUTTON === 'true';

  return (
    <Seccion aria-label="Opciones para finalizar el pedido">
      <p className="oa-titulo">¿Cómo querés continuar?</p>

      {pagoVisible ? (
        <div className="oa-mp">
          <BotonMercadoPago cart={cart} codigoCupon={codigoCupon} />
        </div>
      ) : (
        <p className="oa-no-disponible">
          <FiCreditCard aria-hidden="true" />{' '}
          El pago online estará disponible cuando terminemos de configurar
          Mercado Pago en el servidor.
        </p>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`oa-whatsapp ${pagoVisible ? '' : 'oa-principal'}`}
      >
        <span className="oa-icono"><FiMessageCircle aria-hidden="true" /></span>
        <span className="oa-texto">
          <strong>Solicitar presupuesto por WhatsApp</strong>
          <small>Sin pagar ahora · coordinamos los detalles</small>
        </span>
        <FiArrowUpRight className="oa-flecha" aria-hidden="true" />
      </a>

      <details className="oa-historial">
        <summary>
          <span className="oa-icono"><FiBookmark aria-hidden="true" /></span>
          <span className="oa-texto">
            <strong>Guardar para después</strong>
            <small>Ver este presupuesto en Mi Perfil</small>
          </span>
          <FiArrowUpRight className="oa-flecha" aria-hidden="true" />
        </summary>
        <div className="oa-historial-contenido">
          <GuardarSolicitud
            cart={cart}
            totalEstimado={totalEstimado}
            codigoCupon={codigoCupon}
          />
        </div>
      </details>

      <p className="oa-aclaracion">
        <FiShield aria-hidden="true" />
        Los pagos se completan en Mercado Pago. Enviar una consulta o guardar
        el presupuesto no genera ningún cobro.
      </p>
    </Seccion>
  );
};

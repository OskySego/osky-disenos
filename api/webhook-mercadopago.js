import { createHmac, timingSafeEqual } from 'node:crypto';
import { serviciosAdmin } from '../server/firebaseAdmin.js';

const pagoIdValido = /^\d{1,30}$/;

function verificarFirma(req, secreto) {
  const id = req.query?.['data.id'];
  const requestId = req.headers['x-request-id'];
  const header = req.headers['x-signature'];
  if (typeof id !== 'string' || !pagoIdValido.test(id)
    || typeof requestId !== 'string' || typeof header !== 'string') return null;

  const campos = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));
  const { ts, v1 } = campos;
  if (!/^\d{10,16}$/.test(ts || '') || !/^[a-f0-9]{64}$/i.test(v1 || '')) return null;
  const manifiesto = `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const esperado = createHmac('sha256', secreto).update(manifiesto).digest('hex');
  const a = Buffer.from(esperado, 'hex');
  const b = Buffer.from(v1, 'hex');
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  const secreto = process.env.MP_WEBHOOK_SECRET;
  const paymentId = secreto ? verificarFirma(req, secreto) : null;
  if (!paymentId) return res.status(401).end();
  const tipo = String(req.body?.type || req.query?.type || '').toLowerCase();
  if (tipo !== 'payment') return res.status(200).json({ ok: true, ignorado: true });

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    const sellerId = Number(process.env.MP_TEST_SELLER_ID);
    if (!token || !Number.isSafeInteger(sellerId) || sellerId <= 0 || process.env.MP_MODE !== 'test') {
      return res.status(503).end();
    }
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return res.status(502).end();
    const pago = await r.json();
    // No aceptar pagos de producción en la versión de pruebas.
    if (pago.live_mode !== false || Number(pago.collector_id) !== sellerId) {
      console.error('Webhook: pago no corresponde al vendedor de pruebas.');
      return res.status(403).end();
    }
    const id = String(pago.external_reference || '');
    if (!/^[0-9a-f]{40}$/i.test(id)) return res.status(200).json({ ok: true, ignorado: true });

    const { adminDb } = serviciosAdmin();
    const ref = adminDb.collection('solicitudes').doc(id);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const solicitud = snap.data();
      if (solicitud.tipo !== 'pago' || solicitud.moneda !== 'ARS'
        || pago.currency_id !== 'ARS' || Number(pago.transaction_amount) !== Number(solicitud.totalCalculado)
        || (solicitud.preferenciaId && pago.preference_id && String(pago.preference_id) !== String(solicitud.preferenciaId))) {
        throw new Error(`El pago ${paymentId} no coincide con el pedido ${id}`);
      }

      const estado = String(pago.status || 'pending');
      const reembolso = ['refunded', 'charged_back'].includes(estado);
      if ((solicitud.estadoPago === 'approved' && !reembolso)
        || (['refunded', 'charged_back'].includes(solicitud.estadoPago) && !reembolso)) return;

      const cambios = {
        estadoPago: estado,
        pagoId: String(pago.id),
        detalleEstadoPago: String(pago.status_detail || '').slice(0, 120),
        actualizadoEn: new Date(),
      };

      // Solo en la primera aprobación, y de forma atómica, descontar los cupos.
      // Si ya no hay cupos, guardar el pago como aprobado pero señalar que
      // necesita revisión manual (y, de corresponder, devolución).
      if (estado === 'approved' && !solicitud.stockDescontado) {
        const lineas = Array.isArray(solicitud.items) ? solicitud.items : [];
        const referencias = lineas.map((linea) => adminDb.collection('productos').doc(linea.productoId));
        const snapshots = await Promise.all(referencias.map((p) => tx.get(p)));
        const cambiosStock = [];
        let disponible = lineas.length > 0;
        for (let i = 0; i < lineas.length; i += 1) {
          const linea = lineas[i];
          const documento = snapshots[i];
          if (!documento.exists) { disponible = false; break; }
          const p = documento.data();
          const stock = p.stock == null || p.stock === '' ? null : Number(p.stock);
          const promocion = Number(linea.descuentoOfertaAplicado) > 0;
          const stockPromo = promocion ? Number(p.stockOferta) : null;
          if ((stock !== null && (!Number.isSafeInteger(stock) || stock < linea.cantidad))
            || (promocion && (!Number.isSafeInteger(stockPromo) || stockPromo < linea.cantidad))) {
            disponible = false;
            break;
          }
          cambiosStock.push({ ref: referencias[i],
            valores: {
              ...(stock === null ? {} : { stock: stock - linea.cantidad }),
              ...(promocion ? { stockOferta: stockPromo - linea.cantidad } : {}),
            },
          });
        }
        if (disponible) {
          cambiosStock.forEach((c) => tx.update(c.ref, c.valores));
          cambios.stockDescontado = true;
          cambios.estadoEntrega = 'pendiente_de_coordinacion';
        } else {
          cambios.estadoEntrega = 'requiere_revision_stock';
          cambios.requiereRevision = true;
        }
      }
      tx.update(ref, cambios);
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Fallo al verificar pago:', error.message);
    return res.status(500).end();
  }
}

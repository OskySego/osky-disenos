import { createHash } from 'node:crypto';
import { serviciosAdmin } from '../server/firebaseAdmin.js';
import { aplicarCuponPorUnidad, cotizarProducto } from '../server/precios.js';

const fallo = (mensaje, http) => Object.assign(new Error(mensaje), { http });
const ID_VALIDO = /^[A-Za-z0-9_-]{1,128}$/;
const CLAVE_VALIDA = /^[0-9a-f]{8}-[0-9a-f-]{27,45}$/i;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (process.env.MP_CHECKOUT_ENABLED !== 'true' || process.env.MP_MODE !== 'test') {
    return res.status(503).json({ error: 'Los pagos de prueba no están habilitados.' });
  }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || token.length > 4096) return res.status(401).json({ error: 'Iniciá sesión para pagar.' });

  try {
    const { adminAuth, adminDb } = serviciosAdmin();
    let usuario;
    try {
      usuario = await adminAuth.verifyIdToken(token, true);
    } catch {
      return res.status(401).json({ error: 'Tu sesión expiró. Iniciá sesión nuevamente.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 7000) {
      throw fallo('La solicitud no es válida.', 400);
    }
    const items = body.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > 25) {
      throw fallo('El carrito debe tener entre 1 y 25 servicios.', 400);
    }
    const clave = String(body.checkoutKey || '');
    if (!CLAVE_VALIDA.test(clave)) throw fallo('Identificador de checkout no válido.', 400);

    const ids = new Set();
    const lineas = [];
    for (const item of items) {
      const id = String(item?.id || '');
      const cantidad = Number(item?.quantity);
      if (!ID_VALIDO.test(id) || ids.has(id) || !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 100) {
        throw fallo('El carrito contiene cantidades o servicios inválidos.', 400);
      }
      ids.add(id);
      const snap = await adminDb.collection('productos').doc(id).get();
      if (!snap.exists) throw fallo('Uno de los servicios ya no está publicado.', 409);
      const producto = snap.data();
      const precio = cotizarProducto(producto, cantidad);
      lineas.push({
        productoId: id,
        nombre: String(producto.nombre || 'Servicio').slice(0, 120),
        cantidad,
        precioRegular: precio.regular,
        precioAntesCupon: precio.precioOferta,
        descuentoOfertaAplicado: precio.porcentaje,
      });
    }

    let codigoCupon = '';
    let porcentajeCupon = 0;
    if (body.codigoCupon !== undefined && typeof body.codigoCupon !== 'string') {
      throw fallo('El cupón no es válido.', 400);
    }
    if (String(body.codigoCupon || '').trim()) {
      codigoCupon = body.codigoCupon.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{1,40}$/.test(codigoCupon)) throw fallo('Código de cupón inválido.', 400);
      const q = await adminDb.collection('cupones')
        .where('codigo', '==', codigoCupon).where('activo', '==', true).limit(1).get();
      if (q.empty) throw fallo('El cupón no existe o dejó de estar activo.', 409);
      porcentajeCupon = Number(q.docs[0].data().descuento);
      if (!Number.isSafeInteger(porcentajeCupon) || porcentajeCupon < 1 || porcentajeCupon > 100) {
        throw fallo('El porcentaje del cupón no es válido.', 422);
      }
    }

    const lineasFinales = lineas.map((linea) => ({
      ...linea,
      precioUnitario: aplicarCuponPorUnidad(linea.precioAntesCupon, porcentajeCupon),
    }));
    const total = lineasFinales.reduce((a, item) => a + item.precioUnitario * item.cantidad, 0);
    if (!Number.isSafeInteger(total) || total <= 0) throw fallo('El importe no es cobrable.', 422);

    const sitio = new URL(process.env.PUBLIC_SITE_URL || '');
    if (sitio.protocol !== 'https:') throw fallo('PUBLIC_SITE_URL debe ser HTTPS.', 503);
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const vendedorDePrueba = Number(process.env.MP_TEST_SELLER_ID);
    if (!accessToken || !Number.isSafeInteger(vendedorDePrueba) || vendedorDePrueba <= 0) {
      throw fallo('Faltan las credenciales de prueba del vendedor.', 503);
    }

    // Un identificador estable para evitar dos preferencias por doble clic.
    // Un mismo checkoutKey nunca vuelve a crear una preferencia nueva.
    const documentoId = createHash('sha256').update(`${usuario.uid}:${clave}`).digest('hex').slice(0, 40);
    const ref = adminDb.collection('solicitudes').doc(documentoId);
    const firmaCarrito = createHash('sha256').update(JSON.stringify({ items, codigoCupon })).digest('hex');
    try {
      await ref.create({
        uid: usuario.uid,
        tipo: 'pago',
        estadoGestion: 'iniciada',
        estadoPago: 'checkout_creando',
        estadoEntrega: 'sin_confirmar',
        stockDescontado: false,
        items: lineasFinales,
        totalCalculado: total,
        moneda: 'ARS',
        codigoCupon,
        porcentajeCupon,
        firmaCarrito,
        creadoEn: new Date(),
      });
    } catch (error) {
      if (error.code !== 6 && error.code !== 'already-exists') throw error;
      const previa = await ref.get();
      const datos = previa.data();
      if (datos?.uid !== usuario.uid || datos?.firmaCarrito !== firmaCarrito) {
        throw fallo('Esta solicitud de pago ya se utilizó. Actualizá el carrito.', 409);
      }
      if (datos.checkoutUrl && datos.preferenciaId) {
        return res.status(200).json({ url: datos.checkoutUrl, solicitudId: ref.id, total: datos.totalCalculado });
      }
      throw fallo('Ya se está preparando este pago. Probá nuevamente en unos segundos.', 409);
    }

    const volver = (resultado) => {
      const url = new URL('/resultado-pago', sitio.origin);
      url.searchParams.set('solicitud', ref.id);
      url.searchParams.set('resultado', resultado); // Solo informativo.
      return url.toString();
    };
    const preferencia = {
      items: lineasFinales.map((item) => ({
        id: item.productoId,
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precioUnitario,
        currency_id: 'ARS',
      })),
      external_reference: ref.id,
      back_urls: { success: volver('success'), pending: volver('pending'), failure: volver('failure') },
      auto_return: 'approved',
      notification_url: new URL('/api/webhook-mercadopago', sitio.origin).toString(),
    };

    try {
      const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencia),
        signal: AbortSignal.timeout(15000),
      });
      const mp = await r.json();
      if (!r.ok || !mp.id || !mp.init_point) {
        console.error('Error al crear preferencia en MP:', r.status, mp.message);
        throw fallo('Mercado Pago no pudo preparar el pago.', 502);
      }
      if (Number(mp.collector_id) !== vendedorDePrueba) {
        // Nunca exponer la URL si las credenciales no pertenecen al vendedor esperado.
        throw fallo('El vendedor no coincide con la cuenta de prueba configurada.', 503);
      }
      await adminDb.runTransaction(async (tx) => {
        const actual = (await tx.get(ref)).data();
        tx.update(ref, {
          preferenciaId: String(mp.id),
          checkoutUrl: String(mp.init_point),
          ...(actual?.estadoPago === 'checkout_creando' ? { estadoPago: 'checkout_iniciado' } : {}),
        });
      });
      return res.status(200).json({ url: mp.init_point, solicitudId: ref.id, total });
    } catch (error) {
      await adminDb.runTransaction(async (tx) => {
        const actual = (await tx.get(ref)).data();
        if (actual?.estadoPago === 'checkout_creando') {
          tx.update(ref, { estadoPago: 'checkout_error', actualizadoEn: new Date() });
        }
      }).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Error al crear checkout:', error.message);
    return res.status(Number(error.http) || 500).json({
      error: error.http ? error.message : 'No se pudo preparar el pago. Revisá la configuración del servidor.',
    });
  }
}

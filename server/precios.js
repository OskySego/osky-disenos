// Funciones puras compartidas por los endpoints del servidor. No importar en React.
export function enteroNoNegativo(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= 0 ? numero : null;
}

export function cotizarProducto(producto, cantidad) {
  const regular = Number(producto.precio);
  if (!Number.isSafeInteger(regular) || regular <= 0) {
    throw Object.assign(new Error('El producto no tiene un precio válido.'), { http: 422 });
  }
  if (!Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 100) {
    throw Object.assign(new Error('La cantidad solicitada no es válida.'), { http: 400 });
  }
  const stockGeneral = enteroNoNegativo(producto.stock);
  if (producto.stock != null && producto.stock !== '' && stockGeneral === null) {
    throw Object.assign(new Error('El stock general no es válido.'), { http: 409 });
  }
  if (stockGeneral !== null && cantidad > stockGeneral) {
    throw Object.assign(new Error('No hay suficientes cupos generales para este servicio.'), { http: 409 });
  }

  const d = Number(producto.descuentoOferta);
  const stockPromo = enteroNoNegativo(producto.stockOferta);
  const porcentaje = producto.ofertaActiva === true
    && Number.isSafeInteger(d) && d >= 1 && d <= 90
    && stockPromo !== null && stockPromo > 0 ? d : 0;

  // Nunca cobrar a precio normal un carrito que supera los cupos de una
  // promoción activa. El cliente debe corregir las cantidades.
  if (porcentaje && cantidad > stockPromo) {
    throw Object.assign(new Error('Los cupos promocionales disponibles no alcanzan para esta cantidad.'), { http: 409 });
  }
  const precioOferta = porcentaje
    ? Math.max(1, Math.round(regular * (100 - porcentaje) / 100))
    : regular;
  return { regular, precioOferta, porcentaje, stockPromo };
}

export function aplicarCuponPorUnidad(precio, porcentaje) {
  const valor = Math.round(precio * (100 - porcentaje) / 100);
  if (!Number.isSafeInteger(valor) || valor < 1) {
    throw Object.assign(new Error('El descuento deja un importe no cobrable. Solicitá un presupuesto.'), { http: 422 });
  }
  return valor;
}

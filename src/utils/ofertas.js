// Regla de visualización única para catálogo, detalle y portada.
// En cobros reales, el backend debe consultar Firestore y recalcular todo.
const enteroNoNegativo = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= 0 ? numero : null;
};

export const stockOfertaDisponible = (producto) => {
  const cupos = enteroNoNegativo(producto?.stockOferta);
  // Las ofertas anteriores sin stockOferta deben configurarse en el panel.
  if (cupos === null) return 0;
  const stockTotal = enteroNoNegativo(producto?.stock);
  return stockTotal === null ? cupos : Math.min(cupos, stockTotal);
};

export const descuentoDeOferta = (producto) => {
  const porcentaje = Number(producto?.descuentoOferta);
  return producto?.ofertaActiva === true
    && Number.isSafeInteger(porcentaje)
    && porcentaje >= 1 && porcentaje <= 90
    && stockOfertaDisponible(producto) > 0
    ? porcentaje
    : 0;
};

export const precioVigente = (producto) => {
  const precio = Number(producto?.precio);
  if (!Number.isSafeInteger(precio) || precio <= 0) return null;
  const descuento = descuentoDeOferta(producto);
  return descuento ? Math.max(1, Math.round(precio * (100 - descuento) / 100)) : precio;
};

export const itemParaCarrito = (producto) => {
  const descuento = descuentoDeOferta(producto);
  return {
    ...producto,
    precioOriginal: Number(producto.precio),
    precio: precioVigente(producto),
    porcentajeOfertaAplicada: descuento,
    // La cantidad agregable con descuento no puede superar los cupos de oferta.
    ...(descuento > 0 ? { stock: stockOfertaDisponible(producto) } : {}),
  };
};

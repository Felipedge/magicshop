export function formatoCLP(numero) {
  return Number(numero || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
}

/** Precio final aplicando el % de oferta del producto (redondeado a peso) */
export function precioFinal(producto) {
  const descuento = Number(producto.oferta) || 0;
  return Math.round(producto.precio * (1 - descuento / 100));
}

import { ordenesApi, productosApi } from './recursos';
import { snapshot } from './catalogo';
import { STOCK_INICIAL } from './mtg';

function numeroOrden() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${fecha}${String(Date.now()).slice(-4)}`;
}

/**
 * Simula el pago de una compra contra json-server.
 * 1. Consulta el stock de cada carta en el inventario (GET /productos/:id; si no está, parte con STOCK_INICIAL).
 * 2. Registra la orden pagada o rechazada (POST /ordenes).
 * 3. Si el pago es exitoso descuenta el stock (PATCH /productos/:id, o POST si la carta aún no estaba en el inventario).
 * Se rechaza si se pide simularlo, si el carrito está vacío o si falta stock.
 */
export async function procesarPago({ items, cliente, despacho, usuarioId = null, simularRechazo = false }) {
  const inventario = await Promise.all(items.map((i) => productosApi.obtener(i.id)));
  const stockDe = (indice) => (inventario[indice] ? inventario[indice].stock : STOCK_INICIAL);
  const sinStock = items.filter((i, indice) => inventario[indice]?.eliminado || stockDe(indice) < i.cantidad);

  let motivo = '';
  if (!items.length) motivo = 'El carrito está vacío.';
  else if (sinStock.length) motivo = `Stock insuficiente para: ${sinStock.map((i) => i.nombre).join(', ')}.`;
  else if (simularRechazo) motivo = 'El medio de pago fue rechazado por el banco.';

  const estado = motivo ? 'rechazada' : 'pagada';

  const orden = await ordenesApi.crear({
    numero: numeroOrden(),
    fecha: new Date().toISOString(),
    usuarioId,
    cliente,
    despacho,
    items: items.map(({ id, nombre, imagen, categoria, precioUnitario, cantidad, subtotal }) => ({ id, nombre, imagen, categoria, precioUnitario, cantidad, subtotal })),
    total: items.reduce((suma, i) => suma + i.subtotal, 0),
    estado,
    motivo,
  });

  if (estado === 'pagada') {
    await Promise.all(
      items.map((i, indice) => {
        const stock = stockDe(indice) - i.cantidad;
        return inventario[indice] ? productosApi.actualizar(i.id, { stock }) : productosApi.crear({ ...snapshot(i), stock });
      }),
    );
  }

  return orden;
}

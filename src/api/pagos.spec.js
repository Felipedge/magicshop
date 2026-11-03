import { procesarPago } from './pagos';
import { obtenerCarta, STOCK_INICIAL } from './mtg';
import { datosApi } from '../test/apiFalsa';

describe('procesarPago', () => {
  const cliente = { nombre: 'Ana', apellidos: 'Rojas', email: 'ana@test.cl' };
  const despacho = { calle: 'Calle 1', region: 'Región de Valparaíso', comuna: 'Valparaíso' };
  const inventario = () => datosApi().productos;

  function item(producto, cantidad) {
    return { ...producto, cantidad, precioUnitario: producto.precio, subtotal: producto.precio * cantidad };
  }

  it('pago exitoso: crea la orden pagada (POST /ordenes) y descuenta stock (PATCH)', async () => {
    const producto = inventario()[0];
    const stockAntes = producto.stock;
    const orden = await procesarPago({ items: [item(producto, 2)], cliente, despacho, usuarioId: 2 });

    expect(orden.estado).toBe('pagada');
    expect(orden.total).toBe(producto.precio * 2);
    expect(orden.usuarioId).toBe(2);
    expect(orden.items[0].categoria).toBe(producto.categoria);
    expect(datosApi().ordenes.length).toBe(1);
    expect(inventario()[0].stock).toBe(stockAntes - 2);
  });

  it('una carta que no estaba en el inventario se agrega con el stock inicial descontado (POST)', async () => {
    const carta = await obtenerCarta('carta-extra-1');
    await procesarPago({ items: [item(carta, 3)], cliente, despacho });
    const guardada = inventario().find((p) => p.id === 'carta-extra-1');
    expect(guardada).toEqual(jasmine.objectContaining({ nombre: 'Dragón de Prueba', stock: STOCK_INICIAL - 3, eliminado: false }));
  });

  it('pago rechazado (simulado): guarda la orden rechazada y NO toca el stock', async () => {
    const producto = inventario()[0];
    const stockAntes = producto.stock;
    const orden = await procesarPago({ items: [item(producto, 1)], cliente, despacho, simularRechazo: true });

    expect(orden.estado).toBe('rechazada');
    expect(orden.motivo).toContain('rechazado');
    expect(inventario()[0].stock).toBe(stockAntes);
  });

  it('rechaza el pago si el stock en el servidor ya no alcanza o la carta fue quitada', async () => {
    const pedido = item(inventario()[0], 3);
    inventario()[0].stock = 1; // otro cliente compró mientras tanto
    expect((await procesarPago({ items: [pedido], cliente, despacho })).motivo).toContain('Stock insuficiente');

    inventario()[0].stock = 50;
    inventario()[0].eliminado = true;
    expect((await procesarPago({ items: [pedido], cliente, despacho })).estado).toBe('rechazada');
  });

  it('rechaza un carrito vacío', async () => {
    expect((await procesarPago({ items: [], cliente, despacho })).motivo).toContain('vacío');
  });
});

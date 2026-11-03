import { combinar, guardarEnInventario, snapshot } from './catalogo';
import { obtenerCarta } from './mtg';
import { datosApi } from '../test/apiFalsa';

describe('catálogo (API de Magic + inventario de json-server)', () => {
  it('combinar aplica precio, stock y oferta del inventario sobre la carta', () => {
    const carta = { id: 'x', nombre: 'Carta', precio: 1000, stock: 10, oferta: 0 };
    expect(combinar(carta, null)).toBe(carta);
    expect(combinar(carta, { id: 'x', precio: 2000, stock: 1, oferta: 15, nombre: 'otro' })).toEqual({ id: 'x', nombre: 'Carta', precio: 2000, stock: 1, oferta: 15 });
  });

  it('snapshot guarda solo los datos necesarios para listar sin consultar la API de Magic', () => {
    const datos = snapshot({ id: 'x', nombre: 'Carta', texto: 'largo...', tiposApi: ['Land'], precio: 1, stock: 2, oferta: 0 });
    expect(datos.texto).toBeUndefined();
    expect(datos.tiposApi).toBeUndefined();
    expect(datos.eliminado).toBeFalse();
  });

  it('guardarEnInventario crea la carta (POST) si no estaba en el inventario', async () => {
    const carta = await obtenerCarta('carta-extra-1');
    await guardarEnInventario(carta, { precio: 9990, stock: 3 });
    expect(window.fetch.calls.mostRecent().args[1].method).toBe('POST');
    expect(datosApi().productos.find((p) => p.id === 'carta-extra-1')).toEqual(jasmine.objectContaining({ nombre: 'Dragón de Prueba', precio: 9990, stock: 3 }));
  });

  it('guardarEnInventario actualiza (PATCH) si la carta ya estaba', async () => {
    const existente = datosApi().productos[0];
    await guardarEnInventario(existente, { stock: 50 });
    expect(window.fetch.calls.mostRecent().args[1].method).toBe('PATCH');
    expect(datosApi().productos[0].stock).toBe(50);
  });
});

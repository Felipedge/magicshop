import { crearRecurso, EVENTO_CAMBIO } from './cliente';
import { productosApi } from './recursos';
import { datosApi } from '../test/apiFalsa';

describe('cliente de la API (json-server)', () => {
  it('listar hace GET /api/<recurso> con los filtros como query string', async () => {
    const lista = await productosApi.listar({ categoria: 'tierras', stock_lte: 99, vacio: '' });
    const url = window.fetch.calls.mostRecent().args[0];
    expect(url).toBe('/api/productos?categoria=tierras&stock_lte=99');
    expect(lista.every((p) => p.categoria === 'tierras')).toBeTrue();
  });

  it('obtener devuelve el registro, o null si la API responde 404', async () => {
    const id = datosApi().productos[0].id;
    expect((await productosApi.obtener(id)).id).toBe(id);
    expect(await productosApi.obtener('no-existe')).toBeNull();
  });

  it('crear (POST), actualizar (PATCH) y eliminar (DELETE) modifican los datos', async () => {
    const creado = await productosApi.crear({ nombre: 'Nueva', stock: 1 });
    expect(window.fetch.calls.mostRecent().args[1].method).toBe('POST');
    expect(datosApi().productos.some((p) => p.id === creado.id)).toBeTrue();

    await productosApi.actualizar(creado.id, { stock: 7 });
    expect(window.fetch.calls.mostRecent().args[1].method).toBe('PATCH');
    expect(datosApi().productos.find((p) => p.id === creado.id).stock).toBe(7);

    await productosApi.eliminar(creado.id);
    expect(window.fetch.calls.mostRecent().args[1].method).toBe('DELETE');
    expect(datosApi().productos.some((p) => p.id === creado.id)).toBeFalse();
  });

  it('las escrituras emiten el evento de cambio para refrescar la interfaz', async () => {
    const escuchar = jasmine.createSpy('escuchar');
    window.addEventListener(EVENTO_CAMBIO, escuchar);
    await productosApi.actualizar(datosApi().productos[0].id, { stock: 3 });
    window.removeEventListener(EVENTO_CAMBIO, escuchar);
    expect(escuchar).toHaveBeenCalledTimes(1);
    expect(escuchar.calls.mostRecent().args[0].detail).toBe('productos');
  });

  it('informa un error claro si la API no está disponible (mock de fetch que falla)', async () => {
    window.fetch.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    await expectAsync(productosApi.listar()).toBeRejectedWithError(/json-server/);
  });

  it('informa el código de estado si la API responde con error', async () => {
    window.fetch.and.returnValue(Promise.resolve(new Response('{}', { status: 500 })));
    await expectAsync(crearRecurso('productos').listar()).toBeRejectedWithError(/500/);
  });
});

import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { productosApi } from '../api/recursos';
import { obtenerCarta, STOCK_INICIAL } from '../api/mtg';
import { esperar, productoApi } from '../test/utils';
import { precioFinal } from '../utils/formato';

/** Monta el carrito y espera a que llegue el inventario desde la API. */
async function montar() {
  const hook = renderHook(() => useCart(), { wrapper: CartProvider });
  await esperar(() => !hook.result.current.cargando, 'El carrito no terminó de cargar');
  return hook;
}

describe('CartContext (estado del carrito)', () => {
  it('agrega productos, acumula cantidades y calcula el total con ofertas', async () => {
    Object.assign(productoApi(1), { precio: 1000, oferta: 10, stock: 5 });
    const { result } = await montar();

    act(() => result.current.agregar(productoApi(1)));
    act(() => result.current.agregar(productoApi(1)));

    expect(result.current.cantidadTotal).toBe(2);
    expect(result.current.items[0].precioUnitario).toBe(900);
    expect(result.current.total).toBe(1800);
  });

  it('una carta de la API que no está en el inventario usa su precio y stock por defecto', async () => {
    const carta = await obtenerCarta('carta-extra-1');
    const { result } = await montar();
    act(() => result.current.agregar(carta, 99));
    expect(result.current.items[0].cantidad).toBe(STOCK_INICIAL);
    expect(result.current.total).toBe(carta.precio * STOCK_INICIAL);
  });

  it('no permite superar el stock disponible', async () => {
    productoApi(1).stock = 2;
    const { result } = await montar();
    let respuesta;
    act(() => result.current.agregar(productoApi(1), 2));
    act(() => {
      respuesta = result.current.agregar(productoApi(1));
    });
    expect(respuesta).toBeFalse();
    expect(result.current.items[0].cantidad).toBe(2);
  });

  it('no agrega productos sin stock ni quitados de la tienda', async () => {
    productoApi(1).stock = 0;
    productoApi(2).eliminado = true;
    const { result } = await montar();
    act(() => {
      expect(result.current.agregar(productoApi(1))).toBeFalse();
      expect(result.current.agregar(productoApi(2))).toBeFalse();
    });
    expect(result.current.items.length).toBe(0);
  });

  it('cambiarCantidad a 0 elimina el ítem; quitar y vaciar limpian el carrito', async () => {
    const { result } = await montar();
    const [a, b, c] = [productoApi(1), productoApi(2), productoApi(3)];
    act(() => result.current.agregar(a));
    act(() => result.current.agregar(b));
    act(() => result.current.cambiarCantidad(a.id, 0));
    expect(result.current.items.map((i) => i.id)).toEqual([b.id]);

    act(() => result.current.quitar(b.id));
    expect(result.current.items.length).toBe(0);

    act(() => result.current.agregar(c));
    act(() => result.current.vaciar());
    expect(result.current.total).toBe(0);
  });

  it('persiste el carrito (con los datos de la carta) y lo recupera al volver a montar', async () => {
    const primero = await montar();
    act(() => primero.result.current.agregar(productoApi(1), 3));
    const guardado = JSON.parse(localStorage.getItem('magicshop_carrito'));
    expect(guardado[0]).toEqual(jasmine.objectContaining({ id: productoApi(1).id, cantidad: 3 }));
    expect(guardado[0].producto.nombre).toBe(productoApi(1).nombre);
    primero.unmount();

    const { result } = await montar();
    expect(result.current.items[0].cantidad).toBe(3);
    expect(result.current.total).toBe(precioFinal(productoApi(1)) * 3);
  });

  it('se actualiza cuando el admin cambia el precio en la API', async () => {
    const { result } = await montar();
    act(() => result.current.agregar(productoApi(1)));
    await act(() => productosApi.actualizar(productoApi(1).id, { precio: 5000, oferta: 0 }));
    await esperar(() => result.current.total === 5000, 'El total no se actualizó');
    expect(result.current.total).toBe(5000);
  });

  it('expone el error si la API no responde', async () => {
    window.fetch.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    const hook = renderHook(() => useCart(), { wrapper: CartProvider });
    await esperar(() => hook.result.current.error);
    expect(hook.result.current.error).toContain('json-server');
  });

  it('useCart fuera del proveedor lanza un error descriptivo', () => {
    spyOn(console, 'error'); // React registra el error; lo silenciamos
    expect(() => renderHook(() => useCart())).toThrowError(/CartProvider/);
  });
});

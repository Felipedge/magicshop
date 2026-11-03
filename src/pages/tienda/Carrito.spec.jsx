import { fireEvent, screen } from '@testing-library/react';
import Carrito from './Carrito';
import { esperarCarga, precargarCarrito, productoApi, renderConProveedores, rutaActual } from '../../test/utils';
import { formatoCLP } from '../../utils/formato';

describe('Carrito (página)', () => {
  it('con el carrito vacío muestra el mensaje y el acceso al catálogo', async () => {
    renderConProveedores(<Carrito />, { ruta: '/carrito' });
    expect(await screen.findByText('Tu carrito está vacío.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Comprar ahora' })).toBeNull();
  });

  it('muestra solo los productos del carrito, sin la lista del catálogo', async () => {
    precargarCarrito([{ n: 1, cantidad: 1 }, { n: 2, cantidad: 2 }]);
    renderConProveedores(<Carrito />, { ruta: '/carrito' });
    await esperarCarga();
    expect(screen.getAllByRole('row').length).toBe(3); // encabezado + 2 productos
    expect(screen.queryAllByRole('article').length).toBe(0);
    expect(screen.queryByRole('button', { name: 'Añadir' })).toBeNull();
  });

  it('suma unidades con "+" y recalcula el total', async () => {
    Object.assign(productoApi(1), { precio: 1000, oferta: 0, stock: 10 });
    precargarCarrito([{ n: 1, cantidad: 1 }]);
    renderConProveedores(<Carrito />, { ruta: '/carrito' });

    fireEvent.click(await screen.findByRole('button', { name: '+' }));
    expect(screen.getByTestId(`cantidad-${productoApi(1).id}`).textContent).toBe('2');
    expect(screen.getByTestId('total-carrito').textContent).toBe(formatoCLP(2000));
  });

  it('Comprar ahora navega al checkout', async () => {
    precargarCarrito([{ n: 1, cantidad: 1 }]);
    renderConProveedores(<Carrito />, { ruta: '/carrito' });
    fireEvent.click(await screen.findByRole('button', { name: 'Comprar ahora' }));
    expect(rutaActual()).toBe('/checkout');
  });

  it('Limpiar vacía el carrito', async () => {
    precargarCarrito([{ n: 1, cantidad: 1 }]);
    renderConProveedores(<Carrito />, { ruta: '/carrito' });
    fireEvent.click(await screen.findByRole('button', { name: 'Limpiar' }));
    expect(screen.getByText('Tu carrito está vacío.')).toBeTruthy();
  });
});

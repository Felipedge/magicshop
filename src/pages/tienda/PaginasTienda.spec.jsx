import { fireEvent, screen } from '@testing-library/react';
import Categorias from './Categorias';
import Ofertas from './Ofertas';
import Nosotros from './Nosotros';
import Contacto from './Contacto';
import ProductoDetalle from './ProductoDetalle';
import { PagoExitoso } from './ResultadoPago';
import { productosApi } from '../../api/recursos';
import { fetchFalso } from '../../test/apiFalsa';
import { datosApi, esperar, esperarCarga, productoApi, renderConProveedores, rutaActual } from '../../test/utils';

const urlsMtg = () => window.fetch.calls.allArgs().map((a) => a[0]).filter((u) => u.startsWith('https://api.magicthegathering.io'));

describe('Páginas de la tienda', () => {
  it('Categorías: sin selección muestra las 6 categorías y no consulta la API de Magic', async () => {
    renderConProveedores(<Categorias />, { ruta: '/categorias' });
    await esperarCarga();
    expect(screen.getAllByRole('heading', { level: 6 }).length).toBe(6);
    expect(screen.getByText('Selecciona una categoría para ver sus cartas.')).toBeTruthy();
    expect(urlsMtg().length).toBe(0);
  });

  it('Categorías: con slug pide a la API de Magic las cartas de ese tipo', async () => {
    renderConProveedores(<Categorias />, { ruta: '/categorias/tierras', patron: '/categorias/:slug' });
    await esperarCarga();
    expect(screen.getByRole('heading', { name: 'Tierras', level: 1 })).toBeTruthy();
    expect(new URL(urlsMtg()[0]).searchParams.get('types')).toBe('Land');
    datosApi()
      .productos.filter((p) => p.categoria === 'tierras')
      .forEach((p) => expect(screen.getByRole('heading', { name: p.nombre })).toBeTruthy());
  });

  it('Categorías: pagina las cartas de la categoría', async () => {
    renderConProveedores(<Categorias />, { ruta: '/categorias/criaturas', patron: '/categorias/:slug' });
    await esperarCarga();
    expect(screen.getByTestId('pagina-actual').textContent).toBe('Página 1 de 2'); // 13 criaturas / 12 por página
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await esperar(() => rutaActual() === '/categorias/criaturas?pagina=2');
  });

  it('Categorías: slug inexistente muestra un aviso', async () => {
    renderConProveedores(<Categorias />, { ruta: '/categorias/xyz', patron: '/categorias/:slug' });
    expect(await screen.findByText('La categoría no existe.')).toBeTruthy();
  });

  it('Ofertas: pide al inventario los productos con descuento, de mayor a menor', async () => {
    renderConProveedores(<Ofertas />, { ruta: '/ofertas' });
    await esperarCarga();
    const urls = window.fetch.calls.allArgs().map((args) => args[0]);
    expect(urls).toContain('/api/productos?oferta_gte=1&eliminado_ne=true&_sort=oferta&_order=desc');

    const enOferta = datosApi().productos.filter((p) => p.oferta > 0);
    expect(screen.getAllByRole('article').length).toBe(enOferta.length);
    const badges = screen.getAllByText(/^-\d+%$/).map((b) => parseInt(b.textContent.slice(1), 10));
    expect(badges).toEqual([...badges].sort((a, b) => b - a));
  });

  it('Ofertas: sin productos en oferta muestra el mensaje vacío (mock de la API)', async () => {
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve([]));
    renderConProveedores(<Ofertas />, { ruta: '/ofertas' });
    expect(await screen.findByText('No hay ofertas vigentes en este momento.')).toBeTruthy();
  });

  it('Nosotros se renderiza con su descripción e imagen', () => {
    renderConProveedores(<Nosotros />);
    expect(screen.getByRole('heading', { name: 'Nosotros' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Mesa de juego de Magic' })).toBeTruthy();
  });

  it('Contacto: valida y muestra confirmación al enviar correctamente', () => {
    renderConProveedores(<Contacto />, { ruta: '/contacto' });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Nombre completo/), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/^Correo/), { target: { value: 'ana@test.cl' } });
    fireEvent.change(screen.getByLabelText(/^Mensaje/), { target: { value: '¿Tienen stock de Serra Angel?' } });
    expect(screen.getByText('29/500')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(screen.getByRole('alert').textContent).toContain('Gracias');
  });

  it('Detalle: combina la carta de la API de Magic con el stock del inventario y agrega al carrito', async () => {
    const producto = productoApi(1);
    producto.stock = 3;
    renderConProveedores(<ProductoDetalle />, { ruta: `/productos/${producto.id}`, patron: '/productos/:id' });
    const cantidad = await screen.findByLabelText('Cantidad');
    expect(screen.getByText(`Texto de ${producto.nombre}.`)).toBeTruthy(); // texto viene de la API de Magic
    expect(screen.getByText('Stock disponible: 3')).toBeTruthy(); // stock viene de json-server
    expect(await screen.findByRole('heading', { name: 'Productos relacionados' })).toBeTruthy();

    fireEvent.change(cantidad, { target: { value: '10' } });
    expect(cantidad.value).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }));
    expect(JSON.parse(localStorage.getItem('magicshop_carrito'))[0]).toEqual(jasmine.objectContaining({ id: producto.id, cantidad: 3 }));
  });

  it('Detalle: una carta que no está en el inventario usa el stock inicial', async () => {
    renderConProveedores(<ProductoDetalle />, { ruta: '/productos/carta-extra-2', patron: '/productos/:id' });
    expect(await screen.findByRole('heading', { name: 'Dragón Anciano' })).toBeTruthy();
    expect(screen.getByText('Stock disponible: 10')).toBeTruthy();
  });

  it('Detalle: si la API de Magic falla usa los datos guardados en el inventario', async () => {
    // Mock: la API de Magic no responde, json-server sí.
    window.fetch.and.callFake((url, opciones) =>
      url.startsWith('https://api.magicthegathering.io') ? Promise.reject(new TypeError('Failed to fetch')) : fetchFalso(url, opciones),
    );
    renderConProveedores(<ProductoDetalle />, { ruta: `/productos/${productoApi(2).id}`, patron: '/productos/:id' });
    expect(await screen.findByRole('heading', { name: productoApi(2).nombre })).toBeTruthy();
  });

  it('Detalle: una carta quitada de la tienda o inexistente muestra un aviso', async () => {
    productoApi(1).eliminado = true;
    const { unmount } = renderConProveedores(<ProductoDetalle />, { ruta: `/productos/${productoApi(1).id}`, patron: '/productos/:id' });
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeTruthy();
    unmount();

    renderConProveedores(<ProductoDetalle />, { ruta: '/productos/no-existe', patron: '/productos/:id' });
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeTruthy();
  });

  it('Pago exitoso con orden inexistente muestra un aviso', async () => {
    renderConProveedores(<PagoExitoso />, { ruta: '/compra/exito/5', patron: '/compra/exito/:id' });
    expect(await screen.findByText('No encontramos esa orden.')).toBeTruthy();
  });
});

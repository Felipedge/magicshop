import { fireEvent, screen } from '@testing-library/react';
import Productos, { filtrarProductos } from './Productos';
import { esperar, esperarCarga, productoFalso, renderConProveedores, rutaActual } from '../../test/utils';

const PAGINA = [
  productoFalso({ id: 'a', nombre: 'Dragón Rojo', precio: 3000 }),
  productoFalso({ id: 'b', nombre: 'Rayo', precio: 500 }),
  productoFalso({ id: 'c', nombre: 'Ángel', precio: 2000, oferta: 50, stock: 0 }),
];

const urlsMtg = () =>
  window.fetch.calls
    .allArgs()
    .map((a) => a[0])
    .filter((u) => u.startsWith('https://api.magicthegathering.io'))
    .map((u) => Object.fromEntries(new URL(u).searchParams));

describe('Productos: filtrarProductos (lógica pura sobre la página actual)', () => {
  it('filtra por stock', () => {
    expect(filtrarProductos(PAGINA, { soloStock: true }).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('ordena por precio final (considerando ofertas) y por nombre', () => {
    expect(filtrarProductos(PAGINA, { orden: 'precio-asc' }).map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(filtrarProductos(PAGINA, { orden: 'precio-desc' }).map((p) => p.id)).toEqual(['a', 'c', 'b']);
    expect(filtrarProductos(PAGINA, { orden: 'nombre' }).map((p) => p.nombre)).toEqual(['Ángel', 'Dragón Rojo', 'Rayo']);
  });
});

describe('Productos (página con la API de Magic simulada)', () => {
  it('pide la primera página de cartas a la API de Magic y muestra el total', async () => {
    renderConProveedores(<Productos />, { ruta: '/productos' });
    await esperarCarga();
    expect(urlsMtg()[0]).toEqual(jasmine.objectContaining({ page: '1', pageSize: '12' }));
    expect(screen.getAllByRole('article').length).toBe(12);
    expect(screen.getByText('35 carta(s) encontradas')).toBeTruthy();
    expect(screen.getByTestId('pagina-actual').textContent).toBe('Página 1 de 3');
  });

  it('la búsqueda de la URL (?q=) se envía a la API como name', async () => {
    renderConProveedores(<Productos />, { ruta: '/productos?q=dragón' });
    await esperarCarga();
    expect(screen.getByRole('heading', { name: 'Resultados para "dragón"' })).toBeTruthy();
    expect(urlsMtg()[0].name).toBe('dragón');
    expect(screen.getAllByRole('article').length).toBe(3);
  });

  it('buscar, filtrar por categoría y paginar actualizan la URL y consultan la API', async () => {
    renderConProveedores(<Productos />, { ruta: '/productos' });
    await esperarCarga();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await esperar(() => rutaActual() === '/productos?pagina=2');
    await esperarCarga();
    expect(screen.getByTestId('pagina-actual').textContent).toBe('Página 2 de 3');

    await esperar(() => screen.getByLabelText('Categoría').options.length > 1, 'No cargaron las categorías');
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Land' } });
    await esperar(() => rutaActual() === '/productos?tipo=Land'); // vuelve a la página 1
    await esperarCarga();
    expect(urlsMtg().at(-1).types).toBe('Land');

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'forge' } });
    fireEvent.submit(screen.getByRole('search'));
    await esperar(() => rutaActual() === '/productos?q=forge&tipo=Land');
  });

  it('ordenar y "solo con stock" trabajan sobre la página cargada', async () => {
    renderConProveedores(<Productos />, { ruta: '/productos?q=dragón' });
    await esperarCarga();
    fireEvent.change(screen.getByLabelText('Ordenar página'), { target: { value: 'nombre' } });
    const nombres = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b)));
    fireEvent.click(screen.getByLabelText('Solo con stock'));
    expect(screen.getAllByRole('article').length).toBe(3);
  });
});

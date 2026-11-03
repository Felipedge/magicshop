import { fireEvent, screen } from '@testing-library/react';
import CategoriasAdmin from './CategoriasAdmin';
import { ProductosAdmin } from './ProductosAdmin';
import { calcularReporte } from './Reportes';
import { STOCK_CRITICO } from '../../api/recursos';
import { datosApi, esperar, esperarCarga, iniciarSesionComo, renderConProveedores } from '../../test/utils';

const filas = () => screen.getAllByRole('row').length - 1; // sin el encabezado

describe('Admin: ProductosAdmin (inventario en json-server)', () => {
  beforeEach(() => iniciarSesionComo(1));

  it('lista el inventario de la tienda', async () => {
    renderConProveedores(<ProductosAdmin />);
    await esperarCarga();
    expect(filas()).toBe(datosApi().productos.length);
  });

  it('críticos: pide a la API stock_lte y muestra solo stock bajo', async () => {
    renderConProveedores(<ProductosAdmin soloCriticos />);
    await esperarCarga();
    expect(window.fetch.calls.allArgs().map((a) => a[0])).toContain(`/api/productos?stock_lte=${STOCK_CRITICO}&eliminado_ne=true`);
    expect(filas()).toBe(datosApi().productos.filter((p) => p.stock <= STOCK_CRITICO).length);
  });

  it('eliminar pide confirmación (mock de window.confirm), marca la carta como quitada (PATCH) y refresca', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    renderConProveedores(<ProductosAdmin />);
    await esperarCarga();
    const antes = filas();

    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);

    await esperar(() => filas() === antes - 1, 'La tabla no se refrescó');
    expect(window.confirm).toHaveBeenCalled();
    expect(datosApi().productos[0].eliminado).toBeTrue();
  });

  it('si se cancela la confirmación no elimina', async () => {
    spyOn(window, 'confirm').and.returnValue(false);
    renderConProveedores(<ProductosAdmin />);
    await esperarCarga();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);
    expect(datosApi().productos[0].eliminado).toBeFalse();
  });
});

describe('Admin: CategoriasAdmin', () => {
  it('lista las categorías con su tipo de carta de la API de Magic', async () => {
    renderConProveedores(<CategoriasAdmin />);
    await esperarCarga();
    expect(filas()).toBe(6);
    expect(screen.getByText('Creature')).toBeTruthy();
  });

  it('crea una categoría para un tipo libre (POST) con el slug correspondiente', async () => {
    renderConProveedores(<CategoriasAdmin />);
    await esperarCarga();
    const tipo = screen.getByLabelText(/^Tipo de carta/);
    expect(Array.from(tipo.options).map((o) => o.value)).toEqual(['', 'Planeswalker']); // los demás ya están usados

    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByRole('alert').textContent).toContain('El nombre es obligatorio');

    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Planeswalkers' } });
    fireEvent.change(tipo, { target: { value: 'Planeswalker' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(await screen.findByText('Planeswalkers')).toBeTruthy();
    expect(datosApi().categorias.at(-1)).toEqual(jasmine.objectContaining({ slug: 'planeswalkers', tipoApi: 'Planeswalker' }));
  });

  it('editar cambia nombre y descripción pero no el tipo (PATCH)', async () => {
    renderConProveedores(<CategoriasAdmin />);
    await esperarCarga();
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[5]); // Tierras
    expect(screen.getByLabelText(/^Tipo de carta/).disabled).toBeTrue();

    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Tierras Básicas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Tierras Básicas')).toBeTruthy();
    expect(datosApi().categorias[5]).toEqual(jasmine.objectContaining({ nombre: 'Tierras Básicas', slug: 'tierras', tipoApi: 'Land' }));
  });

  it('elimina una categoría tras confirmar (DELETE)', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    renderConProveedores(<CategoriasAdmin />);
    await esperarCarga();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);
    await esperar(() => filas() === 5);
    expect(datosApi().categorias.some((c) => c.slug === 'criaturas')).toBeFalse();
  });
});

describe('Admin: calcularReporte', () => {
  it('calcula ventas, ticket promedio, ventas por categoría y más vendidos', () => {
    const productos = [
      { id: 'a', nombre: 'A', categoria: 'x', precio: 100, stock: 2 },
      { id: 'b', nombre: 'B', categoria: 'y', precio: 50, stock: 10 },
      { id: 'z', nombre: 'Quitada', categoria: 'y', precio: 999, stock: 9, eliminado: true },
    ];
    const categorias = [{ nombre: 'X', slug: 'x' }, { nombre: 'Y', slug: 'y' }];
    const ordenes = [
      { estado: 'pagada', total: 300, items: [{ id: 'a', nombre: 'A', cantidad: 2, subtotal: 200 }, { id: 'b', nombre: 'B', cantidad: 2, subtotal: 100 }] },
      { estado: 'pagada', total: 100, items: [{ id: 'nueva', nombre: 'Fuera de inventario', categoria: 'x', cantidad: 1, subtotal: 100 }] },
      { estado: 'rechazada', total: 999, items: [{ id: 'b', nombre: 'B', cantidad: 9, subtotal: 999 }] },
    ];

    const r = calcularReporte(ordenes, productos, categorias);

    expect(r.totalVentas).toBe(400);
    expect(r.ordenesPagadas).toBe(2);
    expect(r.ordenesRechazadas).toBe(1);
    expect(r.ticketPromedio).toBe(200);
    expect(r.valorInventario).toBe(700); // no cuenta la carta quitada
    expect(r.porCategoria).toEqual([{ nombre: 'X', total: 300 }, { nombre: 'Y', total: 100 }]);
    expect(r.masVendidos[0]).toEqual({ nombre: 'A', cantidad: 2 });
  });

  it('sin órdenes devuelve ceros', () => {
    const r = calcularReporte([], [], []);
    expect(r.totalVentas).toBe(0);
    expect(r.ticketPromedio).toBe(0);
    expect(r.masVendidos).toEqual([]);
  });
});

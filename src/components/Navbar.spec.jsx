import { fireEvent, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { esperar, iniciarSesionComo, precargarCarrito, productoApi, renderConProveedores, rutaActual } from '../test/utils';
import { formatoCLP, precioFinal } from '../utils/formato';

describe('Navbar', () => {
  it('sin sesión muestra Iniciar sesión y Crear cuenta', () => {
    renderConProveedores(<Navbar />);
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull();
  });

  it('con sesión de cliente saluda y no muestra el panel admin', () => {
    iniciarSesionComo(2);
    renderConProveedores(<Navbar />);
    expect(screen.getByText('Hola, Felipe')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Panel admin' })).toBeNull();
  });

  it('con sesión de admin muestra el acceso al panel; cerrar sesión vuelve al home', () => {
    iniciarSesionComo(1);
    renderConProveedores(<Navbar />, { ruta: '/productos' });
    expect(screen.getByRole('link', { name: 'Panel admin' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(rutaActual()).toBe('/');
  });

  it('muestra el total del carrito con los precios de la API', async () => {
    precargarCarrito([{ n: 1, cantidad: 2 }]);
    renderConProveedores(<Navbar />);
    const esperado = formatoCLP(precioFinal(productoApi(1)) * 2);
    await esperar(() => screen.getByRole('link', { name: /Carrito/ }).textContent.includes(esperado));
    expect(screen.getByRole('link', { name: /Carrito/ }).textContent).toContain(esperado);
  });

  it('el menú hamburguesa y el dropdown de categorías (cargadas de la API) se abren con estado', async () => {
    renderConProveedores(<Navbar />);
    const toggler = screen.getByLabelText('Abrir menú');
    expect(toggler.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggler);
    expect(toggler.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('menuPrincipal').classList).toContain('show');

    fireEvent.click(screen.getByRole('button', { name: 'Categorías' }));
    expect(await screen.findByRole('link', { name: 'Criaturas' })).toBeTruthy();
  });

  it('el buscador navega a /productos con la consulta', () => {
    renderConProveedores(<Navbar />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'angel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(rutaActual()).toBe('/productos?q=angel');
  });
});

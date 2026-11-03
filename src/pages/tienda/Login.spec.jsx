import { fireEvent, screen } from '@testing-library/react';
import Login from './Login';
import { esperar, renderConProveedores, rutaActual } from '../../test/utils';

function completar(email, password) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('Login', () => {
  it('valida el formato antes de consultar la API', () => {
    renderConProveedores(<Login />, { ruta: '/login' });
    completar('correo-malo', '123');
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
    expect(screen.getByText(/al menos 6/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    const urls = window.fetch.calls.allArgs().map((args) => args[0]);
    expect(urls.some((url) => url.startsWith('/api/usuarios'))).toBeFalse();
  });

  it('muestra el mensaje de error solo cuando las credenciales son incorrectas', async () => {
    renderConProveedores(<Login />, { ruta: '/login' });
    expect(screen.queryByRole('alert')).toBeNull();
    completar('admin@magicshop.com', 'incorrecta');
    expect((await screen.findByRole('alert')).textContent).toContain('Correo o contraseña incorrectos.');
  });

  it('un admin es redirigido al panel', async () => {
    renderConProveedores(<Login />, { ruta: '/login' });
    completar('admin@magicshop.com', 'admin123');
    await esperar(() => rutaActual() === '/admin');
    expect(rutaActual()).toBe('/admin');
  });

  it('un cliente es redirigido al home', async () => {
    renderConProveedores(<Login />, { ruta: '/login' });
    completar('comprador@magicshop.com', 'comprador123');
    await esperar(() => rutaActual() === '/');
    expect(rutaActual()).toBe('/');
  });

  it('si la API falla muestra el error de conexión', async () => {
    window.fetch.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    renderConProveedores(<Login />, { ruta: '/login' });
    completar('admin@magicshop.com', 'admin123');
    expect((await screen.findByRole('alert')).textContent).toContain('json-server');
  });
});

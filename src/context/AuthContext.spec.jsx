import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { datosApi } from '../test/apiFalsa';

const montar = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

describe('AuthContext', () => {
  it('login correcto consulta la API, guarda la sesión sin contraseña e identifica al admin', async () => {
    const { result } = montar();
    await act(() => result.current.login('ADMIN@magicshop.com', 'admin123'));

    expect(window.fetch.calls.mostRecent().args[0]).toBe('/api/usuarios?email=admin%40magicshop.com');
    expect(result.current.usuario.email).toBe('admin@magicshop.com');
    expect(result.current.esAdmin).toBeTrue();
    const sesion = JSON.parse(localStorage.getItem('magicshop_sesion'));
    expect(sesion.id).toBe(1);
    expect(sesion.password).toBeUndefined();
  });

  it('login incorrecto devuelve null y no inicia sesión', async () => {
    const { result } = montar();
    let respuesta;
    await act(async () => {
      respuesta = await result.current.login('admin@magicshop.com', 'malaclave');
    });
    expect(respuesta).toBeNull();
    expect(result.current.usuario).toBeNull();
  });

  it('la sesión sobrevive a un "recargo" y logout la borra', async () => {
    const primero = montar();
    await act(() => primero.result.current.login('comprador@magicshop.com', 'comprador123'));
    primero.unmount();

    const { result } = montar(); // simula recargar la página
    expect(result.current.usuario.nombre).toBe('Felipe');

    act(() => result.current.logout());
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('magicshop_sesion')).toBeNull();
  });

  it('registrar crea un cliente (POST /usuarios) y rechaza correos repetidos', async () => {
    const { result } = montar();
    await act(() => result.current.registrar({ nombre: 'Nuevo', email: 'Nuevo@Test.cl', password: '123456' }));

    expect(result.current.usuario.rol).toBe('cliente');
    expect(datosApi().usuarios.at(-1).email).toBe('nuevo@test.cl');
    await expectAsync(result.current.registrar({ email: 'NUEVO@test.cl' })).toBeRejectedWithError(/Ya existe/);
  });

  it('actualizarPerfil guarda los cambios en la API (PATCH /usuarios/:id)', async () => {
    const { result } = montar();
    await act(() => result.current.login('comprador@magicshop.com', 'comprador123'));
    await act(() => result.current.actualizarPerfil({ nombre: 'Felipe Andrés' }));

    expect(result.current.usuario.nombre).toBe('Felipe Andrés');
    expect(datosApi().usuarios.find((u) => u.id === 2).nombre).toBe('Felipe Andrés');
  });
});

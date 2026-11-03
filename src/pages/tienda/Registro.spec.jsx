import { fireEvent, screen } from '@testing-library/react';
import Registro from './Registro';
import { datosApi, esperar, renderConProveedores, rutaActual } from '../../test/utils';

const escribir = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

function completarFormulario({ run = '12345678-5', email = 'nueva@test.cl', password = 'secreta1', confirmar = 'secreta1' } = {}) {
  escribir(/^RUN/, run);
  escribir(/^Correo/, email);
  escribir(/^Nombre/, 'Camila');
  escribir(/^Apellidos/, 'Díaz');
  escribir(/^Contraseña/, password);
  escribir(/^Confirmar contraseña/, confirmar);
  escribir(/^Región/, 'Región de La Araucanía');
  escribir(/^Comuna/, 'Temuco');
  escribir(/^Dirección/, 'Av. Alemania 100');
  fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));
}

describe('Registro', () => {
  it('valida RUN y que las contraseñas coincidan, sin llamar a la API', () => {
    renderConProveedores(<Registro />, { ruta: '/registro' });
    completarFormulario({ run: '12345678-9', confirmar: 'otra' });
    expect(screen.getByText(/dígito verificador/)).toBeTruthy();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    const urls = window.fetch.calls.allArgs().map((args) => args[0]);
    expect(urls.some((url) => url.startsWith('/api/usuarios'))).toBeFalse();
  });

  it('crea la cuenta en la API (sin guardar la confirmación) y navega al home', async () => {
    renderConProveedores(<Registro />, { ruta: '/registro' });
    completarFormulario();
    await esperar(() => rutaActual() === '/');
    const nuevo = datosApi().usuarios.find((u) => u.email === 'nueva@test.cl');
    expect(nuevo.rol).toBe('cliente');
    expect(nuevo.confirmar).toBeUndefined();
  });

  it('muestra un error si el correo ya está registrado', async () => {
    renderConProveedores(<Registro />, { ruta: '/registro' });
    completarFormulario({ email: 'comprador@magicshop.com' });
    expect((await screen.findByRole('alert')).textContent).toContain('Ya existe una cuenta');
  });
});

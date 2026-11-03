import { fireEvent, screen } from '@testing-library/react';
import { UsuarioFormPage, UsuariosAdmin, UsuarioVer } from './UsuariosAdmin';
import { BoletaAdmin, OrdenesAdmin } from './Ordenes';
import { ProductoFormPage, ProductoNuevo, ProductoVer } from './ProductosAdmin';
import Perfil from './Perfil';
import Reportes from './Reportes';
import { datosApi, esperar, esperarCarga, iniciarSesionComo, productoApi, renderConProveedores, rutaActual } from '../../test/utils';

const escribir = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
const filas = () => screen.getAllByRole('row').length - 1;

/** Agrega una orden directamente a la API falsa */
function crearOrden(cambios = {}) {
  const orden = {
    id: datosApi().ordenes.length + 1,
    numero: '20261102001',
    fecha: '2026-11-02T12:00:00.000Z',
    usuarioId: 2,
    cliente: { nombre: 'Felipe', apellidos: 'Palma', email: 'comprador@magicshop.com' },
    despacho: { calle: 'Los Crisantemos 603', region: 'Región Metropolitana de Santiago', comuna: 'Providencia' },
    items: [{ id: datosApi().productos[0].id, nombre: "Ancestor's Chosen", categoria: 'criaturas', imagen: '/img/logo.png', precioUnitario: 1450, cantidad: 2, subtotal: 2900 }],
    total: 2900,
    estado: 'pagada',
    motivo: '',
    ...cambios,
  };
  datosApi().ordenes.push(orden);
  return orden;
}

describe('Admin: usuarios', () => {
  beforeEach(() => iniciarSesionComo(1));

  it('lista los usuarios y no permite que el admin se elimine a sí mismo', async () => {
    renderConProveedores(<UsuariosAdmin />);
    await esperarCarga();
    expect(filas()).toBe(datosApi().usuarios.length);
    const botones = screen.getAllByRole('button', { name: 'Eliminar' });
    expect(botones[0].disabled).toBeTrue(); // fila del admin conectado
    expect(botones[1].disabled).toBeFalse();
  });

  it('elimina un usuario tras confirmar (DELETE /usuarios/:id)', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    renderConProveedores(<UsuariosAdmin />);
    await esperarCarga();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);
    await esperar(() => filas() === 1);
    expect(datosApi().usuarios.some((u) => u.id === 2)).toBeFalse();
  });

  it('nuevo usuario: valida correo repetido y luego crea el usuario (POST)', async () => {
    renderConProveedores(<UsuarioFormPage />, { ruta: '/admin/usuarios/nuevo', patron: '/admin/usuarios/nuevo' });
    await screen.findByRole('button', { name: 'Crear usuario' });
    escribir(/^RUN/, '11111111-1');
    escribir(/^Correo/, 'comprador@magicshop.com');
    escribir(/^Nombre/, 'Rosa');
    escribir(/^Apellidos/, 'Mena');
    escribir(/^Contraseña/, 'clave123');
    escribir(/^Rol/, 'admin');
    escribir(/^Región/, 'Región del Biobío');
    escribir(/^Comuna/, 'Talcahuano');
    escribir(/^Dirección/, 'Colón 100');
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
    expect(screen.getByText('Ese correo ya está registrado.')).toBeTruthy();

    escribir(/^Correo/, 'Rosa@MagicShop.com');
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
    await esperar(() => rutaActual() === '/admin/usuarios');
    const creado = datosApi().usuarios.find((u) => u.email === 'rosa@magicshop.com');
    expect(creado.rol).toBe('admin');
  });

  it('editar usuario: carga sus datos de la API y guarda los cambios (PATCH)', async () => {
    renderConProveedores(<UsuarioFormPage />, { ruta: '/admin/usuarios/2/editar', patron: '/admin/usuarios/:id/editar' });
    const correo = await screen.findByLabelText(/^Correo/);
    expect(correo.value).toBe('comprador@magicshop.com');
    escribir(/^Nombre/, 'Felipe Ignacio');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await esperar(() => rutaActual() === '/admin/usuarios');
    expect(datosApi().usuarios.find((u) => u.id === 2).nombre).toBe('Felipe Ignacio');
  });

  it('mostrar usuario incluye su historial de compras (GET /ordenes?usuarioId=)', async () => {
    crearOrden();
    crearOrden({ numero: '20261102999', usuarioId: 1 });
    renderConProveedores(<UsuarioVer />, { ruta: '/admin/usuarios/2', patron: '/admin/usuarios/:id' });
    expect(await screen.findByRole('heading', { name: 'Felipe Palma' })).toBeTruthy();
    expect(await screen.findByText('#20261102001')).toBeTruthy();
    expect(screen.queryByText('#20261102999')).toBeNull();
  });

  it('usuario inexistente muestra un aviso', async () => {
    renderConProveedores(<UsuarioVer />, { ruta: '/admin/usuarios/99', patron: '/admin/usuarios/:id' });
    expect(await screen.findByText(/Usuario no encontrado/)).toBeTruthy();
  });
});

describe('Admin: órdenes y boletas', () => {
  it('sin órdenes muestra el mensaje vacío', async () => {
    renderConProveedores(<OrdenesAdmin />);
    expect(await screen.findByText('No hay órdenes registradas.')).toBeTruthy();
  });

  it('filtra las órdenes por estado consultando la API', async () => {
    crearOrden();
    crearOrden({ numero: '20261102002', estado: 'rechazada' });
    renderConProveedores(<OrdenesAdmin />);
    await esperarCarga();
    expect(filas()).toBe(2);

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'rechazada' } });
    await esperar(() => filas() === 1);
    expect(screen.getByText('#20261102002')).toBeTruthy();
    expect(window.fetch.calls.mostRecent().args[0]).toContain('estado=rechazada');
  });

  it('la boleta muestra datos del cliente, despacho y total', async () => {
    const orden = crearOrden({ estado: 'rechazada', motivo: 'Tarjeta rechazada' });
    renderConProveedores(<BoletaAdmin />, { ruta: `/admin/ordenes/${orden.id}`, patron: '/admin/ordenes/:id' });
    expect(await screen.findByRole('heading', { name: 'Boleta #20261102001' })).toBeTruthy();
    expect(screen.getByText('Tarjeta rechazada')).toBeTruthy();
    expect(screen.getByText('Providencia')).toBeTruthy();
    expect(screen.getByText(/Total a pagar/)).toBeTruthy();
  });
});

describe('Admin: productos (ver / editar / nuevo)', () => {
  it('ver producto muestra su ficha y enlace a edición', async () => {
    const { id, nombre } = productoApi(1);
    renderConProveedores(<ProductoVer />, { ruta: `/admin/productos/${id}`, patron: '/admin/productos/:id' });
    expect(await screen.findByRole('heading', { name: nombre })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Editar producto' }).getAttribute('href')).toBe(`/admin/productos/${id}/editar`);
  });

  it('editar producto actualiza el stock en la API (PATCH)', async () => {
    const { id } = productoApi(1);
    renderConProveedores(<ProductoFormPage />, { ruta: `/admin/productos/${id}/editar`, patron: '/admin/productos/:id/editar' });
    await screen.findByRole('button', { name: 'Guardar cambios' });
    escribir(/^Stock/, '42');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await esperar(() => rutaActual() === '/admin/productos');
    expect(productoApi(1).stock).toBe(42);
  });

  it('nuevo producto: busca la carta en la API de Magic y la agrega al inventario (POST)', async () => {
    const total = datosApi().productos.length;
    renderConProveedores(<ProductoNuevo />, { ruta: '/admin/productos/nuevo' });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'dragón' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    const botones = await screen.findAllByRole('button', { name: 'Elegir' });
    expect(botones.length).toBe(3);
    const url = window.fetch.calls.allArgs().map((a) => a[0]).find((u) => u.startsWith('https://api.magicthegathering.io'));
    expect(new URL(url).searchParams.get('name')).toBe('dragón');

    fireEvent.click(botones[0]);
    escribir(/^Precio/, '9990');
    escribir(/^Stock/, '2');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la tienda' }));
    await esperar(() => rutaActual() === '/admin/productos');
    expect(datosApi().productos.length).toBe(total + 1);
    expect(datosApi().productos.at(-1)).toEqual(jasmine.objectContaining({ id: 'carta-extra-1', nombre: 'Dragón de Prueba', precio: 9990, stock: 2 }));
  });

  it('nuevo producto: sin resultados muestra un aviso', async () => {
    renderConProveedores(<ProductoNuevo />, { ruta: '/admin/productos/nuevo' });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('No se encontraron cartas con ese nombre.')).toBeTruthy();
  });

  it('producto inexistente muestra un aviso', async () => {
    renderConProveedores(<ProductoFormPage />, { ruta: '/admin/productos/no-existe/editar', patron: '/admin/productos/:id/editar' });
    expect(await screen.findByText(/Producto no encontrado/)).toBeTruthy();
  });
});

describe('Admin: perfil y reportes', () => {
  it('el perfil se carga de la API y se guarda sin cambiar el rol', async () => {
    iniciarSesionComo(1);
    renderConProveedores(<Perfil />);
    await screen.findByRole('button', { name: 'Guardar cambios' });
    expect(screen.queryByLabelText(/^Rol/)).toBeNull();
    escribir(/^Nombre/, 'Administrador');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Perfil actualizado');
    expect(datosApi().usuarios.find((u) => u.id === 1)).toEqual(jasmine.objectContaining({ nombre: 'Administrador', rol: 'admin' }));
  });

  it('reportes muestra los indicadores con las órdenes pagadas', async () => {
    crearOrden();
    renderConProveedores(<Reportes />);
    expect(await screen.findByText("Ancestor's Chosen — 2 u.")).toBeTruthy();
    expect(screen.getByText('Órdenes pagadas').nextSibling.textContent).toBe('1');
  });
});

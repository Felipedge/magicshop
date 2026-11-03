import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { datosApi, esperar, esperarCarga, iniciarSesionComo, precargarCarrito, productoApi, RutaActual, rutaActual } from './test/utils';

function renderApp(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <CartProvider>
          <App />
          <RutaActual />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const escribir = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

describe('App (rutas y flujos con las APIs)', () => {
  it('el home carga categorías (json-server) y cartas destacadas (API de Magic)', async () => {
    renderApp('/');
    expect(screen.getAllByText('Cargando...').length).toBeGreaterThan(0);
    await esperarCarga();
    expect(screen.getByRole('heading', { name: 'Criaturas' })).toBeTruthy();
    expect(screen.getAllByRole('article').length).toBe(6 + 8); // 6 categorías + 8 cartas
    const urls = window.fetch.calls.allArgs().map((a) => a[0]);
    expect(urls.some((u) => u.startsWith('https://api.magicthegathering.io/v1/cards?page=1&pageSize=8'))).toBeTrue();
  });

  it('si la API no responde muestra el mensaje de error', async () => {
    window.fetch.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    renderApp('/ofertas');
    expect((await screen.findAllByText(/json-server/)).length).toBeGreaterThan(0);
  });

  it('una ruta inexistente muestra la página 404', () => {
    renderApp('/no-existe');
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('ProtectedRoute: /admin sin sesión redirige a /login', () => {
    renderApp('/admin');
    expect(rutaActual()).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('ProtectedRoute: un cliente no puede entrar al panel admin', () => {
    iniciarSesionComo(2);
    renderApp('/admin/productos');
    expect(rutaActual()).toBe('/');
  });

  it('el admin ve el dashboard con las métricas de la API', async () => {
    iniciarSesionComo(1);
    renderApp('/admin');
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    await esperarCarga();
    expect(screen.getAllByTestId('stat-valor')[1].textContent).toBe(String(datosApi().productos.length));
  });

  it('flujo completo: detalle (API de Magic) → carrito → checkout → pago exitoso', async () => {
    iniciarSesionComo(2);
    const producto = productoApi(1);
    const stockAntes = producto.stock;
    renderApp(`/productos/${producto.id}`);

    fireEvent.click(await screen.findByRole('button', { name: 'Añadir al carrito' }));
    fireEvent.click(screen.getByRole('link', { name: /Carrito/ }));
    expect(rutaActual()).toBe('/carrito');

    fireEvent.click(await screen.findByRole('button', { name: 'Comprar ahora' }));
    expect(rutaActual()).toBe('/checkout');
    // Usuario conectado: el formulario viene autocompletado
    expect(screen.getByLabelText(/^Correo/).value).toBe('comprador@magicshop.com');

    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/Se ha realizado la compra/)).toBeTruthy();
    const orden = datosApi().ordenes[0];
    expect(rutaActual()).toBe(`/compra/exito/${orden.id}`);
    expect(orden.usuarioId).toBe(2);
    expect(productoApi(1).stock).toBe(stockAntes - 1);
    expect(localStorage.getItem('magicshop_carrito')).toBe('[]');
  });

  it('flujo con pago rechazado: muestra el error y permite reintentar', async () => {
    precargarCarrito([{ n: 1, cantidad: 1 }]);
    renderApp('/checkout');
    await screen.findByRole('button', { name: /Pagar ahora/ });

    escribir(/^Nombre/, 'Pedro');
    escribir(/^Apellidos/, 'Soto');
    escribir(/^Correo/, 'pedro@test.cl');
    escribir(/^Calle/, 'Los Crisantemos');
    escribir(/^Región/, 'Región del Biobío');
    escribir(/^Comuna/, 'Concepción');
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/No se pudo realizar el pago/)).toBeTruthy();
    expect(datosApi().ordenes[0].estado).toBe('rechazada');
    fireEvent.click(screen.getByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }));
    await esperar(() => rutaActual() === '/checkout');
    expect(await screen.findByRole('button', { name: /Pagar ahora/ })).toBeTruthy(); // el carrito se conserva
  });
});

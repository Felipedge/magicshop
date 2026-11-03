// Utilidades compartidas por las pruebas.
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { datosApi } from './apiFalsa';

export { datosApi };

/** Inicia sesión "a mano" guardando el usuario (sin contraseña), como lo hace AuthContext. */
export function iniciarSesionComo(usuarioId) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...publico } = datosApi().usuarios.find((u) => u.id === usuarioId);
  localStorage.setItem('magicshop_sesion', JSON.stringify(publico));
}

/** Producto n° `n` (1, 2, 3...) del inventario de la API falsa. */
export const productoApi = (n) => datosApi().productos[n - 1];

/**
 * Deja un carrito precargado en localStorage.
 * Recibe [{ n, cantidad }] donde n es el n° de producto del inventario (ver productoApi).
 */
export function precargarCarrito(items) {
  const carrito = items.map(({ n, cantidad }) => {
    const producto = productoApi(n);
    return { id: producto.id, cantidad, producto };
  });
  localStorage.setItem('magicshop_carrito', JSON.stringify(carrito));
}

/**
 * Espera (reintentando) hasta que `condicion()` sea verdadera.
 * Se usa en vez de expect dentro de waitFor, porque en Jasmine expect no lanza excepciones.
 */
export async function esperar(condicion, mensaje = 'La condición no se cumplió a tiempo') {
  await waitFor(() => {
    if (!condicion()) throw new Error(mensaje);
  });
}

/** Espera a que desaparezcan todos los indicadores "Cargando..." (respuestas de la API). */
export const esperarCarga = () => esperar(() => screen.queryAllByText('Cargando...').length === 0, 'La vista sigue cargando');

/** Muestra la ruta actual: permite comprobar navegaciones en las pruebas. */
export function RutaActual() {
  const { pathname, search } = useLocation();
  return <div data-testid="ruta-actual">{pathname + search}</div>;
}

export const rutaActual = () => screen.getByTestId('ruta-actual').textContent;

/**
 * Renderiza un componente con Router en memoria y los contextos de sesión y carrito.
 * `ruta` es la URL inicial y `patron` el path de la ruta (para useParams).
 */
export function renderConProveedores(ui, { ruta = '/', patron = '*' } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path={patron} element={ui} />
            <Route path="*" element={null} />
          </Routes>
          <RutaActual />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

/** Producto de prueba con valores por defecto sobreescribibles. */
export function productoFalso(cambios = {}) {
  return {
    id: 999,
    nombre: 'Carta de Prueba',
    categoria: 'criaturas',
    tipo: 'Creature — Test',
    rareza: 'Rare',
    edicion: 'Test Edition',
    texto: 'Texto de prueba.',
    imagen: '/img/logo.png',
    precio: 1000,
    stock: 5,
    oferta: 0,
    ...cambios,
  };
}

import { createContext, useContext, useEffect, useState } from 'react';
import { productosApi } from '../api/recursos';
import { useColeccion } from '../api/useApi';
import { combinar, snapshot } from '../api/catalogo';
import { precioFinal } from '../utils/formato';

const CartContext = createContext(null);
const CLAVE_CARRITO = 'magicshop_carrito';

function leerCarrito() {
  try {
    const items = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    return items.filter((i) => i.producto); // descarta formatos antiguos
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  // Cada ítem guarda { id, cantidad, producto } con los datos de la carta (vienen de la API de Magic).
  // Precio, stock y oferta se toman siempre del inventario actual de json-server.
  const [items, setItems] = useState(leerCarrito);
  const { datos: inventario, cargando, error } = useColeccion(productosApi);

  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  }, [items]);

  const actual = (producto) => combinar(producto, inventario.find((p) => p.id === producto.id));

  /** Agrega `cantidad` unidades sin superar el stock. Devuelve true si se agregó. */
  function agregar(producto, cantidad = 1) {
    const { stock, eliminado } = actual(producto);
    if (eliminado || stock <= 0) return false;

    const enCarrito = items.find((i) => i.id === producto.id)?.cantidad ?? 0;
    const nueva = Math.min(enCarrito + cantidad, stock);
    if (nueva === enCarrito) return false;

    setItems((prev) =>
      enCarrito
        ? prev.map((i) => (i.id === producto.id ? { ...i, cantidad: nueva } : i))
        : [...prev, { id: producto.id, cantidad: nueva, producto: snapshot(producto) }],
    );
    return true;
  }

  /** Fija la cantidad de un ítem (0 o menos lo elimina; se limita al stock) */
  function cambiarCantidad(productoId, cantidad) {
    const item = items.find((i) => i.id === productoId);
    const limite = item ? actual(item.producto).stock : 0;
    const nueva = Math.min(cantidad, limite);
    setItems((prev) =>
      nueva <= 0 ? prev.filter((i) => i.id !== productoId) : prev.map((i) => (i.id === productoId ? { ...i, cantidad: nueva } : i)),
    );
  }

  function quitar(productoId) {
    setItems((prev) => prev.filter((i) => i.id !== productoId));
  }

  function vaciar() {
    setItems([]);
  }

  // Detalle con precio/stock actuales (si el admin quitó la carta de la tienda, se omite).
  const detalle = items
    .map((i) => {
      const producto = actual(i.producto);
      if (producto.eliminado) return null;
      const precio = precioFinal(producto);
      return { ...producto, cantidad: i.cantidad, precioUnitario: precio, subtotal: precio * i.cantidad };
    })
    .filter(Boolean);

  const total = detalle.reduce((suma, i) => suma + i.subtotal, 0);
  const cantidadTotal = detalle.reduce((suma, i) => suma + i.cantidad, 0);

  const valor = { items: detalle, total, cantidadTotal, cargando, error, agregar, cambiarCantidad, quitar, vaciar };
  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}

import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';

/**
 * Hook para agregar productos al carrito mostrando un aviso temporal.
 * Devuelve [agregarProducto, aviso] — `aviso` se renderiza con <AvisoCarrito aviso={aviso} />.
 */
export function useAgregarAlCarrito() {
  const { agregar } = useCart();
  const [aviso, setAviso] = useState(null);
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  function agregarProducto(producto, cantidad = 1) {
    const ok = agregar(producto, cantidad);
    setAviso(
      ok
        ? { tipo: 'success', texto: `"${producto.nombre}" se agregó al carrito.` }
        : { tipo: 'warning', texto: `No hay más stock disponible de "${producto.nombre}".` },
    );
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 2500);
    return ok;
  }

  return [agregarProducto, aviso];
}

export default function AvisoCarrito({ aviso }) {
  if (!aviso) return null;
  return (
    <div className={`alert alert-${aviso.tipo} aviso-flotante shadow`} role="status">
      {aviso.texto}
    </div>
  );
}

// Catálogo de la tienda = cartas de la API de Magic + inventario de json-server.
// - La API de Magic entrega los datos de la carta.
// - json-server (/productos) guarda, por id de carta, el precio, stock y % de oferta definidos por la tienda.
//   Si una carta no está en el inventario se usa el precio por rareza y el stock inicial.
import { productosApi } from './recursos';
import { buscarCartas, obtenerCarta } from './mtg';
import { useApi, useColeccion } from './useApi';

const CAMPOS_INVENTARIO = ['precio', 'stock', 'oferta', 'eliminado'];

/** Aplica sobre una carta los valores definidos en el inventario de la tienda. */
export function combinar(producto, inventario) {
  if (!inventario) return producto;
  const valores = {};
  for (const campo of CAMPOS_INVENTARIO) if (inventario[campo] !== undefined) valores[campo] = inventario[campo];
  return { ...producto, ...valores };
}

/** Datos de la carta que se guardan en el inventario (para listar sin consultar la API de Magic). */
export function snapshot(producto) {
  const { id, nombre, categoria, tipo, rareza, edicion, imagen, precio, stock, oferta } = producto;
  return { id, nombre, categoria, tipo, rareza, edicion, imagen, precio, stock, oferta, eliminado: false };
}

/** Crea o actualiza la carta en el inventario (PATCH si existe, POST si no). */
export async function guardarEnInventario(producto, cambios) {
  const existente = await productosApi.obtener(producto.id);
  if (existente) return productosApi.actualizar(producto.id, cambios);
  return productosApi.crear({ ...snapshot(producto), ...cambios });
}

/**
 * Página de cartas de la API de Magic con precio/stock de la tienda.
 * `filtros` = { nombre, tipo, pagina, porPagina }; si es null no se consulta nada.
 * Las cartas quitadas de la tienda por el admin (eliminado) no se muestran.
 */
export function useCatalogo(filtros) {
  const inventario = useColeccion(productosApi);
  const pagina = useApi(() => (filtros ? buscarCartas(filtros) : Promise.resolve({ cartas: [], total: 0 })), [JSON.stringify(filtros)], {
    escucharCambios: false, // las cartas de la API no cambian cuando la tienda modifica su inventario
  });

  const porId = new Map(inventario.datos.map((item) => [item.id, item]));
  const productos = (pagina.datos?.cartas ?? []).map((carta) => combinar(carta, porId.get(carta.id))).filter((p) => !p.eliminado);

  return {
    productos,
    total: pagina.datos?.total ?? 0,
    cargando: pagina.cargando || inventario.cargando,
    error: pagina.error || inventario.error,
  };
}

/** Una carta por id (API de Magic) con su precio/stock del inventario. null si no existe o fue quitada. */
export function useProducto(id) {
  return useApi(async () => {
    const inventario = await productosApi.obtener(id);
    let carta;
    try {
      carta = await obtenerCarta(id);
    } catch (error) {
      if (!inventario) throw error; // sin API de Magic se usa lo guardado en el inventario
    }
    if (!carta && !inventario) return null;
    const producto = combinar(carta ?? inventario, inventario);
    return producto.eliminado ? null : producto;
  }, [id]);
}

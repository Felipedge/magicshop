// Cliente HTTP de la API REST (json-server).
// En desarrollo Vite reenvía /api → http://localhost:3001 (ver vite.config.js).
export const API_URL = '/api';

/** Nombre del evento que se emite cuando la API cambia datos (crear, editar, eliminar). */
export const EVENTO_CAMBIO = 'magicshop:api';

export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

async function solicitud(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con la API. ¿Está corriendo json-server (npm run api)?', 0);
  }
  if (!respuesta.ok) throw new ErrorApi(`La API respondió con error ${respuesta.status}.`, respuesta.status);
  return respuesta.status === 204 ? null : respuesta.json();
}

function notificarCambio(recurso) {
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: recurso }));
}

/** Convierte { categoria: 'x', stock_lte: 3 } en "?categoria=x&stock_lte=3" */
function queryString(filtros = {}) {
  const limpios = Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return limpios.length ? `?${new URLSearchParams(limpios).toString()}` : '';
}

/**
 * Crea las operaciones CRUD de un recurso REST de json-server.
 *   GET    /recurso?filtros   → listar
 *   GET    /recurso/:id       → obtener
 *   POST   /recurso           → crear
 *   PATCH  /recurso/:id       → actualizar
 *   DELETE /recurso/:id       → eliminar
 */
export function crearRecurso(nombre) {
  return {
    nombre,

    listar(filtros) {
      return solicitud(`/${nombre}${queryString(filtros)}`);
    },

    /** Devuelve el registro o null si no existe (404). */
    async obtener(id) {
      try {
        return await solicitud(`/${nombre}/${id}`);
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },

    async crear(datos) {
      const creado = await solicitud(`/${nombre}`, { method: 'POST', body: JSON.stringify(datos) });
      notificarCambio(nombre);
      return creado;
    },

    async actualizar(id, cambios) {
      const actualizado = await solicitud(`/${nombre}/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) });
      notificarCambio(nombre);
      return actualizado;
    },

    async eliminar(id) {
      await solicitud(`/${nombre}/${id}`, { method: 'DELETE' });
      notificarCambio(nombre);
    },
  };
}

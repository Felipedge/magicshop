import { useCallback, useEffect, useRef, useState } from 'react';
import { EVENTO_CAMBIO } from './cliente';

/**
 * Ejecuta una petición a la API y expone { datos, cargando, error, recargar }.
 * - Se vuelve a ejecutar cuando cambian las dependencias `deps`.
 * - Se refresca sola cuando la app crea/edita/elimina datos (evento EVENTO_CAMBIO),
 *   así la interfaz siempre muestra la información actual del servidor
 *   (se puede desactivar con { escucharCambios: false }).
 */
export function useApi(peticion, deps = [], { escucharCambios = true } = {}) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const peticionRef = useRef(peticion);
  peticionRef.current = peticion;
  const ultimaLlamada = useRef(0);

  const recargar = useCallback(async () => {
    const llamada = ++ultimaLlamada.current; // descarta respuestas de peticiones antiguas
    try {
      const datos = await peticionRef.current();
      if (llamada === ultimaLlamada.current) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (llamada === ultimaLlamada.current) setEstado({ datos: null, cargando: false, error: error.message });
    }
  }, []);

  // Si las dependencias cambiaron en este render, los datos en estado son de la consulta anterior:
  // se informa "cargando" de inmediato para no mostrar resultados viejos ni un "vacío" momentáneo.
  const depsAnteriores = useRef(deps);
  const depsCambiaron = deps.length !== depsAnteriores.current.length || deps.some((d, i) => !Object.is(d, depsAnteriores.current[i]));

  useEffect(() => {
    depsAnteriores.current = deps;
    setEstado((prev) => ({ ...prev, cargando: true }));
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (escucharCambios) window.addEventListener(EVENTO_CAMBIO, recargar);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, recargar);
      ultimaLlamada.current++; // ignora respuestas que lleguen después de desmontar
    };
  }, [recargar, escucharCambios]);

  return { ...estado, cargando: estado.cargando || depsCambiaron, recargar };
}

/** Atajo para listar una colección: useColeccion(productosApi, { categoria: 'tierras' }) */
export function useColeccion(recurso, filtros) {
  const resultado = useApi(() => recurso.listar(filtros), [recurso, JSON.stringify(filtros ?? {})]);
  return { ...resultado, datos: resultado.datos ?? [] };
}

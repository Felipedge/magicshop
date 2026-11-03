// Recursos de la API (cada uno corresponde a una colección de server/db.json).
import { crearRecurso } from './cliente';

export const productosApi = crearRecurso('productos');
export const categoriasApi = crearRecurso('categorias');
export const usuariosApi = crearRecurso('usuarios');
export const ordenesApi = crearRecurso('ordenes');

/** Un producto es "crítico" cuando su stock es menor o igual a este valor. */
export const STOCK_CRITICO = 3;

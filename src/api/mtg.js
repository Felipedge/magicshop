// Cliente de la API pública de Magic: The Gathering (https://api.magicthegathering.io).
// De aquí salen las cartas (nombre, tipo, rareza, texto, imagen). El precio, stock y ofertas
// los define la tienda en json-server (ver catalogo.js).
import { ErrorApi } from './cliente';

export const MTG_URL = 'https://api.magicthegathering.io/v1';

/** Stock con que parte cualquier carta que aún no está en el inventario de la tienda. */
export const STOCK_INICIAL = 10;

/** Tipo de carta en la API → slug de categoría de la tienda (en orden de prioridad). */
export const CATEGORIA_POR_TIPO = {
  Creature: 'criaturas',
  Planeswalker: 'planeswalkers',
  Instant: 'instantaneos',
  Sorcery: 'conjuros',
  Enchantment: 'encantamientos',
  Artifact: 'artefactos',
  Land: 'tierras',
};
export const TIPOS_MTG = Object.keys(CATEGORIA_POR_TIPO);

export function categoriaDeTipos(tipos = []) {
  const tipo = TIPOS_MTG.find((t) => tipos.includes(t));
  return tipo ? CATEGORIA_POR_TIPO[tipo] : 'otros';
}

export function tipoDeCategoria(slug) {
  return TIPOS_MTG.find((t) => CATEGORIA_POR_TIPO[t] === slug);
}

const PRECIO_POR_RAREZA = { Common: 500, Uncommon: 1200, Rare: 3500, 'Mythic Rare': 8000 };

/** Precio por defecto según la rareza (+ una variación fija calculada desde el id, como en el proyecto original). */
export function precioBase(carta) {
  let hash = 0;
  for (const caracter of carta.id) hash += caracter.charCodeAt(0);
  return (PRECIO_POR_RAREZA[carta.rarity] ?? 800) + (hash % 10) * 50;
}

/** Convierte una carta de la API al formato de producto de la tienda. */
export function cartaAProducto(carta) {
  return {
    id: carta.id,
    nombre: carta.name,
    categoria: categoriaDeTipos(carta.types),
    tipo: carta.type,
    tiposApi: carta.types ?? [],
    rareza: carta.rarity,
    edicion: carta.setName,
    texto: carta.text ?? '',
    imagen: carta.imageUrl?.replace(/^http:/, 'https:') ?? '',
    precio: precioBase(carta),
    stock: STOCK_INICIAL,
    oferta: 0,
  };
}

async function pedir(ruta) {
  let respuesta;
  try {
    respuesta = await fetch(`${MTG_URL}${ruta}`);
  } catch {
    throw new ErrorApi('No se pudo conectar con la API de Magic (api.magicthegathering.io). Revisa tu conexión a internet.', 0);
  }
  if (!respuesta.ok) throw new ErrorApi(`La API de Magic respondió con error ${respuesta.status}.`, respuesta.status);
  return respuesta;
}

/**
 * Busca cartas con imagen. GET /cards?name=&types=&page=&pageSize=
 * Devuelve { cartas: productos[], total } (total viene en el header Total-Count).
 */
export async function buscarCartas({ nombre = '', tipo = '', pagina = 1, porPagina = 12 } = {}) {
  const params = new URLSearchParams({ page: pagina, pageSize: porPagina, contains: 'imageUrl' });
  if (nombre) params.set('name', nombre);
  if (tipo) params.set('types', tipo);
  const respuesta = await pedir(`/cards?${params}`);
  const { cards = [] } = await respuesta.json();
  return { cartas: cards.map(cartaAProducto), total: Number(respuesta.headers.get('Total-Count')) || cards.length };
}

/** GET /cards/:id. Devuelve el producto o null si la carta no existe. */
export async function obtenerCarta(id) {
  try {
    const respuesta = await pedir(`/cards/${encodeURIComponent(id)}`);
    const { card } = await respuesta.json();
    return card ? cartaAProducto(card) : null;
  } catch (error) {
    if (error.status === 404 || error.status === 400) return null;
    throw error;
  }
}

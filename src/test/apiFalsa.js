// APIs falsas en memoria para que las pruebas no dependan de la red:
// - json-server (/api/...) con los datos de server/db.seed.json
// - API de Magic (https://api.magicthegathering.io/v1/cards) con un set de cartas de prueba
// Se instalan como mock de window.fetch en setup.js y se reinician antes de cada prueba.
import semilla from '../../server/db.seed.json';
import { MTG_URL, tipoDeCategoria } from '../api/mtg';

let db = structuredClone(semilla);

/** Cartas de la API de Magic simulada: las del inventario + algunas que la tienda no tiene en inventario. */
export const CARTAS_MTG = [
  ...semilla.productos.map((p) => ({
    id: p.id,
    name: p.nombre,
    type: p.tipo,
    types: [tipoDeCategoria(p.categoria)],
    rarity: p.rareza,
    setName: p.edicion,
    text: `Texto de ${p.nombre}.`,
    imageUrl: p.imagen,
  })),
  ...['Dragón de Prueba', 'Dragón Anciano', 'Dragón Bebé'].map((name, i) => ({
    id: `carta-extra-${i + 1}`,
    name,
    type: 'Creature — Dragon',
    types: ['Creature'],
    rarity: 'Rare',
    setName: 'Edición de Prueba',
    text: 'Vuela.',
    imageUrl: '/img/logo.png',
  })),
];

export function reiniciarApi() {
  db = structuredClone(semilla);
}

function responderMtg(url) {
  const { pathname, searchParams } = url;
  const [, , , id] = pathname.split('/'); // /v1/cards/:id
  if (id) {
    const carta = CARTAS_MTG.find((c) => c.id === decodeURIComponent(id));
    return carta ? responder(200, { card: carta }) : responder(404, { error: 'Not Found' });
  }
  const nombre = (searchParams.get('name') || '').toLowerCase();
  const tipo = searchParams.get('types');
  const filtradas = CARTAS_MTG.filter((c) => (!nombre || c.name.toLowerCase().includes(nombre)) && (!tipo || c.types.includes(tipo)));
  const pagina = Number(searchParams.get('page')) || 1;
  const porPagina = Number(searchParams.get('pageSize')) || 100;
  const cards = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);
  return new Response(JSON.stringify({ cards }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Total-Count': String(filtradas.length) },
  });
}

/** Acceso directo a los datos de la API falsa (para preparar o verificar en las pruebas). */
export function datosApi() {
  return db;
}

function responder(status, cuerpo) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const leerCampo = (obj, ruta) => ruta.split('.').reduce((valor, clave) => valor?.[clave], obj);

function cumpleFiltro(item, clave, valor) {
  const [, campo, operador] = clave.match(/^(.+?)(?:_(gte|lte|ne|like))?$/);
  const actual = leerCampo(item, campo);
  switch (operador) {
    case 'gte': return Number(actual) >= Number(valor);
    case 'lte': return Number(actual) <= Number(valor);
    case 'ne': return String(actual) !== valor;
    case 'like': return new RegExp(valor, 'i').test(String(actual));
    default: return String(actual) === valor;
  }
}

function listar(lista, params) {
  let resultado = lista.filter((item) =>
    [...params.entries()].every(([clave, valor]) => {
      if (clave.startsWith('_')) return true;
      if (clave === 'q') return JSON.stringify(item).toLowerCase().includes(valor.toLowerCase());
      return cumpleFiltro(item, clave, valor);
    }),
  );
  const campoOrden = params.get('_sort');
  if (campoOrden) {
    const signo = params.get('_order') === 'desc' ? -1 : 1;
    resultado = [...resultado].sort((a, b) => (a[campoOrden] > b[campoOrden] ? 1 : a[campoOrden] < b[campoOrden] ? -1 : 0) * signo);
  }
  if (params.get('_limit')) resultado = resultado.slice(0, Number(params.get('_limit')));
  return resultado;
}

/** Reemplazo de fetch: atiende /api/<recurso>[/<id>] con GET, POST, PATCH y DELETE. */
export async function fetchFalso(url, opciones = {}) {
  if (url.startsWith(MTG_URL)) return responderMtg(new URL(url));
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  const [, prefijo, recurso, id] = pathname.split('/');
  const metodo = (opciones.method || 'GET').toUpperCase();
  const lista = db[recurso];
  if (prefijo !== 'api' || !lista) return responder(404, {});

  const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;

  if (id === undefined) {
    if (metodo === 'GET') return responder(200, structuredClone(listar(lista, searchParams)));
    if (metodo === 'POST') {
      // Igual que json-server: respeta el id enviado o asigna el siguiente número.
      const siguiente = lista.reduce((max, x) => (Number.isFinite(Number(x.id)) ? Math.max(max, Number(x.id)) : max), 0) + 1;
      const nuevo = { ...cuerpo, id: cuerpo.id ?? siguiente };
      lista.push(nuevo);
      return responder(201, nuevo);
    }
    return responder(405, {});
  }

  const indice = lista.findIndex((x) => String(x.id) === id);
  if (indice === -1) return responder(404, {});
  if (metodo === 'GET') return responder(200, structuredClone(lista[indice]));
  if (metodo === 'PATCH' || metodo === 'PUT') {
    lista[indice] = metodo === 'PUT' ? { ...cuerpo, id: lista[indice].id } : { ...lista[indice], ...cuerpo, id: lista[indice].id };
    return responder(200, lista[indice]);
  }
  if (metodo === 'DELETE') {
    lista.splice(indice, 1);
    return responder(200, {});
  }
  return responder(405, {});
}

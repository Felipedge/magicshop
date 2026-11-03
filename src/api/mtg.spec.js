import { buscarCartas, cartaAProducto, categoriaDeTipos, MTG_URL, obtenerCarta, precioBase, STOCK_INICIAL, tipoDeCategoria } from './mtg';

const CARTA = {
  id: 'abc-123',
  name: 'Serra Angel',
  type: 'Creature — Angel',
  types: ['Creature'],
  rarity: 'Uncommon',
  setName: 'Tenth Edition',
  text: 'Flying, vigilance',
  imageUrl: 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=1&type=card',
};

describe('API de Magic (api.magicthegathering.io)', () => {
  it('buscarCartas pide solo cartas con imagen, con nombre, tipo y página', async () => {
    await buscarCartas({ nombre: 'dragón', tipo: 'Creature', pagina: 2, porPagina: 12 });
    const url = new URL(window.fetch.calls.mostRecent().args[0]);
    expect(url.origin + url.pathname).toBe(`${MTG_URL}/cards`);
    expect(Object.fromEntries(url.searchParams)).toEqual({ page: '2', pageSize: '12', contains: 'imageUrl', name: 'dragón', types: 'Creature' });
  });

  it('buscarCartas devuelve productos y el total del header Total-Count', async () => {
    const { cartas, total } = await buscarCartas({ nombre: 'dragón', porPagina: 2 });
    expect(total).toBe(3);
    expect(cartas.length).toBe(2);
    expect(cartas[0].stock).toBe(STOCK_INICIAL);
  });

  it('obtenerCarta devuelve el producto, o null si la API responde 404', async () => {
    expect((await obtenerCarta('carta-extra-1')).nombre).toBe('Dragón de Prueba');
    expect(await obtenerCarta('no-existe')).toBeNull();
  });

  it('informa un error claro si no hay conexión con la API de Magic (mock de fetch)', async () => {
    window.fetch.and.returnValue(Promise.reject(new TypeError('Failed to fetch')));
    await expectAsync(buscarCartas()).toBeRejectedWithError(/API de Magic/);
  });

  it('cartaAProducto adapta la carta al formato de la tienda (imagen por https)', () => {
    const producto = cartaAProducto(CARTA);
    expect(producto).toEqual(jasmine.objectContaining({ id: 'abc-123', nombre: 'Serra Angel', categoria: 'criaturas', rareza: 'Uncommon', oferta: 0 }));
    expect(producto.imagen.startsWith('https://')).toBeTrue();
  });

  it('precioBase depende de la rareza y siempre da el mismo valor para la misma carta', () => {
    expect(precioBase(CARTA)).toBe(precioBase({ ...CARTA }));
    expect(precioBase({ ...CARTA, rarity: 'Mythic Rare' })).toBeGreaterThan(precioBase({ ...CARTA, rarity: 'Common' }));
  });

  it('traduce tipos de la API a categorías y viceversa', () => {
    expect(categoriaDeTipos(['Artifact', 'Creature'])).toBe('criaturas'); // prioridad a Creature
    expect(categoriaDeTipos(['Land'])).toBe('tierras');
    expect(categoriaDeTipos(['Tribal'])).toBe('otros');
    expect(tipoDeCategoria('instantaneos')).toBe('Instant');
  });
});

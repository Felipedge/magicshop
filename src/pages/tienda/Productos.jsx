import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid';
import Paginador from '../../components/Paginador';
import SearchBar from '../../components/SearchBar';
import EstadoCarga from '../../components/EstadoCarga';
import AvisoCarrito, { useAgregarAlCarrito } from '../../components/AvisoCarrito';
import { categoriasApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { useCatalogo } from '../../api/catalogo';
import { precioFinal } from '../../utils/formato';

export const POR_PAGINA = 12;

/** Ordena y filtra por stock las cartas de la página actual (función pura, fácil de probar). */
export function filtrarProductos(productos, { orden = 'relevancia', soloStock = false }) {
  const lista = productos.filter((p) => !soloStock || p.stock > 0);
  const comparadores = {
    'precio-asc': (a, b) => precioFinal(a) - precioFinal(b),
    'precio-desc': (a, b) => precioFinal(b) - precioFinal(a),
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  };
  return comparadores[orden] ? [...lista].sort(comparadores[orden]) : lista;
}

export default function Productos() {
  const [params, setParams] = useSearchParams();
  const texto = params.get('q') || '';
  const tipo = params.get('tipo') || '';
  const pagina = Number(params.get('pagina')) || 1;

  const { datos: categorias } = useColeccion(categoriasApi);
  // GET https://api.magicthegathering.io/v1/cards?name=&types=&page=&pageSize=
  const { productos, total, cargando, error } = useCatalogo({ nombre: texto, tipo, pagina, porPagina: POR_PAGINA });
  const [orden, setOrden] = useState('relevancia');
  const [soloStock, setSoloStock] = useState(false);
  const [agregar, aviso] = useAgregarAlCarrito();

  /** Los filtros viven en la URL (?q=&tipo=&pagina=) para poder compartir o volver atrás. */
  function cambiarFiltros(cambios) {
    // Cambiar búsqueda o categoría vuelve a la página 1.
    const siguiente = { q: texto, tipo, pagina: 1, ...cambios };
    const limpios = {};
    for (const [clave, valor] of Object.entries(siguiente)) {
      if (valor && !(clave === 'pagina' && valor === 1)) limpios[clave] = String(valor);
    }
    setParams(limpios);
    window.scrollTo(0, 0);
  }

  const visibles = filtrarProductos(productos, { orden, soloStock });
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <main className="container my-4">
      <AvisoCarrito aviso={aviso} />
      <h1 className="h2 mb-3">{texto ? `Resultados para "${texto}"` : 'Productos'}</h1>

      <div className="row g-2 mb-4 filtros align-items-end">
        <div className="col-12 col-md-5">
          <span className="form-label small d-block">Buscar por nombre</span>
          <SearchBar key={texto} valorInicial={texto} onBuscar={(valor) => cambiarFiltros({ q: valor })} />
        </div>
        <div className="col-6 col-md-3">
          <label htmlFor="filtroCategoria" className="form-label small">Categoría</label>
          <select id="filtroCategoria" className="form-select" value={tipo} onChange={(e) => cambiarFiltros({ tipo: e.target.value })}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.tipoApi}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="filtroOrden" className="form-label small">Ordenar página</label>
          <select id="filtroOrden" className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </div>
        <div className="col-12 col-md-2">
          <div className="form-check mb-2">
            <input id="filtroStock" className="form-check-input" type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} />
            <label htmlFor="filtroStock" className="form-check-label small">Solo con stock</label>
          </div>
        </div>
      </div>

      <EstadoCarga cargando={cargando} error={error}>
        <p className="text-muted small">{total.toLocaleString('es-CL')} carta(s) encontradas</p>
        <ProductGrid productos={visibles} onAgregar={agregar} />
        <Paginador pagina={pagina} totalPaginas={totalPaginas} onCambiar={(p) => cambiarFiltros({ pagina: p })} />
      </EstadoCarga>
    </main>
  );
}

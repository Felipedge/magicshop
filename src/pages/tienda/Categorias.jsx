import { Link, useParams, useSearchParams } from 'react-router-dom';
import CategoryCard from '../../components/CategoryCard';
import ProductGrid from '../../components/ProductGrid';
import Paginador from '../../components/Paginador';
import EstadoCarga from '../../components/EstadoCarga';
import AvisoCarrito, { useAgregarAlCarrito } from '../../components/AvisoCarrito';
import { categoriasApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { useCatalogo } from '../../api/catalogo';

const POR_PAGINA = 12;

/** Vista de categorías. Con /categorias/:slug muestra las cartas de ese tipo desde la API de Magic. */
export default function Categorias() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const pagina = Number(params.get('pagina')) || 1;
  const categorias = useColeccion(categoriasApi); // json-server
  const seleccionada = categorias.datos.find((c) => c.slug === slug);
  // GET api.magicthegathering.io/v1/cards?types=<tipo de la categoría>
  const cartas = useCatalogo(seleccionada ? { tipo: seleccionada.tipoApi, pagina, porPagina: POR_PAGINA } : null);
  const [agregar, aviso] = useAgregarAlCarrito();

  function cambiarPagina(nueva) {
    setParams(nueva > 1 ? { pagina: String(nueva) } : {});
    window.scrollTo(0, 0);
  }

  return (
    <main className="container my-4">
      <AvisoCarrito aviso={aviso} />
      <EstadoCarga cargando={categorias.cargando} error={categorias.error}>
        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3 mb-4 justify-content-center">
          {categorias.datos.map((c) => (
            <div className="col" key={c.id}>
              <CategoryCard categoria={c} activa={c.slug === slug} />
            </div>
          ))}
        </div>

        {slug && !seleccionada && (
          <div className="text-center my-5">
            <p>La categoría no existe.</p>
            <Link to="/categorias" className="btn btn-primary">Ver categorías</Link>
          </div>
        )}

        {seleccionada && (
          <>
            <h1 className="h3">{seleccionada.nombre}</h1>
            <p className="text-muted">{seleccionada.descripcion}</p>
            <EstadoCarga cargando={cartas.cargando} error={cartas.error}>
              <ProductGrid productos={cartas.productos} onAgregar={agregar} mensajeVacio="No hay cartas en esta categoría." />
              <Paginador pagina={pagina} totalPaginas={Math.ceil(cartas.total / POR_PAGINA)} onCambiar={cambiarPagina} />
            </EstadoCarga>
          </>
        )}

        {!slug && <p className="text-center text-muted">Selecciona una categoría para ver sus cartas.</p>}
      </EstadoCarga>
    </main>
  );
}

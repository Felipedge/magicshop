import { Link } from 'react-router-dom';
import Carrusel from '../../components/Carrusel';
import CategoryCard from '../../components/CategoryCard';
import ProductGrid from '../../components/ProductGrid';
import EstadoCarga from '../../components/EstadoCarga';
import AvisoCarrito, { useAgregarAlCarrito } from '../../components/AvisoCarrito';
import { categoriasApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { useCatalogo } from '../../api/catalogo';

const SLIDES = [
  { imagen: '/img/imagen3.jpeg', titulo: 'Nuevos lanzamientos', texto: 'Descubre las últimas cartas disponibles en nuestra tienda.' },
  { imagen: '/img/imagen1.jpg', titulo: 'Ofertas de la semana', texto: 'Hasta 35% de descuento en cartas seleccionadas.' },
  { imagen: '/img/imagen2.jpg', titulo: 'Arma tu mazo', texto: 'Criaturas, hechizos, artefactos y tierras.' },
];

const DESTACADOS = { pagina: 1, porPagina: 8 };

export default function Home() {
  const categorias = useColeccion(categoriasApi); // json-server
  const destacados = useCatalogo(DESTACADOS); // API de Magic + inventario
  const [agregar, aviso] = useAgregarAlCarrito();

  return (
    <>
      <Carrusel slides={SLIDES} />
      <AvisoCarrito aviso={aviso} />

      <section className="container my-5">
        <h2 className="text-center mb-4">Categorías</h2>
        <EstadoCarga cargando={categorias.cargando} error={categorias.error}>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3 justify-content-center">
            {categorias.datos.map((c) => (
              <div className="col" key={c.id}>
                <CategoryCard categoria={c} />
              </div>
            ))}
          </div>
        </EstadoCarga>
      </section>

      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Cartas destacadas</h2>
          <Link to="/productos" className="btn btn-outline-primary btn-sm">Ver todas</Link>
        </div>
        <EstadoCarga cargando={destacados.cargando} error={destacados.error}>
          <ProductGrid productos={destacados.productos} onAgregar={agregar} />
        </EstadoCarga>
      </section>

      <section className="container my-5">
        <h2 className="mb-3">¿Cómo comprar en Magic-Shop?</h2>
        <div className="ratio ratio-16x9 video-home">
          <iframe src="https://www.youtube.com/embed/WUzG8tRX0x4" title="Cómo comprar en Magic-Shop" allowFullScreen />
        </div>
      </section>
    </>
  );
}

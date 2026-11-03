import { Link } from 'react-router-dom';

/** Acceso a una categoría (la imagen viene definida en la categoría). */
export default function CategoryCard({ categoria, activa = false }) {
  return (
    <Link to={`/categorias/${categoria.slug}`} className="text-decoration-none">
      <article className={`card h-100 text-center categoria-card ${activa ? 'border-primary' : ''}`}>
        {categoria.imagen && <img src={categoria.imagen} alt={categoria.nombre} className="card-img-top categoria-img" loading="lazy" />}
        <div className="card-body py-2">
          <h6 className="card-title mb-0">{categoria.nombre}</h6>
        </div>
      </article>
    </Link>
  );
}

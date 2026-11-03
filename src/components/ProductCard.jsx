import { Link } from 'react-router-dom';
import { formatoCLP, precioFinal } from '../utils/formato';

/** Tarjeta de un producto. Recibe el producto y la acción de agregar al carrito por props. */
export default function ProductCard({ producto, onAgregar }) {
  const sinStock = producto.stock <= 0;
  const enOferta = producto.oferta > 0;

  return (
    <article className="card h-100 producto-card">
      {enOferta && <span className="badge bg-danger position-absolute m-2 badge-oferta">-{producto.oferta}%</span>}
      <Link to={`/productos/${producto.id}`}>
        <img src={producto.imagen} className="card-img-top" alt={producto.nombre} loading="lazy" />
      </Link>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{producto.nombre}</h5>
        <p className="card-text text-muted small mb-1">{producto.tipo}</p>
        <p className="card-text mb-1">
          {enOferta && <del className="text-muted small me-2">{formatoCLP(producto.precio)}</del>}
          <span className="fw-bold precio">{formatoCLP(precioFinal(producto))}</span>
        </p>
        <p className="card-text small mb-2">
          {sinStock ? <span className="text-danger">Sin stock</span> : <span className="text-muted">Stock: {producto.stock}</span>}
        </p>
        <div className="mt-auto d-flex gap-2">
          <Link className="btn btn-outline-secondary btn-sm flex-fill" to={`/productos/${producto.id}`}>
            Detalle
          </Link>
          <button className="btn btn-outline-primary btn-sm flex-fill" type="button" disabled={sinStock} onClick={() => onAgregar(producto)}>
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}

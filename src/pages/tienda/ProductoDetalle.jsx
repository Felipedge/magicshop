import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid';
import EstadoCarga from '../../components/EstadoCarga';
import AvisoCarrito, { useAgregarAlCarrito } from '../../components/AvisoCarrito';
import { useCatalogo, useProducto } from '../../api/catalogo';
import { tipoDeCategoria } from '../../api/mtg';
import { formatoCLP, precioFinal } from '../../utils/formato';

export default function ProductoDetalle() {
  const { id } = useParams();
  // GET api.magicthegathering.io/v1/cards/:id  +  GET /api/productos/:id (precio y stock)
  const { datos: producto, cargando, error } = useProducto(id);
  // Relacionados: cartas del mismo tipo
  const tipo = producto ? (producto.tiposApi?.[0] ?? tipoDeCategoria(producto.categoria)) : null;
  const relacionados = useCatalogo(tipo ? { tipo, pagina: 1, porPagina: 5 } : null);
  const [cantidad, setCantidad] = useState(1);
  const [agregar, aviso] = useAgregarAlCarrito();

  if (cargando || error) return <main className="container"><EstadoCarga cargando={cargando} error={error} /></main>;

  if (!producto) {
    return (
      <main className="container my-5 text-center">
        <h1 className="h3">Producto no encontrado</h1>
        <Link to="/productos" className="btn btn-primary mt-3">Volver a productos</Link>
      </main>
    );
  }

  const otros = relacionados.productos.filter((p) => p.id !== producto.id).slice(0, 4);
  const sinStock = producto.stock <= 0;

  return (
    <main className="container my-4">
      <AvisoCarrito aviso={aviso} />
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to={`/categorias/${producto.categoria}`}>{producto.categoria}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-12 col-md-5 col-lg-4 text-center">
          <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded detalle-img" />
        </div>
        <div className="col-12 col-md-7 col-lg-8">
          <h1 className="h2">{producto.nombre}</h1>
          <p className="text-muted mb-1">{producto.tipo}</p>
          <p className="mb-1"><strong>Edición:</strong> {producto.edicion}</p>
          <p className="mb-3"><strong>Rareza:</strong> {producto.rareza}</p>
          <p className="fs-3 mb-1">
            {producto.oferta > 0 && <del className="text-muted fs-6 me-2">{formatoCLP(producto.precio)}</del>}
            <span className="fw-bold precio">{formatoCLP(precioFinal(producto))}</span>
            {producto.oferta > 0 && <span className="badge bg-danger ms-2 fs-6">-{producto.oferta}%</span>}
          </p>
          <p className={sinStock ? 'text-danger' : 'text-muted'}>{sinStock ? 'Sin stock' : `Stock disponible: ${producto.stock}`}</p>
          {producto.texto && <p className="texto-carta">{producto.texto}</p>}

          <div className="d-flex gap-2 align-items-center" style={{ maxWidth: 320 }}>
            <label htmlFor="cantidad" className="visually-hidden">Cantidad</label>
            <input
              id="cantidad"
              type="number"
              className="form-control"
              min={1}
              max={producto.stock}
              value={cantidad}
              disabled={sinStock}
              onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, Number(e.target.value) || 1)))}
            />
            <button type="button" className="btn btn-primary text-nowrap" disabled={sinStock} onClick={() => agregar(producto, cantidad)}>
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>

      {otros.length > 0 && (
        <section className="mt-5">
          <h2 className="h4 mb-3">Productos relacionados</h2>
          <ProductGrid productos={otros} onAgregar={agregar} />
        </section>
      )}
    </main>
  );
}

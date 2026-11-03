import ProductCard from './ProductCard';

/** Grilla responsiva de productos: 1 columna en móvil, 2 en tablet, 3-4 en escritorio. */
export default function ProductGrid({ productos, onAgregar, mensajeVacio = 'No se encontraron productos.' }) {
  if (!productos.length) return <p className="text-muted text-center my-4">{mensajeVacio}</p>;
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
      {productos.map((p) => (
        <div className="col" key={p.id}>
          <ProductCard producto={p} onAgregar={onAgregar} />
        </div>
      ))}
    </div>
  );
}

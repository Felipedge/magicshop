import ProductGrid from '../../components/ProductGrid';
import EstadoCarga from '../../components/EstadoCarga';
import AvisoCarrito, { useAgregarAlCarrito } from '../../components/AvisoCarrito';
import { productosApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';

// Las ofertas las define la tienda en su inventario de json-server:
// GET /productos?oferta_gte=1&eliminado_ne=true&_sort=oferta&_order=desc
const FILTRO_OFERTAS = { oferta_gte: 1, eliminado_ne: true, _sort: 'oferta', _order: 'desc' };

export default function Ofertas() {
  const { datos, cargando, error } = useColeccion(productosApi, FILTRO_OFERTAS);
  const [agregar, aviso] = useAgregarAlCarrito();

  return (
    <main className="container my-4">
      <AvisoCarrito aviso={aviso} />
      <h1 className="h2">Ofertas</h1>
      <p className="text-muted">Cartas con descuento por tiempo limitado.</p>
      <EstadoCarga cargando={cargando} error={error}>
        <ProductGrid productos={datos} onAgregar={agregar} mensajeVacio="No hay ofertas vigentes en este momento." />
      </EstadoCarga>
    </main>
  );
}

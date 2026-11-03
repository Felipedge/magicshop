import EstadoCarga from '../../components/EstadoCarga';
import { categoriasApi, ordenesApi, productosApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { formatoCLP } from '../../utils/formato';

/** Calcula los indicadores del reporte (función pura, probada en Reportes.spec). */
export function calcularReporte(ordenes, productos, categorias) {
  const pagadas = ordenes.filter((o) => o.estado === 'pagada');
  const unidades = {};
  const nombres = {};
  for (const o of pagadas) {
    for (const i of o.items) {
      unidades[i.id] = (unidades[i.id] || 0) + i.cantidad;
      nombres[i.id] = i.nombre;
    }
  }

  // La categoría de cada ítem se guarda en la orden (las cartas pueden no estar en el inventario).
  const categoriaDe = (item) => item.categoria ?? productos.find((p) => p.id === item.id)?.categoria;
  const porCategoria = categorias.map((c) => ({
    nombre: c.nombre,
    total: pagadas.reduce((s, o) => s + o.items.filter((i) => categoriaDe(i) === c.slug).reduce((t, i) => t + i.subtotal, 0), 0),
  }));

  const masVendidos = Object.entries(unidades)
    .map(([id, cantidad]) => ({ nombre: nombres[id] ?? `#${id}`, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return {
    totalVentas: pagadas.reduce((s, o) => s + o.total, 0),
    ordenesPagadas: pagadas.length,
    ordenesRechazadas: ordenes.length - pagadas.length,
    ticketPromedio: pagadas.length ? Math.round(pagadas.reduce((s, o) => s + o.total, 0) / pagadas.length) : 0,
    valorInventario: productos.filter((p) => !p.eliminado).reduce((s, p) => s + p.precio * p.stock, 0),
    porCategoria,
    masVendidos,
  };
}

export default function Reportes() {
  const ordenes = useColeccion(ordenesApi);
  const productos = useColeccion(productosApi);
  const categorias = useColeccion(categoriasApi);
  const cargando = ordenes.cargando || productos.cargando || categorias.cargando;
  const error = ordenes.error || productos.error || categorias.error;
  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;

  const r = calcularReporte(ordenes.datos, productos.datos, categorias.datos);
  const maxCategoria = Math.max(1, ...r.porCategoria.map((c) => c.total));

  const kpis = [
    ['Ventas totales', formatoCLP(r.totalVentas)],
    ['Órdenes pagadas', r.ordenesPagadas],
    ['Órdenes rechazadas', r.ordenesRechazadas],
    ['Ticket promedio', formatoCLP(r.ticketPromedio)],
    ['Inventario valorizado', formatoCLP(r.valorInventario)],
  ];

  return (
    <>
      <h1 className="h3 mb-3">Reportes</h1>
      <div className="row row-cols-2 row-cols-md-3 row-cols-xl-5 g-3 mb-4">
        {kpis.map(([t, v]) => (
          <div className="col" key={t}>
            <div className="card h-100"><div className="card-body"><div className="small text-muted">{t}</div><div className="fs-5 fw-bold">{v}</div></div></div>
          </div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card p-3 h-100">
            <h2 className="h5">Ventas por categoría</h2>
            {r.porCategoria.map((c) => (
              <div key={c.nombre} className="mb-2">
                <div className="d-flex justify-content-between small"><span>{c.nombre}</span><span>{formatoCLP(c.total)}</span></div>
                <div className="progress" role="progressbar" aria-label={c.nombre} aria-valuenow={c.total} aria-valuemin={0} aria-valuemax={maxCategoria}>
                  <div className="progress-bar" style={{ width: `${(c.total / maxCategoria) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card p-3 h-100">
            <h2 className="h5">Más vendidos</h2>
            {r.masVendidos.length ? (
              <ol className="mb-0">{r.masVendidos.map((p) => <li key={p.nombre}>{p.nombre} — {p.cantidad} u.</li>)}</ol>
            ) : (
              <p className="text-muted mb-0">Aún no hay ventas.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

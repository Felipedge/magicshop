/** Tarjeta de métrica del dashboard. */
export default function StatCard({ titulo, valor, detalle, color = 'primary', icono }) {
  return (
    <div className={`card text-bg-${color} stat-card h-100`}>
      <div className="card-body d-flex align-items-center gap-3">
        {icono && <span className="fs-1" aria-hidden="true">{icono}</span>}
        <div>
          <div className="small">{titulo}</div>
          <div className="fs-3 fw-bold" data-testid="stat-valor">{valor}</div>
          {detalle && <div className="small opacity-75">{detalle}</div>}
        </div>
      </div>
    </div>
  );
}

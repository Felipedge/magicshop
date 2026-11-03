/** Paginador Anterior / Página X de Y / Siguiente. */
export default function Paginador({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="mt-4" aria-label="Paginación">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${pagina <= 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 1}>
            Anterior
          </button>
        </li>
        <li className="page-item disabled">
          <span className="page-link" data-testid="pagina-actual">
            Página {pagina} de {totalPaginas.toLocaleString('es-CL')}
          </span>
        </li>
        <li className={`page-item ${pagina >= totalPaginas ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina + 1)} disabled={pagina >= totalPaginas}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
}

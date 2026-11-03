/**
 * Muestra un spinner mientras carga o un mensaje si la API falló.
 * Si no está cargando ni hay error, renderiza a sus hijos.
 */
export default function EstadoCarga({ cargando, error, children }) {
  if (error) {
    return (
      <div className="alert alert-danger my-3" role="alert">
        {error}
      </div>
    );
  }
  if (cargando) {
    return (
      <div className="text-center my-5" role="status">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <p className="text-muted small mt-2 mb-0">Cargando...</p>
      </div>
    );
  }
  return children;
}

/** Mensaje de alerta. Renderizado condicional: si no hay mensaje no muestra nada. */
export default function Alerta({ mensaje, tipo = 'danger', onCerrar }) {
  if (!mensaje) return null;
  return (
    <div className={`alert alert-${tipo} d-flex justify-content-between align-items-start py-2`} role="alert">
      <span>{mensaje}</span>
      {onCerrar && <button type="button" className="btn-close btn-sm ms-2" aria-label="Cerrar" onClick={onCerrar} />}
    </div>
  );
}

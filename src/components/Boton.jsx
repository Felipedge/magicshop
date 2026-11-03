/** Botón Bootstrap reutilizable: recibe la etiqueta y la función onClick por props. */
export default function Boton({ etiqueta, onClick, variante = 'primary', tipo = 'button', deshabilitado = false, className = '', ...resto }) {
  return (
    <button type={tipo} className={`btn btn-${variante} ${className}`.trim()} onClick={onClick} disabled={deshabilitado} {...resto}>
      {etiqueta}
    </button>
  );
}

/**
 * Campo de formulario controlado con etiqueta y mensaje de error (validación Bootstrap).
 * `como` puede ser 'input' (por defecto), 'select' o 'textarea'.
 */
export default function CampoFormulario({ id, etiqueta, error, como = 'input', opciones = [], obligatorio = false, className = '', ...props }) {
  const clase = `${como === 'select' ? 'form-select' : 'form-control'} ${error ? 'is-invalid' : ''}`.trim();
  let control;
  if (como === 'select') {
    control = (
      <select id={id} name={id} className={clase} {...props}>
        {opciones.map((op) => {
          const valor = typeof op === 'string' ? op : op.valor;
          const texto = typeof op === 'string' ? op : op.texto;
          return (
            <option key={valor} value={valor}>
              {texto}
            </option>
          );
        })}
      </select>
    );
  } else if (como === 'textarea') {
    control = <textarea id={id} name={id} className={clase} rows={3} {...props} />;
  } else {
    control = <input id={id} name={id} className={clase} {...props} />;
  }

  return (
    <div className={`mb-3 ${className}`.trim()}>
      <label htmlFor={id} className="form-label">
        {etiqueta}
        {obligatorio && <span className="text-danger">*</span>}
      </label>
      {control}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

import { useState } from 'react';
import CampoFormulario from '../CampoFormulario';
import { formatoCLP, precioFinal } from '../../utils/formato';
import { validarFormulario, validarNumero } from '../../utils/validaciones';

export const REGLAS_PRODUCTO = {
  precio: (v) => validarNumero(v, 'El precio', { min: 1 }),
  stock: (v) => validarNumero(v, 'El stock', { min: 0 }),
  oferta: (v) => validarNumero(v, 'El descuento', { min: 0 }) || (Number(v) > 90 ? 'El descuento no puede superar 90%.' : ''),
};

/**
 * Formulario de inventario de una carta: precio, stock y % de oferta.
 * Los datos de la carta (nombre, tipo, imagen) vienen de la API de Magic y no se editan aquí.
 */
export default function ProductoForm({ producto, onSubmit, onCancelar, textoBoton = 'Guardar' }) {
  const [valores, setValores] = useState({ precio: producto.precio ?? '', stock: producto.stock ?? '', oferta: producto.oferta ?? 0 });
  const [errores, setErrores] = useState({});

  function cambiar(e) {
    setValores({ ...valores, [e.target.name]: e.target.value });
  }

  function enviar(e) {
    e.preventDefault();
    const encontrados = validarFormulario(valores, REGLAS_PRODUCTO);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    onSubmit({ precio: Number(valores.precio), stock: Number(valores.stock), oferta: Number(valores.oferta) });
  }

  const vistaPrevia = Object.keys(validarFormulario(valores, REGLAS_PRODUCTO)).length
    ? null
    : precioFinal({ precio: Number(valores.precio), oferta: Number(valores.oferta) });

  return (
    <form onSubmit={enviar} noValidate>
      <div className="d-flex gap-3 align-items-start mb-3">
        {producto.imagen && <img src={producto.imagen} alt={producto.nombre} className="rounded" style={{ width: 90 }} />}
        <div>
          <h2 className="h5 mb-1">{producto.nombre}</h2>
          <p className="text-muted small mb-0">{producto.tipo} · {producto.rareza} · {producto.edicion}</p>
        </div>
      </div>
      <div className="row">
        <CampoFormulario className="col-md-4" id="precio" type="number" min="1" etiqueta="Precio (CLP)" obligatorio value={valores.precio} onChange={cambiar} error={errores.precio} />
        <CampoFormulario className="col-md-4" id="stock" type="number" min="0" etiqueta="Stock" obligatorio value={valores.stock} onChange={cambiar} error={errores.stock} />
        <CampoFormulario className="col-md-4" id="oferta" type="number" min="0" max="90" etiqueta="Descuento (%)" value={valores.oferta} onChange={cambiar} error={errores.oferta} />
      </div>
      {vistaPrevia !== null && <p className="small text-muted">Precio final en la tienda: <strong>{formatoCLP(vistaPrevia)}</strong></p>}
      <div className="d-flex gap-2 justify-content-end">
        {onCancelar && <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="btn btn-success">{textoBoton}</button>
      </div>
    </form>
  );
}

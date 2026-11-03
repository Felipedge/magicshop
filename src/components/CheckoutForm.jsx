import { useState } from 'react';
import CampoFormulario from './CampoFormulario';
import { REGIONES } from '../data/regiones';
import { formatoCLP } from '../utils/formato';
import { requerido, validarEmail, validarFormulario } from '../utils/validaciones';

const REGLAS = {
  nombre: (v) => requerido(v, 'El nombre'),
  apellidos: (v) => requerido(v, 'Los apellidos'),
  email: validarEmail,
  calle: (v) => requerido(v, 'La calle'),
  region: (v) => requerido(v, 'La región'),
  comuna: (v) => requerido(v, 'La comuna'),
};

const VACIO = { nombre: '', apellidos: '', email: '', calle: '', departamento: '', region: '', comuna: '', indicaciones: '' };

/**
 * Formulario de datos del cliente y despacho.
 * `inicial` permite autocompletar con los datos del usuario conectado.
 */
export default function CheckoutForm({ inicial = {}, total, onSubmit }) {
  const [valores, setValores] = useState({ ...VACIO, ...inicial });
  const [errores, setErrores] = useState({});
  const [simularRechazo, setSimularRechazo] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }));
  }

  function enviar(e) {
    e.preventDefault();
    const encontrados = validarFormulario(valores, REGLAS);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    onSubmit(valores, { simularRechazo });
  }

  const regiones = [{ valor: '', texto: 'Selecciona una región' }, ...Object.keys(REGIONES)];
  const comunas = [{ valor: '', texto: 'Selecciona una comuna' }, ...(REGIONES[valores.region] || [])];

  return (
    <form onSubmit={enviar} noValidate>
      <h5 className="mt-4">Información del cliente</h5>
      <p className="text-muted small">Completa la siguiente información</p>
      <div className="row">
        <CampoFormulario className="col-md-6" id="nombre" etiqueta="Nombre" obligatorio value={valores.nombre} onChange={cambiar} error={errores.nombre} />
        <CampoFormulario className="col-md-6" id="apellidos" etiqueta="Apellidos" obligatorio value={valores.apellidos} onChange={cambiar} error={errores.apellidos} />
        <CampoFormulario className="col-md-6" id="email" type="email" etiqueta="Correo" obligatorio value={valores.email} onChange={cambiar} error={errores.email} />
      </div>

      <h5 className="mt-2">Dirección de entrega de los productos</h5>
      <p className="text-muted small">Ingrese dirección de forma detallada</p>
      <div className="row">
        <CampoFormulario className="col-md-6" id="calle" etiqueta="Calle" obligatorio value={valores.calle} onChange={cambiar} error={errores.calle} />
        <CampoFormulario className="col-md-6" id="departamento" etiqueta="Departamento (opcional)" placeholder="Ej: 603" value={valores.departamento} onChange={cambiar} />
        <CampoFormulario className="col-md-6" id="region" como="select" etiqueta="Región" obligatorio opciones={regiones} value={valores.region} onChange={cambiar} error={errores.region} />
        <CampoFormulario className="col-md-6" id="comuna" como="select" etiqueta="Comuna" obligatorio opciones={comunas} value={valores.comuna} onChange={cambiar} error={errores.comuna} disabled={!valores.region} />
        <CampoFormulario className="col-12" id="indicaciones" como="textarea" etiqueta="Indicaciones para la entrega (opcional)" placeholder="Ej.: Entre calles, color del edificio, no tiene timbre." value={valores.indicaciones} onChange={cambiar} />
      </div>

      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="simularRechazo" checked={simularRechazo} onChange={(e) => setSimularRechazo(e.target.checked)} />
        <label className="form-check-label small text-muted" htmlFor="simularRechazo">
          Simular pago rechazado (demostración)
        </label>
      </div>

      <div className="text-end">
        <button type="submit" className="btn btn-success">
          Pagar ahora {formatoCLP(total)}
        </button>
      </div>
    </form>
  );
}

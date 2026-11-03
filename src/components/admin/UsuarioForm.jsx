import { useState } from 'react';
import CampoFormulario from '../CampoFormulario';
import { REGIONES } from '../../data/regiones';
import { requerido, validarEmail, validarFormulario, validarPassword, validarRun } from '../../utils/validaciones';

const VACIO = { run: '', nombre: '', apellidos: '', email: '', password: '', rol: 'cliente', region: '', comuna: '', direccion: '' };

/**
 * Formulario de usuario (admin y perfil).
 * `mostrarRol` permite ocultar el selector de rol en la vista de perfil.
 * `emailsOcupados` se usa para validar que el correo no se repita.
 */
export default function UsuarioForm({ inicial, onSubmit, onCancelar, mostrarRol = true, emailsOcupados = [], textoBoton = 'Guardar' }) {
  const [valores, setValores] = useState({ ...VACIO, ...inicial });
  const [errores, setErrores] = useState({});

  const reglas = {
    run: validarRun,
    nombre: (v) => requerido(v, 'El nombre'),
    apellidos: (v) => requerido(v, 'Los apellidos'),
    email: (v) => validarEmail(v) || (emailsOcupados.includes(v.trim().toLowerCase()) ? 'Ese correo ya está registrado.' : ''),
    password: validarPassword,
    region: (v) => requerido(v, 'La región'),
    comuna: (v) => requerido(v, 'La comuna'),
    direccion: (v) => requerido(v, 'La dirección'),
  };

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
  }

  function enviar(e) {
    e.preventDefault();
    const encontrados = validarFormulario(valores, reglas);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    onSubmit({ ...valores, email: valores.email.trim() });
  }

  const regiones = [{ valor: '', texto: 'Selecciona una región' }, ...Object.keys(REGIONES)];
  const comunas = [{ valor: '', texto: 'Selecciona una comuna' }, ...(REGIONES[valores.region] || [])];

  return (
    <form onSubmit={enviar} noValidate>
      <div className="row">
        <CampoFormulario className="col-md-6" id="run" etiqueta="RUN" placeholder="12345678-5" obligatorio value={valores.run} onChange={cambiar} error={errores.run} />
        <CampoFormulario className="col-md-6" id="email" type="email" etiqueta="Correo" obligatorio value={valores.email} onChange={cambiar} error={errores.email} />
        <CampoFormulario className="col-md-6" id="nombre" etiqueta="Nombre" obligatorio value={valores.nombre} onChange={cambiar} error={errores.nombre} />
        <CampoFormulario className="col-md-6" id="apellidos" etiqueta="Apellidos" obligatorio value={valores.apellidos} onChange={cambiar} error={errores.apellidos} />
        <CampoFormulario className="col-md-6" id="password" type="password" etiqueta="Contraseña" obligatorio value={valores.password} onChange={cambiar} error={errores.password} />
        {mostrarRol && (
          <CampoFormulario
            className="col-md-6"
            id="rol"
            como="select"
            etiqueta="Rol"
            opciones={[{ valor: 'cliente', texto: 'Cliente' }, { valor: 'admin', texto: 'Administrador' }]}
            value={valores.rol}
            onChange={cambiar}
          />
        )}
        <CampoFormulario className="col-md-6" id="region" como="select" etiqueta="Región" obligatorio opciones={regiones} value={valores.region} onChange={cambiar} error={errores.region} />
        <CampoFormulario className="col-md-6" id="comuna" como="select" etiqueta="Comuna" obligatorio opciones={comunas} value={valores.comuna} onChange={cambiar} error={errores.comuna} disabled={!valores.region} />
        <CampoFormulario className="col-12" id="direccion" etiqueta="Dirección" obligatorio value={valores.direccion} onChange={cambiar} error={errores.direccion} />
      </div>
      <div className="d-flex gap-2 justify-content-end">
        {onCancelar && <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="btn btn-success">{textoBoton}</button>
      </div>
    </form>
  );
}

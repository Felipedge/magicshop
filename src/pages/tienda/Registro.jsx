import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario';
import Alerta from '../../components/Alerta';
import { useAuth } from '../../context/AuthContext';
import { REGIONES } from '../../data/regiones';
import { requerido, validarEmail, validarFormulario, validarPassword, validarRun } from '../../utils/validaciones';

export const REGLAS_REGISTRO = {
  run: validarRun,
  nombre: (v) => requerido(v, 'El nombre'),
  apellidos: (v) => requerido(v, 'Los apellidos'),
  email: validarEmail,
  password: validarPassword,
  confirmar: (v, todos) => (v !== todos.password ? 'Las contraseñas no coinciden.' : ''),
  region: (v) => requerido(v, 'La región'),
  comuna: (v) => requerido(v, 'La comuna'),
  direccion: (v) => requerido(v, 'La dirección'),
};

const VACIO = { run: '', nombre: '', apellidos: '', email: '', password: '', confirmar: '', region: '', comuna: '', direccion: '' };

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const encontrados = validarFormulario(valores, REGLAS_REGISTRO);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmar, ...datos } = valores;
      await registrar(datos); // POST /usuarios
      navigate('/');
    } catch (err) {
      setErrorGeneral(err.message);
    }
  }

  const regiones = [{ valor: '', texto: 'Selecciona una región' }, ...Object.keys(REGIONES)];
  const comunas = [{ valor: '', texto: 'Selecciona una comuna' }, ...(REGIONES[valores.region] || [])];

  return (
    <main className="login-page d-flex justify-content-center py-5">
      <div className="card-login shadow w-100" style={{ maxWidth: 640 }}>
        <h1 className="h3 text-center mb-4">Crear cuenta</h1>
        <Alerta mensaje={errorGeneral} />
        <form onSubmit={enviar} noValidate>
          <div className="row">
            <CampoFormulario className="col-md-6" id="run" etiqueta="RUN" placeholder="12345678-5" obligatorio value={valores.run} onChange={cambiar} error={errores.run} />
            <CampoFormulario className="col-md-6" id="email" type="email" etiqueta="Correo" obligatorio value={valores.email} onChange={cambiar} error={errores.email} />
            <CampoFormulario className="col-md-6" id="nombre" etiqueta="Nombre" obligatorio value={valores.nombre} onChange={cambiar} error={errores.nombre} />
            <CampoFormulario className="col-md-6" id="apellidos" etiqueta="Apellidos" obligatorio value={valores.apellidos} onChange={cambiar} error={errores.apellidos} />
            <CampoFormulario className="col-md-6" id="password" type="password" etiqueta="Contraseña" obligatorio value={valores.password} onChange={cambiar} error={errores.password} />
            <CampoFormulario className="col-md-6" id="confirmar" type="password" etiqueta="Confirmar contraseña" obligatorio value={valores.confirmar} onChange={cambiar} error={errores.confirmar} />
            <CampoFormulario className="col-md-6" id="region" como="select" etiqueta="Región" obligatorio opciones={regiones} value={valores.region} onChange={cambiar} error={errores.region} />
            <CampoFormulario className="col-md-6" id="comuna" como="select" etiqueta="Comuna" obligatorio opciones={comunas} value={valores.comuna} onChange={cambiar} error={errores.comuna} disabled={!valores.region} />
            <CampoFormulario className="col-12" id="direccion" etiqueta="Dirección" obligatorio value={valores.direccion} onChange={cambiar} error={errores.direccion} />
          </div>
          <button type="submit" className="btn btn-primary w-100">Registrarme</button>
        </form>
        <p className="text-center small mt-3 mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}

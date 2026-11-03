import { useState } from 'react';
import CampoFormulario from '../../components/CampoFormulario';
import Alerta from '../../components/Alerta';
import { requerido, validarEmail, validarFormulario } from '../../utils/validaciones';

const REGLAS = {
  nombre: (v) => requerido(v, 'El nombre'),
  email: validarEmail,
  mensaje: (v) => requerido(v, 'El mensaje') || (v.trim().length > 500 ? 'El mensaje no puede superar 500 caracteres.' : ''),
};

export default function Contacto() {
  const [valores, setValores] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  function cambiar(e) {
    setValores({ ...valores, [e.target.name]: e.target.value });
  }

  function enviar(e) {
    e.preventDefault();
    const encontrados = validarFormulario(valores, REGLAS);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    setEnviado(true);
    setValores({ nombre: '', email: '', mensaje: '' });
  }

  return (
    <main className="container my-4" style={{ maxWidth: 640 }}>
      <h1 className="h2 mb-3">Contacto</h1>
      <Alerta tipo="success" mensaje={enviado ? '¡Gracias! Te responderemos a la brevedad.' : ''} onCerrar={() => setEnviado(false)} />
      <form onSubmit={enviar} noValidate className="card p-4">
        <CampoFormulario id="nombre" etiqueta="Nombre completo" obligatorio value={valores.nombre} onChange={cambiar} error={errores.nombre} />
        <CampoFormulario id="email" type="email" etiqueta="Correo" obligatorio value={valores.email} onChange={cambiar} error={errores.email} />
        <CampoFormulario id="mensaje" como="textarea" etiqueta="Mensaje" obligatorio value={valores.mensaje} onChange={cambiar} error={errores.mensaje} />
        <small className="text-muted mb-3">{valores.mensaje.length}/500</small>
        <button type="submit" className="btn btn-primary">Enviar mensaje</button>
      </form>
    </main>
  );
}

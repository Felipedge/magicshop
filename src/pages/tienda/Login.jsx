import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario';
import Alerta from '../../components/Alerta';
import { useAuth } from '../../context/AuthContext';
import { validarEmail, validarFormulario, validarPassword } from '../../utils/validaciones';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorLogin, setErrorLogin] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setValores({ ...valores, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorLogin('');
    const encontrados = validarFormulario(valores, { email: validarEmail, password: validarPassword });
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    let usuario;
    try {
      usuario = await login(valores.email, valores.password); // GET /usuarios?email=...
    } catch (err) {
      setErrorLogin(err.message);
      setEnviando(false);
      return;
    }
    if (!usuario) {
      setErrorLogin('Correo o contraseña incorrectos.');
      setEnviando(false);
      return;
    }
    const destino = location.state?.desde || (usuario.rol === 'admin' ? '/admin' : '/');
    navigate(destino, { replace: true });
  }

  return (
    <main className="login-page d-flex justify-content-center align-items-center py-5">
      <div className="card-login shadow w-100" style={{ maxWidth: 400 }}>
        <h1 className="h3 text-center mb-4">Iniciar sesión</h1>
        <Alerta mensaje={errorLogin} />
        <form onSubmit={enviar} noValidate>
          <CampoFormulario id="email" type="email" etiqueta="Correo electrónico" placeholder="nombre@ejemplo.com" autoComplete="email" value={valores.email} onChange={cambiar} error={errores.email} />
          <CampoFormulario id="password" type="password" etiqueta="Contraseña" placeholder="********" autoComplete="current-password" value={valores.password} onChange={cambiar} error={errores.password} />
          <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center small mt-3 mb-0">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}

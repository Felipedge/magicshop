import { createContext, useContext, useState } from 'react';
import { usuariosApi } from '../api/recursos';

const AuthContext = createContext(null);
const CLAVE_SESION = 'magicshop_sesion';

/** La sesión (usuario conectado, sin contraseña) se recuerda en localStorage. */
function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

function guardarSesion(usuario) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...publico } = usuario;
  localStorage.setItem(CLAVE_SESION, JSON.stringify(publico));
  return publico;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  /** Valida las credenciales contra la API. Devuelve el usuario o null. */
  async function login(email, password) {
    const [encontrado] = await usuariosApi.listar({ email: email.trim().toLowerCase() });
    if (!encontrado || encontrado.password !== password) return null;
    const sesion = guardarSesion(encontrado);
    setUsuario(sesion);
    return sesion;
  }

  function logout() {
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
  }

  /** Registra un cliente nuevo (POST /usuarios). Lanza Error si el correo ya existe. */
  async function registrar(datos) {
    const email = datos.email.trim().toLowerCase();
    const existentes = await usuariosApi.listar({ email });
    if (existentes.length) throw new Error('Ya existe una cuenta con ese correo.');
    const nuevo = await usuariosApi.crear({ ...datos, email, rol: 'cliente' });
    const sesion = guardarSesion(nuevo);
    setUsuario(sesion);
    return sesion;
  }

  /** Actualiza los datos del usuario conectado (PATCH /usuarios/:id) */
  async function actualizarPerfil(cambios) {
    const actualizado = await usuariosApi.actualizar(usuario.id, cambios);
    const sesion = guardarSesion(actualizado);
    setUsuario(sesion);
    return sesion;
  }

  const valor = { usuario, esAdmin: usuario?.rol === 'admin', login, logout, registrar, actualizarPerfil };
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

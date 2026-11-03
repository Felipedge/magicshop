import { useState } from 'react';
import Alerta from '../../components/Alerta';
import EstadoCarga from '../../components/EstadoCarga';
import UsuarioForm from '../../components/admin/UsuarioForm';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi } from '../../api/recursos';
import { useApi, useColeccion } from '../../api/useApi';

export default function Perfil() {
  const { usuario: sesion, actualizarPerfil } = useAuth();
  // La sesión no guarda la contraseña: se pide el registro completo a la API (GET /usuarios/:id).
  const { datos: usuario, cargando, error } = useApi(() => usuariosApi.obtener(sesion.id), [sesion.id]);
  const { datos: usuarios } = useColeccion(usuariosApi);
  const [mensaje, setMensaje] = useState(null);

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;

  const emailsOcupados = usuarios.filter((u) => u.id !== sesion.id).map((u) => u.email.toLowerCase());

  async function guardar(datos) {
    // eslint-disable-next-line no-unused-vars
    const { rol, id, ...cambios } = datos; // el rol propio no se modifica desde el perfil
    try {
      await actualizarPerfil({ ...cambios, email: cambios.email.toLowerCase() });
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  }

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-3">Mi perfil</h1>
      <Alerta tipo={mensaje?.tipo} mensaje={mensaje?.texto} onCerrar={() => setMensaje(null)} />
      <UsuarioForm inicial={usuario} mostrarRol={false} emailsOcupados={emailsOcupados} onSubmit={guardar} textoBoton="Guardar cambios" />
    </div>
  );
}

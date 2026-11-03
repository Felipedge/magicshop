import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../../components/Alerta';
import EstadoCarga from '../../components/EstadoCarga';
import UsuarioForm from '../../components/admin/UsuarioForm';
import { TablaOrdenes } from './Ordenes';
import { useAuth } from '../../context/AuthContext';
import { ordenesApi, usuariosApi } from '../../api/recursos';
import { useApi, useColeccion } from '../../api/useApi';

export function UsuariosAdmin() {
  const { datos: usuarios, cargando, error } = useColeccion(usuariosApi);
  const { usuario: actual } = useAuth();
  const [errorAccion, setErrorAccion] = useState('');

  async function eliminar(u) {
    if (!window.confirm(`¿Eliminar al usuario ${u.email}?`)) return;
    try {
      await usuariosApi.eliminar(u.id); // DELETE /usuarios/:id
    } catch (err) {
      setErrorAccion(err.message);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-success btn-sm">+ Nuevo usuario</Link>
      </div>
      <Alerta mensaje={errorAccion} onCerrar={() => setErrorAccion('')} />
      <EstadoCarga cargando={cargando} error={error}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr><th>RUN</th><th>Nombre</th><th className="d-none d-md-table-cell">Correo</th><th>Rol</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.run}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td className="d-none d-md-table-cell">{u.email}</td>
                  <td><span className={`badge ${u.rol === 'admin' ? 'bg-secondary' : 'bg-info text-dark'}`}>{u.rol}</span></td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/usuarios/${u.id}`} className="btn btn-outline-primary btn-sm me-1">Ver</Link>
                    <Link to={`/admin/usuarios/${u.id}/editar`} className="btn btn-outline-success btn-sm me-1">Editar</Link>
                    <button type="button" className="btn btn-outline-danger btn-sm" disabled={u.id === actual?.id} onClick={() => eliminar(u)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EstadoCarga>
    </>
  );
}

/** Mostrar usuario + historial de compras (GET /usuarios/:id y GET /ordenes?usuarioId=:id) */
export function UsuarioVer() {
  const { id } = useParams();
  const { datos: usuario, cargando, error } = useApi(() => usuariosApi.obtener(id), [id]);
  const historial = useColeccion(ordenesApi, { usuarioId: id, _sort: 'fecha', _order: 'desc' });

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;
  if (!usuario) return <p>Usuario no encontrado. <Link to="/admin/usuarios">Volver</Link></p>;

  return (
    <>
      <div className="card p-3 p-md-4 mb-4" style={{ maxWidth: 900 }}>
        <h1 className="h3">{usuario.nombre} {usuario.apellidos}</h1>
        <dl className="row mb-3">
          <dt className="col-sm-3">RUN</dt><dd className="col-sm-9">{usuario.run}</dd>
          <dt className="col-sm-3">Correo</dt><dd className="col-sm-9">{usuario.email}</dd>
          <dt className="col-sm-3">Rol</dt><dd className="col-sm-9">{usuario.rol}</dd>
          <dt className="col-sm-3">Dirección</dt><dd className="col-sm-9">{usuario.direccion}, {usuario.comuna}, {usuario.region}</dd>
        </dl>
        <div className="d-flex gap-2">
          <Link to="/admin/usuarios" className="btn btn-secondary">Volver</Link>
          <Link to={`/admin/usuarios/${usuario.id}/editar`} className="btn btn-success">Editar usuario</Link>
        </div>
      </div>
      <h2 className="h4">Historial de compras</h2>
      <EstadoCarga cargando={historial.cargando} error={historial.error}>
        <TablaOrdenes ordenes={historial.datos} />
      </EstadoCarga>
    </>
  );
}

export function UsuarioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { datos: usuarios } = useColeccion(usuariosApi);
  const { datos: usuario, cargando, error } = useApi(() => (id ? usuariosApi.obtener(id) : Promise.resolve(null)), [id]);
  const [errorGuardar, setErrorGuardar] = useState('');

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;
  if (id && !usuario) return <p>Usuario no encontrado. <Link to="/admin/usuarios">Volver</Link></p>;

  const emailsOcupados = usuarios.filter((u) => u.id !== usuario?.id).map((u) => u.email.toLowerCase());

  async function guardar(datos) {
    try {
      const limpio = { ...datos, email: datos.email.toLowerCase() };
      if (usuario) await usuariosApi.actualizar(usuario.id, limpio);
      else await usuariosApi.crear(limpio);
      navigate('/admin/usuarios');
    } catch (err) {
      setErrorGuardar(err.message);
    }
  }

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-3">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h1>
      <Alerta mensaje={errorGuardar} />
      <UsuarioForm
        key={id || 'nuevo'}
        inicial={usuario || {}}
        emailsOcupados={emailsOcupados}
        onSubmit={guardar}
        onCancelar={() => navigate(-1)}
        textoBoton={usuario ? 'Guardar cambios' : 'Crear usuario'}
      />
    </div>
  );
}

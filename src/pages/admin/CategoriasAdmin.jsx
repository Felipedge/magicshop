import { useState } from 'react';
import Alerta from '../../components/Alerta';
import CampoFormulario from '../../components/CampoFormulario';
import EstadoCarga from '../../components/EstadoCarga';
import { categoriasApi, productosApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { CATEGORIA_POR_TIPO, TIPOS_MTG } from '../../api/mtg';
import { requerido } from '../../utils/validaciones';

const VACIO = { nombre: '', descripcion: '', tipoApi: '', imagen: '' };

/**
 * CRUD de categorías (json-server). Cada categoría se asocia a un tipo de carta de la API de Magic
 * (Creature, Instant, ...): la vista pública de la categoría muestra las cartas de ese tipo.
 */
export default function CategoriasAdmin() {
  const categorias = useColeccion(categoriasApi);
  const inventario = useColeccion(productosApi, { eliminado_ne: true });
  const [editando, setEditando] = useState(null); // categoría en edición o null (nueva)
  const [valores, setValores] = useState(VACIO);
  const [error, setError] = useState('');

  const tiposLibres = TIPOS_MTG.filter((t) => t === editando?.tipoApi || !categorias.datos.some((c) => c.tipoApi === t));

  function editar(c) {
    setEditando(c);
    setValores({ nombre: c.nombre, descripcion: c.descripcion ?? '', tipoApi: c.tipoApi, imagen: c.imagen ?? '' });
    setError('');
  }

  function limpiar() {
    setEditando(null);
    setValores(VACIO);
    setError('');
  }

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  async function guardar(e) {
    e.preventDefault();
    const mensaje = requerido(valores.nombre, 'El nombre') || requerido(valores.tipoApi, 'El tipo de carta');
    if (mensaje) {
      setError(mensaje);
      return;
    }
    try {
      if (editando) {
        // El tipo (y su slug) no cambia al editar: así no se rompen los enlaces de las cartas.
        await categoriasApi.actualizar(editando.id, { nombre: valores.nombre, descripcion: valores.descripcion, imagen: valores.imagen });
      } else {
        await categoriasApi.crear({ ...valores, slug: CATEGORIA_POR_TIPO[valores.tipoApi] });
      }
      limpiar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(c) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await categoriasApi.eliminar(c.id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1 className="h3 mb-3">Categorías</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <EstadoCarga cargando={categorias.cargando || inventario.cargando} error={categorias.error || inventario.error}>
            <div className="table-responsive">
              <table className="table table-dark align-middle">
                <thead>
                  <tr><th>Nombre</th><th>Tipo en la API</th><th className="text-center">En inventario</th><th className="text-end">Acciones</th></tr>
                </thead>
                <tbody>
                  {categorias.datos.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nombre}<div className="small text-muted">{c.descripcion}</div></td>
                      <td><code>{c.tipoApi}</code></td>
                      <td className="text-center">{inventario.datos.filter((p) => p.categoria === c.slug).length}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-outline-success btn-sm me-1" onClick={() => editar(c)}>Editar</button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(c)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EstadoCarga>
        </div>
        <div className="col-12 col-lg-5">
          <form className="card p-3" onSubmit={guardar} noValidate>
            <h2 className="h5">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <Alerta mensaje={error} onCerrar={() => setError('')} />
            <CampoFormulario id="nombre" etiqueta="Nombre" obligatorio value={valores.nombre} onChange={cambiar} />
            <CampoFormulario
              id="tipoApi"
              como="select"
              etiqueta="Tipo de carta (API de Magic)"
              obligatorio
              disabled={Boolean(editando)}
              opciones={[{ valor: '', texto: tiposLibres.length ? 'Selecciona...' : 'Todos los tipos ya tienen categoría' }, ...tiposLibres]}
              value={valores.tipoApi}
              onChange={cambiar}
            />
            <CampoFormulario id="imagen" etiqueta="URL de imagen (opcional)" value={valores.imagen} onChange={cambiar} />
            <CampoFormulario id="descripcion" como="textarea" etiqueta="Descripción" value={valores.descripcion} onChange={cambiar} />
            <div className="d-flex gap-2 justify-content-end">
              {editando && <button type="button" className="btn btn-secondary" onClick={limpiar}>Cancelar</button>}
              <button type="submit" className="btn btn-success">{editando ? 'Guardar cambios' : 'Crear categoría'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

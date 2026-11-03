import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../../components/Alerta';
import EstadoCarga from '../../components/EstadoCarga';
import SearchBar from '../../components/SearchBar';
import ProductoForm from '../../components/admin/ProductoForm';
import { productosApi, STOCK_CRITICO } from '../../api/recursos';
import { useApi, useColeccion } from '../../api/useApi';
import { guardarEnInventario, useCatalogo } from '../../api/catalogo';
import { formatoCLP, precioFinal } from '../../utils/formato';

/**
 * Inventario de la tienda (json-server /productos): cartas con precio, stock y oferta definidos.
 * Con `soloCriticos` pide a la API solo las de stock bajo (stock_lte).
 */
export function ProductosAdmin({ soloCriticos = false }) {
  const filtro = soloCriticos ? { stock_lte: STOCK_CRITICO, eliminado_ne: true } : { eliminado_ne: true };
  const { datos: productos, cargando, error } = useColeccion(productosApi, filtro);
  const [busqueda, setBusqueda] = useState('');
  const [errorAccion, setErrorAccion] = useState('');

  const visibles = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  async function quitar(p) {
    if (!window.confirm(`¿Quitar "${p.nombre}" de la tienda?`)) return;
    try {
      // No se borra el registro: se marca para que la carta deje de mostrarse en la tienda.
      await productosApi.actualizar(p.id, { eliminado: true }); // PATCH /productos/:id
    } catch (err) {
      setErrorAccion(err.message);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">{soloCriticos ? 'Productos críticos' : 'Productos (inventario)'}</h1>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/productos" className={`btn btn-sm ${soloCriticos ? 'btn-outline-light' : 'btn-light'}`}>Todos</Link>
          <Link to="/admin/productos/criticos" className={`btn btn-sm ${soloCriticos ? 'btn-warning' : 'btn-outline-warning'}`}>Críticos</Link>
          <Link to="/admin/reportes" className="btn btn-sm btn-outline-info">Reportes</Link>
          <Link to="/admin/productos/nuevo" className="btn btn-sm btn-success">+ Nuevo producto</Link>
        </div>
      </div>
      <p className="text-muted small">
        {soloCriticos
          ? `Cartas con stock igual o menor a ${STOCK_CRITICO} unidades.`
          : 'Cartas con precio, stock u oferta definidos por la tienda. El resto del catálogo de la API de Magic se vende con el precio por rareza y stock inicial.'}
      </p>
      <Alerta mensaje={errorAccion} onCerrar={() => setErrorAccion('')} />

      <input className="form-control mb-3" type="search" placeholder="Buscar por nombre..." aria-label="Buscar producto" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <EstadoCarga cargando={cargando} error={error}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th className="d-none d-md-table-cell">Categoría</th>
                <th className="text-end">Precio</th>
                <th className="text-center">Stock</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.imagen} alt="" className="miniatura" /></td>
                  <td>{p.nombre}{p.oferta > 0 && <span className="badge bg-danger ms-2">-{p.oferta}%</span>}</td>
                  <td className="d-none d-md-table-cell">{p.categoria}</td>
                  <td className="text-end">{formatoCLP(precioFinal(p))}</td>
                  <td className="text-center">
                    <span className={`badge ${p.stock <= STOCK_CRITICO ? 'bg-danger' : 'bg-secondary'}`}>{p.stock}</span>
                  </td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/productos/${p.id}`} className="btn btn-outline-primary btn-sm me-1">Ver</Link>
                    <Link to={`/admin/productos/${p.id}/editar`} className="btn btn-outline-success btn-sm me-1">Editar</Link>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => quitar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibles.length && <p className="text-muted">No hay productos para mostrar.</p>}
        </div>
      </EstadoCarga>
    </>
  );
}

export function ProductoVer() {
  const { id } = useParams();
  const { datos: producto, cargando, error } = useApi(() => productosApi.obtener(id), [id]);

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;
  if (!producto) return <p>Producto no encontrado. <Link to="/admin/productos">Volver</Link></p>;

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <div className="row g-4">
        <div className="col-12 col-md-4 text-center"><img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded" /></div>
        <div className="col-12 col-md-8">
          <h1 className="h3">{producto.nombre}</h1>
          <dl className="row mb-3">
            <dt className="col-5">Categoría</dt><dd className="col-7">{producto.categoria}</dd>
            <dt className="col-5">Tipo</dt><dd className="col-7">{producto.tipo}</dd>
            <dt className="col-5">Rareza</dt><dd className="col-7">{producto.rareza}</dd>
            <dt className="col-5">Precio</dt><dd className="col-7">{formatoCLP(producto.precio)}</dd>
            <dt className="col-5">Descuento</dt><dd className="col-7">{producto.oferta}%</dd>
            <dt className="col-5">Stock</dt><dd className="col-7">{producto.stock}</dd>
            <dt className="col-5">Estado</dt><dd className="col-7">{producto.eliminado ? 'Quitada de la tienda' : 'A la venta'}</dd>
          </dl>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/productos" className="btn btn-secondary">Volver</Link>
            <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-success">Editar producto</Link>
            <Link to={`/productos/${producto.id}`} className="btn btn-outline-primary">Ver en la tienda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Editar precio/stock/oferta de una carta del inventario (PATCH /productos/:id). */
export function ProductoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { datos: producto, cargando, error } = useApi(() => productosApi.obtener(id), [id]);
  const [errorGuardar, setErrorGuardar] = useState('');

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;
  if (!producto) return <p>Producto no encontrado. <Link to="/admin/productos">Volver</Link></p>;

  async function guardar(cambios) {
    try {
      await productosApi.actualizar(producto.id, { ...cambios, eliminado: false });
      navigate('/admin/productos');
    } catch (err) {
      setErrorGuardar(err.message);
    }
  }

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-3">Editar producto</h1>
      <Alerta mensaje={errorGuardar} />
      <ProductoForm key={id} producto={producto} onSubmit={guardar} onCancelar={() => navigate(-1)} textoBoton="Guardar cambios" />
    </div>
  );
}

/** Nuevo producto: se busca la carta en la API de Magic y se agrega al inventario con su precio y stock. */
export function ProductoNuevo() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [elegida, setElegida] = useState(null);
  const [errorGuardar, setErrorGuardar] = useState('');
  // GET api.magicthegathering.io/v1/cards?name=<busqueda>
  const resultados = useCatalogo(busqueda ? { nombre: busqueda, pagina: 1, porPagina: 8 } : null);

  async function guardar(cambios) {
    try {
      await guardarEnInventario(elegida, { ...cambios, eliminado: false }); // POST (o PATCH si ya estaba)
      navigate('/admin/productos');
    } catch (err) {
      setErrorGuardar(err.message);
    }
  }

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-3">Nuevo producto</h1>
      <Alerta mensaje={errorGuardar} />

      {elegida ? (
        <ProductoForm producto={elegida} onSubmit={guardar} onCancelar={() => setElegida(null)} textoBoton="Agregar a la tienda" />
      ) : (
        <>
          <p className="text-muted small">Busca la carta en la API de Magic y elige cuál agregar al inventario de la tienda.</p>
          <SearchBar placeholder="Nombre de la carta (ej: Serra Angel)" onBuscar={setBusqueda} />
          {busqueda && (
            <EstadoCarga cargando={resultados.cargando} error={resultados.error}>
              {resultados.productos.length === 0 ? (
                <p className="text-muted mt-3">No se encontraron cartas con ese nombre.</p>
              ) : (
                <ul className="list-group mt-3">
                  {resultados.productos.map((p) => (
                    <li key={p.id} className="list-group-item list-group-item-dark d-flex align-items-center gap-3">
                      <img src={p.imagen} alt="" className="miniatura" />
                      <div className="flex-grow-1">
                        <div>{p.nombre}</div>
                        <small className="text-muted">{p.tipo} · {p.edicion}</small>
                      </div>
                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setElegida(p)}>Elegir</button>
                    </li>
                  ))}
                </ul>
              )}
            </EstadoCarga>
          )}
        </>
      )}
    </div>
  );
}

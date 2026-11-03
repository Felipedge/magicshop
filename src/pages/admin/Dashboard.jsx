import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import EstadoCarga from '../../components/EstadoCarga';
import { MODULOS_ADMIN } from './AdminLayout';
import { ordenesApi, productosApi, STOCK_CRITICO, usuariosApi } from '../../api/recursos';
import { useColeccion } from '../../api/useApi';
import { formatoCLP } from '../../utils/formato';

export default function Dashboard() {
  const ordenes = useColeccion(ordenesApi);
  const productos = useColeccion(productosApi, { eliminado_ne: true }); // inventario de la tienda
  const usuarios = useColeccion(usuariosApi);

  const pagadas = ordenes.datos.filter((o) => o.estado === 'pagada');
  const ventas = pagadas.reduce((s, o) => s + o.total, 0);
  const inventario = productos.datos.reduce((s, p) => s + p.stock, 0);
  const criticos = productos.datos.filter((p) => p.stock <= STOCK_CRITICO).length;

  return (
    <>
      <h1 className="h3 mb-0">Dashboard</h1>
      <p className="text-muted small">Resumen de las actividades</p>

      <EstadoCarga
        cargando={ordenes.cargando || productos.cargando || usuarios.cargando}
        error={ordenes.error || productos.error || usuarios.error}
      >
        <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
          <div className="col"><StatCard color="primary" icono="🛒" titulo="Compras" valor={pagadas.length} detalle={`Ventas: ${formatoCLP(ventas)}`} /></div>
          <div className="col"><StatCard color="success" icono="📦" titulo="Productos" valor={productos.datos.length} detalle={`Inventario actual: ${inventario} · Críticos: ${criticos}`} /></div>
          <div className="col"><StatCard color="warning" icono="👥" titulo="Usuarios" valor={usuarios.datos.length} detalle={`Clientes: ${usuarios.datos.filter((u) => u.rol === 'cliente').length}`} /></div>
        </div>
      </EstadoCarga>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {MODULOS_ADMIN.filter((m) => m.ruta !== '/admin').map((m) => (
          <div className="col" key={m.ruta}>
            <Link to={m.ruta} className="text-decoration-none">
              <div className="card h-100 text-center modulo-card">
                <div className="card-body">
                  <div className="fs-2" aria-hidden="true">{m.icono}</div>
                  <h5 className="card-title">{m.nombre}</h5>
                  <p className="card-text small text-muted">{m.descripcion}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

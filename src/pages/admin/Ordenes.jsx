import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EstadoCarga from '../../components/EstadoCarga';
import ResumenOrden from '../../components/ResumenOrden';
import { ordenesApi } from '../../api/recursos';
import { useApi, useColeccion } from '../../api/useApi';
import { formatoCLP } from '../../utils/formato';

export function EstadoOrden({ estado }) {
  return <span className={`badge ${estado === 'pagada' ? 'bg-success' : 'bg-danger'}`}>{estado}</span>;
}

/** Tabla de órdenes reutilizada en Órdenes y en el historial de compras de un usuario. */
export function TablaOrdenes({ ordenes }) {
  if (!ordenes.length) return <p className="text-muted">No hay órdenes registradas.</p>;
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>N°</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th className="text-end">Total</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id}>
              <td>#{o.numero}</td>
              <td>{new Date(o.fecha).toLocaleString('es-CL')}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td className="text-end">{formatoCLP(o.total)}</td>
              <td><EstadoOrden estado={o.estado} /></td>
              <td><Link to={`/admin/ordenes/${o.id}`} className="btn btn-outline-primary btn-sm">Ver boleta</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrdenesAdmin() {
  const [estado, setEstado] = useState('');
  // GET /ordenes?estado=...&_sort=fecha&_order=desc
  const { datos: ordenes, cargando, error } = useColeccion(ordenesApi, { estado, _sort: 'fecha', _order: 'desc' });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Órdenes / Boletas</h1>
        <select className="form-select w-auto" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todas</option>
          <option value="pagada">Pagadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </div>
      <EstadoCarga cargando={cargando} error={error}>
        <TablaOrdenes ordenes={ordenes} />
      </EstadoCarga>
    </>
  );
}

export function BoletaAdmin() {
  const { id } = useParams();
  const { datos: orden, cargando, error } = useApi(() => ordenesApi.obtener(id), [id]);

  if (cargando || error) return <EstadoCarga cargando={cargando} error={error} />;
  if (!orden) return <p>Orden no encontrada. <Link to="/admin/ordenes">Volver</Link></p>;

  return (
    <div className="card p-3 p-md-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <h1 className="h4">Boleta #{orden.numero}</h1>
        <EstadoOrden estado={orden.estado} />
      </div>
      <p className="text-muted small">{new Date(orden.fecha).toLocaleString('es-CL')}</p>
      {orden.motivo && <div className="alert alert-danger py-2">{orden.motivo}</div>}
      <ResumenOrden orden={orden} />
      <div className="d-flex gap-2 mt-3">
        <Link to="/admin/ordenes" className="btn btn-secondary">Volver</Link>
        <button type="button" className="btn btn-danger" onClick={() => window.print()}>Imprimir</button>
      </div>
    </div>
  );
}

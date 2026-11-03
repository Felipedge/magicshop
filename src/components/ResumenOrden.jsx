import CartTable from './CartTable';
import { formatoCLP } from '../utils/formato';

/** Muestra los datos de cliente, despacho y productos de una orden (solo lectura). */
export default function ResumenOrden({ orden }) {
  const { cliente, despacho } = orden;
  const dato = (etiqueta, valor) => (
    <div className="col-12 col-md">
      <small className="text-muted d-block">{etiqueta}</small>
      <div className="dato-lectura">{valor || '—'}</div>
    </div>
  );

  return (
    <>
      <div className="row g-2 mb-3">
        {dato('Nombre', cliente.nombre)}
        {dato('Apellidos', cliente.apellidos)}
        {dato('Correo', cliente.email)}
      </div>
      <h6>Dirección de entrega</h6>
      <div className="row g-2 mb-2">
        {dato('Calle', despacho.calle)}
        {dato('Departamento', despacho.departamento)}
      </div>
      <div className="row g-2 mb-2">
        {dato('Región', despacho.region)}
        {dato('Comuna', despacho.comuna)}
      </div>
      {despacho.indicaciones && <div className="row g-2 mb-3">{dato('Indicaciones', despacho.indicaciones)}</div>}
      <CartTable items={orden.items} />
      <div className="card mt-3">
        <div className="card-body text-center fs-5">
          Total {orden.estado === 'pagada' ? 'pagado' : 'a pagar'}: <strong>{formatoCLP(orden.total)}</strong>
        </div>
      </div>
    </>
  );
}

import { formatoCLP } from '../utils/formato';

/**
 * Tabla del carrito / detalle de una orden.
 * Si `editable` es true muestra los controles de cantidad y eliminar.
 */
export default function CartTable({ items, editable = false, onCambiarCantidad, onQuitar }) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th className="text-end">Precio</th>
            <th className="text-center">Cantidad</th>
            <th className="text-end">Subtotal</th>
            {editable && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.imagen ? <img src={item.imagen} alt={item.nombre} className="miniatura" /> : <span className="miniatura d-inline-block bg-secondary" />}
              </td>
              <td>{item.nombre}</td>
              <td className="text-end">{formatoCLP(item.precioUnitario)}</td>
              <td className="text-center">
                {editable ? (
                  <div className="btn-group btn-group-sm" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                    <button type="button" className="btn btn-outline-light" onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}>
                      −
                    </button>
                    <span className="btn btn-outline-light disabled" data-testid={`cantidad-${item.id}`}>
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      disabled={item.stock !== undefined && item.cantidad >= item.stock}
                      onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  item.cantidad
                )}
              </td>
              <td className="text-end">{formatoCLP(item.subtotal)}</td>
              {editable && (
                <td className="text-center">
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onQuitar(item.id)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

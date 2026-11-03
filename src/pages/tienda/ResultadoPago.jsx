import { Link, useNavigate, useParams } from 'react-router-dom';
import EstadoCarga from '../../components/EstadoCarga';
import ResumenOrden from '../../components/ResumenOrden';
import { ordenesApi } from '../../api/recursos';
import { useApi } from '../../api/useApi';

/** GET /ordenes/:id según el parámetro de la ruta */
function useOrden() {
  const { id } = useParams();
  return useApi(() => ordenesApi.obtener(id), [id]);
}

function OrdenNoEncontrada() {
  return (
    <main className="container my-5 text-center">
      <p>No encontramos esa orden.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  );
}

export function PagoExitoso() {
  const { datos: orden, cargando, error } = useOrden();
  if (cargando || error) return <main className="container"><EstadoCarga cargando={cargando} error={error} /></main>;
  if (!orden) return <OrdenNoEncontrada />;

  return (
    <main className="container my-4" style={{ maxWidth: 900 }}>
      <div className="card p-3 p-md-4">
        <small className="text-muted text-end">Código orden: ORDER{String(orden.id).padStart(5, '0')}</small>
        <h1 className="h4 text-success">✔ Se ha realizado la compra. nro #{orden.numero}</h1>
        <p className="text-muted small">Detalle de la compra</p>
        <ResumenOrden orden={orden} />
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <button type="button" className="btn btn-danger btn-sm" onClick={() => window.print()}>Imprimir boleta en PDF</button>
          <button type="button" className="btn btn-success btn-sm" onClick={() => alert(`Boleta enviada a ${orden.cliente.email} (simulado).`)}>
            Enviar boleta por email
          </button>
        </div>
      </div>
    </main>
  );
}

export function PagoError() {
  const { datos: orden, cargando, error } = useOrden();
  const navigate = useNavigate();
  if (cargando || error) return <main className="container"><EstadoCarga cargando={cargando} error={error} /></main>;
  if (!orden) return <OrdenNoEncontrada />;

  return (
    <main className="container my-4" style={{ maxWidth: 900 }}>
      <div className="card p-3 p-md-4">
        <h1 className="h4 text-danger">✖ No se pudo realizar el pago. nro #{orden.numero}</h1>
        <p className="text-muted small mb-1">Detalle de compra</p>
        {orden.motivo && <div className="alert alert-danger py-2">{orden.motivo}</div>}
        <div className="text-center mb-3">
          <button type="button" className="btn btn-success" onClick={() => navigate('/checkout')}>VOLVER A REALIZAR EL PAGO</button>
        </div>
        <ResumenOrden orden={orden} />
      </div>
    </main>
  );
}

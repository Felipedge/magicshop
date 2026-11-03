import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Alerta from '../../components/Alerta';
import CartTable from '../../components/CartTable';
import CheckoutForm from '../../components/CheckoutForm';
import EstadoCarga from '../../components/EstadoCarga';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { procesarPago } from '../../api/pagos';
import { formatoCLP } from '../../utils/formato';

export default function Checkout() {
  const { items, total, cargando, error, vaciar } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  // Evita redirigir a /carrito justo después de pagar (el carrito se vacía antes de que termine la navegación).
  const compraFinalizada = useRef(false);

  if (cargando || error) return <main className="container"><EstadoCarga cargando={cargando} error={error} /></main>;
  if (!items.length) return compraFinalizada.current ? null : <Navigate to="/carrito" replace />;

  // Si el usuario inició sesión, sus datos se completan automáticamente.
  const inicial = usuario
    ? {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        calle: usuario.direccion || '',
        region: usuario.region || '',
        comuna: usuario.comuna || '',
      }
    : {};

  async function pagar(valores, { simularRechazo }) {
    const { nombre, apellidos, email, ...despacho } = valores;
    setProcesando(true);
    setErrorPago('');
    try {
      const orden = await procesarPago({ items, cliente: { nombre, apellidos, email }, despacho, usuarioId: usuario?.id ?? null, simularRechazo });
      if (orden.estado === 'pagada') {
        compraFinalizada.current = true;
        vaciar();
        navigate(`/compra/exito/${orden.id}`);
      } else {
        navigate(`/compra/error/${orden.id}`);
      }
    } catch (err) {
      setErrorPago(err.message);
      setProcesando(false);
    }
  }

  return (
    <main className="container my-4" style={{ maxWidth: 900 }}>
      <div className="card p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h1 className="h4 mb-0">Carrito de compra</h1>
            <small className="text-muted">Completa la siguiente información</small>
          </div>
          <span className="badge bg-primary fs-6 p-2">Total a pagar: {formatoCLP(total)}</span>
        </div>
        <CartTable items={items} />
        <Alerta mensaje={errorPago} />
        <fieldset disabled={procesando}>
          <CheckoutForm key={usuario?.id ?? 'invitado'} inicial={inicial} total={total} onSubmit={pagar} />
        </fieldset>
      </div>
    </main>
  );
}

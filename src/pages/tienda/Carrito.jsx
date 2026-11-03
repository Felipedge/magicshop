import { Link, useNavigate } from 'react-router-dom';
import CartTable from '../../components/CartTable';
import EstadoCarga from '../../components/EstadoCarga';
import { useCart } from '../../context/CartContext';
import { formatoCLP } from '../../utils/formato';

/** Carrito: muestra solo los productos que el usuario está comprando. */
export default function Carrito() {
  const { items, total, cargando, error, cambiarCantidad, quitar, vaciar } = useCart();
  const navigate = useNavigate();

  return (
    <main className="container my-4" style={{ maxWidth: 960 }}>
      <h1 className="h3 mb-3">Carrito de compras</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {items.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="mb-2">Tu carrito está vacío.</p>
            <Link to="/productos" className="btn btn-primary align-self-center">Ir a comprar</Link>
          </div>
        ) : (
          <>
            <CartTable items={items} editable onCambiarCantidad={cambiarCantidad} onQuitar={quitar} />
            <div className="d-flex justify-content-end fs-5 my-3">
              Total: <strong className="ms-2" data-testid="total-carrito">{formatoCLP(total)}</strong>
            </div>
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={vaciar}>Limpiar</button>
                <button type="button" className="btn btn-success" onClick={() => navigate('/checkout')}>Comprar ahora</button>
              </div>
            </div>
          </>
        )}
      </EstadoCarga>
    </main>
  );
}

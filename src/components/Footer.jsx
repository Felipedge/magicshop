import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pt-4 pb-3 mt-5">
      <div className="container">
        <div className="row g-4 text-center text-md-start">
          <div className="col-12 col-md-6">
            <h6 className="footer-titulo">Magic-Shop</h6>
            <p className="text-muted small mb-0">Cartas de Magic: The Gathering para jugadores y coleccionistas.</p>
          </div>
          <div className="col-6 col-md-3">
            <h6 className="footer-titulo">Tienda</h6>
            <ul className="list-unstyled small footer-links mb-0">
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-3">
            <h6 className="footer-titulo">Información</h6>
            <ul className="list-unstyled small footer-links mb-0">
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>
        </div>
        <hr className="footer-separador my-3" />
        <p className="text-center text-muted small mb-0">
          Magic-Shop &copy; 2026 — Proyecto académico, no es un servicio de venta real.
        </p>
      </div>
    </footer>
  );
}

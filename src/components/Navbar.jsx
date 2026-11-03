import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoriasApi } from '../api/recursos';
import { useColeccion } from '../api/useApi';
import { formatoCLP } from '../utils/formato';
import SearchBar from './SearchBar';

/** Barra de navegación responsiva. El menú colapsable y el dropdown se controlan con estado de React. */
export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);
  const { usuario, esAdmin, logout } = useAuth();
  const { total } = useCart();
  const { datos: categorias } = useColeccion(categoriasApi);
  const navigate = useNavigate();

  const cerrarMenus = () => {
    setMenuAbierto(false);
    setCategoriasAbiertas(false);
  };

  function buscar(texto) {
    cerrarMenus();
    navigate(texto ? `/productos?q=${encodeURIComponent(texto)}` : '/productos');
  }

  function cerrarSesion() {
    logout();
    cerrarMenus();
    navigate('/');
  }

  return (
    <header>
      <nav className="navbar navbar-expand-xl bg-dark border-bottom" data-bs-theme="dark">
        <div className="container-fluid nav-grid">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={cerrarMenus}>
            <img src="/img/logo.png" alt="Logo" width="70" height="24" className="me-2" />
            Magic-Shop
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="menuPrincipal"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Escritorio: grilla de 3 columnas (logo | buscador + enlaces | cuenta), el centro queda centrado en la página.
              Móvil: todo se apila dentro del menú colapsable. */}
          <div className={`collapse navbar-collapse nav-collapse ${menuAbierto ? 'show' : ''}`} id="menuPrincipal">
            <div className="nav-centro d-flex flex-column align-items-xl-center gap-2 mt-2 mt-xl-0">
              <div className="buscador-nav">
                <SearchBar onBuscar={buscar} />
              </div>

            <ul className="navbar-nav align-items-xl-center gap-xl-1">

              <li className="nav-item">
                <NavLink className="nav-link" to="/" end onClick={cerrarMenus}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/productos" onClick={cerrarMenus}>Productos</NavLink>
              </li>
              <li className="nav-item dropdown">
                <button
                  type="button"
                  className="nav-link dropdown-toggle btn btn-link"
                  aria-expanded={categoriasAbiertas}
                  onClick={() => setCategoriasAbiertas((v) => !v)}
                >
                  Categorías
                </button>
                <ul className={`dropdown-menu ${categoriasAbiertas ? 'show' : ''}`}>
                  <li>
                    <Link className="dropdown-item" to="/categorias" onClick={cerrarMenus}>Todas</Link>
                  </li>
                  {categorias.map((c) => (
                    <li key={c.id}>
                      <Link className="dropdown-item" to={`/categorias/${c.slug}`} onClick={cerrarMenus}>{c.nombre}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/ofertas" onClick={cerrarMenus}>Ofertas</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/nosotros" onClick={cerrarMenus}>Nosotros</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contacto" onClick={cerrarMenus}>Contacto</NavLink>
              </li>
              <li className="nav-item ms-xl-2 my-2 my-xl-0">
                <Link className="btn btn-success btn-sm text-nowrap" to="/carrito" onClick={cerrarMenus}>
                  🛒 Carrito {formatoCLP(total)}
                </Link>
              </li>
            </ul>
            </div>

            <div className="nav-cuenta d-flex flex-wrap gap-2 align-items-center justify-content-xl-end mb-2 mb-xl-0">
              {usuario ? (
                <>
                  <span className="navbar-text text-nowrap">Hola, {usuario.nombre}</span>
                  {esAdmin && (
                    <Link className="btn btn-outline-light btn-sm text-nowrap" to="/admin" onClick={cerrarMenus}>Panel admin</Link>
                  )}
                  <button type="button" className="btn btn-outline-danger btn-sm text-nowrap" onClick={cerrarSesion}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-primary btn-sm text-nowrap" to="/login" onClick={cerrarMenus}>Iniciar sesión</Link>
                  <Link className="btn btn-primary btn-sm text-nowrap" to="/registro" onClick={cerrarMenus}>Crear cuenta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

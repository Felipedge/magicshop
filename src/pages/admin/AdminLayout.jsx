import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MODULOS_ADMIN = [
  { ruta: '/admin', icono: '📊', nombre: 'Dashboard', descripcion: 'Visión general de las métricas clave del sistema.', end: true },
  { ruta: '/admin/ordenes', icono: '🧾', nombre: 'Órdenes', descripcion: 'Gestión y seguimiento de las órdenes de compra.' },
  { ruta: '/admin/productos', icono: '🃏', nombre: 'Productos', descripcion: 'Administrar inventario y detalles de los productos.' },
  { ruta: '/admin/categorias', icono: '🏷️', nombre: 'Categorías', descripcion: 'Organizar productos en categorías.' },
  { ruta: '/admin/usuarios', icono: '👥', nombre: 'Usuarios', descripcion: 'Gestión de cuentas de usuario y sus roles.' },
  { ruta: '/admin/reportes', icono: '📈', nombre: 'Reportes', descripcion: 'Informes de ventas e inventario.' },
  { ruta: '/admin/perfil', icono: '👤', nombre: 'Perfil', descripcion: 'Tu información personal y de cuenta.' },
];

/** Layout del panel: barra lateral (colapsable en móvil) + contenido de la ruta hija. */
export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/login');
  }

  return (
    <div className="admin">
      <header className="admin-topbar d-flex align-items-center justify-content-between px-3 py-2">
        <Link to="/admin" className="navbar-brand">Magic-Shop <span className="badge bg-secondary ms-1">Admin</span></Link>
        <button type="button" className="btn btn-outline-light btn-sm d-lg-none" aria-expanded={menuAbierto} onClick={() => setMenuAbierto((v) => !v)}>
          ☰ Menú
        </button>
      </header>
      <div className="d-lg-flex">
        <aside className={`admin-sidebar p-3 ${menuAbierto ? 'd-block' : 'd-none'} d-lg-block`}>
          <nav className="nav nav-pills flex-column gap-1">
            {MODULOS_ADMIN.map((m) => (
              <NavLink key={m.ruta} to={m.ruta} end={m.end} className="nav-link" onClick={() => setMenuAbierto(false)}>
                <span className="me-2" aria-hidden="true">{m.icono}</span>
                {m.nombre}
              </NavLink>
            ))}
          </nav>
          <hr />
          <p className="small text-muted mb-2">Conectado como {usuario?.email}</p>
          <Link to="/" className="btn btn-dark w-100 mb-2">🏪 Tienda</Link>
          <button type="button" className="btn btn-danger w-100" onClick={cerrarSesion}>Cerrar sesión</button>
        </aside>
        <main className="admin-contenido flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

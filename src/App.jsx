import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/tienda/Home';
import Productos from './pages/tienda/Productos';
import ProductoDetalle from './pages/tienda/ProductoDetalle';
import Categorias from './pages/tienda/Categorias';
import Ofertas from './pages/tienda/Ofertas';
import Nosotros from './pages/tienda/Nosotros';
import Contacto from './pages/tienda/Contacto';
import Login from './pages/tienda/Login';
import Registro from './pages/tienda/Registro';
import Carrito from './pages/tienda/Carrito';
import Checkout from './pages/tienda/Checkout';
import { PagoError, PagoExitoso } from './pages/tienda/ResultadoPago';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import { BoletaAdmin, OrdenesAdmin } from './pages/admin/Ordenes';
import { ProductoFormPage, ProductoNuevo, ProductosAdmin, ProductoVer } from './pages/admin/ProductosAdmin';
import CategoriasAdmin from './pages/admin/CategoriasAdmin';
import { UsuarioFormPage, UsuariosAdmin, UsuarioVer } from './pages/admin/UsuariosAdmin';
import Reportes from './pages/admin/Reportes';
import Perfil from './pages/admin/Perfil';

/** Layout público: navbar + contenido + footer */
function TiendaLayout() {
  const { pathname } = useLocation();
  // Al cambiar de página se vuelve al inicio (el efecto no devuelve nada).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    // min-vh-100 + flex-grow: el footer queda al fondo aunque la página tenga poco contenido
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<TiendaLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<ProductoDetalle />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/:slug" element={<Categorias />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra/exito/:id" element={<PagoExitoso />} />
        <Route path="compra/error/:id" element={<PagoError />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin"
        element={
          <ProtectedRoute rol="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="ordenes" element={<OrdenesAdmin />} />
        <Route path="ordenes/:id" element={<BoletaAdmin />} />
        <Route path="productos" element={<ProductosAdmin />} />
        <Route path="productos/criticos" element={<ProductosAdmin soloCriticos />} />
        <Route path="productos/nuevo" element={<ProductoNuevo />} />
        <Route path="productos/:id" element={<ProductoVer />} />
        <Route path="productos/:id/editar" element={<ProductoFormPage />} />
        <Route path="categorias" element={<CategoriasAdmin />} />
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="usuarios/nuevo" element={<UsuarioFormPage />} />
        <Route path="usuarios/:id" element={<UsuarioVer />} />
        <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
}

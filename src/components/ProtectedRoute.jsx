import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Protege rutas: exige sesión y, si se indica, un rol específico (ej: 'admin'). */
export default function ProtectedRoute({ rol, children }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;
  return children;
}

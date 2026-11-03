import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container my-5 text-center">
      <h1 className="display-5">404</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  );
}

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import semilla from '../../server/db.seed.json';

const PRODUCTOS = semilla.productos;

describe('ProductGrid (renderizado de listas)', () => {
  it('renderiza todos los elementos del conjunto de datos', () => {
    render(
      <MemoryRouter>
        <ProductGrid productos={PRODUCTOS} onAgregar={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('article').length).toBe(PRODUCTOS.length);
    PRODUCTOS.slice(0, 5).forEach((p) => expect(screen.getByRole('heading', { name: p.nombre })).toBeTruthy());
  });

  it('muestra el mensaje de vacío cuando no hay productos', () => {
    render(<ProductGrid productos={[]} onAgregar={() => {}} mensajeVacio="Nada por aquí" />);
    expect(screen.getByText('Nada por aquí')).toBeTruthy();
    expect(screen.queryAllByRole('article').length).toBe(0);
  });
});

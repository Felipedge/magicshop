import { act, fireEvent, render, screen } from '@testing-library/react';
import Carrusel from './Carrusel';

const SLIDES = [
  { imagen: '/img/imagen1.jpg', titulo: 'Uno', texto: '' },
  { imagen: '/img/imagen2.jpg', titulo: 'Dos', texto: '' },
  { imagen: '/img/imagen3.jpeg', titulo: 'Tres', texto: '' },
];

const indiceActivo = () => screen.getAllByTestId('slide').findIndex((s) => s.classList.contains('active'));

describe('Carrusel (estado)', () => {
  it('avanza y retrocede de slide con los controles (y da la vuelta)', () => {
    render(<Carrusel slides={SLIDES} intervalo={0} />);
    expect(indiceActivo()).toBe(0);

    fireEvent.click(screen.getByText('Siguiente'));
    expect(indiceActivo()).toBe(1);

    fireEvent.click(screen.getByText('Anterior'));
    fireEvent.click(screen.getByText('Anterior'));
    expect(indiceActivo()).toBe(2);
  });

  it('salta al slide del indicador seleccionado', () => {
    render(<Carrusel slides={SLIDES} intervalo={0} />);
    fireEvent.click(screen.getByLabelText('Ir al slide 3'));
    expect(indiceActivo()).toBe(2);
  });

  it('avanza solo según el intervalo (mock del reloj con jasmine.clock)', () => {
    jasmine.clock().install();
    try {
      render(<Carrusel slides={SLIDES} intervalo={1000} />);
      act(() => jasmine.clock().tick(1001));
      expect(indiceActivo()).toBe(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('no renderiza nada si no hay slides', () => {
    const { container } = render(<Carrusel slides={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

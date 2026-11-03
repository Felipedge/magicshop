import { fireEvent, render, screen } from '@testing-library/react';
import Boton from './Boton';

describe('Boton (props)', () => {
  it('recibe la etiqueta y ejecuta la función onClick', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<Boton etiqueta="Comprar" onClick={onClick} />);

    const boton = screen.getByRole('button', { name: 'Comprar' });
    fireEvent.click(boton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aplica la variante y no dispara onClick cuando está deshabilitado', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<Boton etiqueta="Eliminar" variante="danger" deshabilitado onClick={onClick} />);

    const boton = screen.getByRole('button', { name: 'Eliminar' });
    expect(boton.classList).toContain('btn-danger');
    expect(boton.disabled).toBeTrue();
    fireEvent.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import CartTable from './CartTable';
import { formatoCLP } from '../utils/formato';

const ITEMS = [
  { id: 1, nombre: 'Uno', imagen: '', precioUnitario: 1000, cantidad: 2, subtotal: 2000, stock: 5 },
  { id: 2, nombre: 'Dos', imagen: '', precioUnitario: 500, cantidad: 3, subtotal: 1500, stock: 3 },
];

describe('CartTable', () => {
  it('modo solo lectura: muestra filas y subtotales sin controles', () => {
    render(<CartTable items={ITEMS} />);
    expect(screen.getAllByRole('row').length).toBe(3); // encabezado + 2
    expect(screen.getByText(formatoCLP(2000))).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull();
  });

  it('modo editable: los botones llaman a los callbacks recibidos por props', () => {
    const onCambiarCantidad = jasmine.createSpy('onCambiarCantidad');
    const onQuitar = jasmine.createSpy('onQuitar');
    render(<CartTable items={ITEMS} editable onCambiarCantidad={onCambiarCantidad} onQuitar={onQuitar} />);

    fireEvent.click(screen.getAllByRole('button', { name: '+' })[0]);
    expect(onCambiarCantidad).toHaveBeenCalledWith(1, 3);

    fireEvent.click(screen.getAllByRole('button', { name: '−' })[1]);
    expect(onCambiarCantidad).toHaveBeenCalledWith(2, 2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);
    expect(onQuitar).toHaveBeenCalledWith(1);
  });

  it('deshabilita "+" cuando la cantidad alcanza el stock', () => {
    render(<CartTable items={ITEMS} editable onCambiarCantidad={() => {}} onQuitar={() => {}} />);
    const botonesMas = screen.getAllByRole('button', { name: '+' });
    expect(botonesMas[0].disabled).toBeFalse();
    expect(botonesMas[1].disabled).toBeTrue();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import Alerta from './Alerta';

describe('Alerta (renderizado condicional)', () => {
  it('no muestra nada cuando no hay mensaje de error', () => {
    const { container } = render(<Alerta mensaje="" />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('muestra el mensaje solo cuando hay un error presente', () => {
    render(<Alerta mensaje="Correo o contraseña incorrectos." />);
    const alerta = screen.getByRole('alert');
    expect(alerta.textContent).toContain('Correo o contraseña incorrectos.');
    expect(alerta.classList).toContain('alert-danger');
  });

  it('muestra el botón cerrar solo si recibe onCerrar y lo ejecuta', () => {
    const onCerrar = jasmine.createSpy('onCerrar');
    const { rerender } = render(<Alerta mensaje="Hola" tipo="success" />);
    expect(screen.queryByLabelText('Cerrar')).toBeNull();

    rerender(<Alerta mensaje="Hola" tipo="success" onCerrar={onCerrar} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onCerrar).toHaveBeenCalled();
  });
});

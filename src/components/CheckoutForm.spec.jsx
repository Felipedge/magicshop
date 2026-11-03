import { fireEvent, render, screen } from '@testing-library/react';
import CheckoutForm from './CheckoutForm';

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe('CheckoutForm (formulario con validación)', () => {
  it('no muestra errores al inicio y los muestra al enviar vacío, sin llamar a onSubmit', () => {
    const onSubmit = jasmine.createSpy('onSubmit');
    const { container } = render(<CheckoutForm total={5000} onSubmit={onSubmit} />);
    expect(container.querySelectorAll('.invalid-feedback').length).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(screen.getByLabelText(/^Calle/).classList).toContain('is-invalid');
  });

  it('el estado cambia al escribir y el error del campo desaparece', () => {
    render(<CheckoutForm total={5000} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
    expect(screen.queryByText('El nombre es obligatorio.')).not.toBeNull();

    escribir(/^Nombre/, 'Pedro');
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Pedro');
    expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
  });

  it('las comunas dependen de la región elegida', () => {
    render(<CheckoutForm total={0} onSubmit={() => {}} />);
    const comuna = screen.getByLabelText(/^Comuna/);
    expect(comuna.disabled).toBeTrue();

    escribir(/^Región/, 'Región de Valparaíso');
    expect(comuna.disabled).toBeFalse();
    expect(Array.from(comuna.options).map((o) => o.value)).toContain('Viña del Mar');
  });

  it('autocompleta con los datos iniciales y envía los valores válidos', () => {
    const onSubmit = jasmine.createSpy('onSubmit');
    const inicial = { nombre: 'Felipe', apellidos: 'Palma', email: 'f@test.cl', calle: 'Los Crisantemos 603', region: 'Región de Valparaíso', comuna: 'Quilpué' };
    render(<CheckoutForm inicial={inicial} total={5000} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/^Nombre/).value).toBe('Felipe');
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(onSubmit).toHaveBeenCalledOnceWith(jasmine.objectContaining(inicial), { simularRechazo: true });
  });
});

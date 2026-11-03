import { fireEvent, render, screen } from '@testing-library/react';
import ProductoForm from './ProductoForm';
import { formatoCLP } from '../../utils/formato';
import { productoFalso } from '../../test/utils';

const escribir = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

describe('ProductoForm (admin: precio, stock y oferta de una carta)', () => {
  it('muestra la carta recibida por props y carga sus valores actuales', () => {
    render(<ProductoForm producto={productoFalso({ precio: 500, stock: 3, oferta: 10 })} onSubmit={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Carta de Prueba' })).toBeTruthy();
    expect(screen.getByLabelText(/^Precio/).value).toBe('500');
    expect(screen.getByLabelText(/^Stock/).value).toBe('3');
    expect(screen.getByText(formatoCLP(450))).toBeTruthy(); // vista previa del precio final
  });

  it('muestra errores de validación y no envía si los valores son inválidos', () => {
    const onSubmit = jasmine.createSpy('onSubmit');
    render(<ProductoForm producto={productoFalso()} onSubmit={onSubmit} />);

    escribir(/^Precio/, '0');
    escribir(/^Stock/, '-2');
    escribir(/^Descuento/, '95');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El precio debe ser mayor o igual a 1.')).toBeTruthy();
    expect(screen.getByText('El stock debe ser mayor o igual a 0.')).toBeTruthy();
    expect(screen.getByText('El descuento no puede superar 90%.')).toBeTruthy();
  });

  it('envía precio, stock y oferta convertidos a número; Cancelar ejecuta onCancelar', () => {
    const onSubmit = jasmine.createSpy('onSubmit');
    const onCancelar = jasmine.createSpy('onCancelar');
    render(<ProductoForm producto={productoFalso()} onSubmit={onSubmit} onCancelar={onCancelar} textoBoton="Agregar a la tienda" />);

    escribir(/^Precio/, '3500');
    escribir(/^Stock/, '4');
    escribir(/^Descuento/, '10');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la tienda' }));
    expect(onSubmit).toHaveBeenCalledOnceWith({ precio: 3500, stock: 4, oferta: 10 });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});

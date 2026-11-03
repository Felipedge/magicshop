import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { formatoCLP } from '../utils/formato';
import { productoFalso } from '../test/utils';

function renderCard(producto, onAgregar = jasmine.createSpy('onAgregar')) {
  render(
    <MemoryRouter>
      <ProductCard producto={producto} onAgregar={onAgregar} />
    </MemoryRouter>,
  );
  return onAgregar;
}

describe('ProductCard', () => {
  it('renderiza los datos del producto recibido por props', () => {
    renderCard(productoFalso());
    expect(screen.getByRole('heading', { name: 'Carta de Prueba' })).toBeTruthy();
    expect(screen.getByText(formatoCLP(1000))).toBeTruthy();
    expect(screen.getByText('Stock: 5')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Detalle' }).getAttribute('href')).toBe('/productos/999');
  });

  it('muestra precio tachado y badge de descuento solo si está en oferta', () => {
    renderCard(productoFalso({ oferta: 20 }));
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByText(formatoCLP(1000)).tagName).toBe('DEL');
    expect(screen.getByText(formatoCLP(800))).toBeTruthy();
  });

  it('al hacer clic en Añadir llama a onAgregar con el producto', () => {
    const producto = productoFalso();
    const onAgregar = renderCard(producto);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(onAgregar).toHaveBeenCalledOnceWith(producto);
  });

  it('sin stock: muestra el aviso y deshabilita el botón', () => {
    const onAgregar = renderCard(productoFalso({ stock: 0 }));
    expect(screen.getByText('Sin stock')).toBeTruthy();
    const boton = screen.getByRole('button', { name: 'Añadir' });
    expect(boton.disabled).toBeTrue();
    fireEvent.click(boton);
    expect(onAgregar).not.toHaveBeenCalled();
  });
});

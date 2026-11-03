import { fireEvent, render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar (estado y eventos)', () => {
  it('el estado del input cambia cuando el usuario escribe', () => {
    render(<SearchBar onBuscar={() => {}} />);
    const input = screen.getByRole('searchbox');
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: 'Angel' } });
    expect(input.value).toBe('Angel');
  });

  it('al enviar llama a onBuscar con el texto sin espacios extra', () => {
    const onBuscar = jasmine.createSpy('onBuscar');
    render(<SearchBar valorInicial="  dragon  " onBuscar={onBuscar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onBuscar).toHaveBeenCalledOnceWith('dragon');
  });
});

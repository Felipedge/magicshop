import { formatoCLP, precioFinal } from './formato';

describe('formato', () => {
  it('formatoCLP usa el formato de moneda chilena', () => {
    expect(formatoCLP(1500)).toBe((1500).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
    expect(formatoCLP(1500)).toContain('1.500');
    expect(formatoCLP(undefined)).toContain('0');
  });

  it('precioFinal aplica el porcentaje de oferta y redondea', () => {
    expect(precioFinal({ precio: 1000, oferta: 0 })).toBe(1000);
    expect(precioFinal({ precio: 1000, oferta: 25 })).toBe(750);
    expect(precioFinal({ precio: 999, oferta: 15 })).toBe(849);
  });
});

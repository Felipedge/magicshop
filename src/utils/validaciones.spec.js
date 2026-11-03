import { requerido, validarEmail, validarFormulario, validarNumero, validarPassword, validarRun } from './validaciones';

describe('validaciones', () => {
  describe('validarRun', () => {
    it('acepta RUN válidos con y sin puntos, incluido el dígito K', () => {
      expect(validarRun('12345678-5')).toBe('');
      expect(validarRun('12.345.678-5')).toBe('');
      expect(validarRun('11111111-1')).toBe('');
      expect(validarRun('10000013-k')).toBe('');
    });

    it('rechaza dígito verificador incorrecto', () => {
      expect(validarRun('12345678-9')).toContain('dígito verificador');
    });

    it('rechaza formato inválido y valor vacío', () => {
      expect(validarRun('abc')).toContain('Formato');
      expect(validarRun('')).toContain('obligatorio');
    });
  });

  describe('validarEmail', () => {
    it('acepta correos válidos y rechaza inválidos', () => {
      expect(validarEmail('felipe@magicshop.com')).toBe('');
      expect(validarEmail('felipe@')).toContain('válido');
      expect(validarEmail('sin-arroba.cl')).toContain('válido');
      expect(validarEmail('   ')).toContain('obligatorio');
    });
  });

  describe('validarPassword', () => {
    it('exige entre 6 y 20 caracteres', () => {
      expect(validarPassword('')).toContain('obligatoria');
      expect(validarPassword('12345')).toContain('al menos 6');
      expect(validarPassword('123456')).toBe('');
      expect(validarPassword('x'.repeat(21))).toContain('20');
    });
  });

  describe('validarNumero', () => {
    it('valida obligatorio, tipo, entero y mínimo', () => {
      expect(validarNumero('', 'El precio')).toContain('obligatorio');
      expect(validarNumero('abc', 'El precio')).toContain('número');
      expect(validarNumero('1.5', 'El stock')).toContain('entero');
      expect(validarNumero('-1', 'El stock')).toContain('mayor o igual a 0');
      expect(validarNumero('0', 'El precio', { min: 1 })).toContain('mayor o igual a 1');
      expect(validarNumero('10', 'El stock')).toBe('');
    });
  });

  describe('validarFormulario', () => {
    it('devuelve solo los campos con error y pasa todos los valores a cada regla', () => {
      const reglaConfirmar = jasmine.createSpy('confirmar').and.callFake((v, todos) => (v !== todos.clave ? 'No coinciden' : ''));
      const errores = validarFormulario(
        { nombre: '', clave: 'abc', confirmar: 'xyz' },
        { nombre: (v) => requerido(v, 'El nombre'), confirmar: reglaConfirmar },
      );
      expect(errores).toEqual({ nombre: 'El nombre es obligatorio.', confirmar: 'No coinciden' });
      expect(reglaConfirmar).toHaveBeenCalledWith('xyz', jasmine.objectContaining({ clave: 'abc' }));
    });
  });
});

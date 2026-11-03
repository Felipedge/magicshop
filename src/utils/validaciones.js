// Reglas de validación reutilizadas por todos los formularios.
// Cada validador devuelve un mensaje de error (string) o '' si el valor es válido.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requerido(valor, campo = 'Este campo') {
  return String(valor ?? '').trim() === '' ? `${campo} es obligatorio.` : '';
}

export function validarEmail(email) {
  if (!email || !email.trim()) return 'El correo es obligatorio.';
  return EMAIL_REGEX.test(email.trim()) ? '' : 'Ingresa un correo electrónico válido.';
}

export function validarPassword(password) {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (password.length > 20) return 'La contraseña no puede superar los 20 caracteres.';
  return '';
}

/** Valida un RUN chileno con dígito verificador (formato 12345678-5, con o sin puntos) */
export function validarRun(run) {
  if (!run || !run.trim()) return 'El RUN es obligatorio.';
  const limpio = run.replace(/\./g, '').toUpperCase().trim();
  const match = limpio.match(/^(\d{7,8})-([\dK])$/);
  if (!match) return 'Formato de RUN inválido (ej: 12345678-5).';

  const [, cuerpo, dv] = match;
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === esperado ? '' : 'El dígito verificador del RUN no es válido.';
}

export function validarNumero(valor, campo, { min = 0, entero = true } = {}) {
  if (valor === '' || valor === null || valor === undefined) return `${campo} es obligatorio.`;
  const n = Number(valor);
  if (Number.isNaN(n)) return `${campo} debe ser un número.`;
  if (entero && !Number.isInteger(n)) return `${campo} debe ser un número entero.`;
  if (n < min) return `${campo} debe ser mayor o igual a ${min}.`;
  return '';
}

/**
 * Ejecuta un mapa de validadores { campo: fn(valor, todos) } y devuelve solo los errores.
 * Útil para validar un formulario completo de una vez.
 */
export function validarFormulario(valores, reglas) {
  const errores = {};
  for (const campo of Object.keys(reglas)) {
    const mensaje = reglas[campo](valores[campo], valores);
    if (mensaje) errores[campo] = mensaje;
  }
  return errores;
}

// Se carga antes de todas las pruebas (ver karma.conf.cjs).
import { cleanup } from '@testing-library/react';
import { fetchFalso, reiniciarApi } from './apiFalsa';

// Indica a React que las pruebas corren dentro de act() (evita advertencias).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  // Cada prueba parte con la API (json-server simulado) en su estado inicial
  // y sin sesión ni carrito guardados.
  reiniciarApi();
  spyOn(window, 'fetch').and.callFake(fetchFalso);
  localStorage.clear();
});

afterEach(() => {
  // Desmonta los componentes renderizados para no contaminar la siguiente prueba.
  cleanup();
});

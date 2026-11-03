import { useState } from 'react';

/** Buscador controlado: guarda el texto en su estado y llama a onBuscar al enviar. */
export default function SearchBar({ valorInicial = '', onBuscar, placeholder = 'Buscar carta...' }) {
  const [texto, setTexto] = useState(valorInicial);

  function enviar(e) {
    e.preventDefault();
    onBuscar(texto.trim());
  }

  return (
    <form className="d-flex" role="search" onSubmit={enviar}>
      <label htmlFor="buscador" className="visually-hidden">
        Buscar
      </label>
      <input
        id="buscador"
        className="form-control me-2"
        type="search"
        placeholder={placeholder}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        autoComplete="off"
      />
      <button className="btn btn-outline-success" type="submit">
        Buscar
      </button>
    </form>
  );
}

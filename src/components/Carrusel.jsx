import { useEffect, useState } from 'react';

/** Carrusel de imágenes con estado propio (slide activo) y avance automático opcional. */
export default function Carrusel({ slides, intervalo = 5000 }) {
  const [activo, setActivo] = useState(0);
  const total = slides.length;

  const siguiente = () => setActivo((i) => (i + 1) % total);
  const anterior = () => setActivo((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (!intervalo || total < 2) return undefined;
    const id = setInterval(() => setActivo((i) => (i + 1) % total), intervalo);
    return () => clearInterval(id);
  }, [intervalo, total]);

  if (!total) return null;

  return (
    <section className="carousel slide" aria-label="Cartas destacadas">
      <div className="carousel-indicators">
        {slides.map((s, i) => (
          <button
            key={s.imagen}
            type="button"
            className={i === activo ? 'active' : ''}
            aria-current={i === activo}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => setActivo(i)}
          />
        ))}
      </div>
      <div className="carousel-inner">
        {slides.map((s, i) => (
          <div key={s.imagen} className={`carousel-item ${i === activo ? 'active' : ''}`} data-testid="slide">
            <img src={s.imagen} className="d-block w-100" alt={s.titulo} />
            <div className="carousel-caption d-none d-md-block">
              <h5>{s.titulo}</h5>
              <p>{s.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" onClick={anterior}>
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Anterior</span>
      </button>
      <button className="carousel-control-next" type="button" onClick={siguiente}>
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Siguiente</span>
      </button>
    </section>
  );
}

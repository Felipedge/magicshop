export default function Nosotros() {
  return (
    <main className="container my-4">
      <h1 className="h2 mb-4">Nosotros</h1>
      <div className="row g-4 align-items-center">
        <div className="col-12 col-md-6">
          <p>
            Magic-Shop nació como un proyecto de jugadores para jugadores: una tienda online donde encontrar cartas de
            Magic: The Gathering con precios claros, stock real y despacho a todo Chile.
          </p>
          <p>
            Nuestra misión es acercar el juego a nuevos jugadores y ayudar a los coleccionistas a completar sus mazos,
            con un catálogo organizado por categorías y ofertas semanales.
          </p>
        </div>
        <div className="col-12 col-md-6">
          <img src="/img/fondo.jpeg" alt="Mesa de juego de Magic" className="img-fluid rounded shadow" />
        </div>
      </div>
    </main>
  );
}

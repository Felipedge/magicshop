// Prepara la base de datos de json-server.
// - Si server/db.json no existe, lo crea copiando server/db.seed.json.
// - Con --reset la vuelve a los datos iniciales (borra órdenes y cambios hechos desde la app).
const fs = require('fs');
const path = require('path');

const seed = path.join(__dirname, 'db.seed.json');
const db = path.join(__dirname, 'db.json');
const reset = process.argv.includes('--reset');

if (reset || !fs.existsSync(db)) {
  fs.copyFileSync(seed, db);
  console.log(reset ? 'Base de datos reiniciada (server/db.json).' : 'Base de datos creada (server/db.json).');
}

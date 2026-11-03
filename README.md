# Magic-Shop — Tienda online de cartas Magic (React + json-server + API de Magic)

Proyecto de la asignatura DSY1104 Desarrollo Fullstack II — Evaluación Parcial 2.
Frontend en **React** con **React Router** y **Bootstrap 5**, que consume dos APIs:

- **API pública de Magic: The Gathering** (`api.magicthegathering.io`): el catálogo de cartas (nombre, tipo, rareza, texto, imagen), con búsqueda, filtro por tipo y paginación.
- **API REST propia con json-server**: lo que define la tienda (precio, stock, ofertas), categorías, usuarios y órdenes.

## Requisitos

- Node.js 20 o superior
- Conexión a internet (para la API de Magic)
- Google Chrome (solo para las pruebas con Karma)

## Cómo ejecutar

```bash
npm install     # instala dependencias
npm start       # levanta la API (json-server :3001) y la app (Vite :5173) al mismo tiempo
```

Abrir **http://localhost:5173**.

| Comando            | Qué hace |
|--------------------|----------|
| `npm start`        | API + app juntas (recomendado) |
| `npm run api`      | Solo la API: json-server en http://localhost:3001 |
| `npm run dev`      | Solo la app (necesita la API corriendo) |
| `npm run db:reset` | Vuelve la base de datos a los datos iniciales |
| `npm test`         | Pruebas unitarias (Jasmine + Karma) con reporte de cobertura |
| `npm run build`    | Build de producción en `dist/` |

## Cuentas de prueba

| Rol           | Correo                    | Contraseña     |
|---------------|---------------------------|----------------|
| Administrador | admin@magicshop.com       | admin123       |
| Cliente       | comprador@magicshop.com   | comprador123   |

## De dónde vienen los datos

```
                 ┌──────────────────────────────┐
  Cartas ───────▶│ api.magicthegathering.io/v1  │  GET /cards?name=&types=&page=&pageSize=  ·  GET /cards/:id
                 └──────────────────────────────┘
                                │  se combinan por id de carta (src/api/catalogo.js)
                 ┌──────────────────────────────┐
  Tienda ───────▶│ json-server  (/api → :3001)  │  precio, stock, oferta · categorías · usuarios · órdenes
                 └──────────────────────────────┘
```

- Cada carta de la API de Magic se muestra con el precio, stock y % de oferta que la tienda tiene en su
  **inventario** (`/productos` de json-server, usando el id de la carta).
- Si la carta no está en el inventario se vende con un **precio por rareza** y **stock inicial de 10**
  (como en el proyecto original). Al comprarla, se agrega automáticamente al inventario con el stock descontado.
- Las **ofertas** y los **productos críticos** salen del inventario.
- Cada **categoría** está asociada a un tipo de carta de la API (`Creature`, `Instant`, `Land`…).
- En el panel admin, **Nuevo producto** busca la carta en la API de Magic y la agrega al inventario con su precio y stock;
  **Eliminar** la quita de la tienda.

## API (json-server)

La base de datos es `server/db.json`, que se crea automáticamente desde `server/db.seed.json` la primera vez
que se ejecuta `npm run api`. Todo lo que se haga en la app (compras, productos, usuarios) queda guardado ahí.

La app llama a `/api/...` y Vite reenvía esas peticiones a json-server (`vite.config.js`).

| Recurso       | Endpoints | Uso en la app |
|---------------|-----------|---------------|
| `/productos`  | `GET` `GET /:id` `POST` `PATCH /:id` | Inventario (id = id de la carta): precio/stock en catálogo y detalle, ofertas (`?oferta_gte=1&_sort=oferta&_order=desc`), críticos (`?stock_lte=3`), admin, descuento de stock al pagar |
| `/categorias` | `GET` `POST` `PATCH /:id` `DELETE /:id` | Menú, vista de categorías (`tipoApi` → filtro `types` de la API de Magic), CRUD del admin |
| `/usuarios`   | `GET ?email=` `GET /:id` `POST` `PATCH /:id` `DELETE /:id` | Login, registro, perfil, CRUD del admin |
| `/ordenes`    | `GET ?estado=&_sort=fecha` `GET ?usuarioId=` `GET /:id` `POST` | Checkout, boletas, historial de compras, reportes |

## Estructura

```
server/
├── db.seed.json           Datos iniciales (inventario de 32 cartas, 6 categorías, usuarios)
└── prepare-db.cjs         Crea/reinicia server/db.json
src/
├── main.jsx               Punto de entrada (BrowserRouter + contextos)
├── App.jsx                Rutas de React Router (tienda y panel admin)
├── api/
│   ├── cliente.js         Cliente fetch genérico: listar, obtener, crear, actualizar, eliminar
│   ├── recursos.js        productosApi, categoriasApi, usuariosApi, ordenesApi (json-server)
│   ├── mtg.js             Cliente de la API de Magic: buscarCartas, obtenerCarta, precio por rareza
│   ├── catalogo.js        Combina cartas + inventario: useCatalogo, useProducto, guardarEnInventario
│   ├── useApi.js          Hooks useApi / useColeccion (carga, error y refresco automático)
│   └── pagos.js           Simulación de pago: crea la orden y descuenta stock vía API
├── context/               Sesión (AuthContext) y carrito (CartContext)
├── components/            Componentes reutilizables (Navbar, ProductCard, CartTable, CheckoutForm…)
├── pages/tienda/          Home, Productos, Detalle, Categorías, Ofertas, Nosotros, Contacto,
│                          Login, Registro, Carrito, Checkout, Pago exitoso / con error
├── pages/admin/           Dashboard, Órdenes, Productos, Categorías, Usuarios, Reportes, Perfil
├── data/regiones.js       Regiones y comunas (dato estático)
├── utils/                 Formato de moneda y validaciones (RUN, correo, contraseña…)
└── test/                  Configuración de pruebas y API falsa en memoria
```

## Rutas (React Router)

**Tienda:** `/` · `/productos` · `/productos/:id` · `/categorias` · `/categorias/:slug` · `/ofertas` ·
`/nosotros` · `/contacto` · `/login` · `/registro` · `/carrito` · `/checkout` ·
`/compra/exito/:id` · `/compra/error/:id`

**Administrador (requiere rol admin):** `/admin` · `/admin/ordenes` · `/admin/ordenes/:id` ·
`/admin/productos` · `/admin/productos/nuevo` · `/admin/productos/:id` · `/admin/productos/:id/editar` ·
`/admin/productos/criticos` · `/admin/categorias` · `/admin/usuarios` · `/admin/usuarios/nuevo` ·
`/admin/usuarios/:id` · `/admin/usuarios/:id/editar` · `/admin/reportes` · `/admin/perfil`

## Notas

- La sesión y el carrito se recuerdan en el navegador (localStorage); todos los demás datos vienen de las APIs.
- En el checkout hay una casilla **"Simular pago rechazado"** para demostrar el flujo de pago con error.
- La API de Magic puede tardar 1-3 segundos en responder; mientras tanto se muestra un indicador de carga.

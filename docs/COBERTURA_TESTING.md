# Documento de cobertura de testing — Magic-Shop

**Asignatura:** DSY1104 Desarrollo Fullstack II — Evaluación Parcial 2
**Proyecto:** Magic-Shop (tienda online de cartas Magic: The Gathering)
**Herramientas:** Jasmine 4.6 · Karma 6.4 · Chrome Headless · React Testing Library 16 · Istanbul (karma-coverage)
**Arquitectura probada:** React + React Router consumiendo la API pública de Magic (catálogo de cartas) y una API REST de json-server (inventario, usuarios, órdenes). Ambas se simulan en memoria durante las pruebas.
**Fecha de ejecución:** 02-11-2026

---

## 1. Resumen de resultados

| Indicador                 | Resultado            |
|---------------------------|----------------------|
| Archivos de prueba        | 26                   |
| Casos de prueba (`it`)    | 146                  |
| Pruebas exitosas          | **146 / 146 (100%)** |
| Pruebas fallidas          | 0                    |
| Tiempo de ejecución       | ≈ 0,7 s              |

| Métrica de cobertura | %          | Cubierto / Total |
|----------------------|------------|------------------|
| Sentencias           | **95,33%** | 878 / 921        |
| Ramas (branches)     | **91,73%** | 566 / 617        |
| Funciones            | **93,82%** | 304 / 324        |
| Líneas               | **96,22%** | 739 / 768        |

> Los valores se obtienen con `npm test`. El detalle por archivo queda en `coverage/html/index.html`.

---

## 2. Configuración del entorno de pruebas

| Archivo              | Función |
|----------------------|---------|
| `karma.conf.cjs`     | Define Jasmine como framework, Chrome Headless como navegador, empaqueta las pruebas con webpack + babel y genera los reportes `spec` (consola), `kjhtml` (HTML de Jasmine) y `coverage` (HTML, lcov y texto). |
| `babel.config.cjs`   | Transforma JSX (`@babel/preset-react`) y, en el entorno `test`, instrumenta el código con `babel-plugin-istanbul` para medir cobertura (excluye los `*.spec.*`). |
| `src/test/setup.js`  | Se carga antes de todas las pruebas: reinicia la API falsa, reemplaza `window.fetch` por ella (mock), limpia `localStorage` y desmonta los componentes después de cada caso. |
| `src/test/apiFalsa.js` | **Mocks de ambas APIs en memoria**: json-server (`GET/POST/PATCH/DELETE /api/<recurso>[/:id]` con los filtros `campo=`, `_gte`, `_lte`, `_ne`, `_sort`, `_order`, `_limit`, desde `server/db.seed.json`) y la API de Magic (`/v1/cards` con `name`, `types`, `page`, `pageSize` y header `Total-Count`; `/v1/cards/:id`), con 35 cartas de prueba. Así las pruebas no dependen de la red. |
| `src/test/utils.jsx` | Utilidades compartidas: `renderConProveedores` (Router en memoria + contextos), `esperarCarga` / `esperar` (esperan las respuestas asíncronas de la API), `iniciarSesionComo`, `precargarCarrito`, `productoFalso`, `datosApi` y `RutaActual`. |

**Convenciones:**
- Cada prueba vive junto al archivo que prueba (`ProductCard.jsx` → `ProductCard.spec.jsx`).
- Estructura **Arrange / Act / Assert**: se prepara el estado, se simula la acción del usuario (`fireEvent`) y se verifica el DOM o las llamadas.
- Se consulta el DOM como lo haría un usuario (por rol, etiqueta o texto), no por clases internas.

---

## 3. Uso de mocks y espías

| Técnica | Dónde se usa | Para qué |
|---------|--------------|----------|
| `jasmine.createSpy` | Boton, ProductCard, SearchBar, CartTable, CheckoutForm, ProductoForm, Alerta | Simular las funciones recibidas por props (`onClick`, `onAgregar`, `onSubmit`…) y verificar que se llaman con los argumentos correctos. |
| `spyOn(window, 'fetch').and.callFake(fetchFalso)` | Todas (setup.js) | Reemplazar la red por la API falsa en memoria; además permite verificar qué URL y método HTTP usó cada operación. |
| `window.fetch.and.returnValue(Promise.reject(...))` | cliente.spec, CartContext.spec, Login.spec, App.spec | Simular que json-server está apagado y comprobar que la app muestra un error claro. |
| `spyOn(productosApi, 'listar').and.returnValue(...)` | Productos.spec, PaginasTienda.spec | Entregar un catálogo controlado (o vacío) para probar la página aislada de los datos reales. |
| `spyOn(window, 'confirm').and.returnValue(true/false)` | Admin.spec, AdminGestion.spec | Simular la confirmación del usuario al eliminar productos o usuarios (acepta / cancela). |
| `jasmine.clock()` | Carrusel.spec | Controlar el tiempo para probar el avance automático del carrusel sin esperar. |
| `spyOn(console, 'error')` | CartContext.spec | Silenciar el log esperado de React al probar un error controlado. |

---

## 4. Alcance: casos de prueba por tipo

La propuesta del docente pide pruebas de **renderizado, renderizado condicional, props, estado y eventos**. Se cubren todos:

### 4.1 Renderizado correcto
| Prueba | Archivo |
|--------|---------|
| La lista de productos renderiza **todos** los elementos del conjunto de datos (32 cartas) | ProductGrid.spec |
| La tarjeta de producto muestra nombre, precio en CLP, stock y enlace al detalle | ProductCard.spec |
| CartTable muestra una fila por ítem con sus subtotales | CartTable.spec |
| El home muestra categorías y cartas destacadas | App.spec |
| Categorías, Ofertas y Nosotros se renderizan con sus datos | PaginasTienda.spec |
| Boleta de una orden: cliente, despacho, productos y total | AdminGestion.spec |

### 4.2 Renderizado condicional
| Prueba | Archivo |
|--------|---------|
| El mensaje de error **solo** aparece cuando hay un error | Alerta.spec, Login.spec |
| Precio tachado y badge de descuento solo si el producto está en oferta | ProductCard.spec |
| "Sin stock" y botón deshabilitado cuando el stock es 0 | ProductCard.spec |
| Mensaje "carrito vacío" vs. tabla del carrito | Carrito.spec |
| Navbar: botones de login/registro sin sesión; saludo y "Panel admin" según el rol | Navbar.spec |
| Errores de validación ausentes al inicio y visibles al enviar el formulario | CheckoutForm.spec |
| Avisos de "no encontrado" para producto, orden, usuario y categoría inexistentes | PaginasTienda.spec, AdminGestion.spec |

### 4.3 Propiedades (props)
| Prueba | Archivo |
|--------|---------|
| El botón recibe la etiqueta y la función `onClick`, y respeta `deshabilitado` | Boton.spec |
| ProductCard llama a `onAgregar` con el producto recibido | ProductCard.spec |
| CartTable llama a `onCambiarCantidad(id, nuevaCantidad)` y `onQuitar(id)` | CartTable.spec |
| CheckoutForm autocompleta con la prop `inicial` (usuario conectado) | CheckoutForm.spec |
| ProductoForm carga `inicial` en modo edición y ejecuta `onCancelar` | ProductoForm.spec |
| ProductosAdmin con la prop `soloCriticos` muestra solo stock ≤ 3 | Admin.spec |

### 4.4 Estado (state)
| Prueba | Archivo |
|--------|---------|
| El estado del buscador cambia cuando el usuario escribe | SearchBar.spec |
| El estado del formulario de checkout cambia al escribir y limpia el error del campo | CheckoutForm.spec |
| Las comunas disponibles dependen de la región elegida | CheckoutForm.spec |
| El carrusel cambia de slide (siguiente, anterior, indicador, automático) | Carrusel.spec |
| Menú hamburguesa y dropdown de categorías abren/cierran con estado | Navbar.spec |
| Carrito: agregar, acumular, límite de stock, cambiar cantidad, quitar, vaciar, persistir | CartContext.spec |
| Sesión: login, logout, persistencia al recargar, registro, edición de perfil | AuthContext.spec |
| La cantidad en el detalle de producto se limita al stock disponible | PaginasTienda.spec |

### 4.5 Eventos
| Prueba | Archivo |
|--------|---------|
| Clic en un botón ejecuta la función recibida | Boton.spec, ProductCard.spec |
| Enviar el buscador navega a `/productos?q=...` | Navbar.spec |
| Login redirige a `/admin` (admin) o `/` (cliente) | Login.spec |
| Filtros de productos (texto desde la URL, solo con stock) | Productos.spec |
| "+", "Limpiar" y "Comprar ahora" en el carrito | Carrito.spec |
| Eliminar producto/usuario con confirmación aceptada o cancelada | Admin.spec, AdminGestion.spec |
| Crear y editar productos, categorías y usuarios desde el panel | Admin.spec, AdminGestion.spec |

### 4.6 Lógica de negocio (funciones puras)
| Prueba | Archivo |
|--------|---------|
| Validación de RUN chileno (dígito verificador, formato, K), correo, contraseña y números | validaciones.spec |
| Formato CLP y precio final con descuento | formato.spec |
| Cliente de json-server: URL y query string, 404 → null, POST/PATCH/DELETE, evento de refresco, errores de conexión y de estado HTTP | cliente.spec |
| Cliente de la API de Magic: parámetros de búsqueda, total por header, 404 → null, conversión carta → producto, precio por rareza, tipos ↔ categorías | mtg.spec |
| Catálogo: combinar carta + inventario, snapshot, guardar en inventario (POST si es nueva, PATCH si existe) | catalogo.spec |
| Pago exitoso crea la orden y descuenta stock vía API; pago rechazado (simulado / sin stock / carrito vacío) no lo toca | pagos.spec |
| Filtro y orden del catálogo (texto, categoría, stock, precio con oferta, nombre) | Productos.spec |
| Cálculo de reportes: ventas, ticket promedio, ventas por categoría, más vendidos | Admin.spec |
| Generación de slug de categorías (acentos, espacios, símbolos) | Admin.spec |

### 4.7 Integración de flujos (navegación completa)
| Prueba | Archivo |
|--------|---------|
| Detalle → añadir al carrito → carrito → checkout (autocompletado) → **pago exitoso** (stock descontado y carrito vacío) | App.spec |
| Checkout como invitado → **pago rechazado** → "Volver a realizar el pago" conserva el carrito | App.spec |
| Rutas protegidas: `/admin` sin sesión → `/login`; cliente en `/admin` → `/` | App.spec |
| Ruta inexistente → página 404 | App.spec |

---

## 5. Cobertura por módulo

| Módulo              | Sentencias | Ramas  | Funciones | Líneas |
|---------------------|-----------:|-------:|----------:|-------:|
| `src/` (App)        | 100%       | 100%   | 100%      | 100%   |
| `src/components`    | 98,56%     | 95,57% | 96,82%    | 99,13% |
| `src/context`       | 95,50%     | 84,84% | 100%      | 97,18% |
| `src/api`           | 98,74%     | 89,52% | 100%      | 99,20% |
| `src/utils`         | 100%       | 94,33% | 100%      | 100%   |
| `src/pages/tienda`  | 97,10%     | 92,24% | 95,08%    | 97,35% |
| `src/pages/admin`   | 87,60%     | 92,19% | 83,51%    | 89,41% |

---

## 6. Análisis de resultados

**Fortalezas**
- Toda la lógica de negocio y de acceso a la API (`api/`, `utils/`) y los componentes reutilizables (`components/`) tienen ~100% de líneas cubiertas: son las piezas que usan todas las vistas.
- Los dos flujos críticos para el negocio (compra exitosa y pago con error) están probados de punta a punta, incluido el efecto sobre el stock.
- Las pruebas detectaron **dos errores reales** durante el desarrollo, que fueron corregidos:
  1. Tras pagar, el checkout redirigía al carrito en vez de a "compra exitosa", porque el carrito se vaciaba antes de que terminara la navegación (React Router 7 navega como transición). Se corrigió en `Checkout.jsx`.
  2. Un `useEffect` en `App.jsx` devolvía un valor que React intentaba usar como función de limpieza (`destroy is not a function`).

**Zonas con menor cobertura y justificación**
| Archivo | Líneas sin cubrir | Motivo |
|---------|-------------------|--------|
| `AdminLayout.jsx` | Botón de menú móvil y "Cerrar sesión" del panel | Comportamiento equivalente al de la Navbar, que sí está probado. |
| Páginas admin | Mensajes de error cuando una escritura en la API falla (crear/editar/eliminar) | El manejo de errores de la API está probado en el cliente (`cliente.spec`) y en las vistas de lectura. |
| `ResultadoPago.jsx` | Botones "Imprimir boleta" y "Enviar boleta por email" | Llaman a `window.print` / `alert`, que son funciones del navegador sin lógica propia. |
| `ProductoDetalle.jsx` (ramas) | Productos relacionados cuando la categoría tiene un solo producto | Caso de borde de presentación. |

**Próximos pasos sugeridos**
1. Probar los mensajes de error de escritura en las páginas del panel de administración.
2. Probar el menú móvil del panel de administración.
3. Integrar `npm test` en un flujo de integración continua (GitHub Actions) para ejecutar las pruebas en cada push.

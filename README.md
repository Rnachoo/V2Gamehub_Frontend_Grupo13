
```
Integrantes: Ignacio Paredes, Marthin Celedon, Facundo Benítez.
```
---
Enlace: https://v2-gamehub-frontend-grupo13.vercel.app/
---
<img width="120" height="120" alt="Logotipo GameHub" src="src/assets/logo.png">

GameHub Store es el FrontEnd de una tienda gamer online, migrado a React en esta segunda versión. Sin backend por ahora: los datos salen de servicios simulados que devuelven Promesas y las órdenes se guardan en `localStorage`.

* **React + Vite** — componentes con props, estado y contexto para el carrito
* **Bootstrap 5** — diseño responsivo con la paleta propia
* **Jasmine + Karma** — 10 pruebas unitarias con reporte de cobertura

| Vista | Ruta |
|---|---|
| Inicio | `/` |
| Catálogo | `/catalogo` |
| Producto | `/producto/:id` |
| Carrito | `/carrito` |
| Checkout | `/checkout` |
| Mis órdenes | `/mis-ordenes` |
| Crear cuenta | `/crear-cuenta` |

## Cómo ejecutar

Requiere Node.js 20.19+ y Google Chrome para las pruebas.

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # pruebas + cobertura en coverage/html/index.html
```

## Paleta de colores

Vitrina oscura — grises azulados y celeste, pensada para catálogos largos con poca luz.

| Fondo | Superficie | Primario | Acento | Texto | Error |
|---|---|---|---|---|---|
| `#171A21` | `#1B2838` | `#66C0F4` | `#ACD550` | `#C7D5E0` | `#FF6B6B` |

## Estructura de carpetas

```
src/
├── assets/
├── components/    piezas reutilizables
├── context/       CarritoContext
├── data/          datos simulados
├── pages/         una vista por ruta
├── services/      acceso a datos con Promesas
├── styles/
└── utils/         carrito, precios y validaciones
```

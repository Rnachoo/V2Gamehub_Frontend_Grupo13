
```
Integrantes: Ignacio Paredes, Marthin Celedon, Facundo Benítez.
```

Enlace: https://v2-gamehub-frontend-grupo13.vercel.app/

<img width="120" height="120" alt="Logotipo GameHub" src="src/assets/logo.png">

GameHub Store es el FrontEnd de una tienda gamer online en React. Desde EP3 consume los microservicios Spring Boot de GameHub a través del API Gateway (puerto 8080) con autenticación JWT.

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
| Panel de administración (solo ADMIN) | `/panel-admin` |

## Cómo ejecutar

Requiere Node.js 20.19+, Google Chrome para las pruebas y el backend levantado (Eureka, los 10 microservicios y el Gateway).

```bash
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
npm test        # pruebas + cobertura en coverage/html/index.html
```

## Variables de entorno

| Variable | Ejemplo | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | URL base del API Gateway |

El repositorio solo trae `.env.example`; el `.env` real no se sube.

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
├── hooks/         useCargaDatos
├── services/      apiClient y acceso a la API REST
├── styles/
└── utils/         carrito, precios, validaciones y errores
```

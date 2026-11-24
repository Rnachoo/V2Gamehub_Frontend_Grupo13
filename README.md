```
Integrantes: Ignacio Paredes, Marthin Celedon, Facundo Benítez.
```

Enlace: https://v2-gamehub-frontend-grupo13.vercel.app/

<img width="120" height="120" alt="Logotipo GameHub" src="src/assets/logo.png">

GameHub Store es el FrontEnd de una tienda gamer online en React. Desde EP3 consume los microservicios Spring Boot de GameHub a través del API Gateway (puerto 8080) con autenticación JWT.

* **React + Vite** — componentes con props, estado y contexto para la sesión y el carrito
* **React Router** — rutas protegidas por sesión y rol
* **Bootstrap 5** — diseño responsivo con la paleta propia
* **Jasmine + Karma** — 10 pruebas unitarias con reporte de cobertura

| Vista | Ruta |
|---|---|
| Inicio | `/` |
| Catálogo | `/catalogo` |
| Producto | `/producto/:id` |
| Carrito | `/carrito` |
| Iniciar sesión | `/login` |
| Crear cuenta | `/crear-cuenta` |
| Checkout (con sesión) | `/checkout` |
| Mis órdenes (con sesión) | `/mis-ordenes` |
| Panel del operador (OPERADOR y ADMIN) | `/panel-operador` |
| Panel de administración (solo ADMIN) | `/panel-admin` |

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
├── context/       AuthContext y CarritoContext
├── data/          regiones y comunas
├── pages/         una vista por ruta
├── hooks/         useCargaDatos
├── services/      apiClient y acceso a la API REST
├── styles/
└── utils/         carrito, precios, validaciones y errores
```

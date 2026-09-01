# PPAI 2026 · Sistema de Seguimiento de Bolsines

Trabajo Práctico Aplicado Integrador de la cátedra Diseño de Sistemas de Información — Grupo 1.

Implementa el **CU36 - Consultar seguimiento de bolsines** (con el **CU31 - Notificar ubicación de bolsín** incluido), siguiendo el modelo de análisis desarrollado durante la materia: diseño orientado a objetos con patrones GRASP y arquitectura Boundary-Control-Entity (BCE).

## Índice

- [Dominio](#dominio)
- [Arquitectura y diagramas](#arquitectura-y-diagramas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts disponibles](#scripts-disponibles)

## Dominio

El sistema modela el traslado de **bolsines** (bolsas con documentación médica, precintadas y con un dispositivo GPS) entre **Comisiones Médicas** (CM) — organismos regionales que envían y reciben esta documentación.

**Conceptos principales:**

| Concepto | Descripción |
|---|---|
| **Comisión Médica** | Organismo con nombre y código propio. Cada Bolsín tiene una CM de origen y una de destino. |
| **Bolsín** | Unidad física que se envía entre dos Comisiones Médicas. Tiene un número de precinto, un `DispositivoGPS` asociado y un historial de `CambioDeEstadoBolsin`. |
| **Estado del Bolsín** | Creado → Cerrado → Enviado → Recibido en CM destino (o De baja). Modelado en [`MaquinaEstadosBolsin.plantuml`](MaquinaEstadosBolsin.plantuml). |
| **Remito** | Documentación que viaja dentro de un Bolsín. Su máquina de estados está modelada en [`MaquinaEstadosRemito.plantuml`](MaquinaEstadosRemito.plantuml) como parte del dominio completo, pero **no está implementado en código** — el alcance actual del sistema es CU36/CU31. |
| **Empleado** | Persona que trabaja en una Comisión Médica, con un `Rol` (Gerente o Administrativo). El Gerente de la CM destino es quien recibe la notificación de ubicación. |
| **Usuario / Sesión** | Credenciales de acceso al sistema y la sesión activa de un Empleado logueado. |
| **Dispositivo GPS** | Hardware asociado a cada Bolsín (3 modelos simulados: XTR-4500L, NavTrack QX-7A, GeoPulse MTR-900), cada uno con su propio formato de respuesta simulado. |

**Flujo funcional (CU36 + CU31):**

1. Un Encargado de Bolsín (empleado ya logueado) abre la pantalla de seguimiento.
2. El sistema busca los bolsines en estado **Enviado** cuyo origen es la Comisión Médica del usuario, y localiza su posición actual vía el `DispositivoGPS` de cada uno.
3. El usuario ve los bolsines sobre un mapa y puede seleccionar uno.
4. Al confirmar el envío de la notificación (CU31, incluido), el sistema registra un nuevo reporte de ubicación y envía (simulado, por consola) un mail al Gerente de la Comisión Médica destino con la ubicación actual del bolsín.

Los datos son un mock en memoria ([`mockData.ts`](proyecto/backend/src/mockData.ts)) — no hay base de datos real.

## Arquitectura y diagramas

El backend sigue el patrón **Boundary-Control-Entity**: `GestorSegBolsines`/`GestorLogin` son clases de **Control** (patrón GRASP *Controller*, una instancia por interacción), las clases de `domain/` son **Entity**, y `boundary/` son las interfaces hacia sistemas externos (GPS Tracker, Mapa). La capa `http/` es el adaptador REST que traduce entre Express y estas clases — no forma parte del modelo BCE en sí, es la infraestructura necesaria para exponerlo como API.

Diagramas UML del modelo de análisis (PlantUML), en la raíz del repo:

- [`DiagramaDeClases.puml`](DiagramaDeClases.puml) — clases de soporte de CU36/CU31.
- [`DiagramaDeSecuenciaPPAI.puml`](DiagramaDeSecuenciaPPAI.puml) — secuencia de CU36 con CU31 incluido.
- [`MaquinaEstadosBolsin.plantuml`](MaquinaEstadosBolsin.plantuml) / [`MaquinaEstadosRemito.plantuml`](MaquinaEstadosRemito.plantuml) — máquinas de estado del dominio completo.

## Estructura del proyecto

```
PPAI-2026-Grupo1/
├── DiagramaDeClases.puml           # Diagramas UML del modelo de análisis
├── DiagramaDeSecuenciaPPAI.puml
├── MaquinaEstadosBolsin.plantuml
├── MaquinaEstadosRemito.plantuml
│
└── proyecto/
    ├── backend/                    # API REST (Node + Express + TypeScript)
    │   ├── src/
    │   │   ├── domain/             # Entidades: Bolsin, CambioDeEstadoBolsin, EstadoBolsin,
    │   │   │                       #   ComisionMedica, DispositivoGPS, Empleado, Rol, Sesion, Usuario
    │   │   ├── boundary/           # Interfaces hacia sistemas externos (GPS Tracker, Mapa)
    │   │   ├── controllers/        # Clases de Control (GRASP): GestorSegBolsines, GestorLogin
    │   │   ├── repositories/       # Acceso a los datos mock (seam para reemplazar por una DB real)
    │   │   ├── http/               # Adaptadores Express: traducen HTTP <-> clases de Control
    │   │   ├── mockData.ts         # Datos simulados en memoria
    │   │   ├── swagger.ts          # Configuración de Swagger/OpenAPI
    │   │   └── server.ts           # Punto de entrada, define las rutas
    │   ├── eslint.config.js
    │   ├── .env.example
    │   └── package.json
    │
    └── frontend/                   # SPA (React + Vite + TypeScript)
        ├── src/
        │   ├── screens/            # Login, MenuPrincipal, PantSegBolsines
        │   ├── components/         # MapaBolsines (Leaflet), PageBackground (UI compartida)
        │   ├── api.ts              # Capa de acceso a la API + manejo de sesión (token)
        │   └── App.tsx             # Enrutador básico entre pantallas según la sesión
        ├── vite.config.ts
        ├── eslint.config.js
        ├── .env.example
        └── package.json
```

Los archivos `*.test.ts(x)` viven junto al código que prueban (convención de vitest), no en una carpeta `tests/` separada.

## Tecnologías utilizadas

### Backend

| Tecnología | Por qué se usa |
|---|---|
| **Node.js + TypeScript** | Tipado estático para modelar el dominio (clases, relaciones, cardinalidades) con la misma fidelidad que los diagramas UML de la cátedra. |
| **Express** | Framework HTTP minimalista; el proyecto necesita rutas REST simples, no un framework opinado con ORM/DI incorporados. |
| **ts-node** | Ejecuta TypeScript directamente sin paso de build separado, adecuado para un proyecto académico sin pipeline de CI/CD. |
| **swagger-jsdoc + swagger-ui-express** | Documentación interactiva de la API a partir de comentarios `@openapi` en el propio código fuente, sin mantener un spec YAML aparte. |
| **cors** | El frontend (Vite, puerto 5173) y el backend (puerto 3000) corren en orígenes distintos en desarrollo. |

### Frontend

| Tecnología | Por qué se usa |
|---|---|
| **React + TypeScript** | Encaja con las tres pantallas con estado local (Login, Menú, Seguimiento) sin necesitar un framework full-stack. |
| **Vite** | Dev server con HMR rápido y build de producción simple; sin configuración de webpack manual. |
| **Tailwind CSS** | Estilado utilitario consistente (glassmorphism) sin escribir CSS a mano por componente. |
| **Leaflet + react-leaflet** | Mapa interactivo de código abierto (OpenStreetMap) para ubicar los bolsines geográficamente, sin depender de una API key de un proveedor comercial. |

### Calidad y tooling (ambos paquetes)

| Tecnología | Por qué se usa |
|---|---|
| **ESLint (flat config) + typescript-eslint** | Detecta errores y código muerto de forma estática; complementa al compilador de TS. |
| **Prettier** | Formato consistente automático, evita discusiones de estilo en el código. |
| **Vitest** | Test runner único para backend y frontend (comparte configuración con Vite), rápido y con API compatible con Jest. |
| **Supertest** | Prueba los endpoints Express reales (integración) sin levantar un servidor HTTP aparte. |
| **Testing Library + jsdom** | Prueba los componentes React simulando interacción real de usuario (clicks, tipeo) en vez de acoplarse a detalles de implementación. |

## Puesta en marcha

Requiere Node.js 20+ y npm.

```bash
# Backend
cd proyecto/backend
npm install
cp .env.example .env   # opcional: PORT y GPS_TRACKER_API_KEY tienen defaults funcionales
npm run dev             # http://localhost:3000  (Swagger en /api-docs)

# Frontend (en otra terminal)
cd proyecto/frontend
npm install
cp .env.example .env    # opcional: VITE_API_BASE apunta a localhost:3000 por defecto
npm run dev              # http://localhost:5173
```

**Credenciales de prueba** (contraseña `1234` para todos): `jperez` (Villa María), `agomez` (Córdoba, Gerente), `lmartinez` (Córdoba), `cruiz` (Río Cuarto, Gerente), `speralta` (Río Cuarto).

## Scripts disponibles

Disponibles en `proyecto/backend` y `proyecto/frontend`:

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo (backend con recarga automática vía nodemon, frontend con Vite). |
| `npm start` | *(solo backend)* Levanta el servidor sin recarga automática. |
| `npm run build` | *(solo frontend)* Compila TypeScript y genera el build de producción. |
| `npm run preview` | *(solo frontend)* Sirve el build de producción generado por `build`. |
| `npm run lint` | Corre ESLint sobre todo el paquete. |
| `npm run format` | Formatea el código con Prettier. |
| `npm test` | Corre los tests con Vitest. |

# PPAI 2026 · Sistema de Seguimiento de Bolsines

Trabajo Práctico Aplicado Integrador de la cátedra Diseño de Sistemas de Información — Grupo 1.

Implementa el **CU36 - Consultar seguimiento de bolsines** (con el **CU31 - Notificar ubicación de bolsín** incluido), siguiendo el modelo de análisis desarrollado durante la materia.
## Índice

- [Dominio](#dominio)
- [Arquitectura y diagramas](#arquitectura-y-diagramas)
- [Patrón Adapter (Entrega 3)](#patrón-adapter-entrega-3)
- [Detalles de implementación](#detalles-de-implementación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Despliegue](#despliegue)
- [Scripts disponibles](#scripts-disponibles)

## Dominio

El sistema modela el traslado de **bolsines** (bolsas con documentación médica, precintadas y con un dispositivo GPS) entre **Comisiones Médicas** (CM) — organismos regionales que envían y reciben esta documentación.

**Conceptos principales:**

| Concepto | Descripción |
|---|---|
| **Comisión Médica** | Organismo con nombre y código propio. Cada Bolsín tiene una CM de origen y una de destino. |
| **Bolsín** | Unidad física que se envía entre dos Comisiones Médicas. Tiene un número de precinto, un `DispositivoGPS` asociado y un historial de `CambioDeEstadoBolsin`. |
| **Estado del Bolsín** | Creado → Cerrado → Enviado → Recibido en CM destino (o De baja). Modelado en [`MaquinaEstadosBolsin.plantuml`](Analisis/MaquinaEstadosBolsin.plantuml). |
| **Remito** | Documentación que viaja dentro de un Bolsín. Su máquina de estados está modelada en [`MaquinaEstadosRemito.plantuml`](Analisis/MaquinaEstadosRemito.plantuml) como parte del dominio completo, pero **no está implementado en código** — el alcance actual del sistema es CU36/CU31. |
| **Empleado** | Persona que trabaja en una Comisión Médica, con un `Rol` (Gerente o Administrativo). El Gerente de la CM destino es quien recibe la notificación de ubicación. |
| **Usuario / Sesión** | Credenciales de acceso al sistema y la sesión activa de un Empleado logueado. |
| **Dispositivo GPS** | Hardware asociado a cada Bolsín (3 modelos simulados: XTR-4500L, NavTrack QX-7A, GeoPulse MTR-900), cada uno con su propio formato de respuesta simulado, unificado mediante el patrón Adapter. |

**Flujo funcional (CU36 + CU31):**

1. Un Encargado de Bolsín (empleado ya logueado) abre la pantalla de seguimiento.
2. El sistema busca los bolsines en estado **Enviado** cuyo origen es la Comisión Médica del usuario, y le pide su ubicación al GPS Tracker de cada uno (a través del adaptador de su modelo).
3. El usuario ve los bolsines sobre un mapa y puede seleccionar uno.
4. Al confirmar el envío de la notificación (CU31, incluido), el sistema envía (simulado, por consola) un mail al Gerente de la Comisión Médica destino con la última ubicación informada del bolsín.

**Flujos alternativos implementados:** A1 (no hay bolsines en estado Enviado: usuario `cruiz`), A2 (no se encuentra el número de precinto filtrado), A3 (el GPS Tracker no pudo informar la ubicación: bolsín 4507 de `jperez`), A4/A5 (cancelar la consulta o el envío del mail).

Los datos se persisten en **PostgreSQL** mediante **Prisma**. [`mockData.ts`](proyecto/backend/src/mockData.ts) contiene los datos de prueba que el seed ([`prisma/seed.ts`](proyecto/backend/prisma/seed.ts)) carga en la base.

## Arquitectura y diagramas

El backend sigue el patrón **Boundary-Control-Entity**: `GestorSegBolsines`/`GestorLogin` son clases de **Control** (patrón GRASP *Controller*, una instancia por interacción), las clases de `domain/` son **Entity**, y `boundary/` son las interfaces hacia sistemas externos (GPS Tracker, Mapa). `repositories/` convierte las filas de la base en objetos de dominio relacionados por punteros. La capa `http/` es el adaptador REST que traduce entre Express y estas clases — no forma parte del modelo BCE en sí, es la infraestructura necesaria para exponerlo como API.

Diagramas UML (PlantUML; las imágenes generadas están en `out/`):

- [`Analisis/DiagramaDeClases.puml`](Analisis/DiagramaDeClases.puml) — clases de soporte de CU36/CU31.
- [`Analisis/DiagramaDeSecuenciaPPAI.puml`](Analisis/DiagramaDeSecuenciaPPAI.puml) — secuencia de análisis de CU36 con CU31 incluido.
- [`Analisis/MaquinaEstadosBolsin.plantuml`](Analisis/MaquinaEstadosBolsin.plantuml) / [`Analisis/MaquinaEstadosRemito.plantuml`](Analisis/MaquinaEstadosRemito.plantuml) — máquinas de estado del dominio completo.
- [`AplicacionAdapter/DiagramaClasesAdapter.plantuml`](AplicacionAdapter/DiagramaClasesAdapter.plantuml) / [`AplicacionAdapter/DiagramaSecuenciaAdapter.plantuml`](AplicacionAdapter/DiagramaSecuenciaAdapter.plantuml) — vistas estática y dinámica del rediseño con el patrón Adapter.
- `vistasArquitectónicas/` — vistas de funcionalidad, diseño y despliegue (Entrega 2).

## Patrón Adapter (Entrega 3)

Los tres modelos de GPS Tracker exponen interfaces distintas (nombre de endpoint, parámetros y formato de respuesta: JSON, String separado por comas o matriz). El patrón **Adapter** las unifica detrás de una única interfaz, de modo que el Gestor no conoce el modelo ni el formato, y agregar un modelo nuevo solo requiere un adaptador nuevo.

| Rol en el patrón | Clase | Archivo |
|---|---|---|
| Cliente | `InterfazGPSTracker` | [`boundary/InterfazGPSTracker.ts`](proyecto/backend/src/boundary/InterfazGPSTracker.ts) |
| Target | `IAdaptadorGPSTracker` | [`boundary/gps/IAdaptadorGPSTracker.ts`](proyecto/backend/src/boundary/gps/IAdaptadorGPSTracker.ts) |
| Adapter | `AdaptadorXTR4500L`, `AdaptadorNavTrackQX7A`, `AdaptadorGeoPulseMTR900` | [`boundary/gps/`](proyecto/backend/src/boundary/gps/) |
| Adaptee | `ServicioXTR4500L`, `ServicioNavTrackQX7A`, `ServicioGeoPulseMTR900` (simulados) | [`boundary/gps/`](proyecto/backend/src/boundary/gps/) |

El método de enganche es `GestorSegBolsines.buscarUbicacionBolsines()`. La identificación y justificación del patrón está en el documento de la Entrega 3.

## Detalles de implementación

| Aspecto | Elección |
|---|---|
| Lenguaje de programación | TypeScript (Node.js en el backend) |
| Framework de programación | Express (API REST) y React (interfaz de usuario) |
| Tecnología | Web (SPA + API REST) |
| Base de datos | PostgreSQL 17 (en contenedor Docker) |
| Framework de persistencia | Prisma ORM 6 |

## Estructura del proyecto

```
PPAI-2026-Grupo1/
├── Analisis/                       # Diagramas UML del modelo de análisis
├── AplicacionAdapter/              # Diagramas del rediseño con el patrón Adapter
├── vistasArquitectónicas/          # Vistas arquitectónicas (Entrega 2)
├── out/                            # Imágenes generadas de los diagramas
│
└── proyecto/
    ├── backend/                    # API REST (Node + Express + TypeScript)
    │   ├── prisma/                 # schema.prisma, migraciones y seed de la base de datos
    │   ├── docker-compose.yml      # PostgreSQL para desarrollo
    │   ├── src/
    │   │   ├── domain/             # Entidades: Bolsin, CambioDeEstadoBolsin, EstadoBolsin,
    │   │   │                       #   ComisionMedica, DispositivoGPS, Empleado, Rol, Sesion, Usuario
    │   │   ├── boundary/           # Interfaces hacia sistemas externos (GPS Tracker, Mapa)
    │   │   │   └── gps/            # Patrón Adapter: IAdaptadorGPSTracker, adaptadores y servicios GPS
    │   │   ├── controllers/        # Clases de Control (GRASP): GestorSegBolsines, GestorLogin
    │   │   ├── repositories/       # Acceso a PostgreSQL con Prisma; arman los objetos de dominio
    │   │   ├── http/               # Adaptadores Express: traducen HTTP <-> clases de Control
    │   │   ├── mockData.ts         # Datos de prueba que carga el seed
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
| **PostgreSQL** | Base de datos relacional donde se persisten las entidades del dominio. |
| **Prisma** | ORM: define el esquema (`schema.prisma`), genera las migraciones y un cliente tipado para las consultas de los repositorios. |
| **Docker Compose** | Levanta PostgreSQL con un solo comando, sin instalarlo en la máquina. |

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

## Despliegue

Requiere Node.js 20+, npm y Docker (para PostgreSQL).

```bash
# Backend
cd proyecto/backend
npm install
cp .env.example .env   # DATABASE_URL apunta al PostgreSQL de docker-compose
npm run db:up           # levanta PostgreSQL (Docker)
npm run db:migrate      # crea las tablas
npm run db:seed         # carga los datos de prueba
npm run dev             # http://localhost:3000  (Swagger en /api-docs)

# Frontend (en otra terminal)
cd proyecto/frontend
npm install
cp .env.example .env    # opcional: VITE_API_BASE apunta a localhost:3000 por defecto
npm run dev              # http://localhost:5173
```

**Credenciales de prueba** (contraseña `1234` para todos): `jperez` (Villa María), `agomez` (Córdoba, Gerente), `lmartinez` (Córdoba), `cruiz` (Río Cuarto, Gerente), `speralta` (Río Cuarto).

Los tests de la API (`server.test.ts`) usan la base de datos: requieren PostgreSQL levantado y el seed cargado.

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
| `npm run db:up` | *(solo backend)* Levanta PostgreSQL con Docker Compose. |
| `npm run db:migrate` | *(solo backend)* Aplica las migraciones de Prisma (crea/actualiza las tablas). |
| `npm run db:seed` | *(solo backend)* Carga los datos de prueba en la base. |

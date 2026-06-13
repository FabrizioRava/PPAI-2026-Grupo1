1. ESTRUCTURA

proyecto/
├── frontend/ (React + TS)
│   ├── src/
│   │   ├── components/       # Componentes visuales (Mapa, Filtros)
│   │   └── screens/          # PantSegBolsines (La pantalla principal)
└── backend/ (Node.js + TS)
    ├── src/
    │   ├── controllers/      # GestorSegBolsines
    │   ├── domain/           # Entidades (Bolsin, Sesion, Empleado, etc.)
    │   ├── mockData.ts       # Base de datos simulada en memoria (¡Clave!)
    │   └── server.ts         # Punto de entrada de la API
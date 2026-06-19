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


COMO CORRER PROYECTO
Terminal front, back

BACK
npm install
npm run start

FRONT
npm install
# Actualizar dependencias
npm install @vitejs/plugin-react@latest --save-dev

npm cache clean -f
sudo npm install -g n
sudo n lts

npm run dev

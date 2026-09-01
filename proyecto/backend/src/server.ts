import express from 'express';
import cors from 'cors';
import { BolsinesController } from './http/BolsinesController';
import { AuthController } from './http/AuthController';
import { setupSwagger } from './swagger';
// Importamos mockData para inicializar las instancias en memoria (usuarios, empleados, bolsines)
import './mockData';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de Swagger
setupSwagger(app);

// Rutas de autenticación
app.post('/api/login', AuthController.login);
app.post('/api/logout', AuthController.logout);
app.get('/api/me', AuthController.me);

// Rutas de seguimiento de bolsines (requieren sesión activa)
app.get('/api/bolsines', BolsinesController.getTodosLosBolsines);
app.get('/api/bolsines/activos', BolsinesController.getBolsinesActivos);
app.post('/api/bolsines/seleccionar', BolsinesController.seleccionarBolsin);
app.post('/api/bolsines/notificar', BolsinesController.notificarUbicacionBolsin);

export { app };

// Solo levanta el listener si el archivo se ejecuta directamente (no al importar `app` en tests).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  });
}

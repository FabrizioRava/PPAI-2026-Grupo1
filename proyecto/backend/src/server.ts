import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { GestorSegBolsines } from './controllers/GestorSegBolsines';
// Importamos mockData para inicializar las instancias y registrar la sesión activa
import './mockData';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Seguimiento de Bolsines',
      version: '1.0.0',
      description: 'Documentación de los endpoints para el sistema de gestión y localización de bolsines.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  // Dónde buscar los comentarios de documentación
  apis: ['./src/server.ts', './src/controllers/*.ts'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Ruta para Documentacion
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Rutas
app.get('/api/bolsines/activos', GestorSegBolsines.getBolsinesActivos);
app.post('/api/bolsines/notificar', GestorSegBolsines.notificarUbicacionBolsin);
app.get('/api/bolsines', GestorSegBolsines.getTodosLosBolsines);

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
});

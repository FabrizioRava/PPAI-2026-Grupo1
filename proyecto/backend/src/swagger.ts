import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Seguimiento de Bolsines (PPAI)',
      version: '1.0.0',
      description: 'Documentación de los endpoints de la API del proyecto Bolsines, incluyendo Autenticación y Seguimiento.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local Express',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/server.ts', './dist/controllers/*.js', './dist/server.js'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('Documentación de Swagger disponible en http://localhost:3000/api-docs');
}

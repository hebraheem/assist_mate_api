import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';

// Basic metadata for Swagger documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assist Mate ',
      version: '1.0.0',
      description: 'API documentation for assist mate REST API',
    },
    servers: [
      {
        url: 'http://localhost:4000', // Update with your server URL
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Points to the route files for Swagger to read
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwaggerDocs = (app) => {
  // Swagger documentation route
  app.use('/api-docs', serve, setup(swaggerSpec));
  console.log('Swagger Docs are available at /api-docs');
};

export default setupSwaggerDocs;

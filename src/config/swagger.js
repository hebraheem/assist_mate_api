import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import localStorage from '../utils/localStorage.js';

const getTokenToPersist = {
  swaggerOptions: {
    authAction: {
      authorize: {
        name: 'BearerAuth',
        schema: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
        value: localStorage.getItem('jwtToken') || '', // Persist token from localStorage
      },
    },
    onComplete: function () {
      // Swagger UI: On load, check for a stored token in localStorage
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        ui.authActions.authorize({
          BearerAuth: {
            name: 'BearerAuth',
            schema: {
              type: 'apiKey',
              in: 'header',
              name: 'Authorization',
            },
            value: storedToken,
          },
        });
      }
    },
  },
};

// Basic metadata for Swagger documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assist Mate ',
      version: '1.0.0',
      description: 'API documentation for assist mate REST API',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
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
  app.use('/api-docs', serve, setup(swaggerSpec, getTokenToPersist));
};

export default setupSwaggerDocs;

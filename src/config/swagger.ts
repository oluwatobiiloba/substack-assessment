import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SUBSTACK - ASSESSMENT',
      version: '1.0.0',
      description: 'A RESTful API for managing store products with role-based authentication',
      contact: {
        name: 'Oluwatobiloba Aremu',
        url: 'https://github.com/oluwatobiiloba/substack-assessment',
        email: 'oluwatobiloba.f.a@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock', 'sku'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the product',
            },
            name: {
              type: 'string',
              description: 'The name of the product',
            },
            description: {
              type: 'string',
              description: 'The description of the product',
            },
            price: {
              type: 'number',
              description: 'The price of the product',
              minimum: 0,
            },
            stock: {
              type: 'integer',
              description: 'The available stock of the product',
              minimum: 0,
            },
            sku: {
              type: 'string',
              description: 'The unique SKU of the product',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ClientSync API',
    version: '1.0.0',
    description: 'Multi-tenant SaaS API for AI-powered customer support chatbots',
    contact: {
      name: 'ClientSync Team',
      email: 'support@clientsync.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server'
    },
    {
      url: 'https://api.clientsync.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      },
      SubdomainHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-subdomain',
        description: 'Organization subdomain for multi-tenant access'
      }
    },
    schemas: {
      Organization: {
        type: 'object',
        properties: {
          id: { 
            type: 'string', 
            example: 'cluv1234567890',
            description: 'Unique organization identifier'
          },
          subdomain: { 
            type: 'string', 
            example: 'acme-corp',
            description: 'Unique subdomain for the organization'
          },
          companyName: { 
            type: 'string', 
            example: 'Acme Corporation',
            description: 'Company name'
          },
          contactEmail: { 
            type: 'string', 
            example: 'admin@acme.com',
            description: 'Primary contact email'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Organization creation timestamp'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update timestamp'
          }
        },
        required: ['id', 'subdomain', 'companyName', 'contactEmail']
      },
      User: {
        type: 'object',
        properties: {
          id: { 
            type: 'string', 
            example: 'cluv1234567890',
            description: 'Unique user identifier'
          },
          firstName: { 
            type: 'string', 
            example: 'John',
            description: 'User first name'
          },
          lastName: { 
            type: 'string', 
            example: 'Doe',
            description: 'User last name'
          },
          email: { 
            type: 'string', 
            example: 'john.doe@acme.com',
            description: 'User email address'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'User creation timestamp'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update timestamp'
          }
        },
        required: ['id', 'firstName', 'lastName', 'email']
      },
      ChatBot: {
        type: 'object',
        properties: {
          id: { 
            type: 'string', 
            example: 'cluv1234567890',
            description: 'Unique chatbot identifier'
          },
          name: { 
            type: 'string', 
            example: 'Support Bot',
            description: 'Chatbot name'
          },
          description: { 
            type: 'string', 
            example: 'General customer support chatbot',
            description: 'Chatbot description'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Chatbot creation timestamp'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update timestamp'
          }
        },
        required: ['id', 'name']
      },
      RegisterRequest: {
        type: 'object',
        required: ['companyName', 'contactEmail', 'subdomain', 'firstName', 'lastName', 'email', 'password'],
        properties: {
          companyName: { 
            type: 'string', 
            example: 'Acme Corporation',
            description: 'Company name',
            minLength: 2
          },
          contactEmail: { 
            type: 'string', 
            format: 'email',
            example: 'admin@acme.com',
            description: 'Primary contact email'
          },
          subdomain: { 
            type: 'string', 
            example: 'acme-corp',
            description: 'Unique subdomain (3-30 chars, lowercase, numbers, hyphens)',
            pattern: '^[a-z0-9-]+$',
            minLength: 3,
            maxLength: 30
          },
          firstName: { 
            type: 'string', 
            example: 'John',
            description: 'First name of the admin user',
            minLength: 1
          },
          lastName: { 
            type: 'string', 
            example: 'Doe',
            description: 'Last name of the admin user',
            minLength: 1
          },
          email: { 
            type: 'string', 
            format: 'email',
            example: 'john.doe@acme.com',
            description: 'Email of the admin user'
          },
          password: { 
            type: 'string', 
            example: 'SecurePass123',
            description: 'Password (min 6 chars, must contain letter and number)',
            minLength: 6
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password', 'subdomain'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            example: 'john.doe@acme.com',
            description: 'User email address'
          },
          password: { 
            type: 'string', 
            example: 'SecurePass123',
            description: 'User password'
          },
          subdomain: { 
            type: 'string', 
            example: 'acme-corp',
            description: 'Organization subdomain'
          }
        }
      },
      CreateChatBotRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { 
            type: 'string', 
            example: 'Support Bot',
            description: 'Chatbot name',
            minLength: 1
          },
          description: { 
            type: 'string', 
            example: 'General customer support chatbot',
            description: 'Optional chatbot description'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { 
            type: 'boolean',
            description: 'Indicates if the request was successful'
          },
          message: { 
            type: 'string',
            description: 'Response message'
          },
          data: { 
            type: 'object',
            description: 'Response data (varies by endpoint)'
          }
        },
        required: ['success']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { 
            type: 'boolean', 
            example: false,
            description: 'Always false for error responses'
          },
          message: { 
            type: 'string', 
            example: 'Error message',
            description: 'Error description'
          },
          errors: { 
            type: 'array',
            items: { 
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            },
            description: 'Detailed validation errors (if applicable)'
          }
        },
        required: ['success', 'message']
      },
      PaginatedResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 10 },
                  total: { type: 'integer', example: 100 },
                  totalPages: { type: 'integer', example: 10 }
                }
              }
            }
          }
        ]
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and registration endpoints'
    },
    {
      name: 'Organizations',
      description: 'Organization management endpoints'
    },
    {
      name: 'ChatBots',
      description: 'ChatBot management endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ], // Path to the API files
};

export const swaggerSpec = swaggerJSDoc(options);
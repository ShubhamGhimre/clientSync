import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'ClientSync API',
        version: '1.0.0',
        description: 'Multi-tenant SaaS API for AI-powered customer support chatbots',
        contact: {
            name: 'ClientSync Team',
            email: 'support@clientsync.com'
        }
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
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
                    id: { type: 'string', example: 'cluv1234567890' },
                    subdomain: { type: 'string', example: 'acme-corp' },
                    companyName: { type: 'string', example: 'Acme Corporation' },
                    contactEmail: { type: 'string', example: 'admin@acme.com' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'cluv1234567890' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john.doe@acme.com' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            ChatBot: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'cluv1234567890' },
                    name: { type: 'string', example: 'Support Bot' },
                    description: { type: 'string', example: 'General customer support chatbot' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['companyName', 'contactEmail', 'subdomain', 'firstName', 'lastName', 'email', 'password'],
                properties: {
                    companyName: { type: 'string', example: 'Acme Corporation' },
                    contactEmail: { type: 'string', example: 'admin@acme.com' },
                    subdomain: { type: 'string', example: 'acme-corp' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john.doe@acme.com' },
                    password: { type: 'string', example: 'SecurePass123' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password', 'subdomain'],
                properties: {
                    email: { type: 'string', example: 'john.doe@acme.com' },
                    password: { type: 'string', example: 'SecurePass123' },
                    subdomain: { type: 'string', example: 'acme-corp' }
                }
            },
            CreateChatBotRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Support Bot' },
                    description: { type: 'string', example: 'General customer support chatbot' }
                }
            },
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error message' },
                    errors: { type: 'array', items: { type: 'object' } }
                }
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
        }
    ]
};
const options = {
    definition: swaggerDefinition,
    apis: ['./src/routes/*.ts'], // Path to the API files
};
export const swaggerSpec = swaggerJSDoc(options);
//# sourceMappingURL=swagger.config.js.map
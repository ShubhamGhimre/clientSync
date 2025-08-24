import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import chatBotRoutes from './routes/chatbot.routes.js';
import supportTicketRoutes from './routes/supportTicket.routes.js';
import userRoutes from './routes/user.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import botAccessRoutes from './routes/botAccess.routes.js';
import ticketAttachmentRoutes from './routes/ticketAttachment.routes.js';
import chatRoomRoutes from './routes/chatRoom.routes.js';
import ragRoutes from './routes/rag.routes.js'
import fileRoutes from './routes/file.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './config/swagger.config.js';
import { extractSubdomain } from './middleware/subdomain.middleware.js';
import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Ultra-permissive CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    console.log(`🔄 CORS Preflight: ${req.method} ${req.path} from ${req.headers.origin || 'unknown'}`);
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Extract subdomain for all requests
app.use(extractSubdomain);

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.headers.origin || 'none'}`);
  console.log(`   Host: ${req.get('host')}`);
  console.log(`   Subdomain: ${req.subdomain || 'none'}`);
  console.log(`   Query: ${JSON.stringify(req.query)}`);
  next();
});

// Middleware to check tenant requirement for protected routes

const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  // Define routes that don't require tenant/subdomain
  const publicRoutes = [
    '/api/auth/register',
    '/api/auth/check-subdomain',
    '/health',
    '/api/docs',
    '/api/docs.json',
    '/api/test-cors',
    '/'
  ];

  // Check if current path is exactly in public routes
  const isPublicRoute = publicRoutes.includes(req.path);

  console.log(`🔒 Route check:`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Is Public: ${isPublicRoute}`);
  console.log(`   Subdomain: ${req.subdomain || 'none'}`);

  // If it's a public route, allow without tenant
  if (isPublicRoute) {
    console.log(`✅ Public route access allowed: ${req.path}`);
    return next();
  }

  // For all other routes, require subdomain/tenant
  if (!req.subdomain) {
    console.log(`❌ Tenant required for: ${req.path}`);
    return res.status(400).json({
      success: false,
      message: 'Subdomain/tenant is required for this endpoint',
      code: 'TENANT_REQUIRED',
      path: req.path,
      method: req.method,
      hint: 'Access this endpoint using a subdomain like: http://your-org.localhost:5000',
      publicEndpoints: [
        'POST /api/auth/register',
        'GET /api/auth/check-subdomain',
        'GET /health',
        'GET /api/docs'
      ]
    });
  }

  console.log(`✅ Tenant verified: ${req.subdomain} for ${req.path}`);
  next();
};

// Apply tenant requirement middleware
app.use(requireTenant);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root endpoint (public)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClientSync API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    subdomain: req.subdomain || 'none',
    publicEndpoints: {
      health: `${req.protocol}://${req.get('host')}/health`,
      docs: `${req.protocol}://${req.get('host')}/api/docs`,
      register: `${req.protocol}://${req.get('host')}/api/auth/register`,
      checkSubdomain: `${req.protocol}://${req.get('host')}/api/auth/check-subdomain?subdomain=example`
    },
    tenantEndpoints: {
      login: `${req.protocol}://your-org.${req.get('host')}/api/auth/login`,
      dashboard: `${req.protocol}://your-org.${req.get('host')}/api/*`,
      note: 'Replace "your-org" with your actual organization subdomain'
    },
    cors: 'enabled - all origins allowed',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin || 'no origin',
    host: req.get('host'),
    subdomain: req.subdomain || 'none',
    timestamp: new Date().toISOString()
  });
});

// Swagger Documentation (public)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ClientSync API Documentation'
}));

// Swagger JSON endpoint (public)
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ClientSync API is running',
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    subdomain: req.subdomain || 'none (public access)',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    cors: 'enabled - all origins allowed',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/chatbots', chatBotRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chatrooms', chatRoomRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/bot-access', botAccessRoutes);
app.use('/api/ticket-attachments', ticketAttachmentRoutes);
app.use('/api/rag', ragRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    host: req.get('host'),
    subdomain: req.subdomain || 'none',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      public: [
        'GET /',
        'GET /health',
        'GET /api/docs',
        'GET /api/test-cors',
        'POST /api/auth/register',
        'GET /api/auth/check-subdomain'
      ],
      tenant: [
        'POST /api/auth/login (requires subdomain)',
        'GET /api/auth/me (requires subdomain)',
        'GET /api/organizations/* (requires subdomain)',
        'GET /api/chatbots/* (requires subdomain)',
        '... and all other endpoints (require subdomain)'
      ]
    },
    documentation: `${req.protocol}://${req.get('host')}/api/docs`
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ClientSync API Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at:`);
  console.log(`   - http://localhost:${PORT} (public endpoints)`);
  console.log(`   - http://127.0.0.1:${PORT} (public endpoints)`);
  console.log(`   - http://your-org.localhost:${PORT} (tenant endpoints)`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 CORS Test: http://localhost:${PORT}/api/test-cors`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`📝 Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔍 Check Subdomain: http://localhost:${PORT}/api/auth/check-subdomain?subdomain=example`);
  console.log(`🎯 Tenant-based login: http://your-org.localhost:${PORT}/api/auth/login`);
  console.log(`🌐 CORS: Ultra-permissive mode - ALL origins allowed`);
  console.log(`🔒 Tenant enforcement: Enabled for protected routes`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
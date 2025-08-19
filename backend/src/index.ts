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
import fileRoutes from './routes/file.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { PrismaClient } from '../generated/prisma/index.js';
import { swaggerSpec } from './config/swagger.config.js';
import { extractSubdomain } from './middleware/subdomain.middleware.js';


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any subdomain of localhost:3000
    if (!origin) return callback(null, true); // Allow non-browser requests (like Postman)
    const regex = /^https?:\/\/([a-z0-9-]+)\.localhost:3000$/i;
    if (regex.test(origin) || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(extractSubdomain);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ClientSync API Documentation'
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ClientSync API is running',
    timestamp: new Date().toISOString(),
    documentation: `${req.protocol}://${req.get('host')}/api/docs`
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

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ClientSync API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
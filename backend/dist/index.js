import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import chatBotRoutes from './routes/chatbot.routes';
import { errorHandler } from './middleware/error.middleware';
import { PrismaClient } from '../generated/prisma';
import { swaggerSpec } from './config/swagger.config';
// Load environment variables
dotenv.config();
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Initialize Prisma client
export const prisma = new PrismaClient();
// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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
//# sourceMappingURL=index.js.map
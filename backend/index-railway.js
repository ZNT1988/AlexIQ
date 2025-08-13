/**
 * AlexIQ Backend - Railway Production Server
 * Minimal stable version for production deployment
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration for production
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? (process.env.CORS_ORIGIN?.split(',') || ['https://alexiq.site', 'https://www.alexiq.site'])
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 1000 : 10000, // limit each IP
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        system: 'AlexIQ Backend',
        version: '1.0.0',
        environment: NODE_ENV
    });
});

app.get('/api/health/detailed', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        system: 'AlexIQ Backend - Production Ready',
        version: '1.0.0',
        environment: NODE_ENV,
        modules: {
            express: 'operational',
            cors: 'operational',
            security: 'operational',
            rateLimit: 'operational'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    });
});

// Basic API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        message: 'AlexIQ Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// AI Chat endpoint (minimal implementation)
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, model } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Simple response for now - integrate real AI later
        const response = {
            id: 'response-' + Date.now(),
            message: `AlexIQ received: "${message}". Full AI integration coming soon!`,
            model: model || 'alexiq-base',
            timestamp: new Date().toISOString(),
            status: 'success'
        };

        res.json(response);

    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'AI service temporarily unavailable'
        });
    }
});

// Ideas endpoint (minimal implementation)
app.get('/api/ideas', (req, res) => {
    res.json({
        ideas: [
            {
                id: 1,
                title: 'AlexIQ is launching!',
                description: 'Revolutionary AI system coming online',
                timestamp: new Date().toISOString()
            }
        ],
        total: 1,
        status: 'success'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : error.message
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AlexIQ Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`🔗 CORS origins:`, corsOptions.origin);
});

export default app;
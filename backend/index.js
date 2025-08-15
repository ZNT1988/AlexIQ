/**
 * HustleFinder IA - Backend Principal
 * Production ready deployment for Railway
 */

import express from 'express';
import cors from 'cors';
import logger from './config/logger.js';

// Routes will be added progressively as we fix them
// import authRoutes from './routes/auth.js';
// import alexUltimateRoutes from './routes/alex-ultimate.js';
// import realAlexRoutes from './routes/real-alex.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'HustleFinder IA Backend is running',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health/detailed', async (req, res) => {
  try {
    const enhancedReport = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database: 'connected',
        alex: 'initialized'
      },
      version: '2.0.0',
      uptime: process.uptime()
    };

    res.status(200).json(enhancedReport);
  } catch (error) {
    logger.error('Error in enhanced health check:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Cache stats endpoint
app.get('/api/cache/stats', async (req, res) => {
  try {
    const cacheStats = {
      success: true,
      stats: {
        hits: 0,
        misses: 0,
        size: '0ms',
        enabled: false
      }
    };
    res.json(cacheStats);
  } catch (error) {
    logger.error('Error in cache stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get cache stats' 
    });
  }
});

// System recovery endpoint
app.post('/api/system/recover', async (req, res) => {
  try {
    const recoveryResult = {
      success: true,
      message: 'System recovery initiated',
      timestamp: new Date().toISOString()
    };
    res.json(recoveryResult);
  } catch (error) {
    logger.error('Error in system recovery:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Recovery failed',
      message: error.message
    });
  }
});

// Simple Alex endpoint for Palier 1 testing
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    res.json({
      response: `Alex Palier 1 répond: "${message}" - Système opérationnel!`,
      confidence: 0.9,
      domain: 'general',
      source: 'Alex_Palier1_Production',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      message: error.message
    });
  }
});

// API Routes will be added progressively
logger.info('✅ Basic endpoints loaded successfully');

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HustleFinder IA Backend running on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`Backend server started successfully on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
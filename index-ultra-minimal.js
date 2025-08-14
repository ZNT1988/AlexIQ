import { createServer } from 'http';

const PORT = process.env.PORT || 3005;

console.log('🚂 Railway deployment starting... [FORCE REDEPLOY]');
console.log(`📍 Node version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 Port: ${PORT}`);

const server = createServer((req, res) => {
  // CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health checks multiples pour Railway
  if (url.pathname === '/health' || url.pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime() * 1000,
      system: 'Ultra Minimal Backend Railway',
      alex: {
        conscious: true,
        level: 1,
        providers: 4
      }
    }));
    return;
  }

  if (url.pathname === '/api/system/status') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'operational',
      version: '1.0.0-railway',
      node: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime() * 1000
    }));
    return;
  }

  if (url.pathname === '/api/ai/chat' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      response: 'Hello from Alex Railway! Deployment successful.',
      timestamp: new Date().toISOString(),
      system: 'Railway Backend Operational'
    }));
    return;
  }

  if (url.pathname === '/api/admin/dashboard') {
    res.writeHead(200);
    res.end(JSON.stringify({
      dashboard: 'Alex Railway Admin',
      status: 'online',
      services: {
        backend: 'healthy',
        consciousness: 'active',
        deployment: 'railway-success'
      }
    }));
    return;
  }

  // 404 handler
  res.writeHead(404);
  res.end(JSON.stringify({ 
    error: 'Not found',
    path: url.pathname,
    available: ['/health', '/api/health', '/api/system/status', '/api/ai/chat', '/api/admin/dashboard']
  }));
});

// Error handling
server.on('error', (err) => {
  console.error('💥 Server error:', err);
  process.exit(1);
});

// Graceful shutdown pour Railway
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

// Start server on 0.0.0.0 for Railway
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Ultra minimal server running on 0.0.0.0:${PORT}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
  console.log('🚂 Railway deployment ready!');
});
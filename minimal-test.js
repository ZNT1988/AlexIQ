// Minimal test server to validate safe boot approach
import http from 'http';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    const response = {
      ok: true,
      mode: 'minimal',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else if (req.url === '/api/health') {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: 'AlexIQ Safe Boot Test'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found', url: req.url }));
  }
});

server.listen(PORT, () => {
  console.log(`[INFO] ${new Date().toISOString()} Test server listening on port ${PORT}`);
  console.log(`[INFO] ${new Date().toISOString()} Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('[INFO] Graceful shutdown');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[INFO] Graceful shutdown');
  server.close(() => process.exit(0));
});
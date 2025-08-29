// server-safe.mjs - Ultra-minimal Safe Boot API for Railway production
// Uses only Node.js built-in modules to avoid dependency issues
import http from 'http';

// Simple logger (no external deps for safe boot)
const log = {
  info: (...args) => console.log('[INFO]', new Date().toISOString(), ...args),
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), ...args),
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), ...args),
  debug: (...args) => console.debug('[DEBUG]', new Date().toISOString(), ...args)
};

const PORT = process.env.PORT || 3000;

// Safe boot configuration from environment
const BOOT_MINIMAL = (process.env.ALEX_BOOT_MODE || '').toLowerCase() === 'minimal';
const ENABLE_NEUROCORE = /^true$/i.test(process.env.ALEX_ENABLE_NEUROCORE || 'false');
const ENABLE_EVOLUTION = /^true$/i.test(process.env.ALEX_ENABLE_EVOLUTION || 'false');
const ENABLE_BACKGROUND = /^true$/i.test(process.env.ALEX_ENABLE_BACKGROUND || 'false');

// Parse simple JSON from request body
function parseJSON(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (e) {
      callback(e);
    }
  });
}

// Track heavy modules initialization
let startedHeavy = false;

// Safe wrapper for heavy module initialization
async function startHeavyModules(opts = {}) {
  if (startedHeavy) {
    log.info('Heavy modules already started, skipping');
    return;
  }
  startedHeavy = true;

  const safeWrap = async (name, fn) => {
    try {
      const startMem = process.memoryUsage().heapUsed / 1024 / 1024;
      log.info({ name, startMem }, 'Starting module');
      
      await fn?.();
      
      const endMem = process.memoryUsage().heapUsed / 1024 / 1024;
      log.info({ name, startMem, endMem, deltaMem: endMem - startMem }, 'Module started successfully');
    } catch (e) {
      startedHeavy = false;
      log.error(e, `${name} failed to start; leaving API up (safe boot)`);
      
      // Memory cleanup attempt after failure
      if (global.gc) {
        global.gc();
        log.info('Forced garbage collection after module failure');
      }
    }
  };

  // NeuroCore with memory monitoring
  if (opts.neuro && ENABLE_NEUROCORE) {
    await safeWrap('NeuroCore', async () => {
      const { default: NeuroCore } = await import('./backend/alex-modules/core/NeuroCore.js');
      global.neuroCore = new NeuroCore({ 
        intervalMs: 7000,
        memoryGuard: {
          softLimitMB: 300,
          hardLimitMB: 450,
          enableGC: true
        }
      });
      await global.neuroCore.initialize();
    });
  }

  // AlexNeuralEvolution with conservative settings
  if (opts.evolution && ENABLE_EVOLUTION) {
    await safeWrap('AlexNeuralEvolution', async () => {
      const { default: AlexNeuralEvolution } = await import('./backend/alex-modules/core/AlexNeuralEvolution.js');
      global.evo = new AlexNeuralEvolution({ 
        intervalMs: 8000,
        maxConcurrentOperations: 2
      });
      await global.evo.initialize?.();
    });
  }

  // Background processes with minimal footprint
  if (opts.background && ENABLE_BACKGROUND) {
    await safeWrap('Background', async () => {
      // Start only essential background processes
      log.info('Background processes started with minimal footprint');
    });
  }
}

// Create HTTP server with routing
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

  // Immediate health check (never blocks)
  if (req.url === '/health') {
    const response = {
      ok: true,
      mode: BOOT_MINIMAL ? 'minimal' : 'full',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      modules: {
        neurocore: ENABLE_NEUROCORE ? 'enabled' : 'disabled',
        evolution: ENABLE_EVOLUTION ? 'enabled' : 'disabled',
        background: ENABLE_BACKGROUND ? 'enabled' : 'disabled'
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Version endpoint
  if (req.url === '/version') {
    const response = {
      name: 'AlexIQ API',
      env: process.env.NODE_ENV,
      boot: BOOT_MINIMAL ? 'minimal' : 'full',
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // API health check
  if (req.url === '/api/health') {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: 'AlexIQ Safe Boot',
      mode: BOOT_MINIMAL ? 'minimal' : 'full'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Memory stats endpoint
  if (req.url === '/admin/memory') {
    const memUsage = process.memoryUsage();
    const response = {
      ok: true,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Admin endpoint to enable heavy modules after boot
  if (req.url === '/admin/enable-neuro' && req.method === 'POST') {
    parseJSON(req, async (err, data) => {
      if (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        return;
      }

      try {
        log.info('Admin request to enable heavy modules');
        await startHeavyModules({ neuro: true, evolution: true, background: true });
        const response = { 
          ok: true, 
          message: 'Heavy modules activation initiated',
          timestamp: new Date().toISOString()
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
      } catch (e) {
        log.error(e, 'enable-neuro failed');
        res.writeHead(500);
        res.end(JSON.stringify({ 
          ok: false, 
          error: e.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
    return;
  }

  // Fallback for undefined routes
  const response = {
    error: 'Route not found',
    message: 'API is running in safe boot mode. Heavy modules may be disabled.',
    timestamp: new Date().toISOString(),
    url: req.url
  };
  res.writeHead(404);
  res.end(JSON.stringify(response, null, 2));
});

// Start server immediately
server.listen(PORT, () => {
  log.info(`API listening on :${PORT} (mode=${BOOT_MINIMAL ? 'minimal' : 'full'})`);
  
  // Log memory limits if set
  const maxOldSpaceSize = process.execArgv.find(arg => arg.includes('--max-old-space-size'));
  if (maxOldSpaceSize) {
    log.info(`Memory limit: ${maxOldSpaceSize}`);
  }

  // Lazy initialization: start heavy modules after API is responsive
  if (!BOOT_MINIMAL) {
    setTimeout(async () => {
      log.info('Starting lazy initialization of heavy modules...');
      try {
        await startHeavyModules({ 
          neuro: ENABLE_NEUROCORE, 
          evolution: ENABLE_EVOLUTION, 
          background: ENABLE_BACKGROUND 
        });
      } catch (e) {
        log.error(e, 'Lazy initialization failed, but API remains operational');
      }
    }, 2000); // 2 second delay to ensure health endpoint is responsive
  } else {
    log.info('Running in minimal mode - heavy modules disabled');
  }
});

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, async () => {
    log.info(`Received ${sig}, shutting down gracefully`);
    try {
      if (global.neuroCore?.stop) {
        log.info('Stopping NeuroCore...');
        await global.neuroCore.stop();
      }
      if (global.evo?.stop) {
        log.info('Stopping AlexNeuralEvolution...');
        await global.evo.stop?.();
      }
      log.info('Graceful shutdown completed');
    } catch (e) {
      log.error(e, 'Error during shutdown');
    } finally {
      server.close(() => process.exit(0));
    }
  });
});

// Global error handlers
process.on('unhandledRejection', (reason) => {
  log.error(reason, 'Unhandled rejection (API stays up)');
});

process.on('uncaughtException', (error) => {
  log.error(error, 'Uncaught exception (API stays up where possible)');
  // In production, we might want to restart gracefully
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 1000);
  }
});

// Memory monitoring
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    
    if (heapUsedMB > 400) {
      log.warn({ heapUsedMB, rssMB }, 'High memory usage detected');
      if (global.gc) {
        global.gc();
        log.info('Forced garbage collection');
      }
    }
  }, 30000); // Check every 30 seconds
}
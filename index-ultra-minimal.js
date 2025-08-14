import { createServer } from 'http';

const PORT = process.env.PORT || 3005;

console.log('🚂 Railway deployment starting... [VERCEL+RAILWAY SYNC]');
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
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message, provider = 'anthropic' } = JSON.parse(body || '{}');
        
        if (!message) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Message required' }));
          return;
        }

        // Anthropic Claude API
        if (provider === 'anthropic') {
          console.log('🔑 Anthropic key status:', process.env.ANTHROPIC_API_KEY ? `Present (${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...)` : 'MISSING');
          console.log('🌍 All ENV vars:', Object.keys(process.env).filter(k => k.includes('API')));
          console.log('🌍 ALL ENV vars containing KEY:', Object.keys(process.env).filter(k => k.includes('KEY')));
          console.log('🌍 ALL ENV vars containing CLE:', Object.keys(process.env).filter(k => k.includes('CLE')));
          
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not found in environment variables');
          }
          
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000,
              messages: [{ role: 'user', content: message }]
            })
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.content || !data.content[0]) {
            throw new Error(data.error?.message || 'Invalid AI response');
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            response: data.content[0].text,
            provider: 'claude-3-sonnet',
            timestamp: new Date().toISOString()
          }));
        }
        
        // OpenAI GPT API  
        else if (provider === 'openai') {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{ role: 'user', content: message }],
              max_tokens: 1000
            })
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.choices || !data.choices[0]) {
            throw new Error(data.error?.message || 'Invalid OpenAI response');
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            response: data.choices[0].message.content,
            provider: 'gpt-4',
            timestamp: new Date().toISOString()
          }));
        }
        
      } catch (error) {
        console.error('AI API Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          error: 'AI service unavailable',
          details: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
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
// TEST RAILWAY ULTRA MINIMAL - Test si Railway peut démarrer le serveur
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT || 3000);
console.log('🔍 DEBUG Railway - PORT env var:', process.env.PORT);
console.log('🔍 DEBUG Railway - Final PORT:', PORT);

// Root endpoint for Railway health check
app.get('/', (req, res) => {
  res.json({
    service: 'HustleFinder IA API',
    status: 'Railway Test Active',
    timestamp: Date.now(),
    port: PORT
  });
});

// Test endpoint simple
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    test: 'railway-minimal-server',
    port: PORT,
    node_version: process.version,
    env: process.env.NODE_ENV || 'unknown'
  });
});

// Test Alex minimal sans orchestrateur complet
app.get('/api/alex/status', (req, res) => {
  res.json({
    ok: true,
    orchestrator: 'minimal-test',
    timestamp: Date.now(),
    railway_test: true
  });
});

app.listen(PORT, () => {
  console.log(`🟢 RAILWAY TEST SERVER running on port ${PORT}`);
  console.log(`📊 Test health: /api/health`);
  console.log(`🤖 Test Alex: /api/alex/status`);
  console.log(`🚀 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📝 Node version: ${process.version}`);
});
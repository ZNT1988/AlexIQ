// TEST RAILWAY ULTRA MINIMAL - Test si Railway peut démarrer le serveur
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT || 3000);

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
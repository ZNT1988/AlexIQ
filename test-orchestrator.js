import express from 'express';

async function testOrchestrator() {
  try {
    console.log('🧪 Testing Alex Orchestrator...');
    
    const { mountAlex } = await import('./backend/core/HustleFinderCore.js');
    console.log('✅ HustleFinderCore imported successfully');
    
    const app = express();
    const result = await mountAlex(app, {});
    console.log('✅ Alex mounted:', result);
    
    // Test if routes exist
    const routes = app._router.stack.map(layer => {
      if (layer.route) {
        return `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`;
      } else if (layer.name === 'router' && layer.regexp.source.includes('alex')) {
        return `ROUTER /api/alex/*`;
      }
      return null;
    }).filter(Boolean);
    
    console.log('🛣️ Routes found:', routes);
    
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('📍 Location:', e.stack.split('\n')[1]);
  }
}

testOrchestrator();
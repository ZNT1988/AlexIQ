import NeuroCore from './alex-modules/core/NeuroCore.js';

// Test de stress mémoire pour NeuroCore
console.log('🧠 === MEMORY STRESS TEST NEUROCORE ===\n');

async function memoryStressTest() {
  const neuroCore = new NeuroCore({
    softLimitMB: 64,  // Limite basse pour tester
    hardLimitMB: 128, 
    intervalMs: 1000  // Check plus fréquent
  });

  try {
    console.log('📊 Memory usage avant init:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    // Initialisation
    await neuroCore.initialize();
    console.log('📊 Memory usage après init:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    // Status initial
    let status = neuroCore.getStatus();
    console.log('🔍 Status initial:');
    console.log('  - Memory Guard Intervals:', status.intervals);
    console.log('  - Heap Used:', status.memory.heapUsedMB, 'MB');
    console.log('  - Neural Memory - ShortTerm:', status.memory.shortTerm);
    console.log('  - Memory Cycles:', status.memoryMetrics.cycles);

    // Simulation de traitement intensif
    console.log('\n🔥 Lancement traitement intensif...');
    
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push({
        type: `stress_test_${i}`,
        content: `Stress test request ${i} with long content: ${'x'.repeat(1000)}`,
        priority: Math.random(),
        timestamp: Date.now()
      });
    }

    // Traitement en rafale
    for (const request of requests) {
      await neuroCore.processRequest(request);
      
      const index = requests.indexOf(request);
      if (index % 5 === 0) {
        const currentMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        console.log(`  📈 Requête ${index}: ${currentMem}MB`);
      }
    }

    // Attendre quelques cycles de memory guard
    console.log('\n⏱️  Attente 6 secondes pour memory guard cycles...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Status après stress  
    status = neuroCore.getStatus();
    console.log('\n🔍 Status après stress:');
    console.log('  - Heap Used:', status.memory.heapUsedMB, 'MB');
    console.log('  - Neural Memory - ShortTerm:', status.memory.shortTerm);
    console.log('  - Neural Memory - LongTerm:', status.memory.longTerm);
    console.log('  - Neural Memory - Patterns:', status.memory.patterns);
    console.log('  - Memory Cycles:', status.memoryMetrics.cycles);
    console.log('  - Memory Prunes:', status.memoryMetrics.prunes);
    console.log('  - Last Prune Reason:', status.memoryMetrics.lastPruneReason);

    // Test manual restart si nécessaire
    if (status.intervals === 0) {
      console.log('\n🔄 Memory guard désactivé, test restart...');
      const restartResult = await neuroCore.restart();
      console.log('  - Restart result:', restartResult);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = neuroCore.getStatus();
      console.log('  - Intervals après restart:', status.intervals);
    }

    // Arrêt propre
    await neuroCore.stop();
    console.log('\n📊 Memory usage après stop:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');

    return true;

  } catch (error) {
    console.error('❌ Memory stress test failed:', error);
    return false;
  }
}

// Exécution
memoryStressTest().then(success => {
  console.log(success ? '\n✅ Memory stress test: SUCCESS' : '\n❌ Memory stress test: FAILED');
  process.exit(success ? 0 : 1);
});
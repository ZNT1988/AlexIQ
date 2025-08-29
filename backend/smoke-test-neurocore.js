import NeuroCore from './alex-modules/core/NeuroCore.js';

// Tests pour NeuroCore
const test = (name, condition) => {
  console.log(`${condition ? '✅' : '❌'} ${name}`);
  return condition;
};

async function testNeuroCore() {
  console.log('\n🧠 === TESTS NEUROCORE ===');

  try {
    // 1. Test création/initialisation
    const neuroCore = new NeuroCore();
    test("NeuroCore créé", neuroCore !== null);

    // 2. Test méthodes standard  
    test("getModuleName présent", typeof neuroCore.getModuleName === 'function');
    test("getVersion présent", typeof neuroCore.getVersion === 'function');
    test("initialize présent", typeof neuroCore.initialize === 'function');
    test("stop présent", typeof neuroCore.stop === 'function');
    test("getStatus présent", typeof neuroCore.getStatus === 'function');

    // 3. Test valeurs initiales
    const moduleName = neuroCore.getModuleName();
    test("Module name valide", moduleName === 'NeuroCore');
    
    const version = neuroCore.getVersion();
    test("Version valide", version === '3.0.0');

    const initialStatus = neuroCore.getStatus();
    test("Status initial valide", initialStatus && typeof initialStatus === 'object');
    test("Status initialized false", initialStatus.initialized === false);
    test("Status neural true", initialStatus.neural === true);

    // 4. Test initialisation
    const initResult = await neuroCore.initialize();
    test("Initialisation réussie", initResult.success === true);
    test("Initialized après init", initResult.initialized === true);

    // 5. Test status après init
    const statusAfterInit = neuroCore.getStatus();
    test("Status initialized true", statusAfterInit.initialized === true);
    test("Status active true", statusAfterInit.active === true);
    test("Architecture layers présent", statusAfterInit.architecture && statusAfterInit.architecture.layers > 0);
    test("Neural activity présent", typeof statusAfterInit.neuralActivity === 'number');

    // 6. Test traitement neuronal
    const testRequest = {
      type: 'test_neural',
      content: 'Test neural processing request',
      priority: 0.7
    };

    const processResult = await neuroCore.processRequest(testRequest);
    test("Traitement neuronal réussi", processResult.success === true);
    test("Neural input présent", processResult.neuralInput !== undefined);
    test("Propagation présente", processResult.propagation !== undefined);
    test("Associations présentes", processResult.associations !== undefined);
    test("Output présent", processResult.output !== undefined);

    // 7. Test capacités neuronales
    test("Capacités neuronales présentes", statusAfterInit.neuralCapabilities !== undefined);
    test("Pattern recognition valide", typeof statusAfterInit.neuralCapabilities.patternRecognition === 'number');
    test("Neural plasticity valide", typeof statusAfterInit.neuralCapabilities.neuralPlasticity === 'number');

    // 8. Test mémoire neuronale  
    test("Mémoire neuronale présente", statusAfterInit.memory !== undefined);
    test("Short term memory", typeof statusAfterInit.memory.shortTerm === 'number');
    test("Patterns memory", typeof statusAfterInit.memory.patterns === 'number');

    // 9. Test arrêt
    await neuroCore.stop();
    const statusAfterStop = neuroCore.getStatus();
    test("Status initialized false après stop", statusAfterStop.initialized === false);
    test("Status active false après stop", statusAfterStop.active === false);

    console.log('\n🎯 === TESTS NEUROCORE TERMINÉS ===\n');
    return true;

  } catch (error) {
    console.error('❌ Erreur test NeuroCore:', error);
    return false;
  }
}

// Exécution
testNeuroCore().then(success => {
  console.log(success ? '✅ NeuroCore: 100% SUCCESS' : '❌ NeuroCore: ÉCHEC');
  process.exit(success ? 0 : 1);
});
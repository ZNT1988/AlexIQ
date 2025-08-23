const SimulationEngine = {
  runSimulation: (scenario, parameters = {}) => {
    return {
      id: Date.now(),
      scenario: scenario,
      parameters: parameters,
      results: {
        success: true,
        data: 'Simulation terminée',
        metrics: {}
      }
    };
  }
};

module.exports = SimulationEngine;
const HealthScanner = {
  analyzeSymptoms: (symptoms) => {
    return {
      id: Date.now(),
      symptoms: symptoms,
      analysis: 'Analyse symptômes basique',
      recommendation: 'Consulter un professionnel de santé',
      priority: 'normal'
    };
  }
};

module.exports = HealthScanner;
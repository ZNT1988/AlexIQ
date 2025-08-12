import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Server, Database, Bot } from 'lucide-react';
import apiService from '../services/api.js';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_BACKEND_HEALTH_CHECK = 'Backend Health Check';
const TestIntegration = () => {
  const [tests, setTests] = useState([
    { name: STR_BACKEND_HEALTH_CHECK, status: STR_PENDING, icon: Server }
    { name: STR_DATABASE_CONNECTION, status: STR_PENDING, icon: Database }
    { name: STR_IDEAS_API, status: STR_PENDING, icon: Database }
    { name: STR_PROJECTS_API, status: STR_PENDING, icon: Database }
    { name: STR_ROI_API, status: STR_PENDING, icon: Database }
    { name: STR_AI_CHAT_SYSTEM, status: STR_PENDING, icon: Bot }
  ]);

  const [results, setResults] = useState({});

  useEffect(() => {
    runTests();
  }, []);

  const updateTestStatus = (testName, status, data = null) => {
    setTests(prev => prev.map(test =>
      test.name === testName ? { ...test, status } : test
    ));
    if (data) {
      setResults(prev => ({ ...prev, [testName]: data }));
    }
  };

  const runTests = async () => {
    // Test 1: Backend Health Check
    try {
      updateTestStatus(STR_BACKEND_HEALTH_CHECK, STR_RUNNING);
      const health = await apiService.health();
      updateTestStatus(STR_BACKEND_HEALTH_CHECK, STR_SUCCESS, health);
    } catch (error) {
      updateTestStatus(STR_BACKEND_HEALTH_CHECK, STR_ERROR, { error: error.message });
    }

    // Test 2: Database Connection (via Ideas API)
    try {
      updateTestStatus(STR_DATABASE_CONNECTION, STR_RUNNING);
      const ideas = await apiService.getIdeas();
      updateTestStatus(STR_DATABASE_CONNECTION, STR_SUCCESS, { message: 'Database accessible via API' });
    } catch (error) {
      updateTestStatus(STR_DATABASE_CONNECTION, STR_ERROR, { error: error.message });
    }

    // Test 3: Ideas API
    try {
      updateTestStatus(STR_IDEAS_API, STR_RUNNING);
      const ideas = await apiService.getIdeas();
      updateTestStatus(STR_IDEAS_API, STR_SUCCESS, ideas);
    } catch (error) {
      updateTestStatus(STR_IDEAS_API, STR_ERROR, { error: error.message });
    }

    // Test 4: Projects API
    try {
      updateTestStatus(STR_PROJECTS_API, STR_RUNNING);
      const projects = await apiService.getProjects();
      updateTestStatus(STR_PROJECTS_API, STR_SUCCESS, projects);
    } catch (error) {
      updateTestStatus(STR_PROJECTS_API, STR_ERROR, { error: error.message });
    }

    // Test 5: ROI API
    try {
      updateTestStatus(STR_ROI_API, STR_RUNNING);
      const roi = await apiService.getROICalculations();
      updateTestStatus(STR_ROI_API, STR_SUCCESS, roi);
    } catch (error) {
      updateTestStatus(STR_ROI_API, STR_ERROR, { error: error.message });
    }

    // Test 6: AI Chat System
    try {
      updateTestStatus(STR_AI_CHAT_SYSTEM, STR_RUNNING);
      const aiResponse = await apiService.chatWithAI('Test de connexion IA');
      updateTestStatus(STR_AI_CHAT_SYSTEM, STR_SUCCESS, aiResponse);
    } catch (error) {
      updateTestStatus(STR_AI_CHAT_SYSTEM, STR_ERROR, { error: error.message });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case STR_SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case STR_ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case STR_RUNNING:
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case STR_SUCCESS:
        return 'border-green-200 bg-green-50';
      case STR_ERROR:
        return 'border-red-200 bg-red-50';
      case STR_RUNNING:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const successCount = tests.filter(test => test.status === STR_SUCCESS).length;
  const totalTests = tests.length;
  const isAllComplete = tests.every(test => test.status !== STR_PENDING && test.status !== STR_RUNNING);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Test d'Intégration</h1>
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Relancer les tests
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression des tests</span>
          <span className="text-sm text-gray-500">{successCount}/{totalTests}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(successCount / totalTests) * 100}%` }}
          />
        </div>
        {isAllComplete && (
          <div className={`mt-4 p-3 rounded-lg ${successCount === totalTests ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {successCount === totalTests
              ? '🎉 Tous les tests sont passés avec succès !'
              : '⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessous.'
            }
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="grid gap-4">
        {tests.map((test, index) => {
          const Icon = test.icon;
          const result = results[test.name];

          return (
            <motion.div
        })}
      </div>
    </motion.div>
  );
};

export default TestIntegration;
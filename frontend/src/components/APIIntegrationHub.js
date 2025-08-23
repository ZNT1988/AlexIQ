import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const APIIntegrationHub = () => {
  const [apiStatus, setApiStatus] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const apis = [
    {
      id: 'health',
      name: 'System Health',
      endpoint: '/api/health',
      description: 'Vérification de l\'état du système'
    },
    {
      id: 'chat',
      name: 'Chat IA',
      endpoint: '/api/chat',
      description: 'Interface de chat avec IA'
    }
  ];

  useEffect(() => {
    checkAllAPIs();
  }, []);

  const checkAllAPIs = async () => {
    setLoading(true);
    const newStatus = {};
    const newResults = {};

    for (const api of apis) {
      try {
        const startTime = Date.now();
        const response = await fetch(api.endpoint, {
          method: api.id === 'chat' ? 'POST' : 'GET',
          headers: api.id === 'chat' ? { 'Content-Type': 'application/json' } : {},
          body: api.id === 'chat' ? JSON.stringify({ message: 'test' }) : undefined
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        newStatus[api.id] = response.ok ? 'connected' : 'error';
        newResults[api.id] = {
          status: response.status,
          responseTime,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        newStatus[api.id] = 'disconnected';
        newResults[api.id] = {
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    setApiStatus(newStatus);
    setTestResults(newResults);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'error':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'disconnected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hub d'Intégration API</h1>
            <p className="text-gray-600">Surveillance et test des APIs système</p>
          </div>
          <button
            onClick={checkAllAPIs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        <div className="grid gap-4">
          {apis.map((api) => {
            const status = apiStatus[api.id];
            const result = testResults[api.id];

            return (
              <div
                key={api.id}
                className={`p-4 rounded-lg border ${getStatusColor(status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <h3 className="font-semibold">{api.name}</h3>
                      <p className="text-sm opacity-75">{api.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{api.endpoint}</div>
                    {result?.responseTime && (
                      <div className="text-xs opacity-75">{result.responseTime}ms</div>
                    )}
                  </div>
                </div>

                {result && (
                  <div className="mt-3 text-xs space-y-1">
                    {result.status && (
                      <div>Status HTTP: {result.status}</div>
                    )}
                    {result.error && (
                      <div>Erreur: {result.error}</div>
                    )}
                    <div>Dernière vérification: {new Date(result.timestamp).toLocaleString()}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Information</h3>
          <p className="text-sm text-gray-600">
            Ce hub teste la connectivité aux APIs système. Pour ajouter des intégrations externes,
            configurez les endpoints appropriés dans la configuration backend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationHub;
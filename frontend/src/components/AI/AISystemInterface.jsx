import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, Heart, Eye, Users, Bot, Waves, Shield, Atom } from 'lucide-react';

const AISystemInterface = () => {
  const [aiStatus, setAiStatus] = useState('unknown');
  const [activeSession, setActiveSession] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState(null);

  const availableModules = [
    {
      id: 'chat',
      name: 'Chat IA',
      description: 'Interface de chat avec IA',
      icon: <Bot className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-500',
      endpoint: '/api/chat',
      status: 'available'
    },
    {
      id: 'health',
      name: 'Status Système',
      description: 'Vérifier le status du système',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      endpoint: '/api/health',
      status: 'available'
    },
    {
      id: 'creativity',
      name: 'Assistance Creative',
      description: 'Aide à la création de contenu',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      endpoint: '/api/chat',
      status: 'available'
    },
    {
      id: 'analysis',
      name: 'Analyse de Données',
      description: 'Analyse et traitement de données',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-amber-500 to-red-500',
      endpoint: '/api/chat',
      status: 'available'
    },
    {
      id: 'productivity',
      name: 'Productivité',
      description: 'Optimisation de la productivité',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      endpoint: '/api/chat',
      status: 'available'
    },
    {
      id: 'insights',
      name: 'Insights Personnels',
      description: 'Analyses personnalisées',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-gray-600 to-purple-600',
      endpoint: '/api/chat',
      status: 'available'
    }
  ];

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data.ok ? 'active' : 'inactive');
      } else {
        setAiStatus('inactive');
      }
    } catch (error) {
      setAiStatus('error');
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setResponse(null);
  };

  const executeModule = async (moduleData) => {
    if (!selectedModule) return;

    setProcessing(true);
    setResponse(null);

    try {
      let apiResponse;
      
      if (selectedModule.id === 'health') {
        apiResponse = await fetch('/api/health');
      } else {
        apiResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `${selectedModule.name}: ${JSON.stringify(moduleData)}` 
          })
        });
      }

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        setResponse({
          success: true,
          data: data,
          module: selectedModule.name
        });
      } else {
        setResponse({
          success: false,
          error: data.message || 'Erreur inconnue',
          module: selectedModule.name
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        module: selectedModule.name
      });
    } finally {
      setProcessing(false);
    }
  };

  const ModuleCard = ({ module }) => (
    <div
      onClick={() => handleModuleSelect(module)}
      className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedModule?.id === module.id
          ? 'bg-gradient-to-br ' + module.color + ' text-white'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      <div className="flex items-center mb-3">
        {module.icon}
        <h3 className="ml-3 text-lg font-semibold">{module.name}</h3>
      </div>
      <p className="text-sm opacity-90">{module.description}</p>
      <div className="mt-2">
        <span className={`inline-block px-2 py-1 rounded text-xs ${
          module.status === 'available' 
            ? 'bg-green-500/20 text-green-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {module.status}
        </span>
      </div>
    </div>
  );

  const ModuleInterface = ({ module }) => {
    const [formData, setFormData] = useState({});

    const handleSubmit = (e) => {
      e.preventDefault();
      executeModule(formData);
    };

    return (
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">{module.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {module.id === 'chat' && (
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                className="w-full p-3 bg-black/20 border border-white/20 rounded text-white placeholder-gray-400"
                placeholder="Tapez votre message..."
                value={formData.message || ''}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="4"
                required
              />
            </div>
          )}
          
          {module.id === 'creativity' && (
            <div>
              <label className="block text-sm font-medium mb-2">Sujet créatif</label>
              <textarea
                className="w-full p-3 bg-black/20 border border-white/20 rounded text-white placeholder-gray-400"
                placeholder="Décrivez votre besoin créatif..."
                value={formData.topic || ''}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                rows="3"
                required
              />
            </div>
          )}

          {module.id === 'analysis' && (
            <div>
              <label className="block text-sm font-medium mb-2">Données à analyser</label>
              <textarea
                className="w-full p-3 bg-black/20 border border-white/20 rounded text-white placeholder-gray-400"
                placeholder="Fournissez les données à analyser..."
                value={formData.data || ''}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                rows="4"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
          >
            {processing ? 'Traitement...' : `Exécuter ${module.name}`}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Interface Système IA
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            Accédez aux fonctionnalités d'intelligence artificielle
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm ${
            aiStatus === 'active' ? 'bg-green-500/20 text-green-300' :
            aiStatus === 'inactive' ? 'bg-red-500/20 text-red-300' :
            'bg-yellow-500/20 text-yellow-300'
          }`}>
            Status: {aiStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Modules Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {availableModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {selectedModule && (
              <ModuleInterface module={selectedModule} />
            )}

            {response && (
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Résultat - {response.module}</h3>
                {response.success ? (
                  <div className="space-y-2">
                    <div className="text-green-300 text-sm mb-2">✓ Succès</div>
                    <div className="bg-black/20 p-4 rounded text-sm">
                      {response.data.output ? (
                        <div>
                          <strong>Réponse IA:</strong>
                          <p className="mt-2">{response.data.output}</p>
                          {response.data.provider && (
                            <p className="text-xs text-gray-400 mt-2">
                              via {response.data.provider}
                            </p>
                          )}
                        </div>
                      ) : (
                        <pre>{JSON.stringify(response.data, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-300 text-sm mb-2">✗ Erreur</div>
                    <div className="bg-red-500/20 p-4 rounded text-sm">
                      {response.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISystemInterface;
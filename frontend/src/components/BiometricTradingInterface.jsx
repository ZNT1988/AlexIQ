import React, { useState } from 'react';
import { Brain, Activity, AlertCircle } from 'lucide-react';

const BiometricTradingInterface = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Interface Biométrique</h1>
              <p className="text-gray-400">Nécessite des capteurs réels</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Capteurs Requis</h3>
          <p className="text-gray-400 mb-4">
            Cette interface nécessite des capteurs biométriques réels pour fonctionner.
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-300">
            <p>• Capteur de rythme cardiaque</p>
            <p>• Capteur de conductance cutanée</p>
            <p>• Capteur de température corporelle</p>
            <p>• Système EEG (optionnel)</p>
          </div>
        </div>

        <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium">Note d'Implementation</h4>
          </div>
          <p className="text-sm text-gray-300">
            L'intégration de capteurs biométriques nécessite des APIs spécialisées 
            et des dispositifs matériels certifiés pour un usage médical.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiometricTradingInterface;
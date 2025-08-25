import React from 'react';
import { Brain, AlertCircle } from 'lucide-react';

const ConsciousnessPanel = () => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Interface Conscience</h2>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">Interface Non Implémentée</h3>
        <p className="text-gray-300 text-sm">
          Cette interface nécessite des recherches approfondies en intelligence artificielle 
          et sciences cognitives pour une implémentation authentique.
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>Note: Les concepts de conscience artificielle sont encore en développement 
        dans la recherche académique.</p>
      </div>
    </div>
  );
};

export default ConsciousnessPanel;
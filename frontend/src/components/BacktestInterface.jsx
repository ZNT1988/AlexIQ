import React, { useState } from 'react';
import { BarChart3, Play, AlertCircle, TrendingUp } from 'lucide-react';

const BacktestInterface = () => {
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');

  const strategies = [
    { id: 'momentum', name: 'Momentum', description: 'Stratégie basée sur la tendance' },
    { id: 'meanrev', name: 'Mean Reversion', description: 'Retour à la moyenne' },
    { id: 'breakout', name: 'Breakout', description: 'Cassure de niveaux' }
  ];

  const startBacktest = () => {
    setIsBacktesting(true);
    setTimeout(() => setIsBacktesting(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Interface Backtest</h1>
            <p className="text-gray-400">Test de stratégies de trading</p>
          </div>
          <button
            onClick={startBacktest}
            disabled={isBacktesting}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              isBacktesting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Play className="w-5 h-5" />
            <span>{isBacktesting ? 'Test en cours...' : 'Démarrer Test'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Stratégies Disponibles</h3>
            <div className="space-y-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${
                    selectedStrategy === strategy.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="font-bold">{strategy.name}</h4>
                      <p className="text-sm text-gray-400">{strategy.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Période</label>
                <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option>3 Mois</option>
                  <option>6 Mois</option>
                  <option>1 An</option>
                  <option>2 Ans</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capital Initial</label>
                <input 
                  type="number" 
                  defaultValue="100000"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {isBacktesting && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Test en cours...</h3>
              <span className="text-sm text-gray-400">Analyse des données...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium">Note Importante</h4>
          </div>
          <p className="text-sm text-gray-300">
            Cette interface de backtest nécessite des données historiques réelles 
            et des algorithmes de trading validés pour produire des résultats fiables.
            Les résultats passés ne garantissent pas les performances futures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacktestInterface;
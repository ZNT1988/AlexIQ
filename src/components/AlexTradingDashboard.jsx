import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, AlertCircle } from 'lucide-react';

const AlexTradingDashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    checkAPIConnection();
    const interval = setInterval(checkAPIConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAPIConnection = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setConnectionStatus('connected');
        // Note: Real market data would come from trading APIs
        setMarketData({
          lastUpdate: new Date().toISOString(),
          status: 'Market data requires trading API integration'
        });
      } else {
        setConnectionStatus('disconnected');
        setMarketData(null);
      }
    } catch (error) {
      setConnectionStatus('error');
      setMarketData(null);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {trend && (
        <div className={`text-sm ${color}`}>
          {trend}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">Interface de trading - Nécessite intégration API réelle</p>
          
          <div className={`inline-block px-4 py-2 rounded-full text-sm mt-4 ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
            connectionStatus === 'disconnected' ? 'bg-red-500/20 text-red-300' :
            'bg-yellow-500/20 text-yellow-300'
          }`}>
            Status API: {connectionStatus}
          </div>
        </div>

        {connectionStatus === 'connected' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Portfolio Total"
              value="Non configuré"
              icon={DollarSign}
              trend="Nécessite API broker"
              color="text-yellow-400"
            />
            <MetricCard
              title="P&L Journalier"
              value="N/A"
              icon={TrendingUp}
              trend="Nécessite données réelles"
              color="text-gray-400"
            />
            <MetricCard
              title="Positions Ouvertes"
              value="0"
              icon={BarChart3}
              trend="Aucune position"
              color="text-gray-400"
            />
            <MetricCard
              title="Risk Level"
              value="N/A"
              icon={AlertCircle}
              trend="Non calculé"
              color="text-gray-400"
            />
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">API Non Connectée</h3>
            <p className="text-gray-400 mb-4">
              Ce dashboard nécessite une intégration avec des APIs de trading réelles comme :
            </p>
            <ul className="text-gray-400 text-left max-w-md mx-auto space-y-2">
              <li>• Interactive Brokers API</li>
              <li>• Alpaca Trading API</li>
              <li>• TD Ameritrade API</li>
              <li>• Binance API (crypto)</li>
              <li>• Alpha Vantage (données market)</li>
            </ul>
          </div>
        )}

        {marketData && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">État du Système</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Dernière mise à jour:</span>
                <span className="text-white">{new Date(marketData.lastUpdate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400">{marketData.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlexTradingDashboard;
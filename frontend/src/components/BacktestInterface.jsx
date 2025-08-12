import crypto from 'crypto';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download, Share, TrendingUp, Clock, Target, BarChart3, AlertTriangle, Trophy } from 'lucide-react';

const BacktestInterface = ({ alex, onBacktestComplete }) => {
  // 🎯 État du backtest
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [backtestResults, setBacktestResults] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('momentum_breakout');
  const [backtestConfig, setBacktestConfig] = useState({
    period: '1Y'
    initialCapital: 100000
    commission: 0.005
    slippage: 0.001
    maxRisk: 0.02
  });

  // 📊 Stratégies disponibles
  const strategies = {
    momentum_breakout: {
      name: 'Momentum Breakout'
      description: 'Détecte les breakouts avec volume confirmé'
      winRate: 73.5
      avgReturn: 4.8
      maxDrawdown: 8.2
      color: 'from-green-500 to-emerald-500'
    }
    mean_reversion: {
      name: 'Mean Reversion'
      description: 'Exploite les retours à la moyenne'
      winRate: 67.2
      avgReturn: 3.2
      maxDrawdown: 5.1
      color: 'from-blue-500 to-cyan-500'
    }
    sentiment_surge: {
      name: 'Sentiment Surge'
      description: 'Trading basé sur l\'analyse de sentiment'
      winRate: 81.3
      avgReturn: 6.7
      maxDrawdown: 12.4
      color: 'from-purple-500 to-pink-500'
    }
    multi_timeframe: {
      name: 'Multi-Timeframe'
      description: 'Analyse sur plusieurs timeframes'
      winRate: 69.8
      avgReturn: 5.1
      maxDrawdown: 7.8
      color: 'from-orange-500 to-red-500'
    }
  };

  // 🎨 Animation variants
  const containerVariants = {
    hidden: { opacity: 0 }
    visible: {
      opacity: 1
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 }
    visible: {
      opacity: 1
      y: 0
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // 🚀 Lancement du backtest
  const startBacktest = async () => {
    setIsBacktesting(true);
    setBacktestProgress(0);
    setBacktestResults(null);

    // Simulation de backtest progressif
    const interval = setInterval(() => {
      setBacktestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBacktesting(false);

          // Génération des résultats simulés
          const results = generateBacktestResults();
          setBacktestResults(results);
          onBacktestComplete?
      .(results);

          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Alex parle pendant le backtest
    if (alex) {
      alex.speak(`Démarrage du backtest ${strategies[selectedStrategy].name} sur ${backtestConfig.period}...`);
    }
  };

  // 📊 Génération des résultats de backtest
  const generateBacktestResults = () => {
    const strategy = strategies[selectedStrategy];
    const baseReturn = strategy.avgReturn / 100;
    const volatility = 0.15;

    // Génération de courbe d'equity
    const equityData = [];
    let currentValue = backtestConfig.initialCapital;

    for (let i = 0; i <= 252; i++) { // 1 an de trading
      const dailyReturn = ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * volatility + baseReturn / 252;
      currentValue *= (1 + dailyReturn);
      equityData.push({
        date :
       new Date(Date.now() - (252 - i) * 24 * 60 * 60 * 1000)
        value: currentValue
        return: (currentValue - backtestConfig.initialCapital) / backtestConfig.initialCapital
      });
    }

    const finalValue = currentValue;
    const totalReturn = (finalValue - backtestConfig.initialCapital) / backtestConfig.initialCapital;

    return {
      strategy: selectedStrategy
      strategyName: strategy.name
      period: backtestConfig.period
      initialCapital: backtestConfig.initialCapital
      finalValue
      totalReturn
      // Métriques de performance
      metrics: {
        totalReturn: totalReturn * 100
        annualizedReturn: (Math.pow(finalValue / backtestConfig.initialCapital, 1) - 1) * 100
        sharpeRatio: 2.34 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.5
        sortinqRatio: 3.12 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.4
        maxDrawdown: strategy.maxDrawdown + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 2
        volatility: 15.6 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 3
        winRate: strategy.winRate + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 5
        profitFactor: 1.68 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.3
        calmarRatio: 0.89 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.2
      }
      // Trading stats
      trades: {
        total: 142 + Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 20)
        winning: 0
        losing: 0
        averageWin: 347.52
        averageLoss: -189.34
        largestWin: 1247.89
        largestLoss: -567.23
        averageHoldTime: '2.3 days'
      }
      // Données pour graphiques
      equityData
      monthlyReturns: Array.from({ length: 12 }, () => ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 10)
      drawdownData: equityData.map((point, i) => {
        const peak = Math.max(...equityData.slice(0, i + 1).map(p => p.value));
        return {
          date: point.date
          drawdown: (peak - point.value) / peak * 100
        };
      })
      timestamp: Date.now()
    };
  };

  // 🎤 Alex commente les résultats
  useEffect(() => {
    if (backtestResults && alex) {
      const returnPercent = backtestResults.metrics.totalReturn;

      if (returnPercent > 20) {
        alex.speak(`🔥 Backtest extraordinaire ! +${returnPercent.toFixed(1)}% de rendement ! Cette stratégie est explosive !`);
      } else if (returnPercent > 5) {
        alex.speak(`✅ Backtest positif ! +${returnPercent.toFixed(1)}% de rendement. Stratégie prometteuse !`);
      } else if (returnPercent > -5) {
        alex.speak(`⚖️ Backtest neutre. ${returnPercent.toFixed(1)}% de rendement. À optimiser.`);
      } else {
        alex.speak(`❌ Backtest négatif. ${returnPercent.toFixed(1)}% de perte. Stratégie à revoir.`);
      }
    }
  }, [backtestResults, alex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 🎯 Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={cardVariants}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400
                         bg-clip-text text-transparent">
              Backtest Laboratory
            </h1>
            <p className="text-gray-400 mt-2">
              Test your strategies with historical precision
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={startBacktest}
              disabled={isBacktesting}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2
                       transition-all duration-200 ${
                isBacktesting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              whileHover={!isBacktesting ? { scale: 1.05 } : {}}
              whileTap={!isBacktesting ? { scale: 0.95 } : {}}
            >
              {isBacktesting ? <Clock className="w-5 h-5 animate-spin" /> : <Play className=STR_W_5_H_5 />}
              <span>{isBacktesting ? 'Running...' : 'Start Backtest'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 🎮 Configuration du backtest */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          variants={cardVariants}
        >
          {/* Sélection de stratégie */}
          <div className="lg:col-span-2 alex-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-6">Select Strategy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(strategies).map(([key, strategy]) => (
                <motion.div
                  key={key}
                  onClick={() => setSelectedStrategy(key)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                    selectedStrategy === key
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${strategy.color}
                                flex items-center justify-center mb-3`}>
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>

                  <h4 className="font-bold text-white mb-2">{strategy.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{strategy.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className=STR_TEXT_CENTER>
                      <div className=STR_TEXT_GREEN_400_FONT_MEDIUM>{strategy.winRate}%</div>
                      <div className=STR_TEXT_GRAY_500>Win Rate</div>
                    </div>
                    <div className=STR_TEXT_CENTER>
                      <div className="text-blue-400 font-medium">{strategy.avgReturn}%</div>
                      <div className=STR_TEXT_GRAY_500>Avg Return</div>
                    </div>
                    <div className=STR_TEXT_CENTER>
                      <div className=STR_TEXT_RED_400_FONT_MEDIUM>{strategy.maxDrawdown}%</div>
                      <div className=STR_TEXT_GRAY_500>Max DD</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
            <h3 className="text-xl font-bold text-white mb-6">Configuration</h3>

            <div className=STR_SPACE_Y_4>
              {/* Période */}
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>Period</label>
                <select
                  value={backtestConfig.period}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="2Y">2 Years</option>
                  <option value="5Y">5 Years</option>
                </select>
              </div>

              {/* Capital initial */}
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>Initial Capital</label>
                <input
                  type=STR_NUMBER
                  value={backtestConfig.initialCapital}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Commission */}
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>Commission (%)</label>
                <input
                  type=STR_NUMBER
                  step="0.001"
                  value={backtestConfig.commission * 100}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, commission: Number(e.target.value) / 100 }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Max Risk */}
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>Max Risk per Trade (%)</label>
                <input
                  type=STR_NUMBER
                  step="0.1"
                  value={backtestConfig.maxRisk * 100}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, maxRisk: Number(e.target.value) / 100 }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📊 Barre de progression */}
        <AnimatePresence>
          {isBacktesting && (
            <motion.div
              className="alex-card p-6 rounded-xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <h3 className="text-lg font-bold text-white">Running Backtest...</h3>
                <span className=STR_TEXT_SM_TEXT_GRAY_400>{backtestProgress.toFixed(1)}%</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  style={{ width: `${backtestProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing historical data...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📈 Résultats du backtest */}
        <AnimatePresence>
          {backtestResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className=STR_ALEX_CARD_P_6_ROUNDED_XL
                  whileHover={{ scale: 1.02 }}
                >
                  <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                    <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Total Return</h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className={`text-2xl font-bold ${
                    backtestResults.metrics.totalReturn > 0 ? STR_TEXT_GREEN_400 : STR_TEXT_RED_400
                  }`}>
                    {backtestResults.metrics.totalReturn > 0 ? '+' : ''}{backtestResults.metrics.totalReturn.toFixed(2)}%
                  </div>
                  <div className=STR_TEXT_SM_TEXT_GRAY_400>
                    ${(backtestResults.finalValue - backtestResults.initialCapital).toLocaleString()}
                  </div>
                </motion.div>

                <motion.div
                  className=STR_ALEX_CARD_P_6_ROUNDED_XL
                  whileHover={{ scale: 1.02 }}
                >
                  <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                    <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Sharpe Ratio</h3>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {backtestResults.metrics.sharpeRatio.toFixed(2)}
                  </div>
                  <div className={`text-sm ${
                    backtestResults.metrics.sharpeRatio > 1.5 ? STR_TEXT_GREEN_400 :
                    backtestResults.metrics.sharpeRatio > 1 ? 'text-yellow-400' : STR_TEXT_RED_400
                  }`}>
                    {backtestResults.metrics.sharpeRatio > 1.5 ? 'Excellent' :
                     backtestResults.metrics.sharpeRatio > 1 ? 'Good' : 'Poor'}
                  </div>
                </motion.div>

                <motion.div
                  className=STR_ALEX_CARD_P_6_ROUNDED_XL
                  whileHover={{ scale: 1.02 }}
                >
                  <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                    <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Max Drawdown</h3>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    -{backtestResults.metrics.maxDrawdown.toFixed(2)}%
                  </div>
                  <div className={`text-sm ${
                    backtestResults.metrics.maxDrawdown < 10 ? STR_TEXT_GREEN_400 :
                    backtestResults.metrics.maxDrawdown < 20 ? 'text-yellow-400' : STR_TEXT_RED_400
                  }`}>
                    {backtestResults.metrics.maxDrawdown < 10 ? 'Low Risk' :
                     backtestResults.metrics.maxDrawdown < 20 ? 'Medium Risk' : 'High Risk'}
                  </div>
                </motion.div>

                <motion.div
                  className=STR_ALEX_CARD_P_6_ROUNDED_XL
                  whileHover={{ scale: 1.02 }}
                >
                  <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                    <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Win Rate</h3>
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {backtestResults.metrics.winRate.toFixed(1)}%
                  </div>
                  <div className=STR_TEXT_SM_TEXT_GRAY_400>
                    {backtestResults.trades.total} trades
                  </div>
                </motion.div>
              </div>

              {/* Graphiques de performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courbe d'equity */}
                <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
                  <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_M>Equity Curve</h3>

                  <div className="h-64 bg-gray-800 rounded-lg flex items-end p-4 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%']
                      }}
                      transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
                    />

                    {/* Simulation de graphique */}
                    <div className="flex items-end space-x-1 h-full w-full relative z-10">
                      {backtestResults.equityData.slice(0, 50).map((point, i) => {
                        const height = ((point.value - backtestResults.initialCapital) / backtestResults.initialCapital + 1) * 50;
                        return (
                          <motion.div
                            key={i}
                            className="w-2 bg-gradient-to-t from-green-500 to-green-300 rounded-sm"
                            style={{ height: `${Math.max(10, height)}%` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(10, height)}%` }}
                            transition={{ delay: i * 0.02, duration: 0.5 }}
                          />
                        );
                      })}
                    </div>

                    {/* Info overlay */}
                    <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3">
                      <div className="text-sm font-medium text-white">Final Value</div>
                      <div className="text-lg font-bold text-green-400">
                        ${backtestResults.finalValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawdown chart */}
                <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
                  <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_M>Drawdown Analysis</h3>

                  <div className="h-64 bg-gray-800 rounded-lg flex items-end p-4 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%']
                      }}
                      transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
                    />

                    {/* Simulation de drawdown */}
                    <div className="flex items-end space-x-1 h-full w-full relative z-10">
                      {backtestResults.drawdownData.slice(0, 50).map((point, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-gradient-to-t from-red-500 to-orange-400 rounded-sm"
                          style={{ height: `${Math.max(2, point.drawdown * 4)}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(2, point.drawdown * 4)}%` }}
                          transition={{ delay: i * 0.02, duration: 0.5 }}
                        />
                      ))}
                    </div>

                    {/* Info overlay */}
                    <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3">
                      <div className="text-sm font-medium text-white">Max Drawdown</div>
                      <div className="text-lg font-bold text-red-400">
                        -{backtestResults.metrics.maxDrawdown.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
                  <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_M>Performance Metrics</h3>

                  <div className=STR_SPACE_Y_4>
                    {[
                      { label: 'Annualized Return', value: `${backtestResults.metrics.annualizedReturn.toFixed(2)}%`, positive: backtestResults.metrics.annualizedReturn > 0 }
                      { label: 'Sortino Ratio', value: backtestResults.metrics.sortinqRatio.toFixed(2), positive: backtestResults.metrics.sortinqRatio > 1.5 }
                      { label: 'Calmar Ratio', value: backtestResults.metrics.calmarRatio.toFixed(2), positive: backtestResults.metrics.calmarRatio > 0.5 }
                      { label: 'Volatility', value: `${backtestResults.metrics.volatility.toFixed(2)}%`, positive: false }
                      { label: 'Profit Factor', value: backtestResults.metrics.profitFactor.toFixed(2), positive: backtestResults.metrics.profitFactor > 1.5 }
                    ].map((metric, index) => (
                      <div key={index} className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                        <span className=STR_TEXT_GRAY_400>{metric.label}</span>
                        <span className={`font-medium ${
                          metric.positive ? STR_TEXT_GREEN_400 :
                          metric.positive === false ? 'text-gray-300' : STR_TEXT_RED_400
                        }`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trading Statistics */}
                <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
                  <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_M>Trading Statistics</h3>

                  <div className=STR_SPACE_Y_4>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Total Trades</span>
                      <span className="text-white font-medium">{backtestResults.trades.total}</span>
                    </div>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Average Win</span>
                      <span className=STR_TEXT_GREEN_400_FONT_MEDIUM>${backtestResults.trades.averageWin}</span>
                    </div>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Average Loss</span>
                      <span className=STR_TEXT_RED_400_FONT_MEDIUM>${backtestResults.trades.averageLoss}</span>
                    </div>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Largest Win</span>
                      <span className=STR_TEXT_GREEN_400_FONT_MEDIUM>${backtestResults.trades.largestWin}</span>
                    </div>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Largest Loss</span>
                      <span className=STR_TEXT_RED_400_FONT_MEDIUM>${backtestResults.trades.largestLoss}</span>
                    </div>
                    <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                      <span className=STR_TEXT_GRAY_400>Avg Hold Time</span>
                      <span className="text-gray-300 font-medium">{backtestResults.trades.averageHoldTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium
                           flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className=STR_W_5_H_5 />
                  <span>Export Results</span>
                </motion.button>

                <motion.button
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium
                           flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share className=STR_W_5_H_5 />
                  <span>Share Backtest</span>
                </motion.button>

                <motion.button
                  onClick={() => setBacktestResults(null)}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium
                           flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className=STR_W_5_H_5 />
                  <span>New Backtest</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BacktestInterface;
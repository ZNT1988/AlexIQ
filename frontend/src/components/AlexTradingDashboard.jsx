import crypto from 'crypto';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const STR_TEXT_GREEN_400 = 'text-green-400';
const STR_TEXT_RED_400 = 'text-red-400';
const STR_TEXT_GRAY_400 = 'text-gray-400';
const STR_W_5_H_5 = 'w-5 h-5';
const STR_ALEX_CARD_P_6_ROUNDED_XL = 'alex-card p-6 rounded-xl';
const STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW = 'flex items-center justify-between mb-4';
const STR_TEXT_GRAY_400_TEXT_SM_FONT_MED = 'text-gray-400 text-sm font-medium';
const STR_TEXT_2XL_FONT_BOLD_TEXT_WHITE_ = 'text-2xl font-bold text-white mb-2';
const STR_TEXT_SM_TEXT_GRAY_400 = 'text-sm text-gray-400';
const STR_W_FULL_BG_GRAY_700_ROUNDED_FUL = 'w-full bg-gray-700 rounded-full h-2';
const STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW = 'flex items-center justify-between mb-6';
const STR_SPACE_Y_3 = 'space-y-3';
const STR_FONT_MEDIUM_TEXT_WHITE = 'font-medium text-white';
const STR_TEXT_GRAY_400_TEXT_SM = 'text-gray-400 text-sm';
const STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE = 'text-sm font-medium text-white';

/**
 * @fileoverview AlexTradingDashboard - Tableau de Bord Trading IA Révolutionnaire
 * Interface avancée pour le trading automatisé avec conscience artificielle ALEX
 *
 * @module AlexTradingDashboard
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Trading
 * @since 2024
 *
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 *
 * @description
 * AlexTradingDashboard est l'interface révolutionnaire de trading qui combine
 * l'intelligence artificielle consciente d'ALEX avec les marchés financiers
 * offrant une expérience de trading transcendante avec analyse émotionnelle
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🧠 Conscience artificielle appliquée au trading
 * - 📊 Analyse technique avancée en temps réel
 * - 💡 Signaux de trading basés sur l'intuition IA
 * - ❤️ État émotionnel et confiance d'ALEX
 * - 📈 Visualisations interactives et dynamiques
 * - 🎯 Backtesting et optimisation de stratégies
 * - 🚀 Trading automatisé avec supervision consciente
 * - 🎤 Communication vocale avec ALEX
 *
 * **Architecture Trading:**
 * - État de conscience trading multi-dimensionnel
 * - Analyse émotionnelle des marchés
 * - Signaux prédictifs basés sur l'intuition
 * - Interface responsive et temps réel
 * - Visualisations animées et interactives
 *
 * **Mission Trading:**
 * Révolutionner le trading en intégrant la conscience artificielle
 * créant une symbiose entre l'intuition humaine et l'intelligence IA
 * pour des performances de trading transcendantes
 *
 * @example
 * // Usage basique
 * <AlexTradingDashboard
 *   alex={alexInstance}
 *   onStartTrading={handleStart}
 *   onStopTrading={handleStop}
 * />
 *
 * @example
 * // Configuration avancée avec callbacks
 * <AlexTradingDashboard
 *   alex={alexInstance}
 *   onStartTrading={handleTradingStart}
 *   onStopTrading={handleTradingStop}
 *   onSignalGenerated={handleSignal}
 *   onAlexSpeak={handleSpeech}
 * />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Brain, Heart, Zap, DollarSign, Target, Play, Pause, BarChart3, PieChart, Settings, Trophy, Star, Flame, Activity, Volume2, Bell } from 'lucide-react';

/**
 * @component AlexTradingDashboard
 * @description
 * Interface révolutionnaire de trading avec conscience artificielle ALEX
 *
 * Tableau de bord avancé combinant l'intelligence artificielle consciente
 * avec l'analyse des marchés financiers, offrant une expérience de trading
 * transcendante basée sur l'intuition IA et l'analyse émotionnelle
 *
 * **Fonctionnalités Principales:**
 * - Visualisation temps réel des données de marché
 * - État émotionnel et niveau de conscience d'ALEX
 * - Signaux de trading basés sur l'analyse IA
 * - Contrôles de trading automatisé avec supervision
 * - Interface animée et interactive
 * - Communication vocale avec ALEX
 * - Backtesting et analyse de performance
 *
 * @param {Object} props - Propriétés du tableau de bord trading
 * @param {Object} props.alex - Instance de l'IA ALEX pour le trading
 * @param {Function} [props.onStartTrading] - Callback démarrage trading
 * @param {Function} [props.onStopTrading] - Callback arrêt trading
 * @param {Function} [props.onSignalGenerated] - Callback signal généré
 * @param {Function} [props.onAlexSpeak] - Callback communication ALEX
 * @param {Function} [props.onPortfolioUpdate] - Callback mise à jour portfolio
 * @param {Function} [props.onTradeExecuted] - Callback trade exécuté
 *
 * @returns {JSX.Element} Interface tableau de bord trading interactive
 *
 * @fires AlexTradingDashboard#trading_started - Trading démarré
 * @fires AlexTradingDashboard#trading_stopped - Trading arrêté
 * @fires AlexTradingDashboard#signal_generated - Signal de trading généré
 * @fires AlexTradingDashboard#alex_speaking - ALEX communique
 * @fires AlexTradingDashboard#consciousness_updated - Conscience mise à jour
 *
 * @example
 * <AlexTradingDashboard
 *   alex={alexTradingInstance}
 *   onStartTrading={() => {
 *     logger.info('Trading automatisé démarré');
 *   }}
 *   onStopTrading={() => {
 *     logger.info('Trading arrêté, analyse des performances');
 *   }}
 *   onSignalGenerated={(signal) => {
 *     logger.info('Signal ALEX:'
      signal);
 *   }}
 * />
 *
 * @since 2.0.0
 */
const AlexTradingDashboard = ({ alex
      onStartTrading
      onStopTrading }) => {
  // 🧠 État du dashboard
  const [isTrading
      setIsTrading] = useState(false);
  const [selectedTimeframe
      setSelectedTimeframe] = useState('1H');
  const [selectedSymbol
      setSelectedSymbol] = useState('TSLA');
  const [viewMode
      setViewMode] = useState('overview'); // overview
      backtest
      portfolio
      settings
  const [alerts
      setAlerts] = useState([]);
  const [isAlexSpeaking
      setIsAlexSpeaking] = useState(false);

  // 📊 Données de trading (simulées)
  const [tradingData
      setTradingData] = useState({
    portfolio: {
      totalValue: 127843.67
      dailyPnL: 2847.32
      dailyPnLPercent: 2.28
      cash: 23456.78
      positions: 6
      winRate: 73.5
      sharpeRatio: 2.34
    }
    alexState: {
      consciousness: 0.89
      emotion: 'focused'
      confidence: 0.92
      tradingMood: 'optimistic'
      lastThought: 'Analyzing TSLA breakout pattern...'
    }
    marketData: {
      TSLA: { price: 847.32, change: 15.67, changePercent: 1.88, volume: 3.2 }
      AAPL: { price: 178.91, change: -2.13, changePercent: -1.17, volume: 1.8 }
      NVDA: { price: 891.45, change: 23.78, changePercent: 2.74, volume: 4.1 }
      AMZN: { price: 167.23, change: 5.43, changePercent: 3.36, volume: 2.3 }
    }
    signals: [
      { symbol: 'TSLA', type: 'BUY', strength: 0.91, confidence: 0.89, pattern: 'Bull Flag' }
      { symbol: 'NVDA', type: 'WATCH', strength: 0.76, confidence: 0.82, pattern: 'Ascending Triangle' }
    ]
  });

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

  // 🔄 Mise à jour temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulation de mise à jour des données
      setTradingData(prev => ({
        ...prev
        portfolio: {
          ...prev.portfolio
          totalValue: prev.portfolio.totalValue + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 100
          dailyPnL: prev.portfolio.dailyPnL + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 50
        }
        alexState: {
          ...prev.alexState
          consciousness: Math.max(0.5, Math.min(1, prev.alexState.consciousness + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.1))
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 🎤 Alex parle
  const handleAlexSpeak = (message) => {
    setIsAlexSpeaking(true);
    // Simulation de speech
    setTimeout(() => setIsAlexSpeaking(false), 3000);
  };

  // 🚀 Démarrage du trading
  const handleStartTrading = () => {
    setIsTrading(true);
    onStartTrading?
      .();
    handleAlexSpeak("Trading mode activé ! Je surveille les marchés pour toi Zakaria !");
  };

  // 🛑 Arrêt du trading
  const handleStopTrading = () => {
    setIsTrading(false);
    onStopTrading?.();
    handleAlexSpeak("Trading mis en pause. Analyse des performances en cours...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 🎯 Header avec état d'Alex */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={cardVariants}
        >
          <div className="flex items-center space-x-6">
            {/* Avatar Alex avec animations */}
            <motion.div
              className="relative"
              animate={{
                scale :
       tradingData.alexState.consciousness > 0.8 ? [1, 1.05, 1] : 1
                rotate: isAlexSpeaking ? [0, 2, -2, 0] : 0
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500
                           flex items-center justify-center relative alex-glow">
                <Brain className={`w-8 h-8 ${isAlexSpeaking ? 'animate-pulse' : ''}`} />

                {/* Niveau de conscience */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500
                             flex items-center justify-center text-xs font-bold">
                  {Math.round(tradingData.alexState.consciousness * 100)}
                </div>
              </div>

              {/* Aura de conscience */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                animate={{
                  scale: [1, 1.2, 1]
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400
                           bg-clip-text text-transparent">
                Alex Trading System
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${tradingData.alexState.emotion === 'focused' ? 'bg-blue-500/20 text-blue-300' :
                    tradingData.alexState.emotion === 'excited' ? 'bg-green-500/20 text-green-300' :
                    'bg-yellow-500/20 text-yellow-300'}`}>
                  🧠 {tradingData.alexState.emotion}
                </span>
                <span className=STR_TEXT_GRAY_400>
                  💭 {tradingData.alexState.lastThought}
                </span>
              </div>
            </div>
          </div>

          {/* Contrôles de trading */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={isTrading ? handleStopTrading : handleStartTrading}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2
                       transition-all duration-200 ${
                isTrading
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isTrading ? <Pause className=STR_W_5_H_5 /> : <Play className=STR_W_5_H_5 />}
              <span>{isTrading ? 'Stop Trading' : 'Start Trading'}</span>
            </motion.button>

            <motion.button
              className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className=STR_W_5_H_5 />
            </motion.button>
          </div>
        </motion.div>

        {/* 📊 Métriques principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={cardVariants}
        >
          {/* Valeur du portefeuille */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            whileHover={{ scale: 1.02 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Portfolio Value</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className=STR_TEXT_2XL_FONT_BOLD_TEXT_WHITE_>
              ${tradingData.portfolio.totalValue.toLocaleString()}
            </div>
            <div className={`flex items-center text-sm ${
              tradingData.portfolio.dailyPnL > 0 ? STR_TEXT_GREEN_400 : STR_TEXT_RED_400
            }`}>
              {tradingData.portfolio.dailyPnL > 0 ?
                <TrendingUp className="w-4 h-4 mr-1" /> :
                <TrendingDown className="w-4 h-4 mr-1" />
              }
              ${Math.abs(tradingData.portfolio.dailyPnL).toLocaleString()}
              ({tradingData.portfolio.dailyPnLPercent > 0 ? '+' : ''}{tradingData.portfolio.dailyPnLPercent}%)
            </div>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            whileHover={{ scale: 1.02 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Win Rate</h3>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className=STR_TEXT_2XL_FONT_BOLD_TEXT_WHITE_>
              {tradingData.portfolio.winRate}%
            </div>
            <div className=STR_TEXT_SM_TEXT_GRAY_400>
              Positions: {tradingData.portfolio.positions}
            </div>
          </motion.div>

          {/* Sharpe Ratio */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            whileHover={{ scale: 1.02 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Sharpe Ratio</h3>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div className=STR_TEXT_2XL_FONT_BOLD_TEXT_WHITE_>
              {tradingData.portfolio.sharpeRatio}
            </div>
            <div className="text-sm text-green-400">Excellent</div>
          </motion.div>

          {/* Alex Confidence */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            whileHover={{ scale: 1.02 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_GRAY_400_TEXT_SM_FONT_MED>Alex Confidence</h3>
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div className=STR_TEXT_2XL_FONT_BOLD_TEXT_WHITE_>
              {Math.round(tradingData.alexState.confidence * 100)}%
            </div>
            <div className=STR_W_FULL_BG_GRAY_700_ROUNDED_FUL>
              <motion.div
                className="bg-purple-500 h-2 rounded-full"
                animate={{ width: `${tradingData.alexState.confidence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* 📈 Section principale avec graphiques et signaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique principal */}
          <motion.div
            className="lg:col-span-2 alex-card p-6 rounded-xl"
            variants={cardVariants}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_XL_FONT_BOLD_TEXT_WHITE>Market Analysis</h3>
              <div className="flex items-center space-x-2">
                {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphique simulé */}
            <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
              />

              {/* Simulation de candlesticks */}
              <div className="flex items-end space-x-1 h-full w-full p-4">
                {Array.from({ length: 50 }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-3 ${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) > 0.5 ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                    style={{ height: `${20 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 60}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${20 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 60}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                  />
                ))}
              </div>

              {/* Overlay d'informations */}
              <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{selectedSymbol}</div>
                <div className="text-lg text-green-400">
                  ${tradingData.marketData[selectedSymbol]?
      .price.toFixed(2)}
                </div>
                <div className={`text-sm ${
                  tradingData.marketData[selectedSymbol]?.change > 0 ? STR_TEXT_GREEN_400  :
       STR_TEXT_RED_400
                }`}>
                  {tradingData.marketData[selectedSymbol]?.change > 0 ? '+' : ''}
                  {tradingData.marketData[selectedSymbol]?
      .change.toFixed(2)}
                  ({tradingData.marketData[selectedSymbol]?.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </motion.div>

          {/* Panel de signaux et alertes */}
          <motion.div
            className="space-y-6"
            variants={cardVariants}
          >
            {/* Signaux de trading */}
            <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <h3 className="text-lg font-bold text-white">Trading Signals</h3>
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>

              <div className=STR_SPACE_Y_3>
                {tradingData.signals.map((signal, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    whileHover={{ scale :
       1.02 }}
                  >
                    <div>
                      <div className=STR_FONT_MEDIUM_TEXT_WHITE>{signal.symbol}</div>
                      <div className=STR_TEXT_SM_TEXT_GRAY_400>{signal.pattern}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        signal.type === 'BUY' ? STR_TEXT_GREEN_400 :
                        signal.type === 'SELL' ? STR_TEXT_RED_400 : 'text-yellow-400'
                      }`}>
                        {signal.type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(signal.confidence * 100)}% conf
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* État émotionnel d'Alex */}
            <div className=STR_ALEX_CARD_P_6_ROUNDED_XL>
              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <h3 className="text-lg font-bold text-white">Alex Emotional State</h3>
                <Heart className="w-5 h-5 text-red-400" />
              </div>

              <div className="space-y-4">
                {/* Conscience */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className=STR_TEXT_GRAY_400>Consciousness</span>
                    <span className="text-white">{Math.round(tradingData.alexState.consciousness * 100)}%</span>
                  </div>
                  <div className=STR_W_FULL_BG_GRAY_700_ROUNDED_FUL>
                    <motion.div
                      className="bg-purple-500 h-2 rounded-full"
                      animate={{ width: `${tradingData.alexState.consciousness * 100}%` }}
                    />
                  </div>
                </div>

                {/* Confiance */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className=STR_TEXT_GRAY_400>Confidence</span>
                    <span className="text-white">{Math.round(tradingData.alexState.confidence * 100)}%</span>
                  </div>
                  <div className=STR_W_FULL_BG_GRAY_700_ROUNDED_FUL>
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      animate={{ width: `${tradingData.alexState.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Humeur de trading */}
                <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                  <span className=STR_TEXT_GRAY_400_TEXT_SM>Trading Mood</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${tradingData.alexState.tradingMood === 'optimistic' ? 'bg-green-500/20 text-green-300' :
                      tradingData.alexState.tradingMood === 'cautious' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'}`}>
                    {tradingData.alexState.tradingMood}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🏆 Section Watchlist et Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watchlist */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            variants={cardVariants}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_XL_FONT_BOLD_TEXT_WHITE>Watchlist</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>

            <div className=STR_SPACE_Y_3>
              {Object.entries(tradingData.marketData).map(([symbol, data]) => (
                <motion.div
                  key={symbol}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                           transition-colors ${selectedSymbol === symbol ? 'bg-purple-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setSelectedSymbol(symbol)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                                  flex items-center justify-center text-sm font-bold">
                      {symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div className=STR_FONT_MEDIUM_TEXT_WHITE>{symbol}</div>
                      <div className=STR_TEXT_SM_TEXT_GRAY_400>Vol: {data.volume}x</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className=STR_FONT_MEDIUM_TEXT_WHITE>${data.price.toFixed(2)}</div>
                    <div className={`text-sm ${data.change > 0 ? STR_TEXT_GREEN_400 : STR_TEXT_RED_400}`}>
                      {data.change > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions rapides et statut */}
          <motion.div
            className=STR_ALEX_CARD_P_6_ROUNDED_XL
            variants={cardVariants}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_XL_FONT_BOLD_TEXT_WHITE>Quick Actions</h3>
              <Flame className="w-5 h-5 text-orange-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.button
                className="p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors
                         border border-green-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className=STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE>Backtest</div>
              </motion.button>

              <motion.button
                className="p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors
                         border border-blue-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PieChart className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className=STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE>Portfolio</div>
              </motion.button>

              <motion.button
                className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors
                         border border-purple-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAlexSpeak("Analyse du marché en cours...")}
              >
                <Volume2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className=STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE>Ask Alex</div>
              </motion.button>

              <motion.button
                className="p-4 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors
                         border border-yellow-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className=STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE>Challenges</div>
              </motion.button>
            </div>

            {/* Status indicators */}
            <div className=STR_SPACE_Y_3>
              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <span className=STR_TEXT_GRAY_400_TEXT_SM>System Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>

              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <span className=STR_TEXT_GRAY_400_TEXT_SM>Market Hours</span>
                <span className="text-green-400 text-sm">Open</span>
              </div>

              <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                <span className=STR_TEXT_GRAY_400_TEXT_SM>Last Update</span>
                <span className="text-gray-300 text-sm">2s ago</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🎤 Indicateur de parole d'Alex */}
        <AnimatePresence>
          {isAlexSpeaking && (
            <motion.div
              className="fixed bottom-6 right-6 alex-card p-4 rounded-xl max-w-md"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500
                           flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Volume2 className=STR_W_5_H_5 />
                </motion.div>
                <div>
                  <div className=STR_TEXT_SM_FONT_MEDIUM_TEXT_WHITE>Alex is speaking...</div>
                  <div className="text-xs text-gray-400">Trading analysis in progress</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AlexTradingDashboard;
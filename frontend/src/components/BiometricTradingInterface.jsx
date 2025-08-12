import crypto from 'crypto';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Zap, Activity, Waves, Target, Thermometer, Droplets, Sun, TrendingUp, AlertCircle, Shield, Wifi, Settings } from 'lucide-react';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_WARNING = 'warning';

const BiometricTradingInterface = ({ alex, temporalCore, onBioDataChange }) => {
  // 🧠 État biométrique temps réel
  const [bioData, setBioData] = useState({
    // Données cardiovasculaires
    heartRate: {
      current: 72
      baseline: 70
      variability: 15.3
      trend: 'stable'
      coherence: 0.87
      zones: {
        resting: { min: 60, max: 80 }
        trading: { min: 75, max: 95 }
        stress: { min: 95, max: 120 }
      }
    }
    // Ondes cérébrales
    brainWaves: {
      alpha: { frequency: 10.5, amplitude: 0.82, power: 0.73, state: 'relaxed_focus' }
      beta: { frequency: 20.3, amplitude: 0.65, power: 0.89, state: 'active_thinking' }
      gamma: { frequency: 42.7, amplitude: 0.91, power: 0.95, state: 'peak_performance' }
      theta: { frequency: 6.8, amplitude: 0.48, power: 0.56, state: 'creativity' }
      delta: { frequency: 2.3, amplitude: 0.34, power: 0.42, state: 'deep_processing' }
    }
    // Indicateurs physiologiques
    physiology: {
      skinConductance: 0.67,      // Conductance cutanée (stress)
      bodyTemperature: 36.8,      // Température corporelle
      bloodOxygen: 98.2,          // Oxygénation sanguine
      cortisol: 0.34,            // Niveau de cortisol (stress)
      adrenaline: 0.45,          // Niveau d'adrénaline
      dopamine: 0.78,            // Niveau de dopamine
      serotonin: 0.65,           // Niveau de sérotonine
      norepinephrine: 0.52       // Noradrénaline (attention)
    }
    // États émotionnels détaillés
    emotions: {
      primary: 'focused'
      secondary: ['confident', 'alert', 'optimistic']
      arousal: 0.73,             // Niveau d'éveil
      valence: 0.68,             // Polarité émotionnelle
      dominance: 0.82,           // Sentiment de contrôle
      stress: 0.23,              // Niveau de stress
      fatigue: 0.15,             // Niveau de fatigue
      engagement: 0.91           // Niveau d'engagement
    }
    // Patterns cognitifs
    cognition: {
      attention: 0.89,           // Niveau d'attention
      focus: 0.94,               // Qualité de focus
      workingMemory: 0.78,       // Mémoire de travail
      decisionSpeed: 0.85,       // Vitesse de décision
      riskPerception: 0.67,      // Perception du risque
      confidence: 0.82,          // Confiance en décisions
      fatigue: 0.12,             // Fatigue cognitive
      flow: 0.76                 // État de flow
    }
    // Rythmes circadiens
    circadian: {
      phase: 'peak_performance', // Phase actuelle
      energy: 0.87,             // Niveau d'énergie
      alertness: 0.91,          // Niveau d'alerte
      cortisol_rhythm: 0.65,    // Rythme cortisol
      melatonin: 0.12,          // Niveau mélatonine
      body_clock: '14:23'       // Horloge biologique
    }
  });

  // 🎯 Configuration des capteurs
  const [sensorConfig, setSensorConfig] = useState({
    heartRate: { enabled: true, sensitivity: 0.8, calibrated: true }
    eeg: { enabled: true, channels: 64, quality: 0.94, noise_filter: true }
    gsr: { enabled: true, baseline: 0.5, adaptive: true }
    temperature: { enabled: true, precision: 0.1, calibrated: true }
    breathing: { enabled: true, pattern_detection: true }
    eye_tracking: { enabled: true, precision: 'high', frequency: 120 }
    voice_stress: { enabled: true, ai_analysis: true }
    posture: { enabled: true, ergonomic_alerts: true }
  });

  // 🎮 État de l'interface
  const [interfaceState, setInterfaceState] = useState({
    isConnected: true
    syncQuality: 0.967
    latency: 3.2, // ms
    bandwidth: 2048, // canaux
    adaptiveMode: true
    realTimeMode: true
    predictiveMode: true
    feedbackEnabled: true
  });

  // 📊 Historique biométrique
  const [bioHistory, setBioHistory] = useState({
    heartRate: Array.from({ length: 60 }, (_, i) => ({
      time: Date.now() - (60 - i) * 1000
      value: 70 + Math.sin(i * 0.1) * 5 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 3
    }))
    brainWaves: {
      alpha: Array.from({ length: 60 }, (_, i) => ({ time: Date.now() - (60 - i) * 1000, value: 0.8 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 0.2 }))
      beta: Array.from({ length: 60 }, (_, i) => ({ time: Date.now() - (60 - i) * 1000, value: 0.6 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 0.3 }))
      gamma: Array.from({ length: 60 }, (_, i) => ({ time: Date.now() - (60 - i) * 1000, value: 0.9 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 0.1 }))
    }
    stress: Array.from({ length: 60 }, (_, i) => ({
      time: Date.now() - (60 - i) * 1000
      value: 0.2 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 0.3
    }))
  });

  // 🚨 Alertes biométriques
  const [alerts, setAlerts] = useState([]);

  // 🔄 Mise à jour temps réel des données biométriques
  useEffect(() => {
    const interval = setInterval(() => {
      setBioData(prev => {
        const newData = { ...prev };

        // Mise à jour rythme cardiaque
        const hrVariation = ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 4;
        newData.heartRate.current = Math.max(50, Math.min(120, prev.heartRate.current + hrVariation));
        newData.heartRate.variability = 10 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 20;

        // Mise à jour ondes cérébrales
        Object.keys(newData.brainWaves).forEach(wave => {
          newData.brainWaves[wave].amplitude += ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.1;
          newData.brainWaves[wave].amplitude = Math.max(0.1, Math.min(1.0, newData.brainWaves[wave].amplitude));
          newData.brainWaves[wave].power = (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 0.3 + 0.7;
        });

        // Mise à jour indicateurs physiologiques
        newData.physiology.skinConductance = Math.max(0, Math.min(1, prev.physiology.skinConductance + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.05));
        newData.physiology.cortisol = Math.max(0, Math.min(1, prev.physiology.cortisol + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02));

        // Mise à jour émotions
        newData.emotions.arousal = Math.max(0, Math.min(1, prev.emotions.arousal + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.03));
        newData.emotions.stress = Math.max(0, Math.min(1, prev.emotions.stress + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02));

        // Mise à jour cognition
        newData.cognition.attention = Math.max(0, Math.min(1, prev.cognition.attention + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02));
        newData.cognition.focus = Math.max(0, Math.min(1, prev.cognition.focus + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.01));

        return newData;
      });

      // Mise à jour historique
      setBioHistory(prev => ({
        heartRate: [...prev.heartRate.slice(1), {
          time: Date.now()
          value: bioData.heartRate.current
        }]
        brainWaves: {
          alpha: [...prev.brainWaves.alpha.slice(1), { time: Date.now(), value: bioData.brainWaves.alpha.amplitude }]
          beta: [...prev.brainWaves.beta.slice(1), { time: Date.now(), value: bioData.brainWaves.beta.amplitude }]
          gamma: [...prev.brainWaves.gamma.slice(1), { time: Date.now(), value: bioData.brainWaves.gamma.amplitude }]
        }
        stress: [...prev.stress.slice(1), {
          time: Date.now()
          value: bioData.emotions.stress
        }]
      }));

    }, 1000);

    return () => clearInterval(interval);
  }, [bioData.heartRate.current, bioData.brainWaves, bioData.emotions.stress]);

  // 🎯 Détection d'alertes biométriques
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts = [];

      // Alerte rythme cardiaque élevé
      if (bioData.heartRate.current > 100) {
        newAlerts.push({
          type: 'heart_rate_high'
          severity: STR_WARNING
          message: 'Rythme cardiaque élevé détecté'
          value: bioData.heartRate.current
          recommendation: 'Considérer une pause ou réduire l\'exposition au risque'
        });
      }

      // Alerte stress élevé
      if (bioData.emotions.stress > 0.7) {
        newAlerts.push({
          type: 'stress_high'
          severity: STR_CRITICAL
          message: 'Niveau de stress critique'
          value: bioData.emotions.stress
          recommendation: 'Arrêt immédiat recommandé - Techniques de relaxation'
        });
      }

      // Alerte fatigue cognitive
      if (bioData.cognition.fatigue > 0.6) {
        newAlerts.push({
          type: 'cognitive_fatigue'
          severity: STR_WARNING
          message: 'Fatigue cognitive détectée'
          value: bioData.cognition.fatigue
          recommendation: 'Pause recommandée - Performance dégradée'
        });
      }

      // Alerte baisse d\'attention
      if (bioData.cognition.attention < 0.5) {
        newAlerts.push({
          type: 'attention_low'
          severity: 'info'
          message: 'Baisse d\'attention détectée'
          value: bioData.cognition.attention
          recommendation: 'Exercices de concentration ou pause active'
        });
      }

      setAlerts(newAlerts);
    };

    checkAlerts();
  }, [bioData]);

  // 🎤 Feedback vocal d'Alex basé sur la biométrie    if (alex && feedbackMessages[alertType]) {
      alex.speak(feedbackMessages[alertType]);
    }
  }, [alex]);

  // 🎨 Couleur basée sur l'état biométrique
  const getBioColor = (value, type = 'normal') => {
    if (type === 'stress') {
      if (value < 0.3) return STR_10B981; // Vert - faible stress
      if (value < 0.6) return STR_F59E0B; // Orange - stress modéré
      return '#ef4444'; // Rouge - stress élevé
    }

    if (value > 0.8) return STR_10B981;  // Excellent
    if (value > 0.6) return STR_3B82F6;  // Bon
    if (value > 0.4) return STR_F59E0B;  // Moyen
    return '#ef4444';                   // Faible
  };

  // 📊 Composant Graphique biométrique
  const BiometricChart = ({ data, label, color, unit = '' }) => {
    return (
      <div className="h-24 relative">
        <div className="absolute top-0 left-0 text-xs text-gray-400">{label}</div>
        <div className="absolute top-0 right-0 text-xs font-medium" style={{ color }}>
          {typeof data[data.length - 1]?.value === 'number'
            ? data[data.length - 1].value.toFixed(1) + unit
            : 'N/A'}
        </div>

        <svg className="w-full h-full mt-4" viewBox="0 0 300 60">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((_, i) => `${(i / (data.length - 1)) * 300},${60 - (point.value * 50)}`
            ).join(' ')}
          />

          {/* Zone de remplissage */}
          <path
            d={`M 0,60 ${data.map((_, i) => '${L ${(i / (data.length - 1)) * 300},${60 - (point.value * 50)}}'
            ).join(' ')} L 300,60 Z`}
            fill={color}
            opacity="0.1"
          />
        </svg>
      </div>
    );
  };

  // 🎯 Composant Jauge circulaire
  const CircularGauge = ({ value, label, color, icon: Icon, size = 'md' }) => {
    const radius = size === 'lg' ? 45 : size === 'md' ? 35 : 25;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value * circumference);

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <svg width={radius * 2 + 20} height={radius * 2 + 20} className="transform -rotate-90">
            {/* Cercle de fond */}
            <circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              stroke="#374151"
              strokeWidth="4"
              fill="transparent"
            />

            {/* Cercle de progression */}
            <motion.circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              stroke={color}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Icône et valeur au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-xs font-bold text-white">
              {(value * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <span className="text-xs text-gray-400 text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* 🎯 Header avec statut de connexion */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0
      y: -20 }}
          animate={{ opacity: 1
      y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500
                       flex items-center justify-center relative"
              animate={{
                boxShadow: interfaceState.isConnected
                  ?
      ['0 0 0 0 rgba(34
      197
      94
      0.7)'
      '0 0 0 10px rgba(34
      197
      94
      0)'
      '0 0 0 0 rgba(34
      197
      94
      0.7)']
                   :
       '0 0 0 0 rgba(239
      68
      68
      0.7)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-6 h-6" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400
                           bg-clip-text text-transparent">
                Biometric Trading Interface
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`flex items-center space-x-1 ${
                  interfaceState.isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  <Wifi className="w-4 h-4" />
                  <span>{interfaceState.isConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
                <span className=STR_TEXT_GRAY_400>
                  Sync: {(interfaceState.syncQuality * 100).toFixed(1)}%
                </span>
                <span className=STR_TEXT_GRAY_400>
                  Latency: {interfaceState.latency}ms
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* 🚨 Alertes biométriques */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === STR_CRITICAL ? 'bg-red-900/30 border-red-500' :
                    alert.severity === STR_WARNING ? 'bg-yellow-900/30 border-yellow-500' :
                    'bg-blue-900/30 border-blue-500'
                  }`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className={`w-5 h-5 ${
                      alert.severity === STR_CRITICAL ? 'text-red-400' :
                      alert.severity === STR_WARNING ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{alert.recommendation}</p>
                  <div className="text-xs text-gray-500">
                    Valeur: {typeof alert.value === 'number' ? alert.value.toFixed(2) : alert.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📊 Dashboard principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Métriques cardiovasculaires */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_F>
                <Heart className="w-5 h-5 text-red-400 mr-2" />
                Cardiovasculaire
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium
                ${bioData.heartRate.current > 90 ? 'bg-red-500/20 text-red-400' :
                  bioData.heartRate.current > 80 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'}`}>
                {bioData.heartRate.current > 90 ? 'Élevé' :
                 bioData.heartRate.current > 80 ? 'Modéré' : STR_NORMAL}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className=STR_TEXT_GRAY_400>Rythme cardiaque</span>
                  <span className="text-white font-medium">{Math.round(bioData.heartRate.current)} BPM</span>
                </div>
                <BiometricChart
                  data={bioHistory.heartRate}
                  label="BPM"
                  color={getBioColor(bioData.heartRate.current / 100)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CircularGauge
                  value={bioData.heartRate.variability / 30}
                  label="Variabilité"
                  color=STR_8B5CF6
                  icon={Activity}
                />
                <CircularGauge
                  value={bioData.heartRate.coherence}
                  label="Cohérence"
                  color="#06b6d4"
                  icon={Target}
                />
              </div>
            </div>
          </motion.div>

          {/* Activité cérébrale */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_F>
                <Brain className="w-5 h-5 text-purple-400 mr-2" />
                Activité Cérébrale
              </h3>
              <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                {bioData.brainWaves.gamma.power > 0.8 ? 'Peak' : STR_NORMAL}
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(bioData.brainWaves).map(([wave, data]) => (
                <div key={wave}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 capitalize">{wave}</span>
                    <span className="text-white">{data.frequency.toFixed(1)} Hz</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        wave === 'alpha' ? 'from-blue-500 to-blue-300' :
                        wave === 'beta' ? 'from-green-500 to-green-300' :
                        wave === 'gamma' ? 'from-purple-500 to-purple-300' :
                        wave === 'theta' ? 'from-orange-500 to-orange-300' :
                        'from-red-500 to-red-300'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.power * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{data.state}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* États émotionnels et cognitifs */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <h3 className=STR_TEXT_LG_FONT_BOLD_TEXT_WHITE_F>
                <Eye className="w-5 h-5 text-blue-400 mr-2" />
                État Mental
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium
                ${bioData.cognition.flow > 0.7 ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'}`}>
                {bioData.cognition.flow > 0.7 ? 'Flow' : STR_NORMAL}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <CircularGauge
                value={bioData.cognition.attention}
                label="Attention"
                color=STR_3B82F6
                icon={Target}
              />
              <CircularGauge
                value={bioData.cognition.focus}
                label="Focus"
                color=STR_8B5CF6
                icon={Zap}
              />
              <CircularGauge
                value={1 - bioData.emotions.stress}
                label="Calme"
                color={getBioColor(1 - bioData.emotions.stress)}
                icon={Shield}
              />
              <CircularGauge
                value={bioData.cognition.confidence}
                label="Confiance"
                color=STR_10B981
                icon={TrendingUp}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className=STR_TEXT_GRAY_400>État primaire: </span>
                <span className="text-white font-medium capitalize">{bioData.emotions.primary}</span>
              </div>
              <div className="text-sm">
                <span className=STR_TEXT_GRAY_400>Engagement: </span>
                <span className="text-green-400 font-medium">{(bioData.emotions.engagement * 100).toFixed(0)}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🌊 Graphiques détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ondes cérébrales temps réel */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Waves className="w-5 h-5 text-purple-400 mr-2" />
              Ondes Cérébrales Temps Réel
            </h3>

            <div className="space-y-4">
              {Object.entries(bioHistory.brainWaves).map(([wave, data]) => (
                <BiometricChart
                  key={wave}
                  data={data}
                  label={wave.charAt(0).toUpperCase() + wave.slice(1)}
                  color={
                    wave === 'alpha' ? STR_3B82F6 :
                    wave === 'beta' ? STR_10B981 :
                    STR_8B5CF6
                  }
                />
              ))}
            </div>
          </motion.div>

          {/* Indicateurs physiologiques */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Thermometer className="w-5 h-5 text-orange-400 mr-2" />
              Indicateurs Physiologiques
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'skinConductance', label: 'Conductance', icon: Droplets, color: '#06b6d4' }
                { key: 'cortisol', label: 'Cortisol', icon: AlertCircle, color: STR_F59E0B }
                { key: 'dopamine', label: 'Dopamine', icon: TrendingUp, color: STR_10B981 }
                { key: 'serotonin', label: 'Sérotonine', icon: Sun, color: '#fbbf24' }
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="text-center">
                  <CircularGauge
                    value={bioData.physiology[key]}
                    label={label}
                    color={color}
                    icon={Icon}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <BiometricChart
                data={bioHistory.stress}
                label="Niveau de Stress"
                color={getBioColor(1 - bioData.emotions.stress, 'stress')}
              />
            </div>
          </motion.div>
        </div>

        {/* 🎯 Recommandations biométriques d'Alex */}
        <motion.div
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Brain className="w-6 h-6 text-purple-400 mr-2" />
              Recommandations Alex
            </h3>
            <div className="text-sm text-purple-400">
              Basé sur votre profil biométrique
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2">État Optimal Détecté</h4>
              <p className=STR_TEXT_SM_TEXT_GRAY_300>
                Votre focus et attention sont excellents. C'est le moment idéal pour les analyses complexes
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Ajustement Stratégie</h4>
              <p className=STR_TEXT_SM_TEXT_GRAY_300>
                Votre tolérance au risque est élevée. Je recommande d'augmenter légèrement la taille des positions
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-medium text-purple-400 mb-2">Prévention Fatigue</h4>
              <p className=STR_TEXT_SM_TEXT_GRAY_300>
                Une pause active dans 45 minutes préviendra la fatigue cognitive et maintiendra votre performance
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BiometricTradingInterface;
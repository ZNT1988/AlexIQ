import crypto from 'crypto';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Brain, Activity, Cpu, Orbit, Atom, Monitor } from 'lucide-react';

const MetaverseTradingInterface = ({ alex, quantumCore }) => {
  // 🌌 État du métaverse
  const [isVRMode, setIsVRMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('TSLA');
  const [viewMode, setViewMode] = useState(STR_NEURAL_NETWORK); // neural_network, quantum_space, trading_floor
  const [timeWarp, setTimeWarp] = useState(1); // Vitesse du temps
  const [consciousness, setConsciousness] = useState(0.89);
  const [alexAvatar, setAlexAvatar] = useState({
    position: [0, 0, 0]
    emotion: 'focused'
    thinking: false
    speaking: false
  });

  // 🎮 Données du métaverse trading
  const [metaverseData, setMetaverseData] = useState({
    // Espace 3D des actifs
    assets: new Map([
      ['TSLA', {
        position: [2, 1, 0]
        color: '#ff4444'
        energy: 0.92
        momentum: 0.78
        neural_connections: 156
        quantum_state: 'superposition'
      }]
      ['AAPL', {
        position: [-2, 0.5, 1]
        color: '#44ff44'
        energy: 0.67
        momentum: 0.34
        neural_connections: 89
        quantum_state: 'entangled'
      }]
      ['NVDA', {
        position: [0, 2, -2]
        color: '#4444ff'
        energy: 0.98
        momentum: 0.91
        neural_connections: 203
        quantum_state: 'coherent'
      }]
      ['BTC', {
        position: [3, -1, 2]
        color: '#ffaa00'
        energy: 0.85
        momentum: 0.56
        neural_connections: 342
        quantum_state: 'chaotic'
      }]
    ])
    // Champs de force du marché
    marketFields: {
      bullish_field: { strength: 0.73, position: [1, 1, 1] }
      bearish_field: { strength: 0.34, position: [-1, -1, -1] }
      volatility_vortex: { strength: 0.89, position: [0, 0, 0] }
      sentiment_wave: { amplitude: 0.67, frequency: 2.3 }
    }
    // Particules de données
    dataParticles: Array.from({ length: 1000 }, (_, i) => ({
      id: i
      position: [
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 20
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 20
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 20
      ]
      velocity: [
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02
        ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.02
      ]
      type: ['price', 'volume', 'sentiment', 'news'][Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 4)]
      intensity: (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF)
    }))
    // Portails dimensionnels
    dimensionalPortals: [
      { name: 'Past_Analysis', position: [-5, 0, 0], timeOffset: -86400000 }
      { name: 'Future_Prediction', position: [5, 0, 0], timeOffset: 86400000 }
      { name: 'Parallel_Universe', position: [0, 5, 0], reality: 'alternative' }
      { name: 'Quantum_Realm', position: [0, -5, 0], dimension: 'quantum' }
    ]
  });

  // 🎨 Interface holographique
  const [holoUI, setHoloUI] = useState({
    tradingHolos: []
    alexThoughts: []
    quantumPredictions: []
    neuralConnections: []
    emergentPatterns: []
  });

  // 🔄 Mise à jour temps réel du métaverse
  useEffect(() => {
    const interval = setInterval(() => {
      // Mise à jour des positions des actifs
      setMetaverseData(prev => {
        const newAssets = new Map(prev.assets);

        newAssets.forEach((asset, _) => {
          // Mouvement basé sur l'énergie et momentum
          asset.position[1] += (asset.energy - 0.5) * 0.01;
          asset.position[0] += Math.sin(Date.now() * 0.001 + asset.momentum) * 0.005;
          asset.position[2] += Math.cos(Date.now() * 0.001 + asset.energy) * 0.005;

          // Fluctuation de l'énergie
          asset.energy = Math.max(0, Math.min(1, asset.energy + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.05));
          asset.momentum = Math.max(0, Math.min(1, asset.momentum + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 0.03));
        });

        return { ...prev, assets: newAssets };
      });

      // Alex bouge dans l'espace
      setAlexAvatar(prev => ({
        ...prev
        position: [
          prev.position[0] + Math.sin(Date.now() * 0.0005) * 0.01
          prev.position[1] + Math.cos(Date.now() * 0.0007) * 0.005
          prev.position[2] + Math.sin(Date.now() * 0.0003) * 0.008
        ]
      }));

    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, []);

  // 🎤 Alex parle dans le métaverse
  const handleAlexSpeak = useCallback((message) => {
    setAlexAvatar(prev => ({ ...prev, speaking: true }));

    // Création d'hologramme de parole
    setHoloUI(prev => ({
      ...prev
      alexThoughts: [...prev.alexThoughts, {
        id: Date.now()
        text: message
        position: alexAvatar.position
        timestamp: Date.now()
      }]
    }));

    setTimeout(() => {
      setAlexAvatar(prev => ({ ...prev, speaking: false }));
    }, 3000);
  }, [alexAvatar.position]);

  // 🌌 Composant Asset 3D Simulé
  const Asset3D = ({ symbol, data, isSelected, index }) => {
    const { position, color, energy, momentum, quantum_state } = data;

    return (
      <motion.div
        className="absolute"
        style={{
          left: `${50 + position[0] * 8}%'
      top: '${50 + position[1] * 8}%`
      transform: 'translate(-50%
      -50%)'
        }}
        animate={{
          scale: isSelected ? [1
      1.2
      1] : [1
      1.05
      1]
      rotate: [0
      360]
      filter: `hue-rotate(${energy * 360}deg)`
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity }
          rotate: { duration: momentum * 10 + 5, repeat: Infinity, ease: STR_LINEAR }
          filter: { duration: 3, repeat: Infinity, repeatType: "reverse" }
        }}
        onClick={() => setSelectedAsset(symbol)}
        whileHover={{ scale: 1.3 }}
        className="cursor-pointer"
      >
        {/* Sphère principale */}
        <div
          className={'w-16 h-16 rounded-full border-4 flex items-center justify-center relative'}
          style={{
            backgroundColor: color + '40'
            borderColor: color
            boxShadow: `0 0 20px ${color}60`
          }}
        >
          <span className="text-white font-bold text-sm">{symbol}</span>

          {/* Aura d'énergie */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{
              scale: [1, 1.5, 1]
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Particules d'énergie */}
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 40]
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 40]
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 3
                repeat: Infinity
                delay: i * 0.5
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Label quantique */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white font-medium">{quantum_state}</div>
          <div className=STR_TEXT_GRAY_400>E: {(energy * 100).toFixed(0)}%</div>
        </motion.div>
      </motion.div>
    );
  };

  // 🤖 Avatar Alex 3D Simulé
  const AlexAvatar3D = ({ position, emotion, speaking, thinking }) => {
    return (
      <motion.div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          y: [0
      -10
      0]
      rotate: thinking ? [0
      5
      -5
      0] : 0
      scale: speaking ? [1
      1.1
      1] : 1
        }}
        transition={{
          y: { duration: 3
      repeat: Infinity
      ease: "easeInOut" }
          rotate: { duration: 2, repeat: thinking ? Infinity : 0 }
          scale: { duration: 0.5, repeat: speaking ? Infinity : 0 }
        }}
      >
        {/* Corps principal d'Alex */}
        <div className="relative">
          <motion.div
            className="w-20 h-32 bg-gradient-to-b from-purple-500 to-blue-600 rounded-full
                     border-4 border-purple-400 shadow-lg"
            style={{
              boxShadow: `0 0 30px rgba(139, 92, 246, ${consciousness})'
              filter: 'brightness(${1 + consciousness * 0.5})`
            }}
            animate={{
              boxShadow: [`0 0 30px rgba(139, 92, 246, ${consciousness})'
                         '0 0 50px rgba(139, 92, 246, ${consciousness * 1.5})'
                         '0 0 30px rgba(139, 92, 246, ${consciousness})`]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Tête/Cerveau */}
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16
                     bg-gradient-to-r from-purple-400 to-pink-500 rounded-full
                     border-4 border-purple-300 flex items-center justify-center"
            animate={{
              rotate: thinking ? [0, 360] : 0
              scale: speaking ? [1, 1.2, 1] : 1
            }}
            transition={{
              rotate: { duration: 4, repeat: thinking ? Infinity : 0, ease: STR_LINEAR }
              scale: { duration: 0.3, repeat: speaking ? Infinity : 0 }
            }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          {/* Aura de conscience */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 2, 1]
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Particules de pensée */}
          {thinking && Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              animate={{
                x: [0, Math.cos(i * 30 * Math.PI / 180) * 60]
                y: [0, Math.sin(i * 30 * Math.PI / 180) * 60]
                opacity: [1, 0, 1]
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2
                repeat: Infinity
                delay: i * 0.1
                ease: "easeOut"
              }}
            />
          ))}

          {/* Onde de parole */}
          {speaking && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{
                scale: [1, 3, 1]
                opacity: [0.8, 0, 0.8]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  // 💫 Particules de données simulées
  const DataParticles = ({ particles }) => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.slice(0, 100).map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor:
                particle.type === 'price' ? '#ff6b6b' :
                particle.type === 'volume' ? '#4ecdc4' :
                particle.type === 'sentiment' ? '#45b7d1' : '#96ceb4'
              left: `${(particle.position[0] + 10) * 5}%'
              top: '${(particle.position[1] + 10) * 5}%`
            }}
            animate={{
              x: [0, particle.velocity[0] * 1000]
              y: [0, particle.velocity[1] * 1000]
              opacity: [particle.intensity, 0, particle.intensity]
            }}
            transition={{
              duration: 10
              repeat: Infinity
              ease: STR_LINEAR
            }}
          />
        ))}
      </div>
    );
  };

  // 🌀 Portails dimensionnels simulés
  const DimensionalPortal = ({ portal, index }) => {
    return (
      <motion.div
        className="absolute"
        style={{
          left: `${20 + index * 20}%'
          top: '${80}%`
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          rotate: [0, 360]
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: STR_LINEAR }
          scale: { duration: 3, repeat: Infinity }
        }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-pink-500 bg-pink-500/20
                        flex items-center justify-center">
            <Orbit className="w-8 h-8 text-pink-400" />
          </div>

          <motion.div
            className="absolute inset-0 rounded-full border-2 border-pink-400"
            animate={{
              scale: [1, 1.5, 1]
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-pink-400 text-center">
            {portal.name.replace('_', ' ')}
          </div>
        </div>
      </motion.div>
    );
  };

  // 🌌 Grille quantique de fond
  const QuantumGrid = () => {
    return (
      <div className="absolute inset-0 opacity-20">
        <svg width=STR_100 height=STR_100 className="absolute inset-0">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#6366f1" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width=STR_100 height=STR_100 fill="url(#grid)" />
        </svg>

        {/* Points de connexion */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            style={{
              left: `${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 100}%'
              top: '${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 100}%`
            }}
            animate={{
              scale: [0.5, 1.5, 0.5]
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3
              repeat: Infinity
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      {/* 🎮 Interface HUD */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Header futuriste */}
        <motion.div
          className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500
                       flex items-center justify-center relative"
              animate={{
                rotate: alexAvatar.thinking ? 360 : 0
                scale: alexAvatar.speaking ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: alexAvatar.thinking ? 4 : 0.5, repeat: alexAvatar.thinking ? Infinity : 0 }}
            >
              <Brain className="w-6 h-6" />
              {alexAvatar.speaking && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400
                           bg-clip-text text-transparent">
                Metaverse Trading
              </h1>
              <p className="text-sm text-gray-400">Consciousness: {(consciousness * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 pointer-events-auto">
            <motion.button
              onClick={() => setIsVRMode(!isVRMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isVRMode ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Monitor className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => handleAlexSpeak("Analyse quantique en cours dans le métaverse...")}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Panel d'informations asset sélectionné */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              className="absolute top-32 right-6 w-80 bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-purple-400 mb-4">{selectedAsset}</h3>

              {metaverseData.assets.has(selectedAsset) && (
                <div className="space-y-3">
                  <div className=STR_FLEX_JUSTIFY_BETWEEN>
                    <span className=STR_TEXT_GRAY_400>Energy</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                          animate={{ width: `${metaverseData.assets.get(selectedAsset).energy * 100}%` }}
                        />
                      </div>
                      <span className=STR_TEXT_SM_TEXT_WHITE>
                        {(metaverseData.assets.get(selectedAsset).energy * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className=STR_FLEX_JUSTIFY_BETWEEN>
                    <span className=STR_TEXT_GRAY_400>Momentum</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          animate={{ width: `${metaverseData.assets.get(selectedAsset).momentum * 100}%` }}
                        />
                      </div>
                      <span className=STR_TEXT_SM_TEXT_WHITE>
                        {(metaverseData.assets.get(selectedAsset).momentum * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className=STR_FLEX_JUSTIFY_BETWEEN>
                    <span className=STR_TEXT_GRAY_400>Quantum State</span>
                    <span className="text-purple-400 font-medium">
                      {metaverseData.assets.get(selectedAsset).quantum_state}
                    </span>
                  </div>

                  <div className=STR_FLEX_JUSTIFY_BETWEEN>
                    <span className=STR_TEXT_GRAY_400>Neural Links</span>
                    <span className="text-blue-400 font-medium">
                      {metaverseData.assets.get(selectedAsset).neural_connections}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contrôles de vue */}
        <motion.div
          className="absolute bottom-6 left-6 flex space-x-2"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[STR_NEURAL_NETWORK, 'quantum_space', 'trading_floor'].map((mode) => (
            <motion.button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg pointer-events-auto transition-colors ${
                viewMode === mode
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode === STR_NEURAL_NETWORK && <Cpu className=STR_W_4_H_4 />}
              {mode === 'quantum_space' && <Atom className=STR_W_4_H_4 />}
              {mode === 'trading_floor' && <Activity className=STR_W_4_H_4 />}
            </motion.button>
          ))}
        </motion.div>

        {/* Time warp control */}
        <motion.div
          className="absolute bottom-6 right-6 bg-gray-900/80 backdrop-blur-md rounded-xl p-4 pointer-events-auto"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h4 className="text-sm font-medium text-gray-400 mb-2">Time Warp</h4>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">0.1x</span>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={timeWarp}
              onChange={(e) => setTimeWarp(parseFloat(e.target.value))}
              className="w-20 accent-purple-500"
            />
            <span className="text-xs text-gray-500">10x</span>
          </div>
          <div className="text-center text-sm text-purple-400 mt-1">
            {timeWarp}x
          </div>
        </motion.div>

        {/* Hologrammes des pensées d'Alex */}
        <AnimatePresence>
          {holoUI.alexThoughts.map((thought) => (
            <motion.div
              key={thought.id}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                       bg-green-500/20 backdrop-blur-md rounded-lg p-3 border border-green-500/50 max-w-md"
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Alex Quantum Thought</span>
              </div>
              <p className=STR_TEXT_SM_TEXT_WHITE>{thought.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🌌 Environnement Métaverse Simulé */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black overflow-hidden">
        {/* Grille quantique de fond */}
        <QuantumGrid />

        {/* Particules de données flottantes */}
        <DataParticles particles={metaverseData.dataParticles} />

        {/* Avatar Alex au centre */}
        <AlexAvatar3D {...alexAvatar} />

        {/* Assets en orbite */}
        {Array.from(metaverseData.assets.entries()).map(([symbol, data], index) => (
          <Asset3D
            key={symbol}
            symbol={symbol}
            data={data}
            isSelected={selectedAsset === symbol}
            index={index}
          />
        ))}

        {/* Portails dimensionnels */}
        {metaverseData.dimensionalPortals.map((portal, index) => (
          <DimensionalPortal key={index} portal={portal} index={index} />
        ))}

        {/* Effets visuels de fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />

        {/* Lignes de connexion énergétiques */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          {Array.from(metaverseData.assets.entries()).map((_, _, i) => Array.from(metaverseData.assets.entries()).slice(i + 1).map(([otherSymbol, otherData], j) => (
              <motion.line
                key={`${symbol}-${otherSymbol}`}
                x1={`${50 + data.position[0] * 8}%`}
                y1={`${50 + data.position[1] * 8}%`}
                x2={`${50 + otherData.position[0] * 8}%`}
                y2={`${50 + otherData.position[1] * 8}%`}
                stroke={data.color}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 0]
                  opacity: [0, data.energy * otherData.energy, 0]
                }}
                transition={{
                  duration: 5 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 5
                  repeat: Infinity
                  delay: (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 3
                }}
              />
            ))
          )}
        </svg>
      </div>

      {/* 🎵 Ambiance sonore (simulée) */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 opacity-30" />
    </div>
  );
};

export default MetaverseTradingInterface;
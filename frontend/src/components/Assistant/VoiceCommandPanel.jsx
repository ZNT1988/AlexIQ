
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Panneau de Commandes Vocales Avancées - HustleFinderIA
// Interface moderne pour commandes vocales avec raccourcis intelligents

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicOff, Settings, Zap, Calendar, Mail, Search, CheckCircle, Clock, MessageSquare, Lightbulb, Target, Headphones } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const VoiceCommandPanel = ({ onCommand, onToggleListening, isListening, isProcessing }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [quickCommands, setQuickCommands] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'fr-FR'
    speed: 1.0
    volume: 0.8
    autoResponse: true
    noiseReduction: true
  });

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Commandes prédéfinies intelligentes
  const smartCommands = [
    {
      category: 'Calendrier'
      icon: Calendar
      color: 'blue'
      commands: [
        { phrase: "Montre-moi mon planning aujourd'hui", action: 'show_today_schedule' }
        { phrase: "Programme une réunion demain à 14h", action: 'schedule_meeting' }
        { phrase: "Trouve un créneau libre cette semaine", action: 'find_free_slot' }
        { phrase: "Annule ma prochaine réunion", action: 'cancel_next_meeting' }
      ]
    }
    {
      category: 'Emails'
      icon: Mail
      color: 'green'
      commands: [
        { phrase: "Lis mes nouveaux emails", action: 'read_new_emails' }
        { phrase: "Rédige un email professionnel", action: 'compose_email' }
        { phrase: "Marque comme prioritaire", action: 'mark_priority' }
        { phrase: "Répondre automatiquement", action: 'auto_reply' }
      ]
    }
    {
      category: 'Recherche'
      icon: Search
      color: 'purple'
      commands: [
        { phrase: "Recherche des infos sur l'IA", action: 'research_ai' }
        { phrase: "Trouve des contacts dans mon réseau", action: 'find_contacts' }
        { phrase: "Analyse le marché tech", action: 'market_analysis' }
        { phrase: "Suggestions de lecture", action: 'reading_suggestions' }
      ]
    }
    {
      category: 'Productivité'
      icon: Zap
      color: 'yellow'
      commands: [
        { phrase: "Optimise ma journée", action: 'optimize_day' }
        { phrase: "Crée une liste de tâches", action: 'create_task_list' }
        { phrase: "Rappel dans 30 minutes", action: 'set_reminder' }
        { phrase: "Focus mode activé", action: 'enable_focus_mode' }
      ]
    }
  ];

  useEffect(() => {
    initializeVoiceRecognition();
    setupAudioVisualization();
    loadCommandHistory();

    return () => {
      cleanupAudio();
    };
  }, []);

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onstart = () => {
        setIsVoiceEnabled(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        if (event.results[0].isFinal) {
          handleVoiceCommand(transcript, confidence);
        }
      };

      recognitionRef.current.onerror = (event) => {
        logger.error('Speech recognition error:', event.error);
        setIsVoiceEnabled(false);
      };

      recognitionRef.current.onend = () => {
        setIsVoiceEnabled(false);
      };
    }
  };

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      if (isListening) {
        updateAudioLevel();
      }
    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}
  };

  const handleVoiceCommand = (transcript, confidence) => {
    const command = {
      transcript
      confidence
      timestamp: new Date()
      executed: false
    };

    setLastCommand(transcript);
    setCommandHistory(prev => [command, ...prev.slice(0, 9)]);

    // Recherche de commande correspondante
    const matchedCommand = findMatchingCommand(transcript);
    if (matchedCommand) {
      command.action = matchedCommand.action;
      command.executed = true;
      onCommand(matchedCommand.action, transcript);
    } else {
      onCommand('chat_message', transcript);
    }

    saveCommandHistory([command, ...commandHistory]);
  };

  const findMatchingCommand = (transcript) => {
    const normalizedTranscript = transcript.toLowerCase();

    for (const category of smartCommands) {
      for (const command of category.commands) {
        const normalizedPhrase = command.phrase.toLowerCase();
        if (normalizedTranscript.includes(normalizedPhrase) ||
            calculateSimilarity(normalizedTranscript, normalizedPhrase) > 0.7) {
          return command;
        }
      }
    }
    return null;
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1
            matrix[i][j - 1] + 1
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?
      .stop();
    } else {
      recognitionRef.current?.start();
    }
    onToggleListening();
  };

  const executeQuickCommand = (command) => {
    onCommand(command.action, command.phrase);
    setLastCommand(command.phrase);
  };

  const cleanupAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const loadCommandHistory = () => {
    const saved = localStorage.getItem('voice_command_history');
    if (saved) {
      setCommandHistory(JSON.parse(saved));
    }
  };

  const saveCommandHistory = (history) => {
    localStorage.setItem('voice_command_history', JSON.stringify(history));
  };

  return (
    <div className="space-y-6">

      {/* Contrôle vocal principal */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={toggleVoiceRecognition}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 hover :
      bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isProcessing}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>

              {/* Indicateur niveau audio */}
              {isListening && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-4 bg-white rounded-full transition-all duration-100 ${
                          audioLevel * 5 > i ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{
                          height: `${Math.max(8, audioLevel * 20)}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {isListening ? 'Écoute en cours...' : 'Assistant Vocal'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isProcessing ? 'Traitement...' : 'Cliquez pour parler'}
              </p>
            </div>
          </div>

          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Paramètres vocaux"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Dernière commande */}
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 rounded-lg p-3 mb-4"
          >
            <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Dernière commande :</span>
            </div>
            <p className="text-white mt-1 font-medium">"{lastCommand}"</p>
          </motion.div>
        )}

        {/* Statut vocal */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
              <div className={`w-2 h-2 rounded-full ${isVoiceEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className=STR_TEXT_GRAY_400>
                {isVoiceEnabled ? 'Reconnaissance active' : 'Reconnaissance désactivée'}
              </span>
            </div>

            <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
              <Headphones className="w-4 h-4 text-gray-400" />
              <span className=STR_TEXT_GRAY_400>Langue: {voiceSettings.language}</span>
            </div>
          </div>

          <div className=STR_TEXT_GRAY_400>
            {commandHistory.length} commandes exécutées
          </div>
        </div>
      </div>

      {/* Commandes rapides par catégorie */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Commandes rapides
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartCommands.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${category.color}-600`} />
                  </div>
                  <h5 className="font-semibold text-gray-900">{category.category}</h5>
                </div>

                <div className="space-y-2">
                  {category.commands.slice(0, 3).map((command, index) => (
                    <button
                      key={index}
                      onClick={() => executeQuickCommand(command)}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      💬 "{command.phrase}"
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique des commandes */}
      {commandHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Historique récent
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {commandHistory.slice(0, 10).map((command, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${command.executed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-sm text-gray-700">"{command.transcript}"</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {command.confidence && (
                    <span>{Math.round(command.confidence * 100)}%</span>
                  )}
                  <span>{command.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit'
                    minute: '2-digit'
                  })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils d'utilisation */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
          Conseils pour de meilleures commandes vocales
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Parlez clairement et à un rythme normal</span>
            </div>
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Utilisez des phrases complètes et précises</span>
            </div>
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Évitez les bruits de fond</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <Target className=STR_W_4_H_4_TEXT_BLUE_500_MT_0_5_F />
              <span>Commencez par "Programme", "Trouve", "Montre"</span>
            </div>
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <Target className=STR_W_4_H_4_TEXT_BLUE_500_MT_0_5_F />
              <span>Soyez spécifique avec les dates et heures</span>
            </div>
            <div className=STR_FLEX_ITEMS_START_SPACE_X_2>
              <Target className=STR_W_4_H_4_TEXT_BLUE_500_MT_0_5_F />
              <span>Utilisez les raccourcis prédéfinis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandPanel;
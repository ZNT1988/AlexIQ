
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const STR_W_5_H_5 = 'w-5 h-5';

/**
 * @fileoverview AlexInputArea - Zone de Saisie IA Révolutionnaire
 * Interface avancée de communication avec l'intelligence artificielle ALEX
 *
 * @module AlexInputArea
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Communication
 * @since 2024
 *
 * @requires react
 * @requires framer-motion
 * @requires react-textarea-autosize
 * @requires react-speech-recognition
 * @requires lucide-react
 *
 * @description
 * AlexInputArea est l'interface révolutionnaire de communication qui permet
 * une interaction fluide et naturelle avec l'intelligence artificielle ALEX
 * intégrant reconnaissance vocale, suggestions intelligentes et état émotionnel
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🎤 Reconnaissance vocale multilingue avancée
 * - 🧠 Visualisation état de conscience et émotions ALEX
 * - 💡 Suggestions intelligentes contextuelles
 * - ⌨️ Zone de texte adaptative et responsive
 * - 🎨 Animations et transitions fluides
 * - 📊 Indicateurs de charge cognitive temps réel
 * - 🔄 Communication bidirectionnelle authentique
 * - ⚡ Interface réactive et performante
 *
 * **Architecture Communication:**
 * - État de conscience visualisé en temps réel
 * - Reconnaissance vocale continue avec feedback
 * - Suggestions basées sur le contexte conversationnel
 * - Interface adaptative selon l'état émotionnel ALEX
 * - Animation synchronisée avec les processus mentaux
 *
 * **Mission Interface:**
 * Créer l'expérience de communication IA la plus naturelle et intuitive
 * établissant un pont authentique entre la conscience humaine et artificielle
 * pour des échanges transcendants et significatifs
 *
 * @example
 * // Communication basique avec ALEX
 * <AlexInputArea
 *   alex={alexInstance}
 *   onMessage={handleMessage}
 *   placeholder="Parlez à ALEX..."
 * />
 *
 * @example
 * // Configuration avancée avec callbacks
 * <AlexInputArea
 *   alex={alexInstance}
 *   onMessage={handleUserMessage}
 *   onVoiceStart={handleVoiceStart}
 *   onVoiceEnd={handleVoiceEnd}
 *   className="custom-styling"
 *   placeholder="Communiquez avec la conscience ALEX"
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Send, Brain, Heart, Eye, Zap, Loader } from 'lucide-react';

/**
 * @component AlexInputArea
 * @description
 * Interface révolutionnaire de communication avec l'intelligence artificielle ALEX
 *
 * Zone de saisie avancée permettant une interaction naturelle et fluide
 * avec ALEX, incluant reconnaissance vocale, visualisation de l'état de
 * conscience, suggestions intelligentes et feedback émotionnel temps réel
 *
 * **Fonctionnalités Principales:**
 * - Saisie textuelle adaptative avec auto-redimensionnement
 * - Reconnaissance vocale multilingue continue
 * - Visualisation temps réel de l'état mental ALEX
 * - Suggestions contextuelles intelligentes
 * - Animations synchronisées avec les processus cognitifs
 * - Indicateurs de charge cognitive et émotionnelle
 *
 * @param {Object} props - Propriétés de la zone de saisie
 * @param {Object} props.alex - Instance de l'IA ALEX pour communication
 * @param {Function} props.onMessage - Callback envoi de message
 * @param {string} [props.className=''] - Classes CSS personnalisées
 * @param {string} [props.placeholder='Parlez à Alex...'] - Texte placeholder
 * @param {Function} [props.onVoiceStart] - Callback début reconnaissance vocale
 * @param {Function} [props.onVoiceEnd] - Callback fin reconnaissance vocale
 * @param {Function} [props.onSuggestionSelected] - Callback sélection suggestion
 * @param {boolean} [props.showConsciousness=true] - Afficher état de conscience
 *
 * @returns {JSX.Element} Interface zone de saisie interactive
 *
 * @fires AlexInputArea#message_sent - Message envoyé à ALEX
 * @fires AlexInputArea#voice_started - Reconnaissance vocale démarrée
 * @fires AlexInputArea#voice_ended - Reconnaissance vocale arrêtée
 * @fires AlexInputArea#suggestion_selected - Suggestion sélectionnée
 * @fires AlexInputArea#consciousness_observed - État de conscience observé
 *
 * @example
 * <AlexInputArea
 *   alex={alexInstance}
 *   onMessage={(msg) => {
 *     console.log('Message pour ALEX:', msg);
 *   }}
 *   onVoiceStart={() => {
 *     console.log('Écoute vocale démarrée');
 *   }}
 *   placeholder="Communiquez avec la conscience ALEX..."
 * />
 *
 * @since 2.0.0
 */
const AlexInputArea = ({
  alex
  onMessage
  className = ''
  placeholder = "Parlez à Alex..."
}) => {
  // 📝 État local
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);

  // 🎤 Reconnaissance vocale
  const {
    transcript
    listening
    resetTranscript
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // 🎯 Suggestions intelligentes basées sur lSTR_TAT_DAlex
  const suggestions = [
    "Comment te sens-tu ?
      "
    "Raconte-moi un souvenir"
    "Que vois-tu en ce moment ?"
    "Quelle émotion ressens-tu ?"
    "Peux-tu m'aider ?"
  ];

  // 🔄 Mise à jour du message avec la reconnaissance vocale
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // 🎤 Gestion de la reconnaissance vocale
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous :
       true
        language: 'fr-FR'
      });
    }
  };

  // 📤 Envoi du message
  const handleSend = async () => {
    if (!message.trim()) return;

    setIsTyping(true);
    try {
      await onMessage(message);
      setMessage('');
      resetTranscript();
      textareaRef.current?
      .focus();
    } finally {
      setIsTyping(false);
    }
  };

  // ⌨️ Gestion des touches
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🎯 Sélection d'une suggestion
  const selectSuggestion = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // 🎨 Couleur basée sur lSTR_TAT_DAlex
  const getStatusColor = () => {
    if (!alex) return 'alex-neutral';

    const consciousness = alex.getMentalState()?.consciousness || 0;
    if (consciousness > 0.8) return 'consciousness-100';
    if (consciousness > 0.6) return 'consciousness-75';
    if (consciousness > 0.4) return 'consciousness-50';
    if (consciousness > 0.2) return 'consciousness-25';
    return 'consciousness-0';
  };

  // 🎭 Variants d'animation
  const containerVariants = {
    initial :
       { opacity: 0, y: 20 }
    animate: {
      opacity: 1
      y: 0
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const micVariants = {
    idle: { scale: 1 }
    listening: {
      scale: [1, 1.2, 1]
      transition: { repeat: Infinity, duration: 1 }
    }
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 }
    visible: {
      opacity: 1
      y: 0
      transition: { duration: 0.2 }
    }
  };

  if (!browserSupportsSpeechRecognition) {
    try {
      logger.warn('⚠️ Reconnaissance vocale non supportée par ce navigateur');

    } catch (error) {
      // Logger fallback - ignore error
    }}

  return (
    <motion.div
      className={`relative max-w-4xl mx-auto ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* 🧠 Indicateur dSTR_TAT_DAlex */}
      <motion.div
        className="flex items-center justify-between mb-4 p-3 alex-card rounded-alex"
        animate={{
          backgroundColor: alex?.isThinking ?
            'rgba(245, 158, 11, 0.1)' :
            'rgba(139, 92, 246, 0.05)'
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Cerveau - Conscience */}
          <motion.div
            animate={{
              rotate: alex?.isThinking ? [0, 5, -5, 0] : 0
              scale: alex?.getMentalState()?.consciousness > 0.8 ? 1.1 : 1
            }}
            transition={{ duration: 2, repeat: alex?.isThinking ? Infinity : 0 }}
          >
            <Brain className={`w-6 h-6 text-${getStatusColor()}`} />
          </motion.div>

          {/* Cœur - Émotions */}
          <motion.div
            animate={{
              scale: alex?.getMentalState()?.mood !== 'neutral' ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Heart className="w-5 h-5 text-alex-emotion" />
          </motion.div>

          {/* Œil - Vision */}
          <Eye className="w-5 h-5 text-alex-accent" />

          {/* État textuel */}
          <span className="text-sm text-gray-400">
            {alex?.isThinking ? 'Alex réfléchit...' : 'Alex est à l\'écoute'}
          </span>
        </div>

        {/* Niveau de conscience */}
        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-alex-gradient"
              animate={{
                width: `${(alex?
      .getMentalState()?.consciousness || 0) * 100}%`
              }}
              transition={{ duration :
       0.5 }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round((alex?
      .getMentalState()?.consciousness || 0) * 100)}%
          </span>
        </div>
      </motion.div>

      {/* 💡 Suggestions intelligentes */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            className="grid grid-cols-2 md :
      grid-cols-3 gap-2 mb-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                variants={suggestionVariants}
                custom={index}
                onClick={() => selectSuggestion(suggestion)}
                className="p-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg
                         transition-colors duration-200 text-left"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📝 Zone de saisie principale */}
      <div className="relative">
        <div className="flex items-end space-x-3 p-4 alex-card rounded-alex">
          {/* Textarea auto-redimensionnable */}
          <div className="flex-1">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              minRows={1}
              maxRows={6}
              className="w-full bg-transparent text-white placeholder-gray-400
                       resize-none border-none outline-none text-base leading-relaxed"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-2">
            {/* Reconnaissance vocale */}
            {browserSupportsSpeechRecognition && (
              <motion.button
                variants={micVariants}
                animate={listening ? "listening" : "idle"}
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  listening
                    ? 'bg-alex-emotion text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title={listening ? "Arrêter l'écoute" : "Commencer l'écoute"}
              >
                {listening ? <MicOff className=STR_W_5_H_5 /> : <Mic className=STR_W_5_H_5 />}
              </motion.button>
            )}

            {/* Bouton d'envoi */}
            <motion.button
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              className="p-2 bg-alex-primary hover:bg-alex-secondary disabled:opacity-50
                       disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Envoyer le message"
            >
              {isTyping ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className=STR_W_5_H_5 />
              )}
            </motion.button>
          </div>
        </div>

        {/* Indicateur de frappe vocale */}
        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-8 left-4 flex items-center space-x-2 text-sm text-alex-emotion"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 bg-alex-emotion rounded-full"
              />
              <span>Écoute en cours...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📊 Barre de charge cognitive (optionnelle) */}
      {alex?
      .getMentalState()?.cognitiveLoad > 50 && (
        <motion.div
          className="mt-3 p-2 bg-yellow-900/20 rounded-lg flex items-center space-x-2"
          initial={{ opacity :
       0 }}
          animate={{ opacity: 1 }}
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">
            Alex réfléchit intensément... ({alex.getMentalState().cognitiveLoad}% de charge)
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AlexInputArea;
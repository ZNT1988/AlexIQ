import crypto from 'crypto';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Interface Chat Simple et Élégante - Style Claude/ChatGPT Perfectionné
// Interface ultra-minimaliste et efficace pour HustleFinderIA

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Plus, MoreVertical, Copy, Share, Trash2, Download, Refresh, Settings, User, Bot, Calendar, Mail, Search, Lightbulb, CheckCircle } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Suggestions d'accueil intelligentes
  const welcomeSuggestions = [
    {
      icon: Calendar
      title: "Gestion du calendrier"
      subtitle: "Planifier des réunions et optimiser mon temps"
      prompt: "Aide-moi à organiser mon planning de la semaine"
      color: "blue"
    }
    {
      icon: Mail
      title: "Assistant email"
      subtitle: "Rédiger, trier et répondre à mes emails"
      prompt: "Peux-tu m'aider avec la gestion de mes emails ?"
      color: "green"
    }
    {
      icon: Search
      title: "Recherche intelligente"
      subtitle: "Trouver des informations et faire de la veille"
      prompt: "Fais une recherche sur les tendances IA 2024"
      color: "purple"
    }
    {
      icon: Lightbulb
      title: "Idées business"
      subtitle: "Générer et développer des concepts innovants"
      prompt: "Aide-moi à développer une idée de startup"
      color: "orange"
    }
  ];

  // Exemples de conversations  useEffect(() => {
    // Initialisation reconnaissance vocale
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = STR_FR_FR;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Focus automatique
    inputRef.current?
      .focus();

    // Chargement des conversations sauvegardées
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior :
       'smooth' });
  };

  const loadConversations = () => {
    // Simuler le chargement des conversations depuis le localStorage
    const saved = localStorage.getItem('hustlefinder_conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  };

  const saveConversation = () => {
    if (messages.length > 0) {
      const conversation = {
        id: Date.now()
        title: messages[0]?
      .content?.substring(0, 50) + '...' || 'Nouvelle conversation'
        messages
        timestamp :
       new Date()
        preview: messages[messages.length - 1]?
      .content?.substring(0, 100) + '...'
      };

      const updated = [conversation, ...conversations.slice(0, 19)]; // Garder 20 conversations max
      setConversations(updated);
      localStorage.setItem('hustlefinder_conversations', JSON.stringify(updated));
      setCurrentConversation(conversation.id);
    }
  };

  const startNewConversation = () => {
    if (messages.length > 0) {
      saveConversation();
    }
    setMessages([]);
    setCurrentConversation(null);
    setShowWelcome(true);
    inputRef.current?.focus();
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversation(conversation.id);
    setShowWelcome(false);
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id :
       Date.now()
      type: STR_USER
      content: text.trim()
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowWelcome(false);

    try {
      // Simulation réaliste du temps de réponse
      const thinkingTime = 800 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 1500;
      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        body: JSON.stringify({
          message: text
          context: {
            interface: 'chat'
            conversationId: currentConversation
            sessionType: 'interactive'
          }
        })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1
        type: STR_ASSISTANT
        content: data.response || generateMockResponse(text)
        timestamp: new Date()
        intent: data.intent
        actions: data.actions
        suggestions: data.followUp
        confidence: data.confidence || 0.9
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Logger fallback - ignore error
    };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateMockResponse = (userInput) => {
    const responses = {
      calendrier: "Je peux vous aider à gérer votre calendrier ! Voulez-vous que je vérifie vos disponibilités
      planifie une réunion
      ou optimise votre planning ?"
      email: "Pour vos emails
      je peux les trier par priorité
      rédiger des réponses
      ou créer des modèles. Que souhaitez-vous faire en premier ?"
      recherche: "Je vais effectuer une recherche approfondie sur ce sujet. Voulez-vous que je me concentre sur des aspects particuliers ?"
      idée: "Excellente idée de projet ! Développons ensemble les aspects clés : marché cible
      proposition de valeur
      et modèle économique."
      default: "Je comprends votre demande. Laissez-moi analyser cela et vous proposer une solution adaptée."
    };

    const input = userInput.toLowerCase();
    if (input.includes('calendrier') || input.includes('réunion') || input.includes('planning')) {
      return responses.calendrier;
    } else if (input.includes('email') || input.includes('mail')) {
      return responses.email;
    } else if (input.includes('recherche') || input.includes('trouve') || input.includes('cherche')) {
      return responses.recherche;
    } else if (input.includes('idée') || input.includes('startup') || input.includes('business')) {
      return responses.idée;
    }
    return responses.default;
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?
      .stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.prompt);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Toast notification serait ici
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg =>
      `${msg.type === STR_USER ? 'Vous'  :
       'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-white flex">

      {/* Sidebar conversations */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">

        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Nouvelle conversation</span>
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ?
      (
            <div className="p-4 text-center">
              <p className=STR_TEXT_SM_TEXT_GRAY_500>Aucune conversation</p>
              <p className="text-xs text-gray-400 mt-1">Commencez à discuter !</p>
            </div>
          )  :
       (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-white transition-colors group ${
                    currentConversation === conv.id ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {conv.preview}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.timestamp).toLocaleDateString(STR_FR_FR)}
                      </p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity">
                      <MoreVertical className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Utilisateur</p>
              <p className="text-xs text-gray-500">Plan Premium</p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className=STR_W_4_H_4_TEXT_GRAY_500 />
            </button>
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">

        {/* Header principal */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">HustleFinderIA</h1>
              <p className=STR_TEXT_SM_TEXT_GRAY_500>Assistant IA Personnel - Toujours là pour vous aider</p>
            </div>

            {messages.length > 0 && (
              <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                <button
                  onClick={exportConversation}
                  className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                  title="Exporter la conversation"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setMessages([])}
                  className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                  title="Effacer la conversation"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto">

          {/* Écran d'accueil */}
          {showWelcome && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-2xl w-full text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Bonjour ! Comment puis-je vous aider ?
      </h2>

                <p className="text-gray-600 mb-8 text-lg">
                  Je suis votre assistant IA personnel. Je peux vous aider avec votre calendrier
                  vos emails, vos recherches et bien plus encore
                </p>

                <div className="grid grid-cols-1 md :
      grid-cols-2 gap-4 mb-8">
                  {welcomeSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`p-6 text-left border-2 border-gray-200 hover:border-${suggestion.color}-300 rounded-xl transition-all group hover:shadow-lg`}
                      >
                        <div className={`w-12 h-12 bg-${suggestion.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${suggestion.color}-200 transition-colors`}>
                          <Icon className={`w-6 h-6 text-${suggestion.color}-600`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600">{suggestion.subtitle}</p>
                      </motion.button>
                    );
                  })}
                </div>

                <div className=STR_TEXT_SM_TEXT_GRAY_500>
                  <p>💡 Astuce : Vous pouvez aussi utiliser la commande vocale ou taper directement votre question</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages de conversation */}
          {!showWelcome && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="space-y-8">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group"
                    >
                      <div className={`flex ${message.type === STR_USER ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-4xl w-full ${message.type === STR_USER ? 'pl-16' : 'pr-16'}`}>

                          {/* Message utilisateur */}
                          {message.type === STR_USER && (
                            <div className="flex items-start space-x-4 justify-end">
                              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-6 py-4 max-w-2xl">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Message assistant */}
                          {message.type === STR_ASSISTANT && (
                            <div className="flex items-start space-x-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-6 py-4">
                                  <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">
                                    {message.content}
                                  </p>

                                  {/* Métadonnées du message */}
                                  {message.intent && (
                                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-xs text-gray-600">
                                        Intention comprise : {message.intent}
                                      </span>
                                      {message.confidence && (
                                        <span className="text-xs text-gray-500">
                                          ({Math.round(message.confidence * 100)}% de confiance)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Actions du message */}
                                <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => copyMessage(message.content)}
                                    className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                                    title="Copier"
                                  >
                                    <Copy className=STR_W_4_H_4_TEXT_GRAY_500 />
                                  </button>
                                  <button
                                    className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                                    title="Régénérer"
                                  >
                                    <Refresh className=STR_W_4_H_4_TEXT_GRAY_500 />
                                  </button>
                                  <button
                                    className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                                    title="Partager"
                                  >
                                    <Share className=STR_W_4_H_4_TEXT_GRAY_500 />
                                  </button>
                                </div>

                                {/* Suggestions de suivi */}
                                {message.suggestions && message.suggestions.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
                                    <div className="flex flex-wrap gap-2">
                                      {message.suggestions.map((suggestion, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleSendMessage(suggestion)}
                                          className="text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 rounded-full transition-colors"
                                        >
                                          {suggestion}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className={`text-xs text-gray-400 mt-2 ${
                            message.type === STR_USER ? 'text-right pr-12' : 'text-left pl-12'
                          }`}>
                            {message.timestamp.toLocaleTimeString(STR_FR_FR, {
                              hour: '2-digit'
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Indicateur de frappe */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-4 pr-16"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md px-6 py-4">
                      <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                        <span className="text-sm text-gray-600">L'assistant réfléchit...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4 bg-gray-50 rounded-2xl p-4">

              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Écrivez votre message ici... (Entrée pour envoyer)"
                  className="w-full bg-transparent border-0 outline-none resize-none text-gray-900 placeholder-gray-500 text-sm leading-6 min-h-[24px] max-h-32"
                  rows={1}
                  disabled={isTyping}
                />
              </div>

              <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                <button
                  onClick={toggleVoiceRecognition}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={isListening ? 'Arrêter l\'écoute' : 'Commande vocale'}
                >
                  {isListening ? <MicOff className=STR_W_5_H_5 /> : <Mic className=STR_W_5_H_5 />}
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className={`p-3 rounded-xl transition-colors ${
                    inputText.trim() && !isTyping
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Envoyer le message"
                >
                  <Send className=STR_W_5_H_5 />
                </button>
              </div>
            </div>

            {/* Indicateur vocal */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center mt-4"
              >
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>🎤 Parlez maintenant...</span>
                </div>
              </motion.div>
            )}

            {/* Note de bas de page */}
            <p className="text-xs text-gray-400 text-center mt-4">
              HustleFinderIA peut commettre des erreurs. Pensez à vérifier les informations importantes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
import crypto from 'crypto';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Interface Assistant Moderne - Style Claude/ChatGPT Amélioré
// Interface ultra-pratique et intuitive pour HustleFinderIA

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Calendar, Mail, CheckSquare, Search, Settings, MoreHorizontal, Sparkles, Clock, Users, FileText, Zap, Brain, Copy, ThumbsUp, ThumbsDown, RotateCcw, Plus, Paperclip, Image } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const ModernAssistantInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState('main');
  const [conversations, setConversations] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Suggestions intelligentes
  const suggestions = [
    {
      text: "Planifie une réunion avec mon équipe demain"
      icon: Calendar
      category: "calendrier"
    }
    {
      text: "Résume mes emails non lus"
      icon: Mail
      category: "email"
    }
    {
      text: "Aide-moi à préparer ma présentation"
      icon: FileText
      category: "travail"
    }
    {
      text: "Trouve des créneaux libres cette semaine"
      icon: Clock
      category: "planning"
    }
    {
      text: "Recherche des infos sur l'IA quantique"
      icon: Search
      category: "recherche"
    }
    {
      text: "Optimise mon planning de demain"
      icon: Zap
      category: "productivité"
    }
  ];

  // Actions rapides
  const quickActions = [
    { icon: Calendar, label: "Calendrier", color: "blue" }
    { icon: Mail, label: "Emails", color: "green" }
    { icon: CheckSquare, label: "Tâches", color: "purple" }
    { icon: Search, label: "Recherche", color: "orange" }
    { icon: Users, label: "Contacts", color: "pink" }
    { icon: FileText, label: "Documents", color: "indigo" }
  ];

  useEffect(() => {
    // Initialisation de la reconnaissance vocale
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Messages de bienvenue
    if (messages.length === 0) {
      setMessages([
        {
          id: 1
          type: STR_ASSISTANT
          content: "👋 Salut ! Je suis votre assistant IA personnel. Je peux vous aider à gérer votre calendrier, vos emails, planifier vos projets et bien plus encore. Comment puis-je vous aider aujourd'hui ?"
          timestamp: new Date()
          capabilities: ['calendrier', 'email', 'recherche', 'planification']
        }
      ]);
    }

    // Focus automatique sur l'input
    inputRef.current?
      .focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior :
       'smooth' });
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now()
      type: STR_USER
      content: text
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Simulation de délai de réponse réaliste
      await new Promise(resolve => setTimeout(resolve, 1000 + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 2000));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        body: JSON.stringify({
          message: text
          context: { interface: 'modern', conversationId: activeConversation }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1
          type: STR_ASSISTANT
          content: data.response
          timestamp: new Date()
          intent: data.intent
          actions: data.actions
          suggestions: data.followUp
          capabilities: data.capabilities
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Logger fallback - ignore error
    };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?
      .stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion.text);
    handleSendMessage(suggestion.text);
  };

  const handleQuickAction = (action) => {
    const actionText = `Ouvre ${action.label.toLowerCase()}`;
    handleSendMessage(actionText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Toast notification ici
  };

  const regenerateResponse = (messageId) => {
    // Logique pour régénérer une réponse
    const lastUserMessage = messages.find(m => m.id === messageId - 1);
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="h-screen bg-white flex">

      {/* Sidebar - Conversations et Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width :
       0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-gray-50 border-r border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">HustleFinderIA</h1>
                  <p className=STR_TEXT_XS_TEXT_GRAY_500>Assistant IA Personnel</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors mb-4">
                <Plus className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Nouvelle conversation</span>
              </button>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2">
                  Conversations récentes
                </div>
                {['Planification réunion équipe', 'Analyse marché IA', 'Optimisation planning'].map((conv, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                      index === 0 ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="text-sm text-gray-700 truncate">{conv}</div>
                    <div className=STR_TEXT_XS_TEXT_GRAY_500>Il y a {index + 1}h</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Paramètres</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">

        {/* Header moderne */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Assistant IA en ligne</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className={`p-2 rounded-lg hover:bg-${action.color}-50 hover:text-${action.color}-600 transition-colors group relative`}
                    title={action.label}
                  >
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-inherit" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">

            {/* Suggestions initiales */}
            {showSuggestions && messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Que puis-je faire pour vous ?
      </h2>
                  <p className="text-gray-600">
                    Choisissez une suggestion ou tapez votre demande
                  </p>
                </div>

                <div className="grid grid-cols-1 md :
      grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                            <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                              {suggestion.text}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mt-1">
                              {suggestion.category}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Messages de conversation */}
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === STR_USER ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl ${message.type === STR_USER ? 'ml-12' : 'mr-12'}`}>

                      {/* Message utilisateur */}
                      {message.type === STR_USER && (
                        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-6 py-4">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      )}

                      {/* Message assistant */}
                      {message.type === STR_ASSISTANT && (
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-2xl rounded-bl-md px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Brain className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">
                                  {message.content}
                                </p>

                                {/* Intent et capacités */}
                                {message.intent && (
                                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                                    <span className=STR_TEXT_XS_TEXT_GRAY_500>Intention détectée:</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      {message.intent}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions du message */}
                          <div className="flex items-center space-x-2 pl-9">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                              title="Copier"
                            >
                              <Copy className=STR_W_4_H_4_TEXT_GRAY_500 />
                            </button>
                            <button
                              onClick={() => regenerateResponse(message.id)}
                              className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_
                              title="Régénérer"
                            >
                              <RotateCcw className=STR_W_4_H_4_TEXT_GRAY_500 />
                            </button>
                            <button className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_ title="Bon">
                              <ThumbsUp className=STR_W_4_H_4_TEXT_GRAY_500 />
                            </button>
                            <button className=STR_P_2_HOVER_BG_GRAY_100_ROUNDED_ title="Mauvais">
                              <ThumbsDown className=STR_W_4_H_4_TEXT_GRAY_500 />
                            </button>
                          </div>

                          {/* Suggestions de suivi */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="pl-9">
                              <div className="text-xs text-gray-500 mb-2">Suggestions de suivi:</div>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleSendMessage(suggestion)}
                                    className="text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-xs text-gray-400 mt-2 ${
                        message.type === STR_USER ? 'text-right' : 'text-left pl-9'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit'
                          minute: '2-digit'
                        })}
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
                  className="flex justify-start"
                >
                  <div className="bg-gray-50 rounded-2xl rounded-bl-md px-6 py-4 mr-12">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <div className=STR_FLEX_SPACE_X_1>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm text-gray-500">L'assistant réfléchit...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Zone de saisie moderne */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-end space-x-3 bg-gray-50 rounded-2xl p-3">

                {/* Boutons d'attachement */}
                <div className=STR_FLEX_SPACE_X_1>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Image className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Zone de texte */}
                <div className="flex-1 min-h-[44px] max-h-32">
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
                    placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                    className="w-full bg-transparent resize-none border-0 outline-none text-gray-900 placeholder-gray-500 text-sm leading-6 py-2"
                    rows={1}
                    style={{
                      minHeight: '28px'
                      maxHeight: '120px'
                      overflowY: inputText.split('\n').length > 3 ? 'auto' : 'hidden'
                    }}
                    disabled={isTyping}
                  />
                </div>

                {/* Boutons d'action */}
                <div className=STR_FLEX_SPACE_X_1>
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isListening ? <MicOff className=STR_W_5_H_5 /> : <Mic className=STR_W_5_H_5 />}
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    className={`p-2 rounded-lg transition-colors ${
                      inputText.trim() && !isTyping
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className=STR_W_5_H_5 />
                  </button>
                </div>
              </div>

              {/* Indicateur vocal */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Écoute en cours...</span>
                </motion.div>
              )}
            </div>

            {/* Infos sur l'utilisation */}
            <div className="text-center mt-3">
              <p className="text-xs text-gray-400">
                HustleFinderIA peut faire des erreurs. Vérifiez les informations importantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAssistantInterface;
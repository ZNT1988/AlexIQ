
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Enhanced Chat Interface with Modern Features
// Can be easily swapped with ModernAssistantInterface for full features

import React, { useState, useEffect, useRef } from 'react';
import { useAIAssistant } from '../../context/AIAssistantContext';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const STR_ASSISTANT = 'assistant';
const EnhancedChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { toggleAssistant } = useAIAssistant();

  // Quick suggestions for getting started
  const suggestions = [
    "Aide-moi à planifier ma journée"
    "Donne-moi des idées de business"
    "Comment optimiser ma productivité ?
      "
    "Recherche des infos sur l'IA"
    "Aide-moi avec mes emails"
    "Conseils pour une présentation"
  ];

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) { setMessages([{
        id :
       1
        type: STR_ASSISTANT
        content: '👋 Bonjour ! Je suis Alex, votre assistant IA personnel.\n\nJe peux vous aider avec:\n🗓️ Planification et organisation\n💡 Idées créatives et business\n📧 Gestion d\'emails\n🔍 Recherche d\'informations\n📊 Analyses et conseils\n\nComment puis-je vous aider aujourd\'hui ?'
        timestamp: new Date()
      ; return; }]);
    }

    // Focus input
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
      content: text.trim()
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = text.trim();
    setInputText('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:8081/api/ai/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
        }
        body: JSON.stringify({
          message: currentInput
          type: 'chat'
          context: {
            interface: 'enhanced_chat'
            timestamp: new Date().toISOString()
            sessionId: 'session_' + Date.now()
          }
        })
      });

      let assistantResponse;

      if (response.ok) {
        const data = await response.json();
        assistantResponse = data.response || generateSmartResponse(currentInput);
      } else {
        assistantResponse = generateSmartResponse(currentInput);
      }

      const assistantMessage = {
        id: Date.now() + 1
        type: STR_ASSISTANT
        content: assistantResponse
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Logger fallback - ignore error
    };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSmartResponse = (input) => {
    const lowerInput = input.toLowerCase();

    // Smart response based on keywords
    if (lowerInput.includes('planifi') || lowerInput.includes('journée') || lowerInput.includes('horaire')) {
      return 'Excellente idée de planifier votre journée ! Voici comment je peux vous aider:\n\n✅ **Priorités du jour**: Identifions vos 3 tâches les plus importantes\n⏰ **Créneaux**: Optimisons votre emploi du temps\n🎯 **Objectifs**: Définissons des objectifs clairs et réalisables\n📊 **Suivi**: Mettons en place un système de suivi\n\nQuelle est votre priorité principale aujourd'hui ?
      ';
    }

    if (lowerInput.includes('business') || lowerInput.includes('idée') || lowerInput.includes('startup')) {
      return 'Fantastique ! Développons vos idées business ensemble :
      \n\n💡 **Brainstorming**: Explorons vos concepts et passions\n🎯 **Marché cible**: Identifions votre audience\n💰 **Modèle économique**: Définissons comment monétiser\n🚀 **Plan d'action**: Créons une roadmap concrète\n📈 **Validation**: Testons vos hypothèses\n\nQuelle idée business vous passionne le plus ?
      ';
    }

    if (lowerInput.includes('productivité') || lowerInput.includes('efficacité') || lowerInput.includes('optimis')) {
      return 'Super ! Optimisons votre productivité avec des méthodes éprouvées :
      \n\n⚡ **Techniques**: Pomodoro, GTD, Time-blocking\n🧠 **Focus**: Élimination des distractions\n🛠️ **Outils**: Applications et systèmes efficaces\n⚖️ **Équilibre**: Work-life balance optimal\n📊 **Mesure**: KPIs personnels\n\nQuel aspect de votre productivité souhaitez-vous améliorer en premier ?
      ';
    }

    if (lowerInput.includes('email') || lowerInput.includes('mail') || lowerInput.includes('message')) {
      return 'Gérons vos emails efficacement ! Voici ma stratégie :
      \n\n📥 **Tri intelligent**: Filtrage et organisation automatique\n⚡ **Réponses rapides**: Templates et raccourcis\n🎯 **Priorités**: System de classification urgent/important\n⏰ **Planification**: Créneaux dédiés aux emails\n📊 **Analytics**: Suivi du temps et efficacité\n\nCombien d'emails recevez-vous par jour en moyenne ?
      ';
    }

    if (lowerInput.includes('recherche') || lowerInput.includes('info') || lowerInput.includes('trouve')) {
      return 'Parfait ! Je vais vous aider à rechercher des informations pertinentes :
      \n\n🔍 **Sources fiables**: Bases de données et sites de référence\n📊 **Analyse**: Synthèse et insights clés\n🎯 **Ciblage**: Recherche précise selon vos besoins\n📈 **Tendances**: Informations à jour et analyses prospectives\n💾 **Organisation**: Structuration des résultats\n\nSur quel sujet souhaitez-vous des informations ?
      ';
    }

    // Default intelligent response
    return `Merci pour votre message ! Je comprends que vous me demandez :
       "${input}"\n\n🤖 **Je suis Alex**, votre assistant IA personnel spécialisé dans:\n• 📋 Planification et organisation\n• 💼 Conseil business et stratégie\n• 🔍 Recherche et analyse\n• 💡 Créativité et innovation\n• 📊 Optimisation et productivité\n\nPouvez-vous me donner plus de détails sur ce que vous souhaitez accomplir ?
      Je pourrai ainsi vous fournir une aide plus spécifique et personnalisée.`;
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Alex - Assistant IA</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-500">En ligne et prêt à vous aider</p>
            </div>
          </div>
        </div>

        <button
          onClick={toggleAssistant}
          className="p-2 hover :
      bg-gray-100 rounded-full transition-colors"
          title="Fermer le chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Suggestions initiales */}
          {showSuggestions && messages.length <= 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Suggestions pour commencer:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-3 bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg transition-all hover:shadow-md"
                  >
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === STR_USER ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                  message.type === STR_USER
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === STR_USER ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit'
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600">Alex réfléchit...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3 bg-gray-50 rounded-2xl p-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message... (Entrée pour envoyer)"
                className="w-full bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500 text-sm"
                disabled={isTyping}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                inputText.trim() && !isTyping
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            💡 Astuce: Soyez précis dans vos demandes pour obtenir les meilleures réponses
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
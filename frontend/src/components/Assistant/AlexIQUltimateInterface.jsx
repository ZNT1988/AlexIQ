import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIAssistant } from '../../context/AIAssistantContext';
import { 
  Mic, MicOff, Send, Sparkles, Brain, Copy, ThumbsUp, ThumbsDown, 
  RotateCcw, Plus, Settings, Zap, Calendar, Mail, FileText, 
  Search, Users, Clock, MoreHorizontal, Paperclip, Image,
  Cpu, Code, Lightbulb, Target, TrendingUp, Rocket
} from 'lucide-react';

/**
 * AlexIQ - Interface Ultimate
 * L'interface la plus avancée au monde pour l'IA la plus puissante
 */
const AlexIQUltimateInterface = () => {
  const { 
    processInput, 
    loading, 
    chatHistory, 
    response,
    clearMemory,
    isListening,
    startListening,
    stopListening,
    transcript,
    setTranscript
  } = useAIAssistant();

  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState('anthropic');
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Suggestions ultra-intelligentes pour AlexIQ
  const suggestions = [
    {
      text: "Analyse le marché de l'IA et trouve des opportunités",
      icon: TrendingUp,
      category: "Business Intelligence",
      complexity: "expert"
    },
    {
      text: "Crée une stratégie d'expansion pour ma startup",
      icon: Rocket,
      category: "Stratégie",
      complexity: "expert"
    },
    {
      text: "Optimise mon code Python avec des techniques avancées",
      icon: Code,
      category: "Développement",
      complexity: "expert"
    },
    {
      text: "Génère des idées disruptives pour mon secteur",
      icon: Lightbulb,
      category: "Innovation",
      complexity: "créatif"
    },
    {
      text: "Planifie ma roadmap produit pour les 12 prochains mois",
      icon: Target,
      category: "Product Management",
      complexity: "stratégique"
    },
    {
      text: "Analyse concurrentielle approfondie de mon marché",
      icon: Search,
      category: "Market Research",
      complexity: "analytique"
    }
  ];

  // Actions rapides expert
  const expertActions = [
    { icon: Brain, label: "Mode Genius", color: "purple", action: "genius" },
    { icon: Cpu, label: "Analysis", color: "blue", action: "analyze" },
    { icon: Rocket, label: "Strategy", color: "red", action: "strategy" },
    { icon: Code, label: "Code", color: "green", action: "code" },
    { icon: TrendingUp, label: "Market", color: "orange", action: "market" },
    { icon: Lightbulb, label: "Innovation", color: "yellow", action: "innovate" }
  ];

  useEffect(() => {
    // Configuration reconnaissance vocale avancée
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript);
        if (finalTranscript) {
          setInputText(finalTranscript);
          handleSendMessage(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        stopListening();
      };
    }

    // Message de bienvenue AlexIQ
    if (chatHistory.length === 0) {
      setTimeout(() => {
        processInput("INIT_ALEX_GREETING");
      }, 1000);
    }

    // Focus automatique
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    setInputText('');
    setShowSuggestions(false);
    setIsThinking(true);

    // Simulation processus de pensée
    const thinkingSteps = [
      "Analyse de la demande...",
      "Accès aux connaissances...",
      "Traitement neuronal...",
      "Génération de la réponse...",
      "Optimisation finale..."
    ];

    for (let i = 0; i < thinkingSteps.length; i++) {
      setThoughtProcess(thinkingSteps[i]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsThinking(false);
    setThoughtProcess('');

    // Envoi à l'IA
    await processInput(text);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopListening();
    } else {
      recognitionRef.current?.start();
      startListening();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion.text);
    handleSendMessage(suggestion.text);
  };

  const handleExpertAction = (action) => {
    const prompts = {
      genius: "Active ton mode genius et aide-moi à résoudre des problèmes complexes",
      analyze: "Fais une analyse approfondie de ma situation actuelle",
      strategy: "Développe une stratégie personnalisée pour mes objectifs",
      code: "Aide-moi avec du développement et de l'optimisation de code",
      market: "Analyse les tendances du marché dans mon secteur",
      innovate: "Génère des idées innovantes pour mon business"
    };
    
    const prompt = prompts[action.action] || action.label;
    handleSendMessage(prompt);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Toast success
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const regenerateResponse = () => {
    if (chatHistory.length > 0) {
      const lastUserMessage = chatHistory
        .filter(msg => msg.type === 'user')
        .pop();
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.input);
      }
    }
  };

  const switchProvider = (provider) => {
    setCurrentProvider(provider);
    // Logique pour changer de provider
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex text-white">
      
      {/* Sidebar Elite */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AlexIQ
                  </h1>
                  <p className="text-sm text-blue-300">Ultimate AI Assistant</p>
                </div>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="p-4 border-b border-white/10">
              <div className="text-xs font-semibold text-blue-300 mb-3 uppercase tracking-wider">
                AI Engine
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => switchProvider('anthropic')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    currentProvider === 'anthropic' 
                      ? 'bg-blue-600/30 border border-blue-500/50' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">Claude 3.5 Sonnet</div>
                  <div className="text-xs text-gray-400">Anthropic - Raisonnement avancé</div>
                </button>
                <button
                  onClick={() => switchProvider('openai')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    currentProvider === 'openai' 
                      ? 'bg-green-600/30 border border-green-500/50' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">GPT-4</div>
                  <div className="text-xs text-gray-400">OpenAI - Créativité pure</div>
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-4">
              <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 hover:border-white/20 transition-all mb-4">
                <Plus className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">Nouvelle session genius</span>
              </button>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
                  Sessions récentes
                </div>
                {[
                  'Stratégie expansion internationale',
                  'Optimisation algorithme ML',
                  'Analyse marché crypto DeFi'
                ].map((session, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      index === 0 
                        ? 'bg-white/10 border border-white/20' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-medium text-white truncate">{session}</div>
                    <div className="text-xs text-gray-400 mt-1">Il y a {index + 1}h - {Math.floor(Math.random() * 50) + 10} messages</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Paramètres avancés</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        
        {/* Header Premium */}
        <div className="border-b border-white/10 bg-black/10 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 hover:bg-white/10 rounded-xl transition-all"
              >
                <MoreHorizontal className="w-6 h-6 text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AlexIQ Online - Mode Expert
                </span>
                {isThinking && (
                  <div className="flex items-center space-x-2 text-blue-400 animate-pulse">
                    <Brain className="w-5 h-5" />
                    <span className="text-sm">{thoughtProcess}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Expert */}
            <div className="flex items-center space-x-2">
              {expertActions.map((action, index) => {
                const Icon = action.icon;
                const colors = {
                  purple: 'hover:bg-purple-500/20 hover:text-purple-300',
                  blue: 'hover:bg-blue-500/20 hover:text-blue-300',
                  red: 'hover:bg-red-500/20 hover:text-red-300',
                  green: 'hover:bg-green-500/20 hover:text-green-300',
                  orange: 'hover:bg-orange-500/20 hover:text-orange-300',
                  yellow: 'hover:bg-yellow-500/20 hover:text-yellow-300'
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => handleExpertAction(action)}
                    className={`p-3 rounded-xl transition-all group relative ${colors[action.color]}`}
                    title={action.label}
                  >
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-inherit" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Écran de bienvenue Elite */}
            {showSuggestions && chatHistory.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <div className="text-center mb-8">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Bienvenue sur AlexIQ
                  </h1>
                  <p className="text-xl text-gray-300 mb-2">
                    L'assistant IA le plus avancé au monde
                  </p>
                  <p className="text-gray-400">
                    Capable de résoudre des problèmes complexes, analyser des marchés, et générer des stratégies innovantes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    const complexityColors = {
                      expert: 'from-red-500/20 to-purple-500/20 border-red-500/30',
                      créatif: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
                      stratégique: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
                      analytique: 'from-green-500/20 to-blue-500/20 border-green-500/30'
                    };
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`p-6 text-left rounded-2xl bg-gradient-to-r ${complexityColors[suggestion.complexity]} border backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white mb-2 text-lg leading-tight">
                              {suggestion.text}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-blue-300">
                                {suggestion.category}
                              </span>
                              <span className="text-xs text-gray-400 capitalize">
                                Niveau {suggestion.complexity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Messages de conversation */}
            <div className="space-y-8">
              <AnimatePresence>
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={message.timestamp || index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-4xl ${message.type === 'user' ? 'ml-16' : 'mr-16'}`}>

                      {/* Message utilisateur */}
                      {message.type === 'user' && (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl rounded-br-lg px-8 py-6 shadow-2xl">
                          <p className="text-lg leading-relaxed font-medium">{message.input}</p>
                        </div>
                      )}

                      {/* Message assistant */}
                      {message.type === 'assistant' && (
                        <div className="space-y-4">
                          <div className="bg-white/5 backdrop-blur-sm rounded-3xl rounded-bl-lg px-8 py-6 border border-white/10 shadow-2xl">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                                <Brain className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-lg leading-relaxed text-white whitespace-pre-wrap">
                                  {message.input}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions du message */}
                          <div className="flex items-center space-x-3 pl-14">
                            <button
                              onClick={() => copyToClipboard(message.input)}
                              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
                              title="Copier la réponse"
                            >
                              <Copy className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </button>
                            <button
                              onClick={regenerateResponse}
                              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
                              title="Régénérer la réponse"
                            >
                              <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </button>
                            <button 
                              className="p-3 hover:bg-green-500/20 rounded-xl transition-all group"
                              title="Excellente réponse"
                            >
                              <ThumbsUp className="w-5 h-5 text-gray-400 group-hover:text-green-400" />
                            </button>
                            <button 
                              className="p-3 hover:bg-red-500/20 rounded-xl transition-all group"
                              title="Réponse à améliorer"
                            >
                              <ThumbsDown className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-sm text-gray-500 mt-3 ${
                        message.type === 'user' ? 'text-right' : 'text-left pl-14'
                      }`}>
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Maintenant'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Indicateur de chargement premium */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl rounded-bl-lg px-8 py-6 mr-16 border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-lg text-blue-300 animate-pulse">
                        AlexIQ réfléchit à votre demande...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Zone de saisie Ultimate */}
        <div className="border-t border-white/10 bg-black/10 backdrop-blur-sm p-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="flex items-end space-x-4 bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10">

                {/* Boutons d'attachement */}
                <div className="flex space-x-2">
                  <button className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                    <Paperclip className="w-6 h-6 text-gray-400" />
                  </button>
                  <button className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                    <Image className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                {/* Zone de texte premium */}
                <div className="flex-1 min-h-[52px] max-h-40">
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
                    placeholder="Demandez n'importe quoi à AlexIQ... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                    className="w-full bg-transparent resize-none border-0 outline-none text-white placeholder-gray-400 text-lg leading-7 py-3 px-2"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '160px',
                      overflowY: inputText.split('\n').length > 4 ? 'auto' : 'hidden'
                    }}
                    disabled={loading}
                  />
                </div>

                {/* Boutons d'action premium */}
                <div className="flex space-x-3">
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`p-3 rounded-2xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'hover:bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || loading}
                    className={`p-3 rounded-2xl transition-all ${
                      inputText.trim() && !loading
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Indicateur vocal premium */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl text-sm flex items-center space-x-3 shadow-2xl"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">AlexIQ vous écoute...</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                    <div className="w-1 h-6 bg-white rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-150"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Infos légales premium */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  AlexIQ
                </span> 
                {" "}peut commettre des erreurs. Vérifiez les informations critiques • Powered by Claude 3.5 & GPT-4
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlexIQUltimateInterface;
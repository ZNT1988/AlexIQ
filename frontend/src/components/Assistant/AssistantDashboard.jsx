
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';
// Dashboard Assistant Personnel Super Intelligent - HustleFinderIA Frontend
// Interface complète pour l'assistant IA avec toutes les fonctionnalités

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MobileOptimizations.css';
import { Clock, Mail, MessageSquare, Mic, MicOff, Search, Settings, TrendingUp, CheckCircle, Video, MapPin, Brain, Zap, Target, BarChart3 } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const AssistantDashboard = () => {
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [assistantData, setAssistantData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isThinking, setIsThinking] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [emailSummary, setEmailSummary] = useState({});
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchAssistantData();
    fetchUpcomingMeetings();
    fetchPendingTasks();
    fetchEmailSummary();
    initializeVoiceRecognition();

    // Auto-refresh des données
    const interval = setInterval(() => {
      fetchAssistantData();
      fetchUpcomingMeetings();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const fetchAssistantData = async () => {
    try {
      const response = await fetch('/api/assistant/performance/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STR_TOKEN)}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAssistantData(data);
      }
    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}
  };

  const fetchUpcomingMeetings = async () => {
    try {
      const response = await fetch('/api/assistant/calendar/upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STR_TOKEN)}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUpcomingMeetings(data.meetings || []);
      }
    } catch (error) {
      // Logger fallback - ignore error
    }
        {
          id: 2
          title: 'Call client - Projet XYZ'
          time: '16:30'
          duration: 30
          participants: ['Client ABC']
          location: 'Visioconférence'
        }
      ]);
    }
  };

  const fetchPendingTasks = async () => {
    setPendingTasks([
      { id: 1, title: 'Réviser proposition commerciale', priority: 'high', deadline: '2024-01-20' }
      { id: 2, title: 'Préparer présentation Q1', priority: 'medium', deadline: '2024-01-22' }
      { id: 3, title: 'Suivre avec l\'équipe dev', priority: 'low', deadline: '2024-01-25' }
    ]);
  };

  const fetchEmailSummary = async () => {
    setEmailSummary({
      unread: 12
      priority: 3
      awaiting_response: 5
      scheduled: 2
    });
  };

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      setVoiceEnabled(true);
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

  const handleVoiceCommand = async (transcript) => {
    setIsThinking(true);

    try {
      const response = await fetch('/api/assistant/voice/command', {
        method :
       STR_POST
        headers: {
          'Content-Type': STR_JSON_CONTENT
          'Authorization': `Bearer ${localStorage.getItem(STR_TOKEN)}`
        }
        body: JSON.stringify({
          audioData: transcript
          context: { interface: 'dashboard', tab: activeTab }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          type: 'assistant'
          content: data.response
          timestamp: new Date()
          intent: data.intent
          confidence: data.confidence
        };

        setChatMessages(prev => [
          ...prev
          { type: STR_USER, content: transcript, timestamp: new Date() }
          assistantMessage
        ]);

        // Exécution des actions suggérées
        if (data.executionDetails.commandExecuted) {
          handleAssistantAction(data.executionDetails.commandExecuted);
        }
      }
    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }} finally {
      setIsThinking(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { type: STR_USER, content: currentMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: STR_POST
        headers: {
          'Content-Type': STR_JSON_CONTENT
          'Authorization': `Bearer ${localStorage.getItem(STR_TOKEN)}`
        }
        body: JSON.stringify({
          message: currentMessage
          context: { interface: 'dashboard', tab: activeTab }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          type: 'assistant'
          content: data.response
          timestamp: new Date()
          intent: data.intent
          actions: data.actions
          insights: data.proactiveInsights
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }} finally {
      setIsThinking(false);
    }
  };      const data = await response.json();

      if (data.success) {
        fetchUpcomingMeetings(); // Rafraîchir la liste
        return data;
      }
    } catch (error) {
      try {
      logger.error('Failed to schedule appointment:', error);

      } catch (error) {
    // Logger fallback - ignore error
  }}
  };

  const handleAssistantAction = (action) => {
    switch (action) {
      case 'show_calendar':
        setActiveTab(STR_CALENDAR);
        break;
      case 'show_emails':
        setActiveTab(STR_EMAIL);
        break;
      case 'show_tasks':
        setActiveTab('tasks');
        break;
      default:
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 }
    { id: STR_CALENDAR, label: 'Calendrier', icon: Calendar }
    { id: STR_EMAIL, label: 'Emails', icon: Mail }
    { id: 'tasks', label: 'Tâches', icon: CheckCircle }
    { id: 'research', label: 'Recherche', icon: Search }
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  if (!assistantData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg text-gray-300">Initialisation de l'assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Mobile-First Header */}
      <div className="border-b border-white/20 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
                <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                  Assistant IA
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 hidden sm:block">
                  Efficacité: {(assistantData.performance.efficiencyGain * 100).toFixed(0)}% |
                  Satisfaction: {(assistantData.performance.userSatisfaction * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-blue-200 sm:hidden">
                  {(assistantData.performance.efficiencyGain * 100).toFixed(0)}% eff
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {voiceEnabled && (
                <button
                  onClick={toggleVoiceRecognition}
                  className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  aria-label={isListening ? 'Arrêter l\'écoute' : 'Démarrer l\'écoute vocale'}
                >
                  {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              )}
              <div className="text-right hidden sm:block">
                <div className="text-sm text-green-400">🟢 En ligne</div>
                <div className="text-xs text-gray-400">
                  {assistantData.performance.tasksCompleted} tâches
                </div>
              </div>
              <div className="text-xs text-green-400 sm:hidden">
                🟢 {assistantData.performance.tasksCompleted}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile-First Navigation Tabs */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile: Horizontal scrollable tabs */}
          <div className="flex overflow-x-auto space-x-1 bg-black/40 rounded-lg p-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm hidden xs:inline">{tab.label}</span>
                  <span className="text-xs xs:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile-First Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">

          {/* Mobile: Chat appears first on mobile, content second on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-3 sm:space-y-6">

            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Mobile-First Performance Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400 truncate">Temps économisé</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-400">
                          {assistantData.performance.timesSaved}h
                        </p>
                      </div>
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400 truncate">Tâches</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-400">
                          {assistantData.performance.tasksCompleted}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400 truncate">Efficacité</p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-400">
                          {(assistantData.performance.efficiencyGain * 100).toFixed(0)}%
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400 truncate">Satisfaction</p>
                        <p className="text-lg sm:text-2xl font-bold text-yellow-400">
                          {(assistantData.performance.userSatisfaction * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Prochaines réunions */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                    Prochaines réunions
                  </h3>
                  <div className="space-y-3">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className=STR_TEXT_SM_TEXT_GRAY_400>
                              {meeting.time} • {meeting.duration}min • {meeting.participants.length} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-gray-400" />
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tâches prioritaires */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-red-400" />
                    Tâches prioritaires
                  </h3>
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className=STR_TEXT_SM_TEXT_GRAY_400>Échéance: {task.deadline}</p>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-400 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Autres onglets */}
            {activeTab === STR_CALENDAR && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold mb-4">Gestion du calendrier</h3>
                <p className="text-gray-400">Interface de calendrier en développement...</p>
              </motion.div>
            )}

            {activeTab === STR_EMAIL && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold mb-4">Gestion des emails</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{emailSummary.unread}</div>
                    <div className=STR_TEXT_SM_TEXT_GRAY_400>Non lus</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{emailSummary.priority}</div>
                    <div className=STR_TEXT_SM_TEXT_GRAY_400>Prioritaires</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{emailSummary.awaiting_response}</div>
                    <div className=STR_TEXT_SM_TEXT_GRAY_400>En attente</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{emailSummary.scheduled}</div>
                    <div className=STR_TEXT_SM_TEXT_GRAY_400>Programmés</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile-First Chat with Assistant */}
          <div className="order-1 lg:order-2 bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 flex flex-col h-[400px] sm:h-[500px] lg:h-[600px]">
            <div className="p-3 sm:p-4 border-b border-white/20">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-400" />
                <span className="truncate">Chat IA</span>
                {isListening && (
                  <div className="ml-2 flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-1" />
                    <span className="text-xs text-red-400 hidden sm:inline">Écoute...</span>
                    <span className="text-xs text-red-400 sm:hidden">🎤</span>
                  </div>
                )}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
              <AnimatePresence>
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === STR_USER ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 rounded-lg ${
                      message.type === STR_USER
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="text-xs sm:text-sm">{message.content}</p>
                      {message.intent && (
                        <p className="text-xs text-blue-300 mt-1">🎯 {message.intent}</p>
                      )}
                      {message.confidence && (
                        <p className="text-xs text-gray-400 mt-1">
                          {(message.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm">L'assistant réfléchit...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-2 sm:p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Demandez quelque chose..."
                  className="flex-1 px-3 sm:px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm sm:text-base"
                  disabled={isThinking}
                />
                <button
                  onClick={sendMessage}
                  disabled={isThinking || !currentMessage.trim()}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Envoyer</span>
                  <span className="sm:hidden">📤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantDashboard;
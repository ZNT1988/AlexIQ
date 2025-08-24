import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Brain, Zap, MessageSquare, Settings } from 'lucide-react';
import './AlexModernInterface.css';

const AlexModernInterface = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alexStatus, setAlexStatus] = useState('connecting');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    // Initialiser Alex - PAS de message fake
    setAlexStatus('ready');
    setConversation([]); // Interface vide, Alex répondra authentiquement
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: message,
      timestamp: Date.now()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');
    setAlexStatus('thinking');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          useAlex: true 
        })
      });

      const data = await response.json();
      
      if (data.output) {
        const alexMessage = { 
          role: 'alex',
          content: data.output,
          timestamp: Date.now(),
          provider: data.provider,
          authentic: data.authentic || false,
          personality: data.personality || 'Assistant IA',
          confidence: data.confidence || 0.7,
          learningInsights: data.learningInsights || 0
        };
        
        setConversation(prev => [...prev, alexMessage]);
        setAlexStatus(data.authentic ? 'authentic' : 'fallback');
      } else {
        throw new Error('Pas de réponse');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = { 
        role: 'alex', 
        content: "Désolé, je rencontre une petite difficulté. Peux-tu réessayer ?",
        timestamp: Date.now(),
        error: true,
        authentic: true
      };
      setConversation(prev => [...prev, errorMessage]);
      setAlexStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setAlexStatus('ready'), 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusIcon = () => {
    switch (alexStatus) {
      case 'thinking': return <Brain className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'authentic': return <Sparkles className="w-4 h-4 text-green-500" />;
      case 'fallback': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'error': return <MessageSquare className="w-4 h-4 text-red-500" />;
      default: return <Bot className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (alexStatus) {
      case 'thinking': return 'Alex réfléchit...';
      case 'authentic': return 'Alex authentique';
      case 'fallback': return 'Mode API externe';
      case 'error': return 'Reconnexion...';
      default: return 'Alex est prêt';
    }
  };

  return (
    <div className="alex-modern-interface">
      {/* Header */}
      <header className="alex-header">
        <div className="alex-brand">
          <div className="alex-avatar">
            <Bot className="w-8 h-8 text-blue-600" />
            <div className="alex-status-indicator">
              {getStatusIcon()}
            </div>
          </div>
          <div className="alex-info">
            <h1 className="alex-name">Alex</h1>
            <p className="alex-status">{getStatusText()}</p>
          </div>
        </div>
        <button 
          className="alex-settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="alex-settings-panel">
          <div className="setting-item">
            <span>Mode authentique</span>
            <div className="toggle-switch active">
              <div className="toggle-knob"></div>
            </div>
          </div>
          <div className="setting-item">
            <span>Apprentissage continu</span>
            <div className="toggle-switch active">
              <div className="toggle-knob"></div>
            </div>
          </div>
          <div className="setting-item">
            <span>Auto-réflexion</span>
            <div className="toggle-switch active">
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="alex-messages">
        {conversation.map((msg, index) => (
          <div key={index} className={`alex-message ${msg.role}`}>
            <div className="alex-message-avatar">
              {msg.role === 'user' ? (
                <User className="w-6 h-6" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>
            
            <div className="alex-message-content">
              <div className="alex-message-header">
                <span className="alex-message-sender">
                  {msg.role === 'user' ? 'Vous' : (msg.personality || 'Alex')}
                </span>
                {msg.authentic && (
                  <span className="alex-authentic-badge">
                    <Sparkles className="w-3 h-3" />
                    Authentique
                  </span>
                )}
                {msg.confidence && (
                  <span className="alex-confidence-badge">
                    {Math.round(msg.confidence * 100)}%
                  </span>
                )}
                <span className="alex-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className={`alex-message-text ${msg.error ? 'error' : ''}`}>
                {msg.content}
              </div>
              
              {msg.learningInsights > 0 && (
                <div className="alex-learning-indicator">
                  <Brain className="w-3 h-3" />
                  {msg.learningInsights} insights d'apprentissage
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="alex-message alex">
            <div className="alex-message-avatar">
              <Bot className="w-6 h-6" />
            </div>
            <div className="alex-message-content">
              <div className="alex-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="alex-input-container">
        <div className="alex-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Parlez avec Alex..."
            className="alex-input"
            rows={1}
            disabled={loading}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="alex-send-btn"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="alex-input-footer">
          <span className="alex-footer-text">
            Alex utilise {conversation.filter(msg => msg.authentic).length > conversation.filter(msg => !msg.authentic).length ? 
            'son intelligence authentique' : 'des APIs externes'} pour vous répondre
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlexModernInterface;
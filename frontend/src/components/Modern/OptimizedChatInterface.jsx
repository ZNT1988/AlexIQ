import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Brain, Trash2 } from 'lucide-react';

const ChatMessage = ({ message, isLastMessage }) => {
  const messageRef = useRef(null);

  useEffect(() => {
    if (isLastMessage && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [isLastMessage]);

  const getMessageStyle = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto';
      case 'assistant':
        return 'bg-gray-100 text-gray-800 mr-auto';
      case 'error':
        return 'bg-red-100 text-red-800 border border-red-200 mr-auto';
      default:
        return 'bg-gray-100 text-gray-800 mr-auto';
    }
  };

  return (
    <div
      ref={messageRef}
      className={`max-w-[80%] p-3 rounded-lg mb-3 shadow-sm ${getMessageStyle(message.type)}`}
    >
      <div className="flex items-start space-x-2">
        {message.type === 'assistant' && (
          <Brain className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="break-words">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className="mb-1 last:mb-0">
                {line}
              </p>
            ))}
          </div>
          <div className="text-xs opacity-60 mt-2">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  }, [input, disabled, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const toggleVoiceRecording = useCallback(() => {
    setIsListening(!isListening);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-4 bg-white border-t">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isListening ? 'Parlez maintenant...' : 'Tapez votre message...'}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            isListening
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        {isListening && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Écoute...</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggleVoiceRecording}
        disabled={disabled}
        className={`p-3 rounded-lg transition-all ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className={`p-3 rounded-lg transition-all ${
          disabled || !input.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title="Envoyer le message"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

const OptimizedChatInterface = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reflectiveMode, setReflectiveMode] = useState(false);
  const messagesContainerRef = useRef(null);

  const handleSendMessage = useCallback(async (message) => {
    const userMessage = { 
      id: Date.now(), 
      type: 'user', 
      content: message, 
      timestamp: Date.now() 
    };
    
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          id: Date.now() + 1,
          type: 'assistant', 
          content: data.output,
          timestamp: Date.now()
        };
        setConversation(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1,
        type: 'error', 
        content: `Erreur: ${error.message}`,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer la conversation ?')) {
      setConversation([]);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">Assistant IA</h2>
              <p className="text-sm opacity-90">
                {reflectiveMode ? 'Mode réfléchi activé' : 'Mode standard'}
                {loading && ' • Traitement en cours...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setReflectiveMode(!reflectiveMode)}
              className={`p-2 rounded-lg transition-all ${
                reflectiveMode
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
              }`}
              title={`${reflectiveMode ? 'Désactiver' : 'Activer'} le mode réfléchi`}
            >
              <Brain className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearChat}
              disabled={conversation.length === 0}
              className="p-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Effacer la conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Bonjour ! Je suis votre assistant</p>
                <p className="text-sm">
                  {reflectiveMode
                    ? 'Mode réfléchi activé - Je prendrai le temps d\'analyser vos questions en profondeur.'
                    : 'Posez-moi vos questions.'
                  }
                </p>
              </div>
            </div>
          ) : (
            conversation.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={index === conversation.length - 1}
              />
            ))
          )}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500 ml-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Réflexion...</span>
            </div>
          )}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OptimizedChatInterface;
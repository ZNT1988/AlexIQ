import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const STR_ASSISTANT = 'assistant';
const STR_P_1_HOVER_BG_GRAY_100_ROUNDED = 'p-1 hover:bg-gray-100 rounded';
const STR_W_3_H_3 = 'w-3 h-3';

const AlexModernChat = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // Message d'accueil d'Alex
    if (conversation.length === 0) {
      setTimeout(() => {
        setConversation([{
          type: STR_ASSISTANT
          content: "Bonjour ! Je suis Alex, votre assistant IA avancé. Je suis équipé de 75+ modules d'intelligence pour vous accompagner dans vos projets entrepreneuriaux et créatifs. Comment puis-je vous aider aujourd'hui ?"
          timestamp: new Date()
          id: Date.now()
        }]);
      }, 500);
    }
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      type: STR_USER
      content: message.trim()
      timestamp: new Date()
      id: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8082/api/assistant/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
        }
        body: JSON.stringify({
          message: userMessage.content
          userId: 'user_' + Date.now()
          context: {
            conversationHistory: conversation.slice(-5)
          }
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        const alexResponse = {
          type: STR_ASSISTANT
          content: data.response
          timestamp: new Date()
          id: Date.now()
          metadata: data.metadata
          intent: data.intent
          capabilities: data.capabilities
        };

        setConversation(prev => [...prev, alexResponse]);
      } else {
        throw new Error(data.error || 'Erreur de communication avec Alex');
      }
    } catch (error) {
      // Logger fallback - ignore error
    };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const formatMessage = (content) => {
    // Simple formatting pour les messages
    return content.split('\n').map((line, index) => (
      <div key={index} className="mb-1">
        {line || <br />}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Alex Ultimate</h1>
            <p className="text-sm text-gray-500">Assistant IA avec 75+ modules d'intelligence</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {conversation.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === STR_USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.type === STR_USER ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.type === STR_USER
                    ? 'bg-gray-600 ml-3'
                    : 'bg-blue-600 mr-3'
                }`}>
                  {msg.type === STR_USER ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-lg px-4 py-3 ${
                  msg.type === STR_USER
                    ? 'bg-blue-600 text-white'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-white border border-gray-200 text-gray-900'
                } shadow-sm`}>
                  <div className="text-sm leading-relaxed">
                    {formatMessage(msg.content)}
                  </div>

                  {/* Metadata pour Alex */}
                  {msg.type === STR_ASSISTANT && msg.metadata && !msg.isError && (
                    <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex justify-between items-center">
                        <span>Temps: {msg.metadata.responseTime}ms • Version: {msg.metadata.version}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className=STR_P_1_HOVER_BG_GRAY_100_ROUNDED
                            title="Copier"
                          >
                            <Copy className=STR_W_3_H_3 />
                          </button>
                          <button className=STR_P_1_HOVER_BG_GRAY_100_ROUNDED title="J'aime">
                            <ThumbsUp className=STR_W_3_H_3 />
                          </button>
                          <button className=STR_P_1_HOVER_BG_GRAY_100_ROUNDED title="Je n'aime pas">
                            <ThumbsDown className=STR_W_3_H_3 />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre message à Alex..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                rows={1}
                style={{
                  minHeight: '48px'
                  maxHeight: '120px'
                }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className={`px-4 py-3 rounded-lg flex items-center justify-center transition-colors ${
                message.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Info bar */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Alex Ultimate • 75+ modules d'IA • Appuyez sur Entrée pour envoyer
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlexModernChat;
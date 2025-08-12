import React, { useState, useEffect, useRef } from 'react';
import { useAIAssistant } from '../../context/AIAssistantContext';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) =>
    process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args),
  warn: (...args) =>
    process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) =>
    process.env.NODE_ENV === STR_DEVELOPMENT &&
    console.debug('[DEBUG]', ...args),
};

const STR_ASSISTANT = 'assistant';
const STR_USER = 'user';
const SimpleChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { toggleAssistant } = useAIAssistant();
  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: STR_ASSISTANT,
          content:
            "👋 Bonjour ! Je suis Alex, votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
          timestamp: new Date(),
        },
      ]);
    }

    // Focus input
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: STR_USER,
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Call the backend API directly
      const response = await fetch('http://localhost:8081/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          type: 'chat',
          context: {
            interface: 'simple_chat',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        type: STR_ASSISTANT,
        content: data.response || '🧬 Génération évolutive Alex activée',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error("Erreur lors de l'envoi du message:", error);
      const assistantMessage = {
        id: Date.now() + 1,
        type: STR_ASSISTANT,
        content: '🔄 Connexion à Alex évolutif...',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
            <span className='text-white font-bold'>AI</span>
          </div>
          <div>
            <h1 className='text-lg font-semibold text-gray-900'>
              Alex - Assistant IA
            </h1>
            <p className='text-sm text-gray-500'>En ligne</p>
          </div>
        </div>

        <button
          onClick={toggleAssistant}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          title='Fermer'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === STR_USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === STR_USER
                  ? 'bg-blue-600 text-white'
                  : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className='text-sm'>{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.type === STR_USER ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className='flex justify-start'>
            <div className='bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs lg:max-w-md'>
              <div className='flex items-center space-x-1'>
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100'></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200'></div>
                </div>
                <span className='text-sm text-gray-500'>Alex réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='bg-white border-t border-gray-200 p-4'>
        <div className='flex items-center space-x-3'>
          <div className='flex-1'>
            <input
              ref={inputRef}
              type='text'
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Tapez votre message...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              inputText.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Mic, MicOff, User, Bot } from 'lucide-react';

const ModernAssistantInterface = () => {
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.output 
        };
        setConversation(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: `Erreur: ${error.message}` 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">Assistant IA</h1>
              <p className="text-sm text-gray-600">Interface moderne</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">En ligne</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Bienvenue</h2>
            <p className="text-gray-500">Comment puis-je vous aider aujourd'hui ?</p>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-md' 
                  : msg.role === 'error'
                  ? 'bg-red-500 text-white rounded-bl-md'
                  : 'bg-gray-50 text-gray-900 rounded-bl-md'
              }`}>
                <div className="flex items-start space-x-2">
                  {msg.role === 'assistant' && <Brain className="w-4 h-4 mt-1 text-blue-500" />}
                  {msg.role === 'user' && <User className="w-4 h-4 mt-1" />}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3 mr-12">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm">Réflexion...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-end space-x-2 bg-gray-50 rounded-2xl p-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tapez votre message..."
              className="w-full bg-transparent resize-none border-0 outline-none text-gray-900 placeholder-gray-500 text-sm leading-6 py-2"
              rows={1}
              style={{ minHeight: '28px', maxHeight: '120px' }}
              disabled={loading}
            />
          </div>
          
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-lg transition-colors ${
              isListening ? 'bg-red-500 text-white' : 'hover:bg-gray-200 text-gray-500'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={sendMessage}
            disabled={!message.trim() || loading}
            className={`p-2 rounded-lg transition-colors ${
              message.trim() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <div className="text-center mt-2">
            <div className="inline-flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Écoute en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernAssistantInterface;
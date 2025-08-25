import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy } from 'lucide-react';

const ModernChatInterface = () => {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text.trim() };
    setConversation(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() })
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const suggestions = [
    "Aide-moi avec mon projet",
    "Donne-moi des conseils", 
    "Aide-moi à analyser",
    "Comment optimiser ?"
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Bot size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Assistant IA</h1>
            <p className="text-sm text-gray-500">Interface moderne</p>
          </div>
        </div>
        
        {conversation.length > 0 && (
          <button
            onClick={clearConversation}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Nouveau
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Bot size={48} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenue</h2>
            <p className="text-lg text-gray-600 mb-8">
              Comment puis-je vous aider aujourd'hui ?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  className="p-4 bg-white border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all hover:shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-0">
            {conversation.map((message, index) => (
              <div key={index} className={`flex p-4 ${message.role === 'user' ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Bot size={20} className="text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`${
                    message.role === 'error' ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex mt-2">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copier"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex p-4 bg-white">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-1">
                  <Bot size={20} className="text-blue-600" />
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="flex space-x-1 mr-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm">Réflexion...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message..."
              className="flex-1 bg-transparent border-0 outline-none resize-none text-gray-900 placeholder-gray-500"
              rows={1}
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-2 rounded-lg transition-colors ${
                input.trim() && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </div>
    </div>
  );
};

export default ModernChatInterface;
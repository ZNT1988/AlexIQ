import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Image, MapPin } from 'lucide-react';

const ModernChatGPT = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText = input, type = 'chat') => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = type === 'image' ? '/api/images' : 
                      type === 'maps' ? '/api/maps/search' : '/api/chat';
      
      const body = type === 'image' ? { prompt: messageText } :
                   type === 'maps' ? { query: messageText } :
                   { message: messageText, provider: selectedProvider };

      // En production: même serveur, en dev: proxy Vite
      const baseURL = import.meta.env.PROD ? '' : '';
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.output || data.message || 'Désolé, une erreur est survenue.',
        sender: 'assistant',
        timestamp: new Date(),
        provider: data.provider,
        imageUrl: data.imageUrl || data.image_url,
        location: data.data?.location,
        authentic: data.authentic,
        error: data.error
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Erreur de connexion. Vérifiez votre connexion.',
        sender: 'assistant',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Alex AI</h1>
              <p className="text-purple-300 text-sm">Intelligence Authentique</p>
            </div>
          </div>
          
          <select 
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="auto">Auto (Meilleur IA)</option>
            <option value="openai">OpenAI GPT-4</option>
            <option value="anthropic">Claude 3.5 Sonnet</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Comment puis-je vous aider ?</h2>
              <p className="text-purple-300 text-lg">Posez-moi n'importe quelle question</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                <button 
                  onClick={() => sendMessage("Explique-moi l'intelligence artificielle", 'chat')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300"
                >
                  <div className="text-white font-medium">💡 Expliquer un concept</div>
                  <div className="text-purple-300 text-sm mt-1">L'intelligence artificielle</div>
                </button>
                
                <button 
                  onClick={() => sendMessage("Créer une image d'un coucher de soleil", 'image')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300"
                >
                  <div className="text-white font-medium">🎨 Créer une image</div>
                  <div className="text-purple-300 text-sm mt-1">Coucher de soleil</div>
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                }`}>
                  {message.sender === 'user' ? 
                    <User className="w-5 h-5 text-white" /> : 
                    <Bot className="w-5 h-5 text-white" />
                  }
                </div>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : message.error 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Generated" 
                      className="mt-3 rounded-lg max-w-full h-auto"
                    />
                  )}
                  
                  {message.provider && !message.error && (
                    <div className="mt-2 text-xs opacity-60">
                      via {message.provider} {message.authentic && '• Authentic AI'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => sendMessage(input, 'image')}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Générer une image"
            >
              <Image className="w-5 h-5" />
            </button>

            <button
              onClick={() => sendMessage(input, 'maps')}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rechercher sur Maps"
            >
              <MapPin className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="1"
                style={{minHeight: '50px'}}
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernChatGPT;
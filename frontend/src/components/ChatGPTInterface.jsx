import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Menu, MessageSquare, Edit3, Share, Trash2, Download, Sun, Moon, Settings, MoreHorizontal, ThumbsUp, ThumbsDown, Copy, RotateCcw, Volume2, Eye, EyeOff } from 'lucide-react';

const ChatGPTInterface = () => {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message, timestamp: Date.now() };
    setCurrentConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      // Détection demande d'image
      const isImageRequest = /génère|créé|fais|dessine|image|photo|picture|draw|peins|illustre/i.test(message);
      
      if (isImageRequest) {
        const response = await fetch(`${apiBaseUrl}/api/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: message,
            size: "1024x1024",
            style: "realistic"
          })
        });

        const data = await response.json();
        
        if (data.image_url) {
          const aiMessage = { 
            role: 'assistant', 
            content: `Voici l'image que j'ai générée pour vous :`,
            image: data.image_url,
            provider: 'Alex + DALL-E 3',
            timestamp: Date.now()
          };
          setCurrentConversation(prev => [...prev, aiMessage]);
        }
      } else {
        // Chat normal avec apprentissage
        const response = await fetch(`${apiBaseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: message,
            context: currentConversation.slice(-5), // Contexte récent
            enableLearning: true
          })
        });

        const data = await response.json();
        
        if (data.output) {
          const aiMessage = { 
            role: 'assistant', 
            content: data.output,
            provider: data.provider,
            confidence: data.confidence,
            learning: data.learning,
            timestamp: Date.now()
          };
          setCurrentConversation(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: `Erreur de connexion: ${error.message}`,
        timestamp: Date.now()
      };
      setCurrentConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const newConversation = () => {
    if (currentConversation.length > 0) {
      const title = currentConversation[0]?.content?.slice(0, 30) + '...' || 'Nouvelle conversation';
      setConversations(prev => [...prev, { 
        id: Date.now(), 
        title, 
        messages: currentConversation,
        timestamp: Date.now()
      }]);
    }
    setCurrentConversation([]);
  };

  const loadConversation = (conversation) => {
    setCurrentConversation(conversation.messages);
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const provideFeedback = async (messageIndex, type) => {
    // Envoyer feedback pour apprentissage
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/alex/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: messageIndex,
          feedback: type,
          conversation: currentConversation.slice(0, messageIndex + 1)
        })
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-4">
          <button
            onClick={newConversation}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors`}
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle conversation</span>
          </button>
        </div>
        
        <div className="px-4 pb-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} className={`group flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}>
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate text-sm" onClick={() => loadConversation(conv)}>
                {conv.title}
              </span>
              <button
                onClick={() => deleteConversation(conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-xs opacity-60">Alex IQ v2.0</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold">Alex IQ Assistant</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                IA avec Self-Learning • 118+ modules actifs
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="max-w-3xl mx-auto">
            {currentConversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className={`text-6xl mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>🤖</div>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Bonjour ! Je suis Alex
                </h2>
                <p className={`text-lg mb-8 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Assistant IA avec apprentissage continu et 118+ modules spécialisés
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <h3 className="font-semibold mb-2">💬 Conversation</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Posez des questions, demandez des conseils
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <h3 className="font-semibold mb-2">🎨 Images</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Génération d'images avec DALL-E 3
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {currentConversation.map((msg, index) => (
                  <div key={index} className={`group ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        msg.role === 'user' 
                          ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                          : msg.role === 'error'
                          ? `${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} ${darkMode ? 'text-red-200' : 'text-red-800'} border`
                          : `${darkMode ? 'bg-gray-700' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`
                      } rounded-2xl px-4 py-3 shadow-sm`}>
                        
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        
                        {msg.image && (
                          <div className="mt-3">
                            <img 
                              src={msg.image} 
                              alt="Generated image" 
                              className="max-w-full h-auto rounded-xl border border-gray-300"
                              style={{ maxHeight: '400px' }}
                            />
                          </div>
                        )}
                        
                        {msg.provider && (
                          <div className={`text-xs mt-2 opacity-70 flex items-center justify-between`}>
                            <span>via {msg.provider}</span>
                            {msg.confidence && (
                              <span>Confiance: {Math.round(msg.confidence * 100)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => provideFeedback(index, 'positive')}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => provideFeedback(index, 'negative')}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-2xl px-4 py-3 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className={`animate-bounce w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full`}></div>
                          <div className={`animate-bounce w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full`} style={{animationDelay: '0.1s'}}></div>
                          <div className={`animate-bounce w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full`} style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alex réfléchit et apprend...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Posez votre question à Alex..."
                rows={1}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                disabled={loading}
                style={{ minHeight: '50px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg ${
                  loading || !message.trim() 
                    ? `${darkMode ? 'bg-gray-600 text-gray-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                } transition-colors`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Alex peut faire des erreurs. Vérifiez les informations importantes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTInterface;
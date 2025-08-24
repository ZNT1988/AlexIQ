import React, { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout.jsx';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Zakaria Housni',
    isPro: true,
    conversationCount: 127,
    alexLevel: 85
  });

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.output,
          provider: data.provider 
        };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { 
          role: 'error', 
          content: `Erreur: ${data.message || 'Réponse invalide'}` 
        };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: `Erreur de connexion: ${error.message}` 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <MainLayout currentUser={currentUser} onLogout={handleLogout}>
      <div className="flex flex-col h-full bg-white">
        {/* Header Chat Alex */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chat avec Alex</h2>
              <p className="text-sm text-gray-600 mt-1">
                Votre assistant IA personnel qui évolue avec chaque conversation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">Niveau d'Alex: {currentUser?.alexLevel || 0}%</div>
                <div className="text-gray-500">{conversation.length} messages aujourd'hui</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-3xl">A</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Salut {currentUser?.name?.split(' ')[0]} ! 👋</h3>
              <div className="space-y-3 text-gray-600 max-w-md">
                <p className="flex items-center justify-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Alex est en ligne et prêt à discuter
                </p>
                <p>🧠 Intelligence artificielle évolutive</p>
                <p>🎯 Personnalisée pour tes besoins HustleFinder</p>
                <p>📈 Devient plus autonome avec chaque conversation</p>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
                <button 
                  onClick={() => setMessage("Peux-tu te présenter Alex ?")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Présentation</div>
                  <div className="text-sm text-gray-500">Découvre qui est Alex</div>
                </button>
                <button 
                  onClick={() => setMessage("Quelles sont tes capacités actuelles ?")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Capacités</div>
                  <div className="text-sm text-gray-500">Explore mes fonctions</div>
                </button>
                <button 
                  onClick={() => setMessage("Aide-moi avec mon business HustleFinder")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Business</div>
                  <div className="text-sm text-gray-500">Conseils HustleFinder</div>
                </button>
              </div>
            </div>
          )}
          
          {conversation.map((msg, index) => (
            <div key={index} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    msg.role === 'user' 
                      ? 'bg-gray-600 text-white' 
                      : msg.role === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  }`}>
                    {msg.role === 'user' ? 'Z' : msg.role === 'error' ? '!' : 'A'}
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.role === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.provider && (
                      <div className="mt-2 text-xs opacity-75 flex items-center">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        via {msg.provider}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="mb-6 flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-gray-500 text-sm">Alex réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Discute avec Alex... (Entrée pour envoyer)"
                disabled={loading}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button 
              onClick={sendMessage} 
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Alex s'améliore avec chaque conversation 🧠</span>
            <span>Propulsé par HustleFinder IA</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
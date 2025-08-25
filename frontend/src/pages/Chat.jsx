import React, { useState } from 'react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: data.output,
          provider: data.provider 
        }]);
      } else {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: 'Désolé, une erreur s\'est produite.',
          error: true 
        }]);
      }
    } catch (error) {
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Erreur de connexion au serveur.',
        error: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold text-gray-900">Chat avec Alex</h1>
          <p className="text-gray-600">Assistant IA intelligent et authentique</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-2">Bonjour ! Je suis Alex</h2>
              <p>Posez-moi n'importe quelle question pour commencer la conversation.</p>
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.error
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.provider && (
                    <div className="text-xs mt-2 opacity-70">
                      via {msg.provider}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <span>Alex réfléchit...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
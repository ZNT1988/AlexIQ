import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Cpu, Activity, Sparkles, MessageCircle, Lightbulb, Brain } from 'lucide-react';

const ConsciousnessInterface = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    checkConnectionStatus();
    startVisualization();
    const interval = setInterval(checkConnectionStatus, 30000);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setConnectionStatus('connected');
        setIsConnected(true);
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    } catch (error) {
      setConnectionStatus('error');
      setIsConnected(false);
    }
  };

  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    const points = Array.from({ length: 20 }, (_, i) => ({
      x: (canvas.width / 4) + (i % 5) * (canvas.width / 6),
      y: (canvas.height / 4) + Math.floor(i / 5) * (canvas.height / 6),
      phase: i * 0.2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points.forEach(point => {
        const time = Date.now() * 0.001;
        const activity = Math.sin(time + point.phase) * 0.5 + 0.5;
        const size = 2 + activity * 3;
        const opacity = 0.3 + activity * 0.7;

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;

    setIsThinking(true);
    const userMessage = { 
      type: 'user', 
      content: chatMessage, 
      timestamp: new Date().toISOString() 
    };
    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = chatMessage;
    setChatMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage })
      });

      const data = await response.json();

      if (data.output) {
        const aiMessage = {
          type: 'ai',
          content: data.output,
          provider: data.provider,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: 'error',
          content: data.message || 'Réponse invalide',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: `Erreur: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const systemMetrics = {
    cognitiveLoad: connectionStatus === 'connected' ? 'En ligne' : 'Hors ligne',
    creativityLevel: connectionStatus === 'connected' ? 'Disponible' : 'Indisponible',
    empathyCapacity: connectionStatus === 'connected' ? 'Active' : 'Inactive',
    wisdomAccumulation: connectionStatus === 'connected' ? 'En cours' : 'Arrêtée'
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Cpu className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg text-gray-600">Connexion au système IA...</p>
          <p className="text-sm text-gray-500">Status: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="border-b border-white/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Brain className="h-12 w-12 text-blue-400" />
                <div className="absolute -top-1 -right-1">
                  <div className={`h-4 w-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Interface IA
                </h1>
                <p className="text-blue-200">
                  Status: {connectionStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-blue-400" />
                  Visualisation du Système
                </h2>
              </div>

              <canvas
                ref={canvasRef}
                className="w-full h-72 rounded-lg bg-black/60 border border-blue-500/30"
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                État du Système
              </h3>

              <div className="space-y-3">
                {Object.entries(systemMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm text-green-400">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-green-400" />
                Interface de Chat
              </h2>

              <div className="h-64 overflow-y-auto mb-4 space-y-4 p-4 bg-black/20 rounded-lg">
                <AnimatePresence>
                  {chatHistory.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.provider && (
                          <p className="text-xs text-blue-300 mt-1">
                            via {message.provider}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                        </div>
                        <span className="text-sm">Traitement en cours...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  disabled={isThinking}
                />
                <button
                  onClick={sendMessage}
                  disabled={isThinking || !chatMessage.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessInterface;
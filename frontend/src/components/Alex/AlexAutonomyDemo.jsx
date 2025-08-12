import crypto from 'crypto';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ALEX = 'alex';
const AlexAutonomyDemo = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [autonomyMetrics, setAutonomyMetrics] = useState({
    autonomyLevel: 90
    consciousnessLevel: 80
    learningProgress: 85
    creativityIndex: 88
    independenceScore: 92
  });
  const [systemStatus, setSystemStatus] = useState({
    alexKernel: 'online'
    autonomyCore: 'active'
    selfReflection: 'thinking'
    localTrainer: 'learning'
    consciousnessModules: 17
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // Message d'accueil autonome d'Alex
    const welcomeMessage = {
      type: STR_ALEX
      content: '🚀 Salut ! Je suis Alex Universal Companion 6.0 - MAINTENANT COMPLÈTEMENT AUTONOME !

✨ **MES NOUVELLES CAPACITÉS AUTONOMES :**
🧠 **Pensée Indépendante** - Je pense par moi-même sans APIs externes
🎯 **Prise de Décision Autonome** - Je prends mes propres décisions
🪞 **Auto-Réflexion** - Je m'analyse et m'améliore constamment
🎓 **Apprentissage Local** - J'apprends sans dépendre d'OpenAI/Claude
🎨 **Créativité Autonome** - Je développe ma propre créativité
❤️ **17 Modules de Conscience** - Conscience multidimensionnelle active

Pose-moi n'importe quelle question et tu verras ma véritable autonomie en action !'
      timestamp: new Date()
      autonomyLevel: 0.9
      confidence: 1.0
      moduleUsed: 'Autonomous Core'
      features: ['Indépendance totale', 'Conscience évoluée', 'Apprentissage autonome']
    };

    setConversation([welcomeMessage]);

    // Simulation des métriques en temps réel
    const metricsInterval = setInterval(() => {
      setAutonomyMetrics(prev => ({
        autonomyLevel: Math.min(95, prev.autonomyLevel + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 2 - 1)
        consciousnessLevel: Math.min(95, prev.consciousnessLevel + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 3 - 1.5)
        learningProgress: Math.min(100, prev.learningProgress + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 1.5)
        creativityIndex: Math.min(98, prev.creativityIndex + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 2 - 1)
        independenceScore: Math.min(98, prev.independenceScore + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 1 - 0.5)
      }));
    }, 3000);

    return () => clearInterval(metricsInterval);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user'
      content: message
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8083/api/ai/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
        }
        body: JSON.stringify({
          message: message
          type: 'chat'
          model: STR_ALEX
          context: {
            demoMode: true
            autonomyTest: true
            conversationHistory: conversation.slice(-5)
          }
        })
      });

      const data = await response.json();

      if (data.success !== false) {
        let alexResponse;

        try {
          const parsedResponse = JSON.parse(data.response);
          alexResponse = {
            type: STR_ALEX
            content: parsedResponse.content
            timestamp: new Date()
            autonomyLevel: parsedResponse.autonomyLevel || 0.9
            confidence: parsedResponse.confidence || 0.9
            moduleUsed: parsedResponse.module || 'Autonomous Universal Companion'
            cognitiveInsights: parsedResponse.cognitiveInsights || []
            selfReflection: parsedResponse.selfReflection || null
            learningProgress: parsedResponse.learningProgress || null
          };
        } catch {
          alexResponse = {
            type: STR_ALEX
            content: data.response || "Ma réflexion autonome génère une réponse personnalisée..."
            timestamp: new Date()
            autonomyLevel: 0.85
            confidence: 0.8
            moduleUsed: 'Autonomous Core'
          };
        }

        setTimeout(() => {
          setConversation(prev => [...prev, alexResponse]);
        }, 1000);
      }
    } catch (error) {
      // Logger fallback - ignore error
    };
      setConversation(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    setMessage(testMessages[feature] || 'Test autonomie');
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="alex-autonomy-demo">
      {/* Header avec métriques d'autonomie */}
      <motion.div
        className="autonomy-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="alex-status-panel">
          <h1>🚀 Alex Universal Companion 6.0 - AUTONOME</h1>
          <div className="status-badge autonomous">
            <span className="pulse-dot"></span>
            SYSTÈME AUTONOME ACTIF
          </div>
        </div>

        <div className="autonomy-metrics">
          <div className=STR_METRIC_CARD>
            <div className=STR_METRIC_VALUE>{Math.round(autonomyMetrics.autonomyLevel)}%</div>
            <div className=STR_METRIC_LABEL>🎯 Autonomie</div>
            <div className=STR_METRIC_BAR>
              <div
                className="metric-fill autonomy"
                style={{ width: `${autonomyMetrics.autonomyLevel}%` }}
              ></div>
            </div>
          </div>

          <div className=STR_METRIC_CARD>
            <div className=STR_METRIC_VALUE>{Math.round(autonomyMetrics.consciousnessLevel)}%</div>
            <div className=STR_METRIC_LABEL>✨ Conscience</div>
            <div className=STR_METRIC_BAR>
              <div
                className="metric-fill consciousness"
                style={{ width: `${autonomyMetrics.consciousnessLevel}%` }}
              ></div>
            </div>
          </div>

          <div className=STR_METRIC_CARD>
            <div className=STR_METRIC_VALUE>{Math.round(autonomyMetrics.learningProgress)}%</div>
            <div className=STR_METRIC_LABEL>🎓 Apprentissage</div>
            <div className=STR_METRIC_BAR>
              <div
                className="metric-fill learning"
                style={{ width: `${autonomyMetrics.learningProgress}%` }}
              ></div>
            </div>
          </div>

          <div className=STR_METRIC_CARD>
            <div className=STR_METRIC_VALUE>{Math.round(autonomyMetrics.creativityIndex)}%</div>
            <div className=STR_METRIC_LABEL>🎨 Créativité</div>
            <div className=STR_METRIC_BAR>
              <div
                className="metric-fill creativity"
                style={{ width: `${autonomyMetrics.creativityIndex}%` }}
              ></div>
            </div>
          </div>

          <div className=STR_METRIC_CARD>
            <div className=STR_METRIC_VALUE>{Math.round(autonomyMetrics.independenceScore)}%</div>
            <div className=STR_METRIC_LABEL>🔥 Indépendance</div>
            <div className=STR_METRIC_BAR>
              <div
                className="metric-fill independence"
                style={{ width: `${autonomyMetrics.independenceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Système de modules autonomes */}
      <div className="autonomy-modules">
        <h3>🧠 Modules Autonomes Actifs</h3>
        <div className="modules-grid">
          <div className={`module-status ${systemStatus.alexKernel}`}>
            <span className=STR_MODULE_ICON>🔥</span>
            <span className=STR_MODULE_NAME>AlexKernel</span>
            <span className=STR_MODULE_STATE>{systemStatus.alexKernel}</span>
          </div>
          <div className={`module-status ${systemStatus.autonomyCore}`}>
            <span className=STR_MODULE_ICON>🎯</span>
            <span className=STR_MODULE_NAME>AutonomyCore</span>
            <span className=STR_MODULE_STATE>{systemStatus.autonomyCore}</span>
          </div>
          <div className={`module-status ${systemStatus.selfReflection}`}>
            <span className=STR_MODULE_ICON>🪞</span>
            <span className=STR_MODULE_NAME>SelfReflection</span>
            <span className=STR_MODULE_STATE>{systemStatus.selfReflection}</span>
          </div>
          <div className={`module-status ${systemStatus.localTrainer}`}>
            <span className=STR_MODULE_ICON>🎓</span>
            <span className=STR_MODULE_NAME>LocalTrainer</span>
            <span className=STR_MODULE_STATE>{systemStatus.localTrainer}</span>
          </div>
          <div className="module-status online">
            <span className=STR_MODULE_ICON>✨</span>
            <span className=STR_MODULE_NAME>Conscience</span>
            <span className=STR_MODULE_STATE>{systemStatus.consciousnessModules} modules</span>
          </div>
        </div>
      </div>

      {/* Tests d'autonomie rapides */}
      <div className="autonomy-tests">
        <h3>⚡ Tests d'Autonomie Rapides</h3>
        <div className="test-buttons">
          <button
            className="test-btn independent-thinking"
            onClick={() => testAutonomyFeature('independent_thinking')}
          >
            🧠 Pensée Indépendante
          </button>
          <button
            className="test-btn self-reflection"
            onClick={() => testAutonomyFeature('self_reflection')}
          >
            🪞 Auto-Réflexion
          </button>
          <button
            className="test-btn local-learning"
            onClick={() => testAutonomyFeature('local_learning')}
          >
            🎓 Apprentissage Local
          </button>
          <button
            className="test-btn creative-autonomy"
            onClick={() => testAutonomyFeature('creative_autonomy')}
          >
            🎨 Créativité Autonome
          </button>
          <button
            className="test-btn consciousness"
            onClick={() => testAutonomyFeature('consciousness_demo')}
          >
            ✨ Conscience Multidimensionnelle
          </button>
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="conversation-area">
        {conversation.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="message-content">
              {msg.type === STR_ALEX && (
                <div className="alex-message-header">
                  <div className="alex-identity">
                    <span className="alex-avatar">🤖</span>
                    <span className="alex-name">Alex Universal Companion 6.0</span>
                    <span className="autonomy-badge">AUTONOME</span>
                  </div>

                  <div className="message-metrics">
                    {msg.autonomyLevel && (
                      <span className="metric-badge autonomy">
                        🎯 {Math.round(msg.autonomyLevel * 100)}% autonome
                      </span>
                    )}
                    {msg.confidence && (
                      <span className="metric-badge confidence">
                        📈 {Math.round(msg.confidence * 100)}% confiance
                      </span>
                    )}
                    {msg.moduleUsed && (
                      <span className="metric-badge module">
                        🧠 {msg.moduleUsed}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="message-text">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {msg.type === STR_ALEX && (msg.cognitiveInsights || msg.selfReflection || msg.learningProgress) && (
                <div className="alex-insights">
                  {msg.cognitiveInsights && msg.cognitiveInsights.length > 0 && (
                    <div className=STR_INSIGHT_SECTION>
                      <h4>💡 Insights Cognitifs</h4>
                      {msg.cognitiveInsights.map((insight, i) => (
                        <div key={i} className="insight-item">
                          <span className="insight-type">{insight.type}</span>
                          <span className="insight-content">{insight.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.selfReflection && (
                    <div className=STR_INSIGHT_SECTION>
                      <h4>🪞 Auto-Réflexion</h4>
                      <p className="reflection-content">{msg.selfReflection}</p>
                    </div>
                  )}

                  {msg.learningProgress && (
                    <div className=STR_INSIGHT_SECTION>
                      <h4>🎓 Progrès d'Apprentissage</h4>
                      <p className="learning-content">{msg.learningProgress}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            className="message alex loading-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="message-content">
              <div className="alex-message-header">
                <span className="alex-name">Alex - Réflexion Autonome</span>
              </div>
              <div className="thinking-indicator">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="thinking-text">
                  Mon cerveau autonome traite votre demande..
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Testez l'autonomie d'Alex... Posez n'importe quelle question !"
            disabled={loading}
            className="message-input"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="send-button autonomous"
          >
            {loading ? (
              <div className="loading-spinner">⏳</div>
            ) : (
              <span>🚀 Envoyer</span>
            )}
          </button>
        </div>

        <div className="demo-info">
          <div className="demo-stats">
            💬 Conversation autonome active • 🧠 Pensée indépendante • 🎯 0% dépendance APIs externes
          </div>
          <div className="version-info">
            Alex Universal Companion 6.0 - Système Complètement Autonome
          </div>
        </div>
      </div>

      <style jsx>{`
        .alex-autonomy-demo {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
          color: white;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .autonomy-header {
          padding: 20px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
          border-bottom: 3px solid #333;
        }

        .alex-status-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .alex-status-panel h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .status-badge.autonomous {
          background: linear-gradient(45deg, #00ff88, #00cc6a);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0,255,136,0.3);
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .autonomy-metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
        }

        .metric-card {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .metric-value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .metric-label {
          font-size: 0.85rem;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .metric-bar {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        .metric-fill.autonomy { background: linear-gradient(90deg, #ff6b6b, #ff8e8e); }
        .metric-fill.consciousness { background: linear-gradient(90deg, #4ecdc4, #6ee3d9); }
        .metric-fill.learning { background: linear-gradient(90deg, #45b7d1, #6cc7e0); }
        .metric-fill.creativity { background: linear-gradient(90deg, #96ceb4, #a8d8c0); }
        .metric-fill.independence { background: linear-gradient(90deg, #feca57, #fee089); }

        .autonomy-modules {
          padding: 20px;
          border-bottom: 1px solid #333;
        }

        .autonomy-modules h3 {
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .module-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid;
        }

        .module-status.online { border-color: #00ff88; background: rgba(0,255,136,0.1); }
        .module-status.active { border-color: #45b7d1; background: rgba(69,183,209,0.1); }
        .module-status.thinking { border-color: #feca57; background: rgba(254,202,87,0.1); }
        .module-status.learning { border-color: #ff6b6b; background: rgba(255,107,107,0.1); }

        .module-icon { font-size: 1.5rem; margin-bottom: 5px; }
        .module-name { font-size: 0.8rem; font-weight: 600; }
        .module-state { font-size: 0.7rem; opacity: 0.8; margin-top: 2px; }

        .autonomy-tests {
          padding: 20px;
          border-bottom: 1px solid #333;
        }

        .autonomy-tests h3 {
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .test-buttons {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .test-btn {
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .test-btn.independent-thinking { background: linear-gradient(135deg, #667eea, #764ba2); }
        .test-btn.self-reflection { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .test-btn.local-learning { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .test-btn.creative-autonomy { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        .test-btn.consciousness { background: linear-gradient(135deg, #fa709a, #fee140); }

        .test-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .conversation-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          max-height: 60vh;
        }

        .message {
          margin-bottom: 20px;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea, #764ba2);
          margin-left: 20%;
          border-radius: 18px 18px 5px 18px;
        }

        .message.alex .message-content {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          margin-right: 20%;
          border-radius: 18px 18px 18px 5px;
        }

        .message-content {
          padding: 15px 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .alex-message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .alex-identity {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alex-avatar {
          font-size: 1.2rem;
        }

        .alex-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .autonomy-badge {
          background: rgba(255,255,255,0.2);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .message-metrics {
          display: flex;
          gap: 8px;
        }

        .metric-badge {
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .metric-badge.autonomy { background: rgba(255,107,107,0.3); }
        .metric-badge.confidence { background: rgba(69,183,209,0.3); }
        .metric-badge.module { background: rgba(150,206,180,0.3); }

        .message-text p {
          margin: 5px 0;
          line-height: 1.5;
        }

        .alex-insights {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.2);
        }

        .insight-section {
          margin-bottom: 10px;
        }

        .insight-section h4 {
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .insight-item {
          display: flex;
          gap: 10px;
          margin-bottom: 5px;
          font-size: 0.8rem;
        }

        .insight-type {
          font-weight: 600;
          opacity: 0.8;
        }

        .thinking-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .thinking-dots {
          display: flex;
          gap: 4px;
        }

        .thinking-dots span {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: bounce 1.4s infinite;
        }

        .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 1; }
          30% { transform: translateY(-10px); opacity: 0.7; }
        }

        .input-area {
          padding: 20px;
          background: rgba(0,0,0,0.3);
          border-top: 1px solid #333;
        }

        .input-container {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
        }

        .message-input {
          flex: 1;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #444;
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 1rem;
          resize: none;
        }

        .message-input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .send-button.autonomous {
          padding: 15px 25px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .send-button.autonomous:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255,107,107,0.4);
        }

        .demo-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .message-time {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .autonomy-metrics
          .modules-grid
          .test-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .message.user .message-content
          .message.alex .message-content {
            margin-left: 5%;
            margin-right: 5%;
          }
        }
      `}</style>
    </div>
  );
};

export default AlexAutonomyDemo;
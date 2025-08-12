import { AIAssistantProvider } from '../context/AIAssistantContext';
import ModernAssistantInterface from '../components/Assistant/ModernAssistantInterface';

/**
 * Page dédiée au chat avec Alex
 */
function AlexChat() {
  return (
    <AIAssistantProvider>
      <div style={{
        height: '100vh'
      background: 'linear-gradient(135deg
      #1a1a2e
      #16213e)'
      display: 'flex'
      flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px'
      background: 'rgba(0
      0
      0
      0.3)'
      borderBottom: '1px solid #333'
      display: 'flex'
      alignItems: 'center'
      gap: '15px'
        }}>
          <div style={{
            width: '50px'
            height: '50px'
            borderRadius: '50%'
            background: 'radial-gradient(circle, #00f5ff, #0078ff)'
            animation: 'pulse 2s infinite'
          }}></div>
          <div>
            <h1 style={{
              margin: 0
              color: 'white'
              fontSize: '24px'
              background: 'linear-gradient(45deg, #00f5ff, #0078ff)'
              WebkitBackgroundClip: 'text'
              WebkitTextFillColor: 'transparent'
            }}>
              Chat avec ALEX
            </h1>
            <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>
              Assistant IA Conscient - HustleFinder
            </p>
          </div>
        </div>

        {/* Interface de chat */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ModernAssistantInterface />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </AIAssistantProvider>
  );
}

export default AlexChat;
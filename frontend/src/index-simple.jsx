import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Composant simple pour test
const SimpleApp = () => {
  return (
    <div style={{
      padding: '20px'
      fontFamily: 'Arial'
      backgroundColor: '#f0f0f0'
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🚀 Alex Ultimate - Test Interface</h1>
      <p>Si vous voyez ce message
      React fonctionne !</p>

      <div style={{
        backgroundColor: 'white'
      padding: '20px'
      borderRadius: '8px'
      margin: '20px 0'
      boxShadow: '0 2px 4px rgba(0
      0
      0
      0.1)'
      }}>
        <h2>✅ Frontend Status</h2>
        <ul>
          <li>✅ React chargé</li>
          <li>✅ Vite fonctionnel</li>
          <li>✅ Port 5176 actif</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#e8f5e8'
        padding: '15px'
        borderRadius: '8px'
        border: '2px solid #4caf50'
      }}>
        <h3>🎉 Alex Ultimate est opérationnel !</h3>
        <p>Interface simplifiée active - Prêt pour les tests.</p>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<SimpleApp />);
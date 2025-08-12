import React from 'react';
import ReactDOM from 'react-dom/client';
import RealAlexInterface from './components/Alex/RealAlexInterface.jsx';
import './index.css';

// Point d'entrée pour la VRAIE interface Alex Ultimate
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RealAlexInterface />
  </React.StrictMode>
);

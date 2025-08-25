import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import AlexUltimateInterface from './components/Alex/AlexUltimateInterface.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setUser({
      id: '1',
      name: 'Zakaria Housni',
      email: 'zakaria@hustlefinder.com'
    });
  };

  const handleSignup = () => {
    console.log('Inscription demandée');
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Layout 
      user={user}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onLogout={handleLogout}
    >
      <AlexUltimateInterface />
    </Layout>
  );
}

export default App;
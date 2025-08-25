import React, { useState } from 'react';
import Header from './Header';
import ModernSidebar from './ModernSidebar';
import './Layout.css';

const Layout = ({ children, user, onLogin, onSignup, onLogout }) => {
  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'Comment créer une application React',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      type: 'chat'
    },
    {
      id: '2', 
      title: 'Génération d\'image avec DALL-E',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      type: 'image'
    }
  ]);
  
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'chat'
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  return (
    <div className="app-layout">
      <Header 
        user={user}
        onLogin={onLogin}
        onSignup={onSignup}
        onLogout={onLogout}
      />
      
      <div className="layout-main">
        <ModernSidebar
          isOpen={!isCollapsed}
          onClose={() => setIsCollapsed(true)}
          currentUser={user}
        />
        
        <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ conversations = [], currentConversation, onSelectConversation, onNewChat, onDeleteConversation, isCollapsed, onToggleCollapse }) => {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header de la sidebar */}
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Nouvelle conversation</span>}
        </button>
        
        <button 
          className="collapse-btn"
          onClick={onToggleCollapse}
        >
          <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Liste des conversations */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            {!isCollapsed && (
              <p>Aucune conversation pour le moment</p>
            )}
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-content">
                <div className="conversation-icon">
                  {conversation.type === 'image' ? (
                    <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="conversation-text">
                    <div className="conversation-title">
                      {truncateTitle(conversation.title || 'Nouvelle conversation')}
                    </div>
                    <div className="conversation-date">
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && onDeleteConversation && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer de la sidebar */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="upgrade-prompt">
            <div className="upgrade-icon">⭐</div>
            <div className="upgrade-text">
              <div>Passez à Alex Pro</div>
              <div className="upgrade-subtitle">Plus rapide, plus intelligent</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
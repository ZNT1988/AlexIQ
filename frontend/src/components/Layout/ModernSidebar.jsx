import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import paymentService, { PLANS } from '../../services/paymentService';

const ModernSidebar = ({ isOpen, onClose, currentUser }) => {
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadCurrentPlan();
    }
  }, [currentUser]);

  const loadCurrentPlan = async () => {
    try {
      const planData = await paymentService.getCurrentPlan(currentUser?.id);
      setCurrentPlan(planData.plan.id);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const mainMenuItems = [
    {
      icon: '💬',
      label: 'Chat avec Alex',
      path: '/chat',
      description: 'Conversation avec l\'IA Alex'
    },
    {
      icon: '🎨',
      label: 'Génération d\'images',
      path: '/images',
      description: 'DALL-E et création visuelle',
      proOnly: currentPlan === 'free'
    },
    {
      icon: '📊',
      label: 'Analytics Business',
      path: '/analytics',
      description: 'Analyses et insights',
      proOnly: true
    },
    {
      icon: '🗺️',
      label: 'Maps & Géolocation',
      path: '/maps',
      description: 'Recherche et géocodage'
    },
    {
      icon: '📋',
      label: 'Gestion de projets',
      path: '/projects',
      description: 'Suivi et organisation',
      proOnly: true
    }
  ];

  const alexModules = [
    {
      icon: '🧠',
      label: 'Intelligence Core',
      path: '/alex/intelligence',
      description: 'Module d\'intelligence avancée',
      proOnly: true
    },
    {
      icon: '🔮',
      label: 'Consciousness',
      path: '/alex/consciousness',
      description: 'Modules de conscience IA',
      businessOnly: true
    },
    {
      icon: '⚡',
      label: 'Specialized',
      path: '/alex/specialized',
      description: 'Modules spécialisés',
      proOnly: true
    },
    {
      icon: '🏗️',
      label: 'Alex Core',
      path: '/alex/core',
      description: 'Noyau système Alex',
      businessOnly: true
    }
  ];

  const MenuItem = ({ item, isActive, onClick }) => {
    const needsUpgrade = (item.proOnly && currentPlan === 'free') || 
                        (item.businessOnly && currentPlan !== 'business');
    
    return (
      <div
        onClick={() => needsUpgrade ? setShowUpgradeModal(true) : onClick()}
        className={`
          group relative flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200
          ${isActive 
            ? 'bg-blue-100 text-blue-900 font-medium' 
            : needsUpgrade
            ? 'text-gray-400 hover:text-gray-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        <span className="text-lg mr-3">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="truncate">{item.label}</span>
            {needsUpgrade && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {item.businessOnly ? 'Business' : 'Pro'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        </div>
      </div>
    );
  };

  const PlanBadge = () => {
    const plan = PLANS[currentPlan.toUpperCase()];
    return (
      <div className="mx-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{plan.name}</p>
            <p className="text-xs text-gray-600">{paymentService.formatPrice(plan)}</p>
          </div>
          {currentPlan === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full hover:shadow-md transition-all"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
              <span className="block w-full h-full text-white text-lg font-bold flex items-center justify-center">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">AlexIQ</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plan Badge */}
        <div className="py-4">
          <PlanBadge />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-6 overflow-y-auto">
          {/* Menu principal */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu principal
            </h3>
            <div className="space-y-1">
              {mainMenuItems.map((item) => (
                <MenuItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => {
                    // Navigation logic here
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Modules Alex */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Modules Alex
            </h3>
            <div className="space-y-1">
              {alexModules.map((item) => (
                <MenuItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => {
                    // Navigation logic here
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions rapides
            </h3>
            <div className="space-y-1">
              <MenuItem
                item={{
                  icon: '📤',
                  label: 'Exporter conversations',
                  description: 'Télécharger historique'
                }}
                onClick={() => {}}
              />
              <MenuItem
                item={{
                  icon: '⚙️',
                  label: 'Paramètres',
                  description: 'Configuration compte'
                }}
                onClick={() => {}}
              />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {currentUser ? (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3">
                <span className="block w-full h-full text-gray-600 text-sm font-medium flex items-center justify-center">
                  {currentUser.name?.[0] || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email || 'user@example.com'}
                </p>
              </div>
            </div>
          ) : (
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Se connecter
            </button>
          )}
        </div>
      </div>

      {/* Modal d'upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Upgrade vers Pro</h2>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Débloquez tous les modules Alex et fonctionnalités avancées avec AlexIQ Pro.
              </p>
              {/* Ici on pourrait intégrer le composant PricingPlans */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Plus tard
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upgrade maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModernSidebar;
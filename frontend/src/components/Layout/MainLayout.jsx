import React, { useState, useEffect } from 'react';
import { User, Menu, X, Settings, CreditCard, BarChart3, Bot, Home, MessageSquare, Users, Crown, Star } from 'lucide-react';

const MainLayout = ({ children, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Récupérer le statut du système
    fetch('/api/whoami')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(console.error);
  }, []);

  const navigation = [
    { name: 'Accueil', href: '/', icon: Home, current: false },
    { name: 'Chat Alex', href: '/chat', icon: MessageSquare, current: true },
    { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3, current: false },
    { name: 'Communauté', href: '/community', icon: Users, current: false },
    { name: 'Paramètres', href: '/settings', icon: Settings, current: false },
  ];

  const subscriptionPlans = [
    { name: 'Gratuit', price: '0€', features: ['5 conversations/jour', 'Alex basique'], current: !currentUser?.isPro },
    { name: 'Pro', price: '19€/mois', features: ['Conversations illimitées', 'Alex avancé', 'Support prioritaire'], current: currentUser?.isPro },
    { name: 'Enterprise', price: 'Sur devis', features: ['API privée', 'Alex personnalisé', 'Support dédié'], current: false }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 lg:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HustleFinder IA</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <SidebarContent navigation={navigation} currentUser={currentUser} systemStatus={systemStatus} subscriptionPlans={subscriptionPlans} />
          </div>
        </nav>
      </div>

      {/* Sidebar desktop */}
      <nav className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4 py-4 border-b">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">HustleFinder IA</span>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <SidebarContent navigation={navigation} currentUser={currentUser} systemStatus={systemStatus} subscriptionPlans={subscriptionPlans} />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {systemStatus?.creator && `Salut ${systemStatus.creator.split(' ')[0]} !`}
              </h1>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  Object.values(systemStatus?.providers || {}).some(Boolean) ? 'bg-green-500' : 'bg-red-500'
                }`} />
                Alex est {Object.values(systemStatus?.providers || {}).some(Boolean) ? 'en ligne' : 'hors ligne'}
              </div>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {currentUser.isPro && <Crown className="h-4 w-4 text-yellow-500 mr-1" />}
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Connexion
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Inscription
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, currentUser, systemStatus, subscriptionPlans }) => {
  return (
    <>
      {/* Navigation */}
      <div className="flex flex-col px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`${
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* System status */}
      {systemStatus && (
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Statut Système</div>
          <div className="space-y-2">
            <div className="text-sm text-gray-700">
              <strong>Créateur:</strong> {systemStatus.creator}
            </div>
            <div className="text-sm">
              <strong>Providers:</strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(systemStatus.providers).map(([provider, active]) => (
                  <span
                    key={provider}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    {active && <div className="ml-1 w-2 h-2 bg-green-500 rounded-full" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription plans */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Abonnements</div>
        <div className="space-y-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`p-3 rounded-lg border-2 ${
                plan.current
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                  {plan.current && <Star className="ml-2 h-4 w-4 text-blue-500 fill-current" />}
                </div>
                <div className="text-sm font-bold text-gray-900">{plan.price}</div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {plan.features.map((feature, index) => (
                  <div key={index}>• {feature}</div>
                ))}
              </div>
              {!plan.current && (
                <button className="mt-2 w-full px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                  Choisir ce plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-3 py-4 border-t border-gray-200 mt-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Vos Stats</div>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Conversations:</span>
            <span className="font-medium">{currentUser?.conversationCount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Niveau Alex:</span>
            <span className="font-medium">{currentUser?.alexLevel || 'Apprenti'}%</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
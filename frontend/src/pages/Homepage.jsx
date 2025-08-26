import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChatBubbleLeftRightIcon, 
  PhotoIcon, 
  MapPinIcon,
  CpuChipIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Homepage = () => {
  const { t } = useTranslation();

  const modules = [
    {
      name: 'Chat Intelligence',
      description: 'Conversation avec OpenAI, Anthropic et Gemini',
      icon: ChatBubbleLeftRightIcon,
      status: 'active',
      path: '/chat'
    },
    {
      name: 'Génération Images',
      description: 'Création images avec DALL-E',
      icon: PhotoIcon,
      status: 'active',
      path: '/chat'
    },
    {
      name: 'Maps Integration',
      description: 'Recherche et géocodage Google Maps',
      icon: MapPinIcon,
      status: 'active',
      path: '/chat'
    },
    {
      name: 'Business Builder AI',
      description: 'Génération d\'idées business intelligentes',
      icon: CpuChipIcon,
      status: 'pending',
      path: '/dashboard'
    },
    {
      name: 'Analytics Engine',
      description: 'Analyse de données et insights',
      icon: ChartBarIcon,
      status: 'pending',
      path: '/dashboard'
    },
    {
      name: 'Automation Core',
      description: 'Automatisation des tâches complexes',
      icon: CogIcon,
      status: 'pending',
      path: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6">
                <CpuChipIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Alex<span className="text-blue-600">IQ</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Intelligence Artificielle Authentique pour HustleFinder
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Commencer maintenant
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Modules Intelligents
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            127 modules d'intelligence artificielle développés pour automatiser et optimiser vos processus
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    module.status === 'active' 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    <module.icon className={`w-6 h-6 ${
                      module.status === 'active' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  module.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {module.status === 'active' ? 'Actif' : 'Bientôt'}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <Link
                to={module.path}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
              >
                {module.status === 'active' ? 'Utiliser →' : 'Prochainement →'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">127+</div>
              <div className="text-gray-300">Modules IA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">3</div>
              <div className="text-gray-300">APIs Actives</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Disponibilité</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à révolutionner votre productivité ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez les entrepreneurs qui utilisent déjà AlexIQ pour automatiser leurs processus
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
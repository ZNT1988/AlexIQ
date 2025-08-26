
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  MapPinIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalModules: 127,
    activeModules: 3,
    pendingModules: 124,
    apiCalls: 0,
    uptime: '99.9%'
  });

  const activeModules = [
    {
      name: 'Chat Intelligence',
      status: 'online',
      provider: 'OpenAI + Anthropic + Gemini',
      icon: ChatBubbleLeftRightIcon
    },
    {
      name: 'Image Generation',
      status: 'online', 
      provider: 'DALL-E',
      icon: PhotoIcon
    },
    {
      name: 'Maps Integration',
      status: 'online',
      provider: 'Google Maps',
      icon: MapPinIcon
    }
  ];

  const pendingModules = [
    'BusinessBuilderAI', 'AlexHyperIntelligence', 'MemoryProcessor',
    'CreativeGenius', 'MarketAnalyzer', 'DecisionEngine'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              127 modules détectés mais non connectés
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Vos modules backend sont prêts mais ne sont pas encore intégrés au serveur de production.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CogIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modules Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibilité</p>
              <p className="text-2xl font-bold text-purple-600">{stats.uptime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Modules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Modules Actifs</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activeModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <module.icon className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-600">{module.provider}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ● En ligne
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Modules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Modules en Attente de Connexion</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pendingModules.map((module, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
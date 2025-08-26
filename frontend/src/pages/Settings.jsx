import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    language: i18n.language,
    notifications: true,
    darkMode: false,
    autoSave: true
  });

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setSettings({ ...settings, language: lang });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h2>
          
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notifications
                </label>
                <p className="text-sm text-gray-500">Recevoir les alertes système</p>
              </div>
              <button
                onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name || 'Non défini'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'Non défini'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
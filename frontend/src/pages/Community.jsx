import React from 'react';
import { useTranslation } from 'react-i18next';

const Community = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Communauté</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Fonctionnalité en développement
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>La section communauté sera bientôt disponible avec forums, partage d'expériences et collaboration entre utilisateurs AlexIQ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
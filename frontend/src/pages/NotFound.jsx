import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="text-9xl mb-4">🤖</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page non trouvée</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Même Alex ne peut pas trouver cette page ! Elle a peut-être été déplacée, supprimée, ou n'a jamais existé.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/chat"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Chat
          </Link>
          
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Accueil
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/images" className="text-blue-600 hover:text-blue-800">
              Images
            </Link>
            <span className="text-gray-400">•</span>
            <a href="mailto:support@alexiq.site" className="text-blue-600 hover:text-blue-800">
              Support
            </a>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Si vous pensez que c'est une erreur, contactez notre équipe support.
          </p>
          <a
            href="mailto:support@alexiq.site"
            className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Signaler le problème
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
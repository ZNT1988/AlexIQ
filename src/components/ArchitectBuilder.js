import React, { useState } from 'react';
import { Building, Layers, Ruler, PaintBucket, AlertCircle } from 'lucide-react';

const ArchitectBuilder = () => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleGenerateProject = async () => {
    if (!projectName || !projectType || !requirements) {
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Projet architectural: ${projectName}. Type: ${projectType}. Exigences: ${requirements}. Merci de fournir des conseils architecturaux.`
        })
      });

      const data = await response.json();
      
      if (data.output) {
        // Display result in a modal or new section
        alert(`Conseil architectural:\n\n${data.output}`);
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const projectTypes = [
    'Résidentiel',
    'Commercial',
    'Industriel',
    'Culturel',
    'Éducatif',
    'Santé',
    'Transport',
    'Autre'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <Building className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Architecte Assistant</h1>
            <p className="text-gray-600">Assistant IA pour projets architecturaux</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du projet
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Entrez le nom de votre projet"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de projet
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exigences et contraintes
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Décrivez vos besoins, contraintes budgétaires, contraintes de terrain, style souhaité..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateProject}
              disabled={!projectName || !projectType || !requirements}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Générer conseils architecturaux
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Layers className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-blue-800">Fonctionnalités</h3>
              </div>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Conseils architecturaux personnalisés</li>
                <li>• Suggestions de design</li>
                <li>• Recommandations de matériaux</li>
                <li>• Optimisation d'espace</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Ruler className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-green-800">Planification</h3>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Analyse des besoins</li>
                <li>• Estimation budgétaire</li>
                <li>• Calendrier de projet</li>
                <li>• Conformité réglementaire</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-yellow-800">Note Importante</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Cet assistant fournit des conseils généraux. Pour des projets réels, 
                consultez toujours un architecte professionnel qualifié.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectBuilder;
import React, { useState } from 'react';

const Images = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          size: '1024x1024',
          style: 'vivid'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la génération');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Génération d'images</h1>
          <p className="text-gray-600">Créez des images uniques avec DALL-E et Alex</p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Décrivez l'image que vous voulez créer
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Un chat astronaute flottant dans l'espace avec des étoiles colorées en arrière-plan"
            className="w-full h-24 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {prompt.length}/500 caractères
            </span>
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Génération...' : 'Générer l\'image'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Alex crée votre image...</p>
            <p className="text-sm text-gray-500 mt-2">Cela peut prendre 10-30 secondes</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={generatedImage.imageUrl}
                alt={generatedImage.prompt}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Détails de l'image</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Prompt:</strong> {generatedImage.prompt}</p>
                <p><strong>Taille:</strong> {generatedImage.size}</p>
                <p><strong>Style:</strong> {generatedImage.style}</p>
                <p><strong>Provider:</strong> {generatedImage.provider}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <a
                  href={generatedImage.imageUrl}
                  download={`alex-generated-${Date.now()}.png`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  Télécharger
                </a>
                <button
                  onClick={() => setGeneratedImage(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  Nouvelle image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        {!loading && !generatedImage && !error && (
          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-4">Exemples de prompts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Un paysage cyberpunk avec des néons violets et des gratte-ciels futuristes",
                "Un portrait de robot élégant dans un style art nouveau",
                "Une forêt magique avec des champignons lumineux et des particules dorées",
                "Un café parisien sous la pluie avec des reflets sur le pavé mouillé"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Images;
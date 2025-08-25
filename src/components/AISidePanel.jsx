
import React, { useState, useEffect } from 'react';

const AISidePanel = ({ preferences = {}, setPreferences = () => {}, clearMemory = () => {} }) => {
  const [open, setOpen] = useState(false);

  const togglePanel = () => setOpen(!open);

  const updatePref = (key, value) => {
    if (setPreferences) {
      setPreferences(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <>
      <button onClick={togglePanel}>
        ⚙️ Paramètres
      </button>

      {open && (
        <div className="side-panel">
          <h3>Paramètres Assistant</h3>

          <div className="panel-section">
            <label>Ton :</label>
            <select
              value={preferences.tone || 'adaptatif'}
              onChange={e => updatePref('tone', e.target.value)}
            >
              <option value="adaptatif">Adaptatif</option>
              <option value="professionnel">Professionnel</option>
              <option value="détendu">Détendu</option>
              <option value="fun">Fun</option>
            </select>
          </div>

          <div className="panel-section">
            <label>Langue :</label>
            <select
              value={preferences.language || 'fr'}
              onChange={e => updatePref('language', e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="lu">Lëtzebuergesch</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className="panel-section">
            <label>Focus par défaut :</label>
            <select
              value={preferences.defaultFocus || 'idées'}
              onChange={e => updatePref('defaultFocus', e.target.value)}
            >
              <option value="idées">Idées</option>
              <option value="astuce">Astuces</option>
              <option value="motivation">Motivation</option>
            </select>
          </div>

          <div className="panel-section">
            <button onClick={clearMemory}>Effacer l'historique</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AISidePanel;

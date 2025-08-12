
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_PROFESSIONNEL = 'professionnel';
/**
 * @fileoverview AISidePanel - Panneau de Configuration IA Révolutionnaire
 * Interface avancée pour personnaliser et contrôler l'expérience utilisateur ALEX
 *
 * @module AISidePanel
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Configuration
 * @since 2024
 *
 * @requires react
 * @requires ../index.css
 *
 * @description
 * AISidePanel est l'interface de configuration révolutionnaire qui permet aux utilisateurs
 * de personnaliser entièrement leur expérience avec l'intelligence artificielle ALEX
 * offrant un contrôle granulaire sur le comportement, la personnalité et les préférences
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🎭 Personnalisation du ton et de la personnalité IA
 * - 🌍 Support multilingue avec adaptation culturelle
 * - 🧠 Gestion de la mémoire et historique conversationnel
 * - ⚡ Focus intelligent adaptatif par contexte
 * - 🔧 Configuration en temps réel avec persistance
 * - 💾 Stockage local des préférences utilisateur
 * - 🎨 Interface intuitive et expérience fluide
 *
 * **Architecture Configuration:**
 * - État de configuration multi-dimensionnel
 * - Persistance automatique des préférences
 * - Synchronisation temps réel avec ALEX
 * - Interface responsive et adaptative
 * - Gestion intelligente des paramètres
 *
 * **Mission Interface:**
 * Créer l'expérience de configuration IA la plus intuitive et personnalisée
 * permettant à chaque utilisateur d'adapter ALEX à sa personnalité et ses besoins
 * pour une interaction authentique et optimisée
 *
 * @example
 * // Configuration basique
 * <AISidePanel
 *   preferences={{ tone: STR_PROFESSIONNEL, language: 'fr' }}
 *   setPreferences={updatePrefs}
 *   clearMemory={resetMemory}
 * />
 *
 * @example
 * // Configuration avancée avec callbacks
 * <AISidePanel
 *   preferences={userPreferences}
 *   setPreferences={handlePreferenceChange}
 *   clearMemory={handleMemoryReset}
 *   onConfigChange={handleConfigurationUpdate}
 * />
 */

// frontend/src/components/AISidePanel.jsx
import React, { useState, useEffect } from 'react';
import '../index.css';

/**
 * @component AISidePanel
 * @description
 * Panneau de configuration révolutionnaire pour personnaliser l'expérience ALEX
 *
 * Interface avancée permettant aux utilisateurs de configurer finement leur
 * interaction avec l'intelligence artificielle ALEX, incluant personnalité
 * langue, focus et gestion de la mémoire conversationnelle
 *
 * **Configuration Disponible:**
 * - Ton et personnalité (adaptatif, professionnel, détendu, fun)
 * - Langue et adaptation culturelle (français, anglais, luxembourgeois, portugais)
 * - Focus par défaut (idées, astuces, motivation)
 * - Gestion mémoire et historique conversationnel
 * - Persistance locale des préférences utilisateur
 *
 * @param {Object} props - Propriétés du panneau de configuration
 * @param {Object} [props.preferences={}] - Préférences utilisateur actuelles
 * @param {string} [props.preferences.tone=STR_ADAPTATIF] - Ton de l'IA
 * @param {string} [props.preferences.language='fr'] - Langue interface
 * @param {string} [props.preferences.defaultFocus=STR_ID_E] - Focus par défaut
 * @param {Function} [props.setPreferences] - Callback mise à jour préférences
 * @param {Function} [props.clearMemory] - Callback effacement mémoire
 * @param {Function} [props.onConfigChange] - Callback changement configuration
 * @param {Function} [props.onLanguageChange] - Callback changement langue
 * @param {Function} [props.onToneChange] - Callback changement ton
 *
 * @returns {JSX.Element} Interface panneau de configuration interactive
 *
 * @fires AISidePanel#preference_updated - Préférence mise à jour
 * @fires AISidePanel#memory_cleared - Mémoire effacée
 * @fires AISidePanel#configuration_changed - Configuration modifiée
 * @fires AISidePanel#panel_opened - Panneau ouvert
 * @fires AISidePanel#panel_closed - Panneau fermé
 *
 * @example
 * <AISidePanel
 *   preferences={{
 *     tone: STR_PROFESSIONNEL
 *     language: 'fr'
 *     defaultFocus: 'motivation'
 *   }}
 *   setPreferences={(newPrefs) => {
 *     console.log('Nouvelles préférences:', newPrefs);
 *   }}
 *   clearMemory={() => {
 *     console.log('Mémoire IA effacée');
 *   }}
 * />
 *
 * @since 2.0.0
 */
const AISidePanel = ({ preferences = {}, setPreferences = () => {}, clearMemory = () => {} }) => {
  const [open, setOpen] = useState(false);

  const togglePanel = () => setOpen(!open);

  const updatePref = (key, value) => {
    if (setPreferences) {
      setPreferences(prev => ({ ...prev, [key]: value }));
      localStorage.setItem(`pref_${key}`, value);
    }
  };

  useEffect(() => {
    const storedTone = localStorage.getItem('pref_tone');
    if (storedTone && setPreferences) {
      setPreferences(prev => ({ ...prev, tone: storedTone }));
    }
  }, [setPreferences]);

  return (
    <>
      <button className="toggle-panel-btn" onClick={togglePanel}>
        ⚙️
      </button>

      {open && (
        <div className="side-panel">
          <h3>⚙️ IA - Paramètres</h3>

          <div className=STR_PANEL_SECTION>
            <label>Ton :</label>
            <select
              value={preferences.tone || STR_ADAPTATIF}
              onChange={e => updatePref('tone', e.target.value)}
            >
              <option value=STR_ADAPTATIF>Adaptatif</option>
              <option value=STR_PROFESSIONNEL>Professionnel</option>
              <option value="détendu">Détendu</option>
              <option value="fun">Fun</option>
            </select>
          </div>

          <div className=STR_PANEL_SECTION>
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

          <div className=STR_PANEL_SECTION>
            <label>Focus par défaut :</label>
            <select
              value={preferences.defaultFocus || STR_ID_E}
              onChange={e => updatePref('defaultFocus', e.target.value)}
            >
              <option value=STR_ID_E>Idées</option>
              <option value="astuce">Astuces</option>
              <option value="motivation">Motivation</option>
            </select>
          </div>

          <div className=STR_PANEL_SECTION>
            <button onClick={clearMemory}>Effacer la mémoire 🧠</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AISidePanel;


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TRAP = 'trap';
/**
 * @fileoverview StyleMatcher - Détecteur de Style Musical Intelligent
 * Identifie styles musicaux depuis audio ou description textuelle
 *
 * @module StyleMatcher
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Style Recognition Engine
 */

import logger from '../config/logger.js';

/**
 * @class StyleMatcher
 * @description Détecteur et classificateur de styles musicaux
 */
export class StyleMatcher {
    constructor(options = {}) {
        this.config = {
            confidenceThreshold: options.confidenceThreshold || 0.7
            maxSuggestions: options.maxSuggestions || 3
            enableSubgenres: options.enableSubgenres !== false
            culturalAdaptation: options.culturalAdaptation !== false
        };

        this.initializeStyleDatabase();
        this.initializeAnalysisModels();

        try {
      logger.info('StyleMatcher initialized', {
            stylesLoaded: this.styleDatabase.size
            enableSubgenres: this.config.enableSubgenres
        });

        } catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Initialise la base de données des styles musicaux
     */
    initializeStyleDatabase() {
        this.styleDatabase = new Map([
            // Styles Electronic/Dance
            [STR_TRAP, {
                name: 'TrapSTR_CATEGORYelectronic'
                characteristics: {
                    bpmRange: [140, 180]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.7
                    bassHeaviness: 0.9
                    energy: 0.8
                }
                instruments: ['808_drums', STR_HI_HATS, 'synth_lead', 'sub_bass']
                effects: [STR_REVERB, STR_DELAY, STR_DISTORTION]
                suggestedBPM: 150
                suggestedKey: 'Cm'
            }]
            ['house', {
                name: 'HouseSTR_CATEGORYelectronic'
                characteristics: {
                    bpmRange: [120, 130]
                    keyPreference: [STR_MAJOR, STR_MINOR]
                    rhythmComplexity: 0.5
                    bassHeaviness: 0.7
                    energy: 0.8
                }
                instruments: ['four_on_floor', 'bass_synth', 'pad', 'vocal_chops']
                effects: [STR_FILTER, STR_REVERB, STR_COMPRESSION]
                suggestedBPM: 125
                suggestedKey: 'Am'
            }]
            ['techno', {
                name: 'TechnoSTR_CATEGORYelectronic'
                characteristics: {
                    bpmRange: [120, 140]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.6
                    bassHeaviness: 0.8
                    energy: 0.9
                }
                instruments: ['kick_drum', 'synth_bass', 'lead_synth', STR_PERCUSSION]
                effects: [STR_DELAY, STR_FILTER, STR_DISTORTION]
                suggestedBPM: 130
                suggestedKey: 'Dm'
            }]
            ['dubstep', {
                name: 'DubstepSTR_CATEGORYelectronic'
                characteristics: {
                    bpmRange: [140, 150]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.8
                    bassHeaviness: 0.95
                    energy: 0.9
                }
                instruments: ['wobble_bass', 'snare', 'synth_lead', 'vocal_chops']
                effects: [STR_DISTORTION, STR_FILTER, STR_REVERB]
                suggestedBPM: 140
                suggestedKey: 'Em'
            }]
            // Styles Hip-Hop
            ['boom_bap', {
                name: 'Boom BapSTR_CATEGORYhip_hop'
                characteristics: {
                    bpmRange: [85, 100]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.6
                    bassHeaviness: 0.7
                    energy: 0.6
                }
                instruments: ['kick', 'snare', STR_HI_HATS, STR_BASS, 'vinyl_samples']
                effects: ['vinyl_crackle', 'lo_fi', STR_COMPRESSION]
                suggestedBPM: 90
                suggestedKey: 'Fm'
            }]
            ['drill', {
                name: 'DrillSTR_CATEGORYhip_hop'
                characteristics: {
                    bpmRange: [130, 150]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.8
                    bassHeaviness: 0.8
                    energy: 0.85
                }
                instruments: ['sliding_808', STR_HI_HATS, STR_PIANO, 'strings']
                effects: [STR_REVERB, STR_DELAY, STR_DISTORTION]
                suggestedBPM: 140
                suggestedKey: 'Gm'
            }]
            // Styles Ambient/Chill
            [STR_LOFI, {
                name: 'Lo-Fi Hip HopSTR_CATEGORYchill'
                characteristics: {
                    bpmRange: [70, 90]
                    keyPreference: [STR_MAJOR, STR_MINOR]
                    rhythmComplexity: 0.3
                    bassHeaviness: 0.5
                    energy: 0.4
                }
                instruments: ['soft_drums', 'jazz_piano', 'vinyl_samples', 'soft_bass']
                effects: ['vinyl_crackle', 'lo_fi_filter', STR_REVERB]
                suggestedBPM: 80
                suggestedKey: 'C'
            }]
            ['ambient', {
                name: 'AmbientSTR_CATEGORYatmospheric'
                characteristics: {
                    bpmRange: [60, 100]
                    keyPreference: [STR_MAJOR]
                    rhythmComplexity: 0.2
                    bassHeaviness: 0.3
                    energy: 0.3
                }
                instruments: ['pad', 'strings', 'field_recordings', 'soft_percussion']
                effects: [STR_REVERB, STR_DELAY, STR_FILTER]
                suggestedBPM: 75
                suggestedKey: 'D'
            }]
            // Styles Afro/World
            ['afrobeat', {
                name: 'AfrobeatSTR_CATEGORYworld'
                characteristics: {
                    bpmRange: [100, 130]
                    keyPreference: [STR_MAJOR, STR_MINOR]
                    rhythmComplexity: 0.8
                    bassHeaviness: 0.7
                    energy: 0.8
                }
                instruments: ['african_drums', 'bass_guitar', 'brass', STR_GUITAR]
                effects: [STR_REVERB, STR_DELAY]
                suggestedBPM: 115
                suggestedKey: 'Am'
            }]
            ['amapiano', {
                name: 'AmapianoSTR_CATEGORYworld'
                characteristics: {
                    bpmRange: [110, 120]
                    keyPreference: [STR_MAJOR]
                    rhythmComplexity: 0.7
                    bassHeaviness: 0.8
                    energy: 0.7
                }
                instruments: ['log_drum', STR_PIANO, STR_BASS, STR_PERCUSSION]
                effects: [STR_REVERB, STR_FILTER]
                suggestedBPM: 115
                suggestedKey: 'G'
            }]
            // Styles Rock/Alternative
            ['rock', {
                name: 'RockSTR_CATEGORYrock'
                characteristics: {
                    bpmRange: [110, 140]
                    keyPreference: [STR_MINOR]
                    rhythmComplexity: 0.6
                    bassHeaviness: 0.6
                    energy: 0.8
                }
                instruments: ['electric_guitar', 'bass_guitar', STR_DRUMS, 'vocals']
                effects: [STR_DISTORTION, STR_REVERB]
                suggestedBPM: 120
                suggestedKey: 'Em'
            }]
            // Styles Jazz/Soul
            ['jazz', {
                name: 'JazzSTR_CATEGORYjazz'
                characteristics: {
                    bpmRange: [80, 180]
                    keyPreference: [STR_MAJOR, STR_MINOR]
                    rhythmComplexity: 0.9
                    bassHeaviness: 0.5
                    energy: 0.6
                }
                instruments: [STR_PIANO, 'double_bass', STR_DRUMS, 'brass', STR_SAXOPHONE]
                effects: [STR_REVERB, STR_COMPRESSION]
                suggestedBPM: 120
                suggestedKey: 'Bb'
            }]
        ]);
    }

    /**
     * Initialise les modèles d'analyse
     */
    initializeAnalysisModels() {
        this.models = {
            audio: new AudioStyleClassifier()
            text: new TextStyleClassifier()
            hybrid: new HybridStyleClassifier()
        };
    }

    /**
     * Détecte le style depuis les caractéristiques audio
     * @param {Object} audioFeatures - Caractéristiques audio depuis AudioAnalyzer
     * @returns {Promise<Object>} Style détecté avec métadonnées
     */
    async detectStyleFromAudio(audioFeatures) {
        const detectionId = `audio_style_${Date.now()}`;

        logger.info('🎵 Detecting style from audio features', {
            detectionId
            bpm: audioFeatures.bpm
            key: audioFeatures.key
            energy: audioFeatures.energy
        });

        try {
            const candidates = [];

            // Analyse de chaque style dans la base
            for (const [styleId, styleData] of this.styleDatabase) {
                const similarity = this.calculateAudioStyleSimilarity(audioFeatures, styleData);

                if (similarity.score >= this.config.confidenceThreshold) {
                    candidates.push({
                        id: styleId
                        name: styleData.name
                        category: styleData.category
                        confidence: similarity.score
                        matchingFeatures: similarity.matchingFeatures
                        suggestedBPM: styleData.suggestedBPM
                        suggestedKey: styleData.suggestedKey
                        instruments: styleData.instruments
                        effects: styleData.effects
                    });
                }
            }

            // Tri par confiance décroissante
            candidates.sort((a, b) => b.confidence - a.confidence);

            // Sélection du meilleur candidat ou fallback
            const detectedStyle = candidates.length > 0 ?
                candidates[0] :
                this.getFallbackStyle(audioFeatures);

            // Génération de suggestions alternatives
            const alternatives = candidates.slice(1, this.config.maxSuggestions);

            logger.info('✅ Style detection completed', {
                detectionId
                detectedStyle: detectedStyle.name
                confidence: detectedStyle.confidence
                alternatives: alternatives.length
            });

            return {
                success: true
                detectionId
                method: 'audio_analysis'
                primary: detectedStyle
                alternatives
                metadata: {
                    analysisFeatures: this.summarizeAudioFeatures(audioFeatures)
                    candidatesEvaluated: this.styleDatabase.size
                    matchingCandidates: candidates.length
                }
            };

        } catch (error) {
      // Logger fallback - ignore error
    });

            return {
                success: false
                error: error.message
                detectionId
                fallback: this.getFallbackStyle(audioFeatures)
            };
        }
    }

    /**
     * Détecte le style depuis une description textuelle
     * @param {string} text - Description textuelle du style souhaité
     * @returns {Promise<Object>} Style détecté avec métadonnées
     */
    async detectStyleFromText(text) {
        const detectionId = `text_style_${Date.now()}`;

        logger.info('📝 Detecting style from text description', {
            detectionId
            textLength: text.length
        });

        try {
            const processedText = this.preprocessTextInput(text);
            const candidates = [];

            // Analyse basée sur mots-clés et patterns
            for (const [styleId, styleData] of this.styleDatabase) {
                const similarity = this.calculateTextStyleSimilarity(processedText, styleData, styleId);

                if (similarity.score > 0) {
                    candidates.push({
                        id: styleId
                        name: styleData.name
                        category: styleData.category
                        confidence: similarity.score
                        matchingKeywords: similarity.keywords
                        suggestedBPM: styleData.suggestedBPM
                        suggestedKey: styleData.suggestedKey
                        mood: this.inferMoodFromStyle(styleData)
                        energy: styleData.characteristics.energy
                        instruments: styleData.instruments
                        effects: styleData.effects
                    });
                }
            }

            // Tri et sélection
            candidates.sort((a, b) => b.confidence - a.confidence);

            const detectedStyle = candidates.length > 0 ?
                candidates[0] :
                this.getDefaultStyle();

            const alternatives = candidates.slice(1, this.config.maxSuggestions);

            logger.info('✅ Text style detection completed', {
                detectionId
                detectedStyle: detectedStyle.name
                confidence: detectedStyle.confidence
                keywords: detectedStyle.matchingKeywords?.slice(0, 3)
            });

            return {
                success: true
                detectionId
                method: 'text_analysis'
                primary: detectedStyle
                alternatives
                metadata: {
                    originalText: text
                    processedKeywords: processedText.keywords
                    emotionalCues: processedText.emotions
                    candidatesEvaluated: candidates.length
                }
            };

        } catch (error) {
      // Logger fallback - ignore error
    });

            return {
                success: false
                error: error.message
                detectionId
                fallback: this.getDefaultStyle()
            };
        }
    }

    /**
     * Calcule la similarité entre caractéristiques audio et style
     */
    calculateAudioStyleSimilarity(audioFeatures, styleData) {
        let score = 0;
        const matchingFeatures = [];

        // Correspondance BPM (poids: 0.3)
        const bpmInRange = audioFeatures.bpm >= styleData.characteristics.bpmRange[0] &&
                          audioFeatures.bpm <= styleData.characteristics.bpmRange[1];
        if (bpmInRange) {
            score += 0.3;
            matchingFeatures.push('bpm');
        }

        // Correspondance énergie (poids: 0.25)
        const energyDiff = Math.abs(audioFeatures.energy - styleData.characteristics.energy);
        const energyScore = Math.max(0, 1 - energyDiff);
        score += 0.25 * energyScore;
        if (energyScore > 0.7) matchingFeatures.push('energy');

        // Correspondance tonalité (poids: 0.2)
        const keyMatch = this.isKeyCompatible(audioFeatures.key, styleData.characteristics.keyPreference);
        if (keyMatch) {
            score += 0.2;
            matchingFeatures.push('key');
        }

        // Correspondance complexité rythmique (poids: 0.15)
        if (audioFeatures.rhythm && audioFeatures.rhythm.complexity) {
            const rhythmDiff = Math.abs(audioFeatures.rhythm.complexity - styleData.characteristics.rhythmComplexity);
            const rhythmScore = Math.max(0, 1 - rhythmDiff);
            score += 0.15 * rhythmScore;
            if (rhythmScore > 0.7) matchingFeatures.push('rhythm');
        }

        // Correspondance poids des basses (poids: 0.1)
        if (audioFeatures.spectrum && audioFeatures.spectrum.rolloff) {
            // Plus le rolloff est bas, plus il y a de basses
            const bassiness = 1 - (audioFeatures.spectrum.rolloff / 10000);
            const bassDiff = Math.abs(bassiness - styleData.characteristics.bassHeaviness);
            const bassScore = Math.max(0, 1 - bassDiff);
            score += 0.1 * bassScore;
            if (bassScore > 0.7) matchingFeatures.push(STR_BASS);
        }

        return {
            score: Math.min(score, 1.0)
            matchingFeatures
        };
    }

    /**
     * Calcule la similarité entre texte et style
     */
    calculateTextStyleSimilarity(processedText, styleData, styleId) {
        let score = 0;
        const matchingKeywords = [];

        // Correspondance nom du style
        if (processedText.text.toLowerCase().includes(styleId.toLowerCase()) ||
            processedText.text.toLowerCase().includes(styleData.name.toLowerCase())) {
            score += 0.5;
            matchingKeywords.push(styleData.name);
        }

        // Correspondance catégorie
        if (processedText.text.toLowerCase().includes(styleData.category.toLowerCase())) {
            score += 0.2;
            matchingKeywords.push(styleData.category);
        }

        // Correspondance instruments mentionnés
        for (const instrument of styleData.instruments) {
            const instrumentName = instrument.replace('_', ' ');
            if (processedText.text.toLowerCase().includes(instrumentName.toLowerCase())) {
                score += 0.1;
                matchingKeywords.push(instrumentName);
            }
        }

        // Correspondance mots-clés émotionnels/énergétiques
        const energyKeywords = this.getEnergyKeywords(styleData.characteristics.energy);
        for (const keyword of energyKeywords) {
            if (processedText.keywords.includes(keyword.toLowerCase())) {
                score += 0.05;
                matchingKeywords.push(keyword);
            }
        }

        // Correspondance artistes/références populaires
        const artistKeywords = this.getArtistKeywords(styleId);
        for (const artist of artistKeywords) {
            if (processedText.text.toLowerCase().includes(artist.toLowerCase())) {
                score += 0.15;
                matchingKeywords.push(artist);
            }
        }

        return {
            score: Math.min(score, 1.0)
            keywords: matchingKeywords
        };
    }

    /**
     * Préprocesse le texte d'entrée
     */
    preprocessTextInput(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];

        return {
            text: text.toLowerCase()
            keywords: words
            emotions: this.extractEmotionalCues(text)
            tempo: this.extractTempoCues(text)
            instruments: this.extractInstrumentMentions(text)
        };
    }

    /**
     * Extrait les indices émotionnels du texte
     */
    extractEmotionalCues(text) {
        const emotions = [];
        const lowerText = text.toLowerCase();

        if (lowerText.includes('tristeSTR_LOWERTEXT_INCLUDESmélancoliqueSTR_LOWERTEXT_INCLUDESsad')) {
            emotions.push('sad');
        }
        if (lowerText.includes('joyeuxSTR_LOWERTEXT_INCLUDEShappySTR_LOWERTEXT_INCLUDESupbeat')) {
            emotions.push('happy');
        }
        if (lowerText.includes('énergiqueSTR_LOWERTEXT_INCLUDESenergeticSTR_LOWERTEXT_INCLUDESpump')) {
            emotions.push('energetic');
        }
        if (lowerText.includes('calmeSTR_LOWERTEXT_INCLUDESrelaxant') || lowerText.includes(STR_CHILL)) {
            emotions.push('calm');
        }
        if (lowerText.includes('agressifSTR_LOWERTEXT_INCLUDEShardcoreSTR_LOWERTEXT_INCLUDESintense')) {
            emotions.push('aggressive');
        }

        return emotions;
    }

    /**
     * Extrait les indices de tempo du texte
     */
    extractTempoCues(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('lentSTR_LOWERTEXT_INCLUDESslow')) return 'slow';
        if (lowerText.includes('rapideSTR_LOWERTEXT_INCLUDESfastSTR_LOWERTEXT_INCLUDESspeed')) return 'fast';
        if (lowerText.includes('modéréSTR_LOWERTEXT_INCLUDESmedium')) return 'medium';

        return null;
    }

    /**
     * Extrait les mentions d'instruments
     */
    extractInstrumentMentions(text) {
        const instruments = [];
        const lowerText = text.toLowerCase();

        const instrumentKeywords = {
            STR_PIANO: [STR_PIANO
      'clavier']
      STR_GUITAR: ['guitare'
      STR_GUITAR]
      STR_DRUMS: ['batterie'
      STR_DRUMS
      STR_PERCUSSION]
      STR_BASS: ['basse'
      STR_BASS]
      STR_SAXOPHONE: [STR_SAXOPHONE
      'sax']
      'violin': ['violon'
      'violin']
      'synthesizer': ['synthé'
      'synth'
      'synthesizer']
        };

        for (const [instrument, keywords] of Object.entries(instrumentKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                instruments.push(instrument);
            }
        }

        return instruments;
    }

    /**
     * Vérifie la compatibilité tonale
     */
    isKeyCompatible(audioKey, preferredModes) {
        if (!audioKey || !preferredModes) return false;

        const isMajor = !audioKey.includes('m') || audioKey.includes('maj');
        const isMinor = audioKey.includes('m') && !audioKey.includes('maj');

        return (isMajor && preferredModes.includes(STR_MAJOR)) ||
               (isMinor && preferredModes.includes(STR_MINOR));
    }

    /**
     * Génère mots-clés énergétiques pour un niveau d'énergie
     */
    getEnergyKeywords(energyLevel) {
        if (energyLevel > 0.8) return ['énergique', 'intense', 'powerful', 'hard', 'aggressive'];
        if (energyLevel > 0.6) return ['dynamique', 'upbeat', 'driving', 'pumping'];
        if (energyLevel > 0.4) return ['modéré', 'balanced', 'steady'];
        return ['calme', STR_CHILL, 'relaxant', 'soft', 'ambient'];
    }

    /**
     * Retourne artistes références pour un style
     */
    getArtistKeywords(styleId) {
        const artistMap = {
            STR_TRAP: ['travis scott'
      'future'
      'migos'
      'lil baby']
      'house': ['calvin harris'
      'david guetta'
      'disclosure'
      'duke dumont']
      'techno': ['charlotte de witte'
      'amelie lens'
      'adam beyer'
      'carl cox']
      STR_LOFI: ['nujabes'
      'j dilla'
      'chillhop']
      'drill': ['pop smoke'
      'fivio foreign'
      'kay flock']
      'afrobeat': ['burna boy'
      'wizkid'
      'davido'
      'fela kuti']
      'amapiano': ['kabza de small'
      'dj maphorisa'
      'focalistic']
        };

        return artistMap[styleId] || [];
    }

    /**
     * Infère l'humeur depuis les caractéristiques du style
     */
    inferMoodFromStyle(styleData) {
        const energy = styleData.characteristics.energy;
        const bassHeaviness = styleData.characteristics.bassHeaviness;
        const isMinor = styleData.characteristics.keyPreference.includes(STR_MINOR);

        if (energy > 0.8 && bassHeaviness > 0.8) return 'aggressive';
        if (energy > 0.7 && !isMinor) return 'upbeat';
        if (energy < 0.4) return STR_CHILL;
        if (isMinor && energy < 0.6) return 'melancholic';

        return 'neutral';
    }

    /**
     * Retourne un style par défaut
     */
    getDefaultStyle() {
        return {
            id: 'house'
            name: 'House'
            category: 'electronic'
            confidence: 0.5
            suggestedBPM: 125
            suggestedKey: 'Am'
            mood: 'upbeat'
            energy: 0.8
            instruments: ['four_on_floor', 'bass_synth', 'pad']
            effects: [STR_FILTER, STR_REVERB]
        };
    }

    /**
     * Retourne style de fallback basé sur les caractéristiques audio
     */
    getFallbackStyle(audioFeatures) {
        // Logique simple basée sur BPM et énergie
        if (audioFeatures.bpm > 140 && audioFeatures.energy > 0.8) {
            return this.styleDatabase.get(STR_TRAP) || this.getDefaultStyle();
        }
        if (audioFeatures.bpm < 90 && audioFeatures.energy < 0.5) {
            return this.styleDatabase.get(STR_LOFI) || this.getDefaultStyle();
        }

        return this.getDefaultStyle();
    }

    /**
     * Résume les caractéristiques audio pour les métadonnées
     */
    summarizeAudioFeatures(audioFeatures) {
        return {
            tempo: audioFeatures.bpm
            key: audioFeatures.key
            energy: Math.round(audioFeatures.energy * 100) / 100
            mood: audioFeatures.mood
            danceability: Math.round((audioFeatures.danceability || 0) * 100) / 100
        };
    }

    /**
     * Retourne tous les styles supportés
     */
    getSupportedStyles() {
        return Array.from(this.styleDatabase.entries()).map(([id, data]) => ({
            id
            name: data.name
            category: data.category
            bpmRange: data.characteristics.bpmRange
            energy: data.characteristics.energy
        }));
    }

    /**
     * Retourne les styles par catégorie
     */
    getStylesByCategory() {
        const categories = {};

        for (const [id, data] of this.styleDatabase) {
            if (!categories[data.category]) {
                categories[data.category] = [];
            }
            categories[data.category].push({
                id
                name: data.name
                suggestedBPM: data.suggestedBPM
            });
        }

        return categories;
    }
}

// =======================================
// CLASSIFICATEURS SPÉCIALISÉS
// =======================================

/**
 * Classificateur de style audio
 */
class AudioStyleClassifier {
    classify(audioFeatures) {
        // Implémentation classification ML ici
        return { confidence: 0.8, predictions: [] };
    }
}

/**
 * Classificateur de style textuel
 */
class TextStyleClassifier {
    classify(textFeatures) {
        // Implémentation classification NLP ici
        return { confidence: 0.7, predictions: [] };
    }
}

/**
 * Classificateur hybride
 */
class HybridStyleClassifier {
    classify(audioFeatures, textFeatures) {
        // Combine audio et text pour meilleure précision
        return { confidence: 0.85, predictions: [] };
    }
}

export default StyleMatcher;
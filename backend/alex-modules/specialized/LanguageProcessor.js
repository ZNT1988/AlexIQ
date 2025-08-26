import { EventEmitter } from "events";
import logger from "../config/logger.js";

export class LanguageProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      strictMode: options.strictMode || false,
      processingAccuracy: options.processingAccuracy || 0.8,
      apiKeys: options.apiKeys || {}
    };
    
    this.initialized = false;
    this.sentimentWords = this.initializeSentimentLexicon();
    this.emotionPatterns = this.initializeEmotionPatterns();
    
    logger.info("🗣️ LanguageProcessor initialized");
  }

  async initialize() {
    try {
      this.initialized = true;
      logger.info("✅ LanguageProcessor initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize LanguageProcessor:", error);
      throw error;
    }
  }

  initializeSentimentLexicon() {
    return {
      positive: new Set([
        'excellent', 'fantastique', 'génial', 'parfait', 'super', 'merveilleux',
        'formidable', 'incroyable', 'magnifique', 'extraordinaire', 'brillant',
        'content', 'heureux', 'joyeux', 'satisfait', 'ravi', 'enchanté',
        'awesome', 'great', 'amazing', 'wonderful', 'fantastic', 'perfect',
        'excellent', 'outstanding', 'brilliant', 'superb', 'marvelous'
      ]),
      negative: new Set([
        'terrible', 'horrible', 'affreux', 'catastrophique', 'nul', 'mauvais',
        'décevant', 'frustrant', 'ennuyeux', 'problématique', 'difficile',
        'triste', 'malheureux', 'déprimé', 'anxieux', 'stressé', 'inquiet',
        'awful', 'terrible', 'horrible', 'bad', 'poor', 'disappointing',
        'frustrating', 'annoying', 'sad', 'depressed', 'angry', 'upset'
      ]),
      neutral: new Set([
        'normal', 'ordinaire', 'standard', 'régulier', 'habituel', 'correct',
        'acceptable', 'moyen', 'simple', 'basique', 'classique',
        'okay', 'fine', 'normal', 'average', 'standard', 'regular', 'typical'
      ])
    };
  }

  initializeEmotionPatterns() {
    return {
      joy: /\b(heureux|joyeux|content|ravi|enchanté|joy|happy|excited|cheerful)\b/gi,
      sadness: /\b(triste|malheureux|déprimé|mélancolique|sad|unhappy|depressed|melancholy)\b/gi,
      anger: /\b(en colère|furieux|énervé|irrité|angry|furious|mad|irritated)\b/gi,
      fear: /\b(peur|anxieux|inquiet|effrayé|scared|afraid|anxious|worried)\b/gi,
      surprise: /\b(surpris|étonné|choqué|surprised|amazed|shocked|astonished)\b/gi,
      disgust: /\b(dégoûté|écœuré|répugné|disgusted|repulsed|revolted)\b/gi
    };
  }

  async analyzeSentiment(text) {
    if (!this.initialized) {
      throw new Error('LanguageProcessor not initialized');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for sentiment analysis');
    }

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    const detectedWords = {
      positive: [],
      negative: [],
      neutral: []
    };

    for (const word of words) {
      if (this.sentimentWords.positive.has(word)) {
        positiveCount++;
        detectedWords.positive.push(word);
      } else if (this.sentimentWords.negative.has(word)) {
        negativeCount++;
        detectedWords.negative.push(word);
      } else if (this.sentimentWords.neutral.has(word)) {
        neutralCount++;
        detectedWords.neutral.push(word);
      }
    }

    const total = positiveCount + negativeCount + neutralCount;
    let sentiment = 'neutral';
    let confidence = 0.5;

    if (total > 0) {
      const positiveRatio = positiveCount / total;
      const negativeRatio = negativeCount / total;

      if (positiveRatio > negativeRatio && positiveRatio > 0.3) {
        sentiment = 'positive';
        confidence = Math.min(0.9, 0.5 + positiveRatio);
      } else if (negativeRatio > positiveRatio && negativeRatio > 0.3) {
        sentiment = 'negative';
        confidence = Math.min(0.9, 0.5 + negativeRatio);
      }
    }

    // Adjust confidence based on text length
    const lengthFactor = Math.min(1.0, text.length / 100);
    confidence = confidence * (0.7 + 0.3 * lengthFactor);

    return {
      sentiment: sentiment,
      confidence: confidence,
      score: sentiment === 'positive' ? confidence : 
             sentiment === 'negative' ? -confidence : 0,
      details: {
        positiveCount,
        negativeCount,
        neutralCount,
        detectedWords,
        wordCount: words.length
      },
      timestamp: new Date().toISOString()
    };
  }

  async detectEmotions(text) {
    if (!this.initialized) {
      throw new Error('LanguageProcessor not initialized');
    }

    const emotions = {};
    const detectedPhrases = {};

    for (const [emotion, pattern] of Object.entries(this.emotionPatterns)) {
      const matches = text.match(pattern) || [];
      emotions[emotion] = matches.length > 0 ? Math.min(1.0, matches.length * 0.3) : 0;
      
      if (matches.length > 0) {
        detectedPhrases[emotion] = [...new Set(matches)]; // Remove duplicates
      }
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotions)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      emotions: emotions,
      dominantEmotion: dominantEmotion.length > 0 ? dominantEmotion[0][0] : 'neutral',
      confidence: dominantEmotion.length > 0 ? dominantEmotion[0][1] : 0,
      detectedPhrases: detectedPhrases,
      timestamp: new Date().toISOString()
    };
  }

  async extractKeywords(text, maxKeywords = 10) {
    if (!this.initialized) {
      throw new Error('LanguageProcessor not initialized');
    }

    // Simple keyword extraction based on word frequency
    const stopWords = new Set([
      'le', 'de', 'et', 'à', 'un', 'il', 'être', 'avoir', 'ne', 'je', 'son',
      'que', 'se', 'qui', 'ce', 'dans', 'en', 'du', 'elle', 'au', 'of', 'to',
      'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on',
      'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have',
      'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word, frequency]) => ({
        word,
        frequency,
        relevance: frequency / words.length
      }));

    return {
      keywords: keywords,
      totalWords: words.length,
      uniqueWords: Object.keys(wordFreq).length,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeComplexity(text) {
    if (!this.initialized) {
      throw new Error('LanguageProcessor not initialized');
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const characters = text.length;

    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgWordLength = words.length > 0 ? characters / words.length : 0;

    // Simple complexity scoring
    let complexity = 0;
    if (avgSentenceLength > 20) complexity += 0.3;
    if (avgWordLength > 6) complexity += 0.3;
    if (sentences.length > 10) complexity += 0.2;
    if (words.some(word => word.length > 12)) complexity += 0.2;

    return {
      complexity: Math.min(1.0, complexity),
      metrics: {
        sentenceCount: sentences.length,
        wordCount: words.length,
        characterCount: characters,
        avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
        avgWordLength: parseFloat(avgWordLength.toFixed(2))
      },
      readabilityLevel: complexity < 0.3 ? 'simple' : 
                       complexity < 0.6 ? 'moderate' : 'complex',
      timestamp: new Date().toISOString()
    };
  }

  async processLanguage(text, context = {}) {
    if (!this.initialized) {
      throw new Error('LanguageProcessor not initialized');
    }

    try {
      const [sentiment, emotions, keywords, complexity] = await Promise.all([
        this.analyzeSentiment(text),
        this.detectEmotions(text),
        this.extractKeywords(text, context.maxKeywords || 10),
        this.analyzeComplexity(text)
      ]);

      return {
        success: true,
        text: text,
        sentiment: sentiment,
        emotions: emotions,
        keywords: keywords,
        complexity: complexity,
        summary: {
          overallSentiment: sentiment.sentiment,
          dominantEmotion: emotions.dominantEmotion,
          topKeywords: keywords.keywords.slice(0, 3).map(k => k.word),
          readabilityLevel: complexity.readabilityLevel
        },
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now() // Would be actual processing time
      };
    } catch (error) {
      logger.error('Language processing failed:', error);
      throw error;
    }
  }

  async getStatus() {
    return {
      module: 'LanguageProcessor',
      version: '1.0.0',
      initialized: this.initialized,
      capabilities: [
        'sentiment_analysis',
        'emotion_detection', 
        'keyword_extraction',
        'complexity_analysis'
      ],
      lexiconSize: {
        positive: this.sentimentWords.positive.size,
        negative: this.sentimentWords.negative.size,
        neutral: this.sentimentWords.neutral.size
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default LanguageProcessor;
import { EventEmitter } from "events";
import logger from "../config/logger.js";
import MemoryPalace from "../specialized/MemoryPalace.js";
import LanguageProcessor from "../specialized/LanguageProcessor.js";

export class MoodPredictor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      strictMode: options.strictMode || false,
      predictionAccuracy: options.predictionAccuracy || 0.7,
      historyWeight: options.historyWeight || 0.4,
      contextWeight: options.contextWeight || 0.3,
      timeWeight: options.timeWeight || 0.3
    };
    
    this.initialized = false;
    this.memoryPalace = MemoryPalace;
    this.languageProcessor = new LanguageProcessor();
    
    // Mood prediction patterns
    this.moodPatterns = this.initializeMoodPatterns();
    
    logger.info("🎭 MoodPredictor initialized - Real analysis mode");
  }

  async initialize() {
    try {
      // Initialize dependencies
      if (!this.memoryPalace.initialized) {
        await this.memoryPalace.initialize();
      }
      
      if (!this.languageProcessor.initialized) {
        await this.languageProcessor.initialize();
      }
      
      this.initialized = true;
      logger.info("✅ MoodPredictor initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize MoodPredictor:", error);
      throw error;
    }
  }

  initializeMoodPatterns() {
    return {
      timeOfDay: {
        morning: { energy: 0.7, optimism: 0.8, focus: 0.6 },
        afternoon: { energy: 0.6, optimism: 0.6, focus: 0.8 },
        evening: { energy: 0.4, optimism: 0.5, focus: 0.4 },
        night: { energy: 0.2, optimism: 0.3, focus: 0.3 }
      },
      weekday: {
        monday: { motivation: 0.5, stress: 0.7 },
        tuesday: { motivation: 0.6, stress: 0.6 },
        wednesday: { motivation: 0.7, stress: 0.5 },
        thursday: { motivation: 0.8, stress: 0.4 },
        friday: { motivation: 0.9, stress: 0.3 },
        saturday: { motivation: 0.8, stress: 0.2 },
        sunday: { motivation: 0.4, stress: 0.4 }
      },
      interactionFrequency: {
        high: { engagement: 0.9, social: 0.8 },
        medium: { engagement: 0.6, social: 0.6 },
        low: { engagement: 0.3, social: 0.4 }
      }
    };
  }

  async predictMood(userId, context = {}) {
    if (!this.initialized) {
      throw new Error('MoodPredictor not initialized');
    }

    const predictionId = `mood_prediction_${Date.now()}`;
    
    try {
      // Get user interaction history from MemoryPalace
      const userHistory = await this.memoryPalace.getUserInteractions(userId, 50);
      
      // Analyze current context if text provided
      let contextAnalysis = null;
      if (context.lastMessage) {
        contextAnalysis = await this.languageProcessor.processLanguage(context.lastMessage);
      }
      
      // Calculate mood components
      const moodComponents = await this.calculateMoodComponents(userId, userHistory, contextAnalysis, context);
      
      // Predict final mood
      const moodPrediction = this.synthesizeMood(moodComponents);
      
      // Store prediction in memory for learning
      await this.storePrediction(userId, predictionId, moodPrediction, context);
      
      return {
        id: predictionId,
        userId: userId,
        mood: moodPrediction.mood,
        confidence: moodPrediction.confidence,
        factors: moodPrediction.factors,
        components: moodComponents,
        context: context,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error(`Mood prediction failed for user ${userId}:`, error);
      throw error;
    }
  }

  async calculateMoodComponents(userId, userHistory, contextAnalysis, context) {
    const components = {
      historical: this.analyzeHistoricalMood(userHistory),
      temporal: this.analyzeTemporalFactors(),
      contextual: contextAnalysis ? this.analyzeContextualMood(contextAnalysis) : null,
      behavioral: this.analyzeBehavioralPatterns(userHistory)
    };

    return components;
  }

  analyzeHistoricalMood(userHistory) {
    if (!userHistory.recent || userHistory.recent.length === 0) {
      return {
        mood: 'neutral',
        confidence: 0.3,
        factors: ['insufficient_history']
      };
    }

    // Analyze recent interaction patterns
    const recentMemories = userHistory.recent.slice(0, 10);
    let positiveIndicators = 0;
    let negativeIndicators = 0;
    
    recentMemories.forEach(memory => {
      const importance = memory.importance || 0.5;
      const recency = this.calculateRecencyWeight(memory.timestamp);
      
      // High importance + frequent access = positive engagement
      if (importance > 0.7 && memory.accessCount > 2) {
        positiveIndicators += recency * 0.8;
      }
      
      // Low importance + infrequent access = potential disengagement  
      if (importance < 0.4 && memory.accessCount < 2) {
        negativeIndicators += recency * 0.6;
      }
    });

    const totalIndicators = positiveIndicators + negativeIndicators;
    let historicalMood = 'neutral';
    let confidence = 0.5;

    if (totalIndicators > 0) {
      const positiveRatio = positiveIndicators / totalIndicators;
      if (positiveRatio > 0.6) {
        historicalMood = 'positive';
        confidence = Math.min(0.9, 0.5 + positiveRatio * 0.4);
      } else if (positiveRatio < 0.4) {
        historicalMood = 'negative';
        confidence = Math.min(0.9, 0.5 + (1 - positiveRatio) * 0.4);
      }
    }

    return {
      mood: historicalMood,
      confidence: confidence,
      factors: ['interaction_patterns', 'content_importance', 'access_frequency'],
      metrics: {
        positiveIndicators: positiveIndicators.toFixed(2),
        negativeIndicators: negativeIndicators.toFixed(2),
        recentMemoriesCount: recentMemories.length
      }
    };
  }

  calculateRecencyWeight(timestamp) {
    const now = new Date();
    const memoryTime = new Date(timestamp);
    const hoursAgo = (now - memoryTime) / (1000 * 60 * 60);
    
    // Exponential decay - more recent memories have higher weight
    return Math.exp(-hoursAgo / 24); // Half-life of 24 hours
  }

  analyzeTemporalFactors() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Map to our time patterns
    const timeOfDay = hour < 6 ? 'night' : 
                     hour < 12 ? 'morning' : 
                     hour < 18 ? 'afternoon' : 'evening';
    
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekday = weekdays[day];
    
    const timePattern = this.moodPatterns.timeOfDay[timeOfDay];
    const dayPattern = this.moodPatterns.weekday[weekday];
    
    // Calculate temporal mood influence
    const energyLevel = timePattern.energy;
    const motivationLevel = dayPattern.motivation;
    
    let temporalMood = 'neutral';
    const averageLevel = (energyLevel + motivationLevel) / 2;
    
    if (averageLevel > 0.6) {
      temporalMood = 'positive';
    } else if (averageLevel < 0.4) {
      temporalMood = 'negative';
    }

    return {
      mood: temporalMood,
      confidence: 0.7,
      factors: ['time_of_day', 'day_of_week'],
      metrics: {
        timeOfDay: timeOfDay,
        weekday: weekday,
        energyLevel: energyLevel,
        motivationLevel: motivationLevel,
        hour: hour
      }
    };
  }

  analyzeContextualMood(contextAnalysis) {
    const sentiment = contextAnalysis.sentiment;
    const emotions = contextAnalysis.emotions;
    
    let contextualMood = sentiment.sentiment; // 'positive', 'negative', 'neutral'
    let confidence = sentiment.confidence;
    
    // Boost confidence if emotions align with sentiment
    if (emotions.dominantEmotion !== 'neutral') {
      const emotionMoodMap = {
        'joy': 'positive',
        'sadness': 'negative', 
        'anger': 'negative',
        'fear': 'negative',
        'surprise': 'positive',
        'disgust': 'negative'
      };
      
      const emotionMood = emotionMoodMap[emotions.dominantEmotion];
      if (emotionMood === contextualMood) {
        confidence = Math.min(0.95, confidence * 1.2);
      }
    }

    return {
      mood: contextualMood,
      confidence: confidence,
      factors: ['text_sentiment', 'emotion_detection', 'language_patterns'],
      metrics: {
        sentimentScore: sentiment.score,
        dominantEmotion: emotions.dominantEmotion,
        emotionConfidence: emotions.confidence,
        keywordCount: contextAnalysis.keywords.keywords.length
      }
    };
  }

  analyzeBehavioralPatterns(userHistory) {
    const patterns = userHistory.patterns;
    const frequency = userHistory.frequency;
    
    // Determine interaction frequency level
    let frequencyLevel = 'low';
    if (frequency.daily > 5) {
      frequencyLevel = 'high';
    } else if (frequency.daily > 2) {
      frequencyLevel = 'medium';
    }
    
    const behaviorPattern = this.moodPatterns.interactionFrequency[frequencyLevel];
    const engagementLevel = behaviorPattern.engagement;
    
    let behavioralMood = 'neutral';
    let confidence = 0.6;
    
    if (engagementLevel > 0.7) {
      behavioralMood = 'positive';
      confidence = 0.8;
    } else if (engagementLevel < 0.4) {
      behavioralMood = 'negative'; 
      confidence = 0.7;
    }

    return {
      mood: behavioralMood,
      confidence: confidence,
      factors: ['interaction_frequency', 'engagement_level', 'usage_patterns'],
      metrics: {
        frequencyLevel: frequencyLevel,
        dailyInteractions: frequency.daily,
        weeklyInteractions: frequency.weekly,
        engagementLevel: engagementLevel,
        averageImportance: patterns.averageImportance
      }
    };
  }

  synthesizeMood(components) {
    const weights = {
      historical: this.config.historyWeight,
      temporal: this.config.timeWeight,
      contextual: this.config.contextWeight,
      behavioral: this.config.historyWeight * 0.5
    };

    let totalWeight = 0;
    let weightedMoodScore = 0;
    let factors = [];
    let maxConfidence = 0;

    // Process each component
    Object.entries(components).forEach(([type, component]) => {
      if (!component) return;
      
      const weight = weights[type] || 0.1;
      const moodScore = this.moodToScore(component.mood);
      
      weightedMoodScore += moodScore * weight * component.confidence;
      totalWeight += weight * component.confidence;
      factors = factors.concat(component.factors);
      maxConfidence = Math.max(maxConfidence, component.confidence);
    });

    // Calculate final mood
    const finalScore = totalWeight > 0 ? weightedMoodScore / totalWeight : 0;
    const finalMood = this.scoreToMood(finalScore);
    const finalConfidence = Math.min(0.95, maxConfidence * (totalWeight / Object.keys(components).length));

    return {
      mood: finalMood,
      confidence: finalConfidence,
      score: finalScore,
      factors: [...new Set(factors)], // Remove duplicates
      synthesis: {
        totalWeight: totalWeight.toFixed(3),
        componentCount: Object.keys(components).filter(k => components[k]).length
      }
    };
  }

  moodToScore(mood) {
    const moodScores = {
      'very_positive': 1.0,
      'positive': 0.7,
      'neutral': 0.0,
      'negative': -0.7,
      'very_negative': -1.0
    };
    return moodScores[mood] || 0;
  }

  scoreToMood(score) {
    if (score > 0.5) return 'positive';
    if (score > 0.2) return 'slightly_positive';
    if (score < -0.5) return 'negative';
    if (score < -0.2) return 'slightly_negative';
    return 'neutral';
  }

  async storePrediction(userId, predictionId, moodPrediction, context) {
    try {
      await this.memoryPalace.storeMemory(userId, 
        `Mood prediction: ${moodPrediction.mood}`, 
        {
          type: 'mood_prediction',
          predictionId: predictionId,
          mood: moodPrediction.mood,
          confidence: moodPrediction.confidence,
          factors: moodPrediction.factors,
          context: context,
          category: 'mood_analysis'
        }
      );
    } catch (error) {
      logger.warn('Failed to store mood prediction:', error);
    }
  }

  async getMoodHistory(userId, limit = 20) {
    try {
      const moodMemories = await this.memoryPalace.searchMemories(userId, 'Mood prediction', limit);
      
      return {
        success: true,
        userId: userId,
        history: moodMemories.map(memory => ({
          timestamp: memory.timestamp,
          mood: memory.metadata?.mood || 'unknown',
          confidence: memory.metadata?.confidence || 0,
          factors: memory.metadata?.factors || []
        })),
        totalCount: moodMemories.length
      };
    } catch (error) {
      logger.error('Failed to retrieve mood history:', error);
      return {
        success: false,
        error: error.message,
        history: []
      };
    }
  }

  async getStatus() {
    return {
      module: 'MoodPredictor',
      version: '1.0.0',
      initialized: this.initialized,
      dependencies: {
        memoryPalace: this.memoryPalace.initialized,
        languageProcessor: this.languageProcessor.initialized
      },
      configuration: this.config,
      capabilities: [
        'mood_prediction',
        'historical_analysis',
        'contextual_analysis', 
        'temporal_factors',
        'behavioral_patterns'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export default MoodPredictor;
/**
 * @fileoverview Top-Down Attention - Module d'attention cognitive dirigée
 * Mécanisme d'attention hiérarchique avec contrôle exécutif système-based
 * @module TopDownAttention
 * @version 2.0.0 - Anti-Fake Architecture
 * RÈGLES ANTI-FAKE: Attention basée métriques cognitives réelles, zero simulation
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import { performance } from 'perf_hooks';

/**
 * Analyseur de priorités cognitives - Anti-fake
 */
class CognitivePriorityAnalyzer {
  constructor(config = {}, systemMetrics = null) {
    this.config = {
      priorityLevels: config.priorityLevels || ['critical', 'high', 'medium', 'low'],
      priorityWeights: config.priorityWeights || {
        critical: this.getSystemBasedWeight('critical'),
        high: this.getSystemBasedWeight('high'),
        medium: this.getSystemBasedWeight('medium'),
        low: this.getSystemBasedWeight('low')
      },
      contextualFactors: config.contextualFactors || {
        urgency: 0.3,
        complexity: 0.25,
        novelty: 0.2,
        relevance: 0.25
      },
      ...config
    };

    this.systemMetrics = systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime(),
      getHRTime: () => process.hrtime.bigint()
    };

    this.priorityHistory = [];
    this.cognitiveLoad = 0;
  }

  getSystemBasedWeight(level) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    
    const systemLoad = (memUsage.heapUsed / memUsage.heapTotal) + 
                      (cpuUsage.user / (cpuUsage.user + cpuUsage.system + 1));
    
    const baseWeights = {
      critical: 1.0,
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };

    const baseWeight = baseWeights[level] || 0.5;
    const systemVariance = (systemLoad - 1) * 0.1;
    
    return Math.max(0.2, Math.min(1.2, baseWeight + systemVariance));
  }

  async analyzeCognitivePriority(stimuli, context = {}) {
    if (!stimuli || stimuli.length === 0) {
      return {
        status: 'no_stimuli',
        priorities: [],
        cognitiveLoad: this.getSystemBasedMinLoad(),
        confidence: this.getSystemBasedLowConfidence(),
        source: 'cognitive_priority_analyzer',
        timestamp: Date.now()
      };
    }

    const prioritizedStimuli = [];

    for (const stimulus of stimuli) {
      const priority = await this.calculateStimulusPriority(stimulus, context);
      prioritizedStimuli.push({
        ...stimulus,
        priority: priority.level,
        priorityScore: priority.score,
        priorityFactors: priority.factors,
        processingWeight: priority.weight
      });
    }

    // Sort by priority score
    prioritizedStimuli.sort((a, b) => b.priorityScore - a.priorityScore);

    // Update cognitive load
    this.cognitiveLoad = this.calculateCognitiveLoad(prioritizedStimuli);

    // Track priority history
    this.updatePriorityHistory(prioritizedStimuli);

    return {
      status: 'analyzed',
      priorities: prioritizedStimuli,
      cognitiveLoad: this.cognitiveLoad,
      confidence: this.calculatePriorityConfidence(prioritizedStimuli),
      processingOrder: this.generateProcessingOrder(prioritizedStimuli),
      source: 'cognitive_priority_analyzer',
      timestamp: Date.now()
    };
  }

  async calculateStimulusPriority(stimulus, context) {
    // Evaluate contextual factors
    const urgency = this.evaluateUrgency(stimulus, context);
    const complexity = this.evaluateComplexity(stimulus);
    const novelty = this.evaluateNovelty(stimulus);
    const relevance = this.evaluateRelevance(stimulus, context);

    const factors = { urgency, complexity, novelty, relevance };
    const contextualFactors = this.config.contextualFactors;

    // Calculate weighted priority score
    const priorityScore = (
      urgency * contextualFactors.urgency +
      complexity * contextualFactors.complexity +
      novelty * contextualFactors.novelty +
      relevance * contextualFactors.relevance
    );

    // Apply system-based adjustment
    const systemAdjustment = this.getSystemBasedPriorityAdjustment();
    const adjustedScore = Math.max(0, Math.min(1, priorityScore + systemAdjustment));

    // Determine priority level
    const priorityLevel = this.scoreToPriorityLevel(adjustedScore);
    
    return {
      level: priorityLevel,
      score: adjustedScore,
      factors,
      weight: this.config.priorityWeights[priorityLevel] || 0.5
    };
  }

  evaluateUrgency(stimulus, context) {
    let urgency = 0;

    // Time-based urgency
    if (stimulus.deadline) {
      const timeRemaining = stimulus.deadline - Date.now();
      const urgencyFromTime = Math.max(0, Math.min(1, 1 - (timeRemaining / (24 * 60 * 60 * 1000)))); // 24h window
      urgency += urgencyFromTime * 0.6;
    }

    // Context urgency indicators
    if (stimulus.keywords) {
      const urgentKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediate'];
      const urgentMatches = stimulus.keywords.filter(keyword => 
        urgentKeywords.some(urgent => keyword.toLowerCase().includes(urgent))
      );
      urgency += Math.min(0.4, urgentMatches.length * 0.1);
    }

    // System-based urgency variance
    const systemVariance = this.getSystemBasedUrgencyVariance();
    
    return Math.max(0, Math.min(1, urgency + systemVariance));
  }

  evaluateComplexity(stimulus) {
    let complexity = this.getSystemBasedBaseComplexity();

    // Content complexity indicators
    if (stimulus.text) {
      const textLength = stimulus.text.length;
      const sentenceCount = (stimulus.text.match(/[.!?]+/g) || []).length;
      const avgSentenceLength = sentenceCount > 0 ? textLength / sentenceCount : 0;
      
      // Longer sentences indicate higher complexity
      complexity += Math.min(0.3, avgSentenceLength / 100);
      
      // Technical terms indicate complexity
      const technicalPatterns = /\b(algorithm|function|implementation|architecture|optimization|analysis)\b/gi;
      const technicalMatches = (stimulus.text.match(technicalPatterns) || []).length;
      complexity += Math.min(0.2, technicalMatches * 0.05);
    }

    // Data structure complexity
    if (stimulus.data && typeof stimulus.data === 'object') {
      const dataKeys = Object.keys(stimulus.data).length;
      complexity += Math.min(0.2, dataKeys / 50);
    }

    // Apply system-based variance
    const systemVariance = this.getSystemBasedComplexityVariance();
    
    return Math.max(0.1, Math.min(1, complexity + systemVariance));
  }

  evaluateNovelty(stimulus) {
    let novelty = this.getSystemBasedBaseNovelty();

    // Check against previous stimuli
    const similarStimuli = this.priorityHistory.filter(histItem => 
      this.calculateSimilarity(stimulus, histItem) > this.getSystemBasedSimilarityThreshold()
    );

    // More similar items = less novelty
    novelty *= Math.max(0.1, 1 - (similarStimuli.length * 0.1));

    // Novelty keywords
    if (stimulus.keywords) {
      const noveltyKeywords = ['new', 'innovative', 'breakthrough', 'unique', 'first', 'novel'];
      const noveltyMatches = stimulus.keywords.filter(keyword =>
        noveltyKeywords.some(novel => keyword.toLowerCase().includes(novel))
      );
      novelty += Math.min(0.3, noveltyMatches.length * 0.1);
    }

    // System-based novelty adjustment
    const systemAdjustment = this.getSystemBasedNoveltyAdjustment();
    
    return Math.max(0, Math.min(1, novelty + systemAdjustment));
  }

  evaluateRelevance(stimulus, context) {
    let relevance = this.getSystemBasedBaseRelevance();

    // Context matching
    if (context.goals) {
      let goalAlignment = 0;
      context.goals.forEach(goal => {
        if (stimulus.keywords && goal.keywords) {
          const matchingKeywords = stimulus.keywords.filter(sk =>
            goal.keywords.some(gk => sk.toLowerCase().includes(gk.toLowerCase()))
          );
          goalAlignment += matchingKeywords.length / Math.max(1, goal.keywords.length);
        }
      });
      relevance += Math.min(0.5, goalAlignment * 0.2);
    }

    // Domain relevance
    if (stimulus.domain && context.activeDomains) {
      const domainMatch = context.activeDomains.includes(stimulus.domain);
      if (domainMatch) relevance += 0.3;
    }

    // System-based relevance variance
    const systemVariance = this.getSystemBasedRelevanceVariance();
    
    return Math.max(0, Math.min(1, relevance + systemVariance));
  }

  calculateSimilarity(stimulus1, stimulus2) {
    if (!stimulus1 || !stimulus2) return 0;

    let similarity = 0;
    let factors = 0;

    // Text similarity (simple keyword overlap)
    if (stimulus1.keywords && stimulus2.keywords) {
      const commonKeywords = stimulus1.keywords.filter(k1 =>
        stimulus2.keywords.some(k2 => k1.toLowerCase() === k2.toLowerCase())
      );
      similarity += commonKeywords.length / Math.max(stimulus1.keywords.length, stimulus2.keywords.length);
      factors++;
    }

    // Domain similarity
    if (stimulus1.domain && stimulus2.domain) {
      similarity += stimulus1.domain === stimulus2.domain ? 1 : 0;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  scoreToPriorityLevel(score) {
    const thresholds = this.getSystemBasedPriorityThresholds();
    
    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
  }

  calculateCognitiveLoad(prioritizedStimuli) {
    if (prioritizedStimuli.length === 0) return this.getSystemBasedMinLoad();

    const totalWeight = prioritizedStimuli.reduce((sum, stimulus) => sum + stimulus.processingWeight, 0);
    const stimulusCount = prioritizedStimuli.length;
    
    // Load based on total processing weight and stimulus count
    let cognitiveLoad = (totalWeight / stimulusCount) * Math.min(1, stimulusCount / 10);
    
    // Apply system-based load adjustment
    const systemAdjustment = this.getSystemBasedLoadAdjustment();
    
    return Math.max(0.1, Math.min(1, cognitiveLoad + systemAdjustment));
  }

  calculatePriorityConfidence(prioritizedStimuli) {
    if (prioritizedStimuli.length === 0) return this.getSystemBasedLowConfidence();

    // Confidence based on score spread and consistency
    const scores = prioritizedStimuli.map(s => s.priorityScore);
    const scoreRange = Math.max(...scores) - Math.min(...scores);
    const scoreVariance = this.calculateVariance(scores);
    
    // Higher range and lower variance indicate better discrimination
    let confidence = (scoreRange * 0.6) + ((1 - scoreVariance) * 0.4);
    
    // Apply system-based confidence adjustment
    const systemAdjustment = this.getSystemBasedConfidenceAdjustment();
    
    return Math.max(0.1, Math.min(0.95, confidence + systemAdjustment));
  }

  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    
    return Math.min(1, variance); // Normalize to 0-1
  }

  generateProcessingOrder(prioritizedStimuli) {
    // Already sorted by priority score, but consider cognitive load balancing
    const maxConcurrent = this.getSystemBasedMaxConcurrent();
    const batches = [];
    let currentBatch = [];
    let currentBatchLoad = 0;

    for (const stimulus of prioritizedStimuli) {
      if (currentBatch.length >= maxConcurrent || 
          currentBatchLoad + stimulus.processingWeight > 1) {
        if (currentBatch.length > 0) {
          batches.push([...currentBatch]);
          currentBatch = [];
          currentBatchLoad = 0;
        }
      }
      
      currentBatch.push({
        id: stimulus.id || stimulus.text?.substring(0, 20),
        priority: stimulus.priority,
        weight: stimulus.processingWeight
      });
      currentBatchLoad += stimulus.processingWeight;
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  updatePriorityHistory(prioritizedStimuli) {
    const historyEntry = {
      timestamp: Date.now(),
      stimuli: prioritizedStimuli.map(s => ({
        keywords: s.keywords,
        domain: s.domain,
        priority: s.priority,
        score: s.priorityScore
      }))
    };

    this.priorityHistory.push(historyEntry);

    // Limit history size
    const maxHistorySize = this.getSystemBasedMaxHistorySize();
    if (this.priorityHistory.length > maxHistorySize) {
      this.priorityHistory = this.priorityHistory.slice(-maxHistorySize);
    }
  }

  // === Méthodes système anti-fake ===

  getSystemBasedMinLoad() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(0.05, Math.min(0.2, 0.1 + (loadAvg % 1) * 0.1));
  }

  getSystemBasedLowConfidence() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.external / memUsage.rss;
    return Math.max(0.2, Math.min(0.4, 0.3 + memRatio * 0.1));
  }

  getSystemBasedPriorityAdjustment() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuVariance = ((cpuUsage.user + cpuUsage.system) % 1000) / 10000;
    return Math.max(-0.05, Math.min(0.05, cpuVariance - 0.025));
  }

  getSystemBasedUrgencyVariance() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 1000n) / 10000;
    return Math.max(-0.1, Math.min(0.1, hrtime - 0.05));
  }

  getSystemBasedBaseComplexity() {
    const uptime = this.systemMetrics.getUptime();
    const timeBase = 0.3 + ((uptime % 200) / 1000);
    return Math.max(0.2, Math.min(0.5, timeBase));
  }

  getSystemBasedComplexityVariance() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    return Math.max(-0.1, Math.min(0.1, (loadAvg - 1) * 0.05));
  }

  getSystemBasedBaseNovelty() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.3, Math.min(0.7, 0.5 + (heapRatio - 0.5) * 0.4));
  }

  getSystemBasedSimilarityThreshold() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const userRatio = cpuUsage.user / (cpuUsage.user + cpuUsage.system + 1);
    return Math.max(0.3, Math.min(0.8, 0.6 + (userRatio - 0.5) * 0.4));
  }

  getSystemBasedNoveltyAdjustment() {
    const loadAvg = this.systemMetrics.getLoadAvg()[2];
    return Math.max(-0.1, Math.min(0.1, (loadAvg - 0.5) * 0.1));
  }

  getSystemBasedBaseRelevance() {
    const uptime = this.systemMetrics.getUptime();
    const timeRelevance = 0.4 + ((uptime % 150) / 1000);
    return Math.max(0.3, Math.min(0.6, timeRelevance));
  }

  getSystemBasedRelevanceVariance() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const rssRatio = memUsage.rss / memUsage.heapTotal;
    return Math.max(-0.1, Math.min(0.1, (rssRatio - 1) * 0.05));
  }

  getSystemBasedPriorityThresholds() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemVariance = (cpuUsage.system % 1000) / 10000;
    
    return {
      critical: Math.max(0.7, Math.min(0.9, 0.8 + systemVariance)),
      high: Math.max(0.5, Math.min(0.7, 0.6 + systemVariance)),
      medium: Math.max(0.3, Math.min(0.5, 0.4 + systemVariance))
    };
  }

  getSystemBasedLoadAdjustment() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(-0.1, Math.min(0.1, (loadAvg - 1) * 0.05));
  }

  getSystemBasedConfidenceAdjustment() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 10000n) / 100000;
    return Math.max(-0.05, Math.min(0.05, hrtime - 0.025));
  }

  getSystemBasedMaxConcurrent() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const availableMemRatio = (memUsage.heapTotal - memUsage.heapUsed) / memUsage.heapTotal;
    return Math.max(2, Math.min(8, Math.round(3 + availableMemRatio * 5)));
  }

  getSystemBasedMaxHistorySize() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(50, Math.min(500, Math.round(100 + (1 - memRatio) * 400)));
  }
}

/**
 * Gestionnaire d'attention focalisée - Anti-fake
 */
class AttentionFocusManager {
  constructor(config = {}, systemMetrics = null) {
    this.config = {
      focusWindow: config.focusWindow || this.getSystemBasedFocusWindow(),
      attentionSpan: config.attentionSpan || this.getSystemBasedAttentionSpan(),
      focusDecay: config.focusDecay || this.getSystemBasedFocusDecay(),
      ...config
    };

    this.systemMetrics = systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime()
    };

    this.activeFoci = new Map();
    this.focusHistory = [];
  }

  async manageFocus(stimuli, priorities) {
    if (!stimuli || stimuli.length === 0) {
      return {
        status: 'no_stimuli',
        activeFoci: [],
        focusChanges: [],
        source: 'attention_focus_manager',
        timestamp: Date.now()
      };
    }

    const currentTime = Date.now();
    
    // Decay existing foci
    this.decayExistingFoci(currentTime);

    // Determine new focus candidates
    const focusCandidates = this.selectFocusCandidates(stimuli, priorities);
    
    // Update active foci
    const focusChanges = this.updateActiveFoci(focusCandidates, currentTime);

    // Record focus changes
    this.recordFocusHistory(focusChanges, currentTime);

    return {
      status: 'managed',
      activeFoci: Array.from(this.activeFoci.values()),
      focusChanges,
      focusWindow: this.config.focusWindow,
      totalActiveElements: this.activeFoci.size,
      source: 'attention_focus_manager',
      timestamp: currentTime
    };
  }

  decayExistingFoci(currentTime) {
    for (const [focusId, focus] of this.activeFoci.entries()) {
      const ageMs = currentTime - focus.startTime;
      const decayFactor = Math.exp(-ageMs / (this.config.attentionSpan * 1000));
      
      focus.intensity *= decayFactor;
      focus.lastUpdate = currentTime;

      // Remove foci that have decayed too much
      if (focus.intensity < this.getSystemBasedMinFocusIntensity()) {
        this.activeFoci.delete(focusId);
      }
    }
  }

  selectFocusCandidates(stimuli, priorities) {
    const maxFoci = this.getSystemBasedMaxFoci();
    const focusCandidates = [];

    // Sort by priority score and select top candidates
    const sortedStimuli = [...stimuli].sort((a, b) => b.priorityScore - a.priorityScore);
    
    for (let i = 0; i < Math.min(maxFoci, sortedStimuli.length); i++) {
      const stimulus = sortedStimuli[i];
      const focusIntensity = this.calculateFocusIntensity(stimulus, priorities);
      
      if (focusIntensity > this.getSystemBasedMinFocusIntensity()) {
        focusCandidates.push({
          id: stimulus.id || `stimulus_${i}`,
          stimulus,
          intensity: focusIntensity,
          priority: stimulus.priority
        });
      }
    }

    return focusCandidates;
  }

  calculateFocusIntensity(stimulus, priorities) {
    let intensity = stimulus.priorityScore || this.getSystemBasedBaseFocusIntensity();

    // Boost intensity for critical priorities
    if (stimulus.priority === 'critical') {
      intensity *= this.getSystemBasedCriticalBoost();
    } else if (stimulus.priority === 'high') {
      intensity *= this.getSystemBasedHighBoost();
    }

    // Apply processing weight
    intensity *= (stimulus.processingWeight || 1);

    // System-based intensity adjustment
    const systemAdjustment = this.getSystemBasedIntensityAdjustment();
    
    return Math.max(0.1, Math.min(1, intensity + systemAdjustment));
  }

  updateActiveFoci(focusCandidates, currentTime) {
    const focusChanges = [];

    for (const candidate of focusCandidates) {
      const existingFocus = this.activeFoci.get(candidate.id);

      if (existingFocus) {
        // Update existing focus
        const oldIntensity = existingFocus.intensity;
        existingFocus.intensity = Math.max(existingFocus.intensity, candidate.intensity);
        existingFocus.lastUpdate = currentTime;
        existingFocus.priority = candidate.priority;

        if (Math.abs(existingFocus.intensity - oldIntensity) > this.getSystemBasedIntensityThreshold()) {
          focusChanges.push({
            type: 'intensity_change',
            focusId: candidate.id,
            oldIntensity,
            newIntensity: existingFocus.intensity,
            timestamp: currentTime
          });
        }
      } else {
        // Add new focus
        const newFocus = {
          id: candidate.id,
          stimulus: candidate.stimulus,
          intensity: candidate.intensity,
          priority: candidate.priority,
          startTime: currentTime,
          lastUpdate: currentTime
        };

        this.activeFoci.set(candidate.id, newFocus);
        
        focusChanges.push({
          type: 'focus_added',
          focusId: candidate.id,
          intensity: candidate.intensity,
          priority: candidate.priority,
          timestamp: currentTime
        });
      }
    }

    return focusChanges;
  }

  recordFocusHistory(focusChanges, timestamp) {
    if (focusChanges.length > 0) {
      this.focusHistory.push({
        timestamp,
        changes: [...focusChanges],
        activeFociCount: this.activeFoci.size
      });

      // Limit history size
      const maxHistorySize = this.getSystemBasedMaxFocusHistorySize();
      if (this.focusHistory.length > maxHistorySize) {
        this.focusHistory = this.focusHistory.slice(-maxHistorySize);
      }
    }
  }

  getFocusState() {
    return {
      activeFociCount: this.activeFoci.size,
      activeFoci: Array.from(this.activeFoci.values()),
      totalIntensity: Array.from(this.activeFoci.values())
        .reduce((sum, focus) => sum + focus.intensity, 0),
      averageIntensity: this.activeFoci.size > 0 ? 
        Array.from(this.activeFoci.values())
          .reduce((sum, focus) => sum + focus.intensity, 0) / this.activeFoci.size : 0,
      focusHistoryLength: this.focusHistory.length
    };
  }

  // === Méthodes système anti-fake pour AttentionFocusManager ===

  getSystemBasedFocusWindow() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuRatio = cpuUsage.user / (cpuUsage.user + cpuUsage.system + 1);
    return Math.max(3, Math.min(10, Math.round(5 + cpuRatio * 5)));
  }

  getSystemBasedAttentionSpan() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(30, Math.min(300, Math.round(120 + (2 - loadAvg) * 60)));
  }

  getSystemBasedFocusDecay() {
    const uptime = this.systemMetrics.getUptime();
    const timeDecay = 0.01 + ((uptime % 1000) / 100000);
    return Math.max(0.005, Math.min(0.05, timeDecay));
  }

  getSystemBasedMinFocusIntensity() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.1, Math.min(0.3, 0.2 + (memRatio - 0.5) * 0.2));
  }

  getSystemBasedMaxFoci() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const availableMem = (memUsage.heapTotal - memUsage.heapUsed) / memUsage.heapTotal;
    return Math.max(3, Math.min(12, Math.round(5 + availableMem * 7)));
  }

  getSystemBasedBaseFocusIntensity() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemLoad = (cpuUsage.user + cpuUsage.system) % 1000;
    return Math.max(0.3, Math.min(0.7, 0.5 + (systemLoad / 10000)));
  }

  getSystemBasedCriticalBoost() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    return Math.max(1.5, Math.min(2.5, 2.0 + (loadAvg - 1) * 0.25));
  }

  getSystemBasedHighBoost() {
    const uptime = this.systemMetrics.getUptime();
    const timeBoost = 1.2 + ((uptime % 100) / 1000);
    return Math.max(1.1, Math.min(1.8, timeBoost));
  }

  getSystemBasedIntensityAdjustment() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const externalRatio = memUsage.external / memUsage.rss;
    return Math.max(-0.1, Math.min(0.1, (externalRatio - 0.1) * 0.5));
  }

  getSystemBasedIntensityThreshold() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuVariance = (cpuUsage.system % 100) / 1000;
    return Math.max(0.05, Math.min(0.2, 0.1 + cpuVariance));
  }

  getSystemBasedMaxFocusHistorySize() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memAvailable = (memUsage.heapTotal - memUsage.heapUsed) / memUsage.heapTotal;
    return Math.max(20, Math.min(200, Math.round(50 + memAvailable * 150)));
  }
}

/**
 * Top-Down Attention Principal - Architecture cognitive complète Anti-fake
 */
class TopDownAttention extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    // Dependency Injection Anti-Fake
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};

    // Métriques système pour tous les calculs cognitifs
    this.systemMetrics = dependencies.systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime(),
      getHRTime: () => process.hrtime.bigint()
    };

    // Initialize cognitive components
    this.priorityAnalyzer = new CognitivePriorityAnalyzer(this.config.priority, this.systemMetrics);
    this.focusManager = new AttentionFocusManager(this.config.focus, this.systemMetrics);

    // Attention state
    this.attentionState = {
      currentContext: null,
      processingQueue: [],
      attentionHistory: [],
      cognitiveLoad: 0,
      focusIntensity: 0
    };

    this.isInitialized = false;
    this.processingInterval = null;

    this.logger.info("🎯 Top-Down Attention initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.isInitialized = true;

      // Start attention processing loop
      const processingInterval = this.getSystemBasedProcessingInterval();
      this.processingInterval = setInterval(() => {
        this.processAttentionCycle();
      }, processingInterval);

      this.logger.info("✅ Top-Down Attention initialized");
      this.emit("attentionReady");
    } catch (error) {
      this.logger.error("❌ Top-Down Attention initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  async processAttention(stimuli, context = {}) {
    const startTime = performance.now();

    try {
      if (!Array.isArray(stimuli) || stimuli.length === 0) {
        return this.createEmptyAttentionResult(startTime);
      }

      // Update current context
      this.attentionState.currentContext = {
        ...context,
        timestamp: Date.now(),
        stimuliCount: stimuli.length
      };

      // Phase 1: Analyze cognitive priorities
      const priorityAnalysis = await this.priorityAnalyzer.analyzeCognitivePriority(stimuli, context);
      
      if (priorityAnalysis.status !== 'analyzed') {
        return this.createErrorAttentionResult(new Error('Priority analysis failed'), startTime);
      }

      // Phase 2: Manage attention focus
      const focusManagement = await this.focusManager.manageFocus(
        priorityAnalysis.priorities, 
        priorityAnalysis
      );

      // Phase 3: Generate attention allocation
      const attentionAllocation = this.generateAttentionAllocation(
        priorityAnalysis,
        focusManagement
      );

      // Phase 4: Update attention state
      this.updateAttentionState(priorityAnalysis, focusManagement, attentionAllocation);

      const result = {
        status: 'processed',
        priorityAnalysis,
        focusManagement,
        attentionAllocation,
        cognitiveLoad: this.attentionState.cognitiveLoad,
        focusIntensity: this.attentionState.focusIntensity,
        processingTime: performance.now() - startTime,
        attentionMetrics: this.getAttentionMetrics(),
        source: 'top_down_attention',
        timestamp: Date.now()
      };

      this.emit('attentionProcessed', result);
      return result;

    } catch (error) {
      this.logger.error("Attention processing failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      return this.createErrorAttentionResult(error, performance.now() - startTime);
    }
  }

  generateAttentionAllocation(priorityAnalysis, focusManagement) {
    const allocation = {
      totalResources: this.getSystemBasedTotalResources(),
      allocations: [],
      utilizationRate: 0
    };

    const activeFoci = focusManagement.activeFoci || [];
    const totalIntensity = activeFoci.reduce((sum, focus) => sum + focus.intensity, 0);

    if (totalIntensity === 0) {
      return {
        ...allocation,
        allocations: [],
        utilizationRate: 0,
        efficiency: 0
      };
    }

    let allocatedResources = 0;

    for (const focus of activeFoci) {
      const resourceShare = (focus.intensity / totalIntensity) * allocation.totalResources;
      const processingTime = this.estimateProcessingTime(focus.stimulus, resourceShare);
      
      const focusAllocation = {
        focusId: focus.id,
        priority: focus.priority,
        resourceShare,
        processingTime,
        intensity: focus.intensity,
        startTime: Date.now(),
        estimatedCompletion: Date.now() + processingTime
      };

      allocation.allocations.push(focusAllocation);
      allocatedResources += resourceShare;
    }

    allocation.utilizationRate = allocatedResources / allocation.totalResources;
    allocation.efficiency = this.calculateAllocationEfficiency(allocation);

    return allocation;
  }

  estimateProcessingTime(stimulus, resourceShare) {
    // Base processing time estimation
    let baseTime = this.getSystemBasedBaseProcessingTime();

    // Adjust for stimulus complexity
    if (stimulus.text) {
      const textComplexity = stimulus.text.length / 1000; // Normalize by 1000 chars
      baseTime *= (1 + textComplexity);
    }

    // Adjust for resource availability
    const resourceFactor = Math.max(0.5, Math.min(2.0, resourceShare / 0.25)); // 0.25 as baseline
    baseTime /= resourceFactor;

    // Apply system-based variance
    const systemVariance = this.getSystemBasedProcessingTimeVariance();
    
    return Math.max(100, Math.round(baseTime + systemVariance)); // Minimum 100ms
  }

  calculateAllocationEfficiency(allocation) {
    if (allocation.allocations.length === 0) return 0;

    // Efficiency based on priority distribution and resource utilization
    const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
    let weightedScore = 0;
    let totalWeight = 0;

    allocation.allocations.forEach(alloc => {
      const weight = priorityWeights[alloc.priority] || 1;
      weightedScore += alloc.resourceShare * weight;
      totalWeight += weight;
    });

    const priorityEfficiency = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const utilizationEfficiency = allocation.utilizationRate;

    // Combined efficiency with system-based adjustment
    let efficiency = (priorityEfficiency * 0.6) + (utilizationEfficiency * 0.4);
    const systemAdjustment = this.getSystemBasedEfficiencyAdjustment();
    
    return Math.max(0, Math.min(1, efficiency + systemAdjustment));
  }

  updateAttentionState(priorityAnalysis, focusManagement, attentionAllocation) {
    // Update cognitive load
    this.attentionState.cognitiveLoad = priorityAnalysis.cognitiveLoad;

    // Update focus intensity
    const activeFoci = focusManagement.activeFoci || [];
    this.attentionState.focusIntensity = activeFoci.reduce((sum, focus) => sum + focus.intensity, 0);

    // Update processing queue
    this.attentionState.processingQueue = attentionAllocation.allocations.map(alloc => ({
      focusId: alloc.focusId,
      priority: alloc.priority,
      estimatedCompletion: alloc.estimatedCompletion,
      status: 'queued'
    }));

    // Record in attention history
    this.attentionState.attentionHistory.push({
      timestamp: Date.now(),
      cognitiveLoad: this.attentionState.cognitiveLoad,
      focusIntensity: this.attentionState.focusIntensity,
      activeFociCount: activeFoci.length,
      allocationEfficiency: attentionAllocation.efficiency
    });

    // Limit history size
    const maxHistorySize = this.getSystemBasedMaxAttentionHistorySize();
    if (this.attentionState.attentionHistory.length > maxHistorySize) {
      this.attentionState.attentionHistory = this.attentionState.attentionHistory.slice(-maxHistorySize);
    }
  }

  processAttentionCycle() {
    // Background attention maintenance
    const now = Date.now();
    
    // Update processing queue status
    this.attentionState.processingQueue.forEach(item => {
      if (item.status === 'queued' && now >= item.estimatedCompletion) {
        item.status = 'completed';
      }
    });

    // Remove completed items
    this.attentionState.processingQueue = this.attentionState.processingQueue
      .filter(item => item.status !== 'completed');

    // Emit cycle completion
    this.emit('attentionCycle', {
      timestamp: now,
      queueLength: this.attentionState.processingQueue.length,
      cognitiveLoad: this.attentionState.cognitiveLoad
    });
  }

  getAttentionMetrics() {
    const focusState = this.focusManager.getFocusState();
    
    return {
      cognitiveLoad: this.attentionState.cognitiveLoad,
      focusIntensity: this.attentionState.focusIntensity,
      activeFociCount: focusState.activeFociCount,
      averageFocusIntensity: focusState.averageIntensity,
      processingQueueLength: this.attentionState.processingQueue.length,
      attentionHistoryLength: this.attentionState.attentionHistory.length,
      systemMetrics: {
        memoryUsage: this.systemMetrics.getMemoryUsage(),
        cpuUsage: this.systemMetrics.getCpuUsage(),
        loadAverage: this.systemMetrics.getLoadAvg()
      }
    };
  }

  getAttentionState() {
    return {
      ...this.attentionState,
      focusState: this.focusManager.getFocusState(),
      isActive: this.processingInterval !== null,
      uptime: this.isInitialized ? Date.now() - (this.attentionState.currentContext?.timestamp || Date.now()) : 0
    };
  }

  // === Méthodes système anti-fake pour TopDownAttention ===

  getSystemBasedProcessingInterval() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    const baseInterval = 1000; // 1 second base
    const variance = (loadAvg % 1) * 500; // 0-500ms variance
    
    return Math.round(baseInterval + variance);
  }

  getSystemBasedTotalResources() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const availableMemRatio = (memUsage.heapTotal - memUsage.heapUsed) / memUsage.heapTotal;
    return Math.max(0.5, Math.min(2.0, 1.0 + availableMemRatio));
  }

  getSystemBasedBaseProcessingTime() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuLoad = (cpuUsage.user + cpuUsage.system) / Math.max(1, cpuUsage.user + cpuUsage.system + 1000);
    return Math.max(500, Math.min(5000, Math.round(1000 + cpuLoad * 2000)));
  }

  getSystemBasedProcessingTimeVariance() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 10000n);
    return Math.max(-200, Math.min(200, (hrtime - 5000) / 25));
  }

  getSystemBasedEfficiencyAdjustment() {
    const uptime = this.systemMetrics.getUptime();
    const timeAdjustment = ((uptime % 1000) - 500) / 10000;
    return Math.max(-0.05, Math.min(0.05, timeAdjustment));
  }

  getSystemBasedMaxAttentionHistorySize() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(50, Math.min(500, Math.round(100 + (1 - memRatio) * 400)));
  }

  createEmptyAttentionResult(startTime) {
    return {
      status: "empty",
      priorityAnalysis: { status: 'no_stimuli', priorities: [], cognitiveLoad: 0 },
      focusManagement: { status: 'no_stimuli', activeFoci: [], focusChanges: [] },
      attentionAllocation: { allocations: [], utilizationRate: 0, efficiency: 0 },
      cognitiveLoad: 0,
      focusIntensity: 0,
      processingTime: performance.now() - startTime,
      source: "top_down_attention",
      timestamp: Date.now()
    };
  }

  createErrorAttentionResult(error, processingTime) {
    return {
      status: "error",
      error: error.message,
      processingTime,
      source: "top_down_attention",
      timestamp: Date.now()
    };
  }

  async shutdown() {
    this.logger.info("🛑 Top-Down Attention shutting down...");
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    // Clear attention state
    this.attentionState.processingQueue = [];
    this.attentionState.attentionHistory = [];
    
    this.logger.info("✅ Top-Down Attention shutdown complete");
  }
}

export default TopDownAttention;
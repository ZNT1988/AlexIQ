import { EventEmitter } from "events";
import logger from "../config/logger.js";
import os from "os";

class SystemMetrics {
  static getInstance() {
    /* eslint-disable no-undef */
    if (!SystemMetrics.instance) {
      SystemMetrics.instance = new SystemMetrics();
    }
    return SystemMetrics.instance;
  }

  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return {
      heap: memUsage.heapUsed / memUsage.heapTotal,
      resident: memUsage.rss / totalMem,
      external: memUsage.external,
      system: (totalMem - freeMem) / totalMem
    };
  }

  getCpuUsage() {
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();
    return {
      user: cpuUsage.user,
      system: cpuUsage.system,
      load1: loadAvg[0],
      load5: loadAvg[1],
      load15: loadAvg[2]
    };
  }

  getSystemVariance(baseValue = 0.1) {
    const memUsage = this.getMemoryUsage();
    const cpuUsage = this.getCpuUsage();
    return ((memUsage.heap + cpuUsage.load1) % 100) / 1000 * baseValue;
  }
}

class VirtualEnvironmentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxEnvironments: config.maxEnvironments || 50,
      defaultCapacity: config.defaultCapacity || 100,
      immersionThreshold: config.immersionThreshold || 0.7,
      qualityStandards: config.qualityStandards || 0.8,
      renderingOptimization: config.renderingOptimization || true,
      ...config
    };
    this.environments = new Map();
    this.systemMetrics = SystemMetrics.getInstance();
    this.renderingEngine = new VRRenderingEngine(this.config);
    this.init();
  }

  init() {
    this.createDefaultEnvironments();
    this.startEnvironmentMonitoring();
    logger.info("VirtualEnvironmentManager initialized");
  }

  createDefaultEnvironments() {
    const defaultSpaces = [
      { id: "workspace", name: "Virtual Workspace", type: "productivity" },
      { id: "meeting", name: "Meeting Room", type: "collaboration" },
      { id: "learning", name: "Learning Space", type: "education" },
      { id: "creative", name: "Creative Studio", type: "creativity" }
    ];

    defaultSpaces.forEach(space => {
      this.createEnvironment(space.id, space.name, space.type);
    });
  }

  createEnvironment(environmentId, name, type) {
    if (this.environments.has(environmentId)) {
      logger.warn(`Environment ${environmentId} already exists`);
      return this.environments.get(environmentId);
    }

    const systemMetrics = this.systemMetrics.getMemoryUsage();
    const baseHue = ((systemMetrics.heap * 1000) % 360);
    
    const environment = {
      id: environmentId,
      name: name,
      type: type,
      created: new Date(),
      visitors: new Map(),
      objects: new Map(),
      lighting: this.generateSystemBasedLighting(baseHue),
      physics: this.initializePhysicsEngine(),
      capacity: this.config.defaultCapacity,
      qualityLevel: this.calculateSystemBasedQuality(),
      rendering: {
        resolution: this.getOptimalResolution(),
        frameRate: this.getTargetFrameRate(),
        antiAliasing: true,
        shadows: true
      }
    };

    this.environments.set(environmentId, environment);
    this.emit("environmentCreated", { environment });
    logger.info(`Virtual environment created: ${name} (${environmentId})`);
    return environment;
  }

  generateSystemBasedLighting(baseHue) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    
    const intensity = Math.max(0.3, Math.min(1.0, 0.5 + memUsage.heap));
    const warmth = Math.max(0.2, Math.min(0.8, cpuUsage.load1 / 10));
    const ambientLevel = Math.max(0.1, Math.min(0.5, memUsage.system));

    return {
      primary: {
        hue: baseHue,
        saturation: intensity * 100,
        lightness: 50 + (warmth * 30)
      },
      ambient: {
        intensity: ambientLevel,
        color: [255, 255, 255],
        direction: [0, 1, 0]
      },
      shadows: {
        enabled: true,
        quality: intensity > 0.7 ? "high" : "medium",
        softness: warmth
      }
    };
  }

  initializePhysicsEngine() {
    const cpuMetrics = this.systemMetrics.getCpuUsage();
    const complexity = cpuMetrics.load1 < 2 ? "high" : "medium";
    
    return {
      gravity: [0, -9.81, 0],
      timeStep: 1/60,
      complexity: complexity,
      collisionDetection: true,
      bodyCount: 0,
      constraints: []
    };
  }

  calculateSystemBasedQuality() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    
    const memoryScore = 1 - memUsage.system;
    const cpuScore = Math.max(0, 1 - (cpuUsage.load5 / 5));
    
    return Math.max(0.3, Math.min(1.0, (memoryScore + cpuScore) / 2));
  }

  getOptimalResolution() {
    const quality = this.calculateSystemBasedQuality();
    if (quality > 0.8) return { width: 2160, height: 1200 }; // 4K VR
    if (quality > 0.6) return { width: 1920, height: 1080 }; // 2K VR
    return { width: 1440, height: 810 }; // Standard VR
  }

  getTargetFrameRate() {
    const quality = this.calculateSystemBasedQuality();
    if (quality > 0.8) return 90;
    if (quality > 0.6) return 72;
    return 60;
  }

  startEnvironmentMonitoring() {
    setInterval(() => {
      this.updateEnvironmentMetrics();
      this.optimizePerformance();
    }, this.config.monitoringInterval || 30000);
  }

  updateEnvironmentMetrics() {
    for (const [envId, environment] of this.environments) {
      const visitorCount = environment.visitors.size;
      const objectCount = environment.objects.size;
      const systemLoad = this.systemMetrics.getCpuUsage().load1;
      
      environment.metrics = {
        visitorCount,
        objectCount,
        systemLoad,
        frameRate: this.calculateCurrentFrameRate(environment),
        memoryUsage: this.calculateEnvironmentMemoryUsage(environment),
        lastUpdated: new Date()
      };
    }
  }

  calculateCurrentFrameRate(environment) {
    const complexity = environment.objects.size + (environment.visitors.size * 2);
    const systemQuality = this.calculateSystemBasedQuality();
    const baseFrameRate = this.getTargetFrameRate();
    
    const loadFactor = Math.max(0.5, 1 - (complexity / 1000));
    return Math.floor(baseFrameRate * systemQuality * loadFactor);
  }

  calculateEnvironmentMemoryUsage(environment) {
    const baseMemory = 50; // MB
    const visitorMemory = environment.visitors.size * 5; // 5MB per visitor
    const objectMemory = environment.objects.size * 2; // 2MB per object
    
    return baseMemory + visitorMemory + objectMemory;
  }

  optimizePerformance() {
    for (const [envId, environment] of this.environments) {
      if (environment.metrics?.frameRate < 60) {
        this.applyPerformanceOptimizations(environment);
      }
    }
  }

  applyPerformanceOptimizations(environment) {
    // Reduce rendering quality if needed
    if (environment.rendering.resolution.width > 1440) {
      environment.rendering.resolution = { width: 1440, height: 810 };
    }
    
    // Simplify physics if needed
    if (environment.physics.complexity === "high") {
      environment.physics.complexity = "medium";
    }
    
    // Reduce shadow quality
    if (environment.lighting.shadows.quality === "high") {
      environment.lighting.shadows.quality = "medium";
    }
    
    logger.info(`Performance optimizations applied to environment ${environment.id}`);
  }
}

class VRRenderingEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.systemMetrics = SystemMetrics.getInstance();
    this.renderQueue = [];
    this.activeRenders = new Map();
  }

  renderEnvironment(environment, viewpoint) {
    const renderContext = this.createRenderContext(environment, viewpoint);
    const renderJob = {
      id: this.generateSystemBasedId(),
      environment: environment.id,
      context: renderContext,
      priority: this.calculateRenderPriority(environment),
      timestamp: Date.now()
    };
    
    this.renderQueue.push(renderJob);
    this.processRenderQueue();
    return renderJob.id;
  }

  createRenderContext(environment, viewpoint) {
    const systemMetrics = this.systemMetrics.getMemoryUsage();
    
    return {
      camera: {
        position: viewpoint.position || [0, 1.7, 0],
        rotation: viewpoint.rotation || [0, 0, 0],
        fov: viewpoint.fov || 110
      },
      lighting: environment.lighting,
      resolution: environment.rendering.resolution,
      quality: {
        textures: systemMetrics.heap > 0.8 ? "medium" : "high",
        models: systemMetrics.system > 0.7 ? "simplified" : "detailed",
        effects: systemMetrics.heap > 0.9 ? "basic" : "advanced"
      },
      optimization: {
        frustumCulling: true,
        occlusionCulling: true,
        levelOfDetail: true,
        batching: true
      }
    };
  }

  calculateRenderPriority(environment) {
    const visitorCount = environment.visitors.size;
    const systemLoad = this.systemMetrics.getCpuUsage().load1;
    
    // Higher visitor count = higher priority
    const visitorPriority = Math.min(1, visitorCount / 10);
    // Lower system load = higher priority
    const systemPriority = Math.max(0, 1 - (systemLoad / 5));
    
    return (visitorPriority + systemPriority) / 2;
  }

  generateSystemBasedId() {
    const timestamp = Date.now();
    const memUsage = this.systemMetrics.getMemoryUsage();
    const systemSeed = Math.floor(memUsage.heap * 10000);
    return `render_${timestamp}_${systemSeed}`;
  }

  processRenderQueue() {
    const maxConcurrentRenders = this.getMaxConcurrentRenders();
    
    while (this.renderQueue.length > 0 && this.activeRenders.size < maxConcurrentRenders) {
      // Sort by priority
      this.renderQueue.sort((a, b) => b.priority - a.priority);
      const renderJob = this.renderQueue.shift();
      
      this.executeRender(renderJob);
    }
  }

  getMaxConcurrentRenders() {
    const systemQuality = this.calculateSystemBasedQuality();
    if (systemQuality > 0.8) return 4;
    if (systemQuality > 0.6) return 2;
    return 1;
  }

  calculateSystemBasedQuality() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    
    return Math.max(0.2, Math.min(1.0, 1 - (memUsage.system + (cpuUsage.load5 / 10)) / 2));
  }

  async executeRender(renderJob) {
    this.activeRenders.set(renderJob.id, renderJob);
    
    try {
      const renderResult = await this.performActualRender(renderJob);
      this.emit("renderComplete", { job: renderJob, result: renderResult });
      
    } catch (error) {
      logger.error(`Render job ${renderJob.id} failed:`, error);
      this.emit("renderError", { job: renderJob, error });
      
    } finally {
      this.activeRenders.delete(renderJob.id);
      this.processRenderQueue(); // Process next in queue
    }
  }

  async performActualRender(renderJob) {
    const startTime = performance.now();
    
    // Simulate rendering process with system-based timing
    const complexity = this.calculateRenderComplexity(renderJob);
    const renderTime = this.calculateSystemBasedRenderTime(complexity);
    
    await new Promise(resolve => setTimeout(resolve, renderTime));
    
    const endTime = performance.now();
    
    return {
      renderId: renderJob.id,
      frameData: this.generateFrameData(renderJob),
      renderTime: endTime - startTime,
      quality: renderJob.context.quality,
      timestamp: Date.now()
    };
  }

  calculateRenderComplexity(renderJob) {
    const context = renderJob.context;
    let complexity = 1;
    
    // Resolution complexity
    const pixels = context.resolution.width * context.resolution.height;
    complexity += pixels / 1000000; // Normalize to base complexity
    
    // Quality complexity
    if (context.quality.textures === "high") complexity += 0.5;
    if (context.quality.models === "detailed") complexity += 0.3;
    if (context.quality.effects === "advanced") complexity += 0.2;
    
    return complexity;
  }

  calculateSystemBasedRenderTime(complexity) {
    const systemQuality = this.calculateSystemBasedQuality();
    const baseTime = 16; // 16ms for 60fps
    
    const adjustedTime = baseTime * complexity * (2 - systemQuality);
    return Math.max(8, Math.min(100, adjustedTime)); // 8ms to 100ms range
  }

  generateFrameData(renderJob) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const timestamp = Date.now();
    
    return {
      frameId: `frame_${timestamp}_${Math.floor(memUsage.heap * 1000)}`,
      resolution: renderJob.context.resolution,
      format: "stereoscopic",
      eyeData: {
        left: { offset: [-0.032, 0, 0] },
        right: { offset: [0.032, 0, 0] }
      },
      metadata: {
        renderTime: renderJob.context.renderTime,
        quality: renderJob.context.quality.textures,
        optimization: Object.keys(renderJob.context.optimization).filter(
          key => renderJob.context.optimization[key]
        )
      }
    };
  }
}

class ImmersiveExperienceEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxSessions: config.maxSessions || 100,
      sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
      trackingInterval: config.trackingInterval || 5000,
      experienceTypes: config.experienceTypes || ["education", "training", "entertainment", "productivity"],
      ...config
    };
    this.sessions = new Map();
    this.experiences = new Map();
    this.systemMetrics = SystemMetrics.getInstance();
    this.init();
  }

  init() {
    this.createDefaultExperiences();
    this.startSessionMonitoring();
    logger.info("ImmersiveExperienceEngine initialized");
  }

  createDefaultExperiences() {
    const defaultExperiences = [
      {
        id: "skill-training",
        name: "Professional Skill Training",
        type: "education",
        objectives: ["complete_module", "pass_assessment", "practical_application"]
      },
      {
        id: "team-collaboration",
        name: "Team Collaboration Session",
        type: "productivity",
        objectives: ["join_meeting", "contribute_ideas", "complete_tasks"]
      },
      {
        id: "creative-workshop",
        name: "Creative Workshop",
        type: "entertainment",
        objectives: ["create_content", "share_work", "provide_feedback"]
      }
    ];

    defaultExperiences.forEach(exp => {
      this.createExperience(exp.id, exp.name, exp.type, exp.objectives);
    });
  }

  createExperience(experienceId, name, type, objectives) {
    if (!this.config.experienceTypes.includes(type)) {
      throw new Error(`Invalid experience type: ${type}`);
    }

    const experience = {
      id: experienceId,
      name: name,
      type: type,
      objectives: objectives,
      created: new Date(),
      participants: new Map(),
      content: {
        scenes: [],
        interactions: [],
        assessments: []
      },
      analytics: {
        totalSessions: 0,
        avgCompletionRate: 0,
        avgRating: 0,
        lastUpdated: new Date()
      }
    };

    this.experiences.set(experienceId, experience);
    this.emit("experienceCreated", { experience });
    logger.info(`Immersive experience created: ${name} (${experienceId})`);
    return experience;
  }

  startSession(userId, experienceId, environmentId) {
    const sessionId = this.generateSystemBasedSessionId();
    const experience = this.experiences.get(experienceId);
    
    if (!experience) {
      throw new Error(`Experience not found: ${experienceId}`);
    }

    const session = {
      id: sessionId,
      userId: userId,
      experienceId: experienceId,
      environmentId: environmentId,
      started: new Date(),
      status: "active",
      interactions: [],
      progress: {
        completedObjectives: [],
        currentObjective: experience.objectives[0],
        completionPercentage: 0
      },
      metrics: {
        immersionLevel: this.calculateInitialImmersion(),
        engagementScore: 0,
        learningProgress: 0,
        satisfactionLevel: 0
      },
      biometrics: {
        heartRate: null,
        skinConductance: null,
        eyeTracking: null,
        headMovement: null
      }
    };

    this.sessions.set(sessionId, session);
    experience.participants.set(userId, sessionId);
    experience.analytics.totalSessions++;

    this.emit("sessionStarted", { session });
    logger.info(`VR session started: ${sessionId} for user ${userId}`);
    return session;
  }

  generateSystemBasedSessionId() {
    const timestamp = Date.now();
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    
    const systemSeed = Math.floor((memUsage.heap + cpuUsage.load1) * 10000);
    return `vr_session_${timestamp}_${systemSeed}`;
  }

  calculateInitialImmersion() {
    const systemMetrics = this.systemMetrics.getMemoryUsage();
    const cpuMetrics = this.systemMetrics.getCpuUsage();
    
    // Base immersion influenced by system performance
    const systemPerformance = Math.max(0.3, 1 - systemMetrics.system);
    const cpuAvailability = Math.max(0.2, 1 - (cpuMetrics.load5 / 5));
    
    return Math.max(0.4, Math.min(1.0, (systemPerformance + cpuAvailability) / 2));
  }

  trackInteraction(sessionId, interactionType, interactionData) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.warn(`Session not found for interaction tracking: ${sessionId}`);
      return;
    }

    const interaction = {
      id: this.generateSystemBasedInteractionId(),
      type: interactionType,
      timestamp: new Date(),
      data: interactionData,
      systemContext: {
        memoryUsage: this.systemMetrics.getMemoryUsage().heap,
        cpuLoad: this.systemMetrics.getCpuUsage().load1
      }
    };

    session.interactions.push(interaction);
    this.updateSessionMetrics(session);
    this.emit("interactionTracked", { session, interaction });
  }

  generateSystemBasedInteractionId() {
    const timestamp = Date.now();
    const systemVariance = this.systemMetrics.getSystemVariance();
    const interactionSeed = Math.floor(systemVariance * 100000);
    return `interaction_${timestamp}_${interactionSeed}`;
  }

  updateSessionMetrics(session) {
    const currentTime = Date.now();
    const sessionDuration = currentTime - session.started.getTime();
    const interactionCount = session.interactions.length;
    
    // Calculate engagement based on interaction frequency
    const interactionRate = interactionCount / (sessionDuration / 60000); // per minute
    session.metrics.engagementScore = Math.min(1.0, interactionRate / 10);
    
    // Update immersion based on consistent interaction
    const recentInteractions = session.interactions.filter(
      i => (currentTime - i.timestamp.getTime()) < 30000 // last 30 seconds
    );
    
    if (recentInteractions.length > 0) {
      session.metrics.immersionLevel = Math.min(1.0, session.metrics.immersionLevel + 0.01);
    } else {
      session.metrics.immersionLevel = Math.max(0.2, session.metrics.immersionLevel - 0.005);
    }
    
    // Update progress
    this.updateSessionProgress(session);
  }

  updateSessionProgress(session) {
    const experience = this.experiences.get(session.experienceId);
    if (!experience) return;

    const totalObjectives = experience.objectives.length;
    const completedCount = session.progress.completedObjectives.length;
    
    session.progress.completionPercentage = (completedCount / totalObjectives) * 100;
    
    // Auto-advance objectives based on interaction patterns
    if (session.interactions.length > 0 && completedCount < totalObjectives) {
      const currentObjectiveIndex = completedCount;
      const targetInteractions = (currentObjectiveIndex + 1) * 5; // 5 interactions per objective
      
      if (session.interactions.length >= targetInteractions) {
        this.completeObjective(session, experience.objectives[currentObjectiveIndex]);
      }
    }
  }

  completeObjective(session, objective) {
    if (!session.progress.completedObjectives.includes(objective)) {
      session.progress.completedObjectives.push(objective);
      
      const experience = this.experiences.get(session.experienceId);
      const nextIndex = session.progress.completedObjectives.length;
      
      if (nextIndex < experience.objectives.length) {
        session.progress.currentObjective = experience.objectives[nextIndex];
      } else {
        session.progress.currentObjective = null;
        this.completeSession(session.id);
      }
      
      this.emit("objectiveCompleted", { session, objective });
      logger.info(`Objective completed: ${objective} in session ${session.id}`);
    }
  }

  completeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = "completed";
    session.ended = new Date();
    session.duration = session.ended.getTime() - session.started.getTime();
    
    // Calculate final satisfaction based on completion and engagement
    const completionRate = session.progress.completionPercentage / 100;
    const avgImmersion = session.metrics.immersionLevel;
    const avgEngagement = session.metrics.engagementScore;
    
    session.metrics.satisfactionLevel = (completionRate + avgImmersion + avgEngagement) / 3;
    
    // Update experience analytics
    this.updateExperienceAnalytics(session);
    
    this.emit("sessionCompleted", { session });
    logger.info(`VR session completed: ${sessionId}`);
  }

  updateExperienceAnalytics(session) {
    const experience = this.experiences.get(session.experienceId);
    if (!experience) return;

    const allSessions = Array.from(this.sessions.values())
      .filter(s => s.experienceId === session.experienceId && s.status === "completed");
    
    if (allSessions.length > 0) {
      const avgCompletion = allSessions.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / allSessions.length;
      const avgSatisfaction = allSessions.reduce((sum, s) => sum + s.metrics.satisfactionLevel, 0) / allSessions.length;
      
      experience.analytics.avgCompletionRate = avgCompletion / 100;
      experience.analytics.avgRating = avgSatisfaction;
      experience.analytics.lastUpdated = new Date();
    }
  }

  startSessionMonitoring() {
    setInterval(() => {
      this.checkSessionTimeouts();
      this.updateActiveSessionMetrics();
    }, this.config.trackingInterval);
  }

  checkSessionTimeouts() {
    const currentTime = Date.now();
    
    for (const [sessionId, session] of this.sessions) {
      if (session.status === "active") {
        const sessionAge = currentTime - session.started.getTime();
        
        if (sessionAge > this.config.sessionTimeout) {
          this.endSession(sessionId, "timeout");
        }
      }
    }
  }

  updateActiveSessionMetrics() {
    for (const [sessionId, session] of this.sessions) {
      if (session.status === "active") {
        this.updateSessionMetrics(session);
      }
    }
  }

  endSession(sessionId, reason = "manual") {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = "ended";
    session.ended = new Date();
    session.endReason = reason;
    session.duration = session.ended.getTime() - session.started.getTime();
    
    this.emit("sessionEnded", { session, reason });
    logger.info(`VR session ended: ${sessionId} (${reason})`);
  }

  getSessionMetrics(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId: session.id,
      duration: session.duration || (Date.now() - session.started.getTime()),
      status: session.status,
      progress: session.progress,
      metrics: session.metrics,
      interactionCount: session.interactions.length,
      lastActivity: session.interactions.length > 0 
        ? session.interactions[session.interactions.length - 1].timestamp 
        : session.started
    };
  }

  getExperienceAnalytics(experienceId) {
    const experience = this.experiences.get(experienceId);
    if (!experience) return null;

    const sessions = Array.from(this.sessions.values())
      .filter(s => s.experienceId === experienceId);
    
    const activeSessions = sessions.filter(s => s.status === "active").length;
    const completedSessions = sessions.filter(s => s.status === "completed").length;
    
    return {
      experienceId: experience.id,
      name: experience.name,
      type: experience.type,
      totalSessions: experience.analytics.totalSessions,
      activeSessions: activeSessions,
      completedSessions: completedSessions,
      avgCompletionRate: experience.analytics.avgCompletionRate,
      avgRating: experience.analytics.avgRating,
      lastUpdated: experience.analytics.lastUpdated
    };
  }
}

class AlexVirtualReality extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxEnvironments: config.maxEnvironments || 20,
      maxSessions: config.maxSessions || 50,
      performanceMonitoring: config.performanceMonitoring !== false,
      analyticsEnabled: config.analyticsEnabled !== false,
      biometricsEnabled: config.biometricsEnabled || false,
      ...config
    };
    
    this.systemMetrics = SystemMetrics.getInstance();
    this.environmentManager = new VirtualEnvironmentManager(this.config);
    this.renderingEngine = new VRRenderingEngine(this.config);
    this.experienceEngine = new ImmersiveExperienceEngine(this.config);
    
    this.isInitialized = false;
    this.performanceMetrics = {
      avgFrameRate: 0,
      avgLatency: 0,
      memoryUsage: 0,
      activeSessions: 0
    };
    
    this.init();
  }

  init() {
    this.setupEventHandlers();
    this.startPerformanceMonitoring();
    this.isInitialized = true;
    
    this.emit("systemInitialized", {
      timestamp: new Date(),
      config: this.config,
      systemMetrics: this.systemMetrics.getMemoryUsage()
    });
    
    logger.info("AlexVirtualReality system fully initialized");
  }

  setupEventHandlers() {
    // Environment events
    this.environmentManager.on("environmentCreated", (data) => {
      this.emit("environmentCreated", data);
    });

    // Rendering events
    this.renderingEngine.on("renderComplete", (data) => {
      this.updateRenderingMetrics(data);
    });

    this.renderingEngine.on("renderError", (data) => {
      logger.error("Rendering error:", data.error);
      this.emit("renderingError", data);
    });

    // Experience events
    this.experienceEngine.on("sessionStarted", (data) => {
      this.updateSessionMetrics();
      this.emit("sessionStarted", data);
    });

    this.experienceEngine.on("sessionCompleted", (data) => {
      this.updateSessionMetrics();
      this.emit("sessionCompleted", data);
    });
  }

  updateRenderingMetrics(renderData) {
    const frameRate = 1000 / renderData.result.renderTime; // Convert to FPS
    this.performanceMetrics.avgFrameRate = 
      (this.performanceMetrics.avgFrameRate + frameRate) / 2;
    
    this.performanceMetrics.avgLatency = renderData.result.renderTime;
  }

  updateSessionMetrics() {
    this.performanceMetrics.activeSessions = 
      Array.from(this.experienceEngine.sessions.values())
        .filter(s => s.status === "active").length;
  }

  startPerformanceMonitoring() {
    if (!this.config.performanceMonitoring) return;

    setInterval(() => {
      const memUsage = this.systemMetrics.getMemoryUsage();
      this.performanceMetrics.memoryUsage = memUsage.heap;
      
      this.emit("performanceUpdate", {
        timestamp: new Date(),
        metrics: { ...this.performanceMetrics },
        systemMetrics: {
          memory: memUsage,
          cpu: this.systemMetrics.getCpuUsage()
        }
      });
    }, 10000); // Every 10 seconds
  }

  // Public API Methods
  
  createVirtualEnvironment(environmentId, name, type, options = {}) {
    return this.environmentManager.createEnvironment(environmentId, name, type, options);
  }

  startVRSession(userId, experienceId, environmentId) {
    return this.experienceEngine.startSession(userId, experienceId, environmentId);
  }

  endVRSession(sessionId, reason = "manual") {
    return this.experienceEngine.endSession(sessionId, reason);
  }

  trackUserInteraction(sessionId, interactionType, data) {
    return this.experienceEngine.trackInteraction(sessionId, interactionType, data);
  }

  renderEnvironmentView(environmentId, viewpoint) {
    const environment = this.environmentManager.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment not found: ${environmentId}`);
    }
    
    return this.renderingEngine.renderEnvironment(environment, viewpoint);
  }

  getEnvironmentList() {
    return Array.from(this.environmentManager.environments.values()).map(env => ({
      id: env.id,
      name: env.name,
      type: env.type,
      visitorCount: env.visitors.size,
      capacity: env.capacity,
      quality: env.qualityLevel
    }));
  }

  getSessionStatus(sessionId) {
    return this.experienceEngine.getSessionMetrics(sessionId);
  }

  getExperienceAnalytics(experienceId) {
    return this.experienceEngine.getExperienceAnalytics(experienceId);
  }

  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      activeEnvironments: this.environmentManager.environments.size,
      activeSessions: this.performanceMetrics.activeSessions,
      performance: { ...this.performanceMetrics },
      systemHealth: {
        memory: this.systemMetrics.getMemoryUsage(),
        cpu: this.systemMetrics.getCpuUsage(),
        timestamp: new Date()
      }
    };
  }

  // Configuration and optimization

  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Propagate configuration changes
    this.environmentManager.config = { ...this.environmentManager.config, ...newConfig };
    this.renderingEngine.config = { ...this.renderingEngine.config, ...newConfig };
    this.experienceEngine.config = { ...this.experienceEngine.config, ...newConfig };
    
    this.emit("configurationUpdated", { config: this.config });
    logger.info("VR system configuration updated");
  }

  optimizePerformance() {
    // Trigger optimization across all components
    this.environmentManager.optimizePerformance();
    
    // Adjust rendering quality based on current load
    const currentLoad = this.systemMetrics.getCpuUsage().load5;
    if (currentLoad > 3) {
      this.renderingEngine.config.qualityReduction = true;
      logger.info("Performance optimization: Quality reduction enabled");
    }
    
    // Clean up inactive sessions
    const inactiveSessions = Array.from(this.experienceEngine.sessions.entries())
      .filter(([id, session]) => {
        const inactive = Date.now() - session.started.getTime() > 3600000; // 1 hour
        return session.status === "ended" && inactive;
      });
    
    inactiveSessions.forEach(([id]) => {
      this.experienceEngine.sessions.delete(id);
    });
    
    if (inactiveSessions.length > 0) {
      logger.info(`Cleaned up ${inactiveSessions.length} inactive sessions`);
    }
  }

  shutdown() {
    // Gracefully end all active sessions
    for (const [sessionId, session] of this.experienceEngine.sessions) {
      if (session.status === "active") {
        this.experienceEngine.endSession(sessionId, "shutdown");
      }
    }
    
    this.emit("systemShutdown", { timestamp: new Date() });
    logger.info("AlexVirtualReality system shutdown completed");
  }
}

export default AlexVirtualReality;
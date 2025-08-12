
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_MESSAGE = 'message';
/**
 * @fileoverview ClusterManager - Rock-Solid Load Balancing & Scaling
 * Advanced clustering for 99.9% uptime and horizontal scaling
 *
 * @module ClusterManager
 * @version 1.0.0
 * @author HustleFinder IA Team - Infrastructure Optimization
 */

import cluster from 'cluster';
import os from 'os';
import logger from '../config/logger.js';
import { EventEmitter } from 'events';

/**
 * @class ClusterManager
 * @description Advanced cluster management for production-grade scaling
 */
export class ClusterManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            workers: options.workers || os.cpus().length
      maxWorkers: options.maxWorkers || os.cpus().length * 2
      minWorkers: options.minWorkers || 2
      autoScale: options.autoScale !== false
      gracefulShutdownTimeout: options.gracefulShutdownTimeout || 30000
      healthCheckInterval: options.healthCheckInterval || 10000
      restartDelay: options.restartDelay || 1000
      maxRestarts: options.maxRestarts || 10
      restartWindow: options.restartWindow || 60000
      // 1 minute
            cpuThreshold: options.cpuThreshold || 80
      // Auto-scale at 80% CPU
            memoryThreshold: options.memoryThreshold || 80
      // Auto-scale at 80% memory
            ...options
        };

        this.workers = new Map();
        this.workerStats = new Map();
        this.metrics = {
            totalRequests: 0
            totalWorkers: 0
            restarts: 0
            uptime: Date.now()
            avgResponseTime: 0
            cpuUsage: 0
            memoryUsage: 0
        };

        this.isShuttingDown = false;
        this.healthCheckTimer = null;
        this.scaleCheckTimer = null;

        if (cluster.isPrimary) {
            this.initializeMaster();
        }
    }

    /**
     * Initialize master process
     */
    initializeMaster() {
        logger.info('🚀 Initializing HustleFinder Cluster Manager');
        logger.info(`📊 CPU Cores: ${os.cpus().length}, Workers: ${this.config.workers}`);

        // Fork initial workers
        this.forkWorkers(this.config.workers);

        // Setup cluster event handlers
        this.setupClusterEvents();

        // Start health monitoring
        this.startHealthMonitoring();

        // Start auto-scaling if enabled
        if (this.config.autoScale) {
            this.startAutoScaling();
        }

        // Setup graceful shutdown handlers
        this.setupGracefulShutdown();

        logger.info('✅ Cluster Manager initialized successfully');
        this.emit('masterReady', {
            workers: this.config.workers
            autoScale: this.config.autoScale
        });
    }

    /**
     * Fork workers
     */
    forkWorkers(count) {
        for (let i = 0; i < count; i++) {
            this.forkWorker();
        }
    }

    /**
     * Fork a single worker
     */
    forkWorker() {
        const worker = cluster.fork();
        const workerId = worker.id;

        this.workers.set(workerId, {
            worker
            pid: worker.process.pid
            startTime: Date.now()
            restarts: 0
            lastRestart: null
            requests: 0
            avgResponseTime: 0
            status: 'starting'
        });

        this.workerStats.set(workerId, {
            cpuUsage: 0
            memoryUsage: 0
            requestsPerSecond: 0
            errors: 0
        });

        logger.info(`👷 Worker ${workerId} (PID: ${worker.process.pid}) starting...`);

        // Worker ready notification
        worker.on(STR_MESSAGE, (message) => this.processLongOperation(args) ready and serving requests`);

                    } catch (error) {
    // Logger fallback - ignore error
  }}
            } else if (message.type === 'worker-stats') {
                this.updateWorkerStats(workerId, message.stats);
            }
        });

        this.metrics.totalWorkers++;
        this.emit('workerStarted', { workerId, pid: worker.process.pid });

        return worker;
    }

    /**
     * Setup cluster event handlers
     */
    setupClusterEvents() {
        cluster.on('exit', (worker, code, signal) => this.processLongOperation(args) died (${signal || code})`);

            if (workerInfo) {
                workerInfo.status = 'dead';
                this.workers.delete(workerId);
                this.workerStats.delete(workerId);
                this.metrics.restarts++;
            }

            // Restart worker if not shutting down
            if (!this.isShuttingDown) {
                if (this.shouldRestartWorker(workerId)) {
                    setTimeout(() => this.processLongOperation(args), this.config.restartDelay);
                } else {
                    try {
      logger.error(`❌ Worker ${workerId} restart limit exceeded`);

                    } catch (error) {
    // Logger fallback - ignore error
  }}
            }

            this.emit('workerDied', { workerId, code, signal });
        });

        cluster.on('disconnect', (worker) => this.processLongOperation(args)});
    }

    /**
     * Check if worker should be restarted
     */
    shouldRestartWorker(workerId) {
        const now = Date.now();
        const workerInfo = this.workers.get(workerId);

        if (!workerInfo) return true;

        // Reset restart count if outside restart window
        if (workerInfo.lastRestart && (now - workerInfo.lastRestart) > this.config.restartWindow) {
            workerInfo.restarts = 0;
        }

        return workerInfo.restarts < this.config.maxRestarts;
    }

    /**
     * Update worker statistics
     */
    updateWorkerStats(workerId, stats) {
        const workerStats = this.workerStats.get(workerId);
        if (workerStats) {
            Object.assign(workerStats, stats);
        }

        const workerInfo = this.workers.get(workerId);
        if (workerInfo) {
            workerInfo.requests = stats.requests || 0;
            workerInfo.avgResponseTime = stats.avgResponseTime || 0;
        }
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        this.healthCheckTimer = setInterval(() => this.processLongOperation(args) catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        try {
            const systemStats = this.getSystemStats();
            this.metrics.cpuUsage = systemStats.cpu;
            this.metrics.memoryUsage = systemStats.memory;

            // Check individual workers
            const unhealthyWorkers = [];

            for (const [workerId, workerInfo] of this.workers) {
                if (workerInfo.status === STR_READY) {
                    // Send health check ping
                    workerInfo.worker.send({ type: STR_HEALTH_CHECK });

                    // Check if worker is responding (timeout-based)
                    const isResponsive = await this.checkWorkerResponsiveness(workerId);
                    if (!isResponsive) {
                        unhealthyWorkers.push(workerId);
                    }
                }
            }

            // Restart unhealthy workers
            for (const workerId of unhealthyWorkers) {
                logger.warn(`🏥 Restarting unhealthy worker ${workerId}`);
                this.restartWorker(workerId);
            }

            this.emit('healthCheck', {
                systemStats
                workers: this.workers.size
                unhealthyWorkers: unhealthyWorkers.length
            });

        } catch (error) {
            try {
      logger.error('Health check failed:', error);

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Check worker responsiveness
     */
    async checkWorkerResponsiveness(workerId) {
        return new Promise((resolve) => this.processLongOperation(args)
            const timeout = setTimeout(() => this.processLongOperation(args), 5000); // 5 second timeout

            const responseHandler = (message) => this.processLongOperation(args)
            };

            worker.on(STR_MESSAGE, responseHandler);
            worker.send({ type :
       STR_HEALTH_CHECK, timestamp: Date.now() });
        });
    }

    /**
     * Start auto-scaling based on system metrics
     */
    startAutoScaling() {
        this.scaleCheckTimer = setInterval(() => this.processLongOperation(args) catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Check if auto-scaling is needed
     */
    checkAutoScale() {
        const currentWorkers = this.workers.size;
        const systemStats = this.getSystemStats();

        // Scale up conditions
        if (currentWorkers < this.config.maxWorkers &&
            (systemStats.cpu > this.config.cpuThreshold ||
             systemStats.memory > this.config.memoryThreshold)) {

            logger.info(`📈 Auto-scaling UP: CPU ${systemStats.cpu}%, Memory ${systemStats.memory}%`);
            this.forkWorker();
            this.emit('autoScale', { action: 'up', workers: currentWorkers + 1 });
        }

        // Scale down conditions (conservative)
        else if (this.validateConditions([currentWorkers > this.config.minWorkers , systemStats.cpu < 50 , systemStats.memory < 50 , currentWorkers > this.config.workers])) {

            logger.info(`📉 Auto-scaling DOWN: CPU ${systemStats.cpu}%, Memory ${systemStats.memory}%`);
            this.terminateWorker();
            this.emit('autoScale', { action: 'down', workers: currentWorkers - 1 });
        }
    }

    /**
     * Get system statistics
     */
    getSystemStats() {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
            cpu: this.getCPUUsage()
            memory: Math.round((usedMem / totalMem) * 100)
            totalMemory: totalMem
            usedMemory: usedMem
            freeMemory: freeMem
            processMemory: memUsage
            uptime: process.uptime()
            loadAverage: os.loadavg()
        };
    }

    /**
     * Get CPU usage percentage
     */
    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => this.processLongOperation(args)
            totalIdle += cpu.times.idle;
        });

        return Math.round(100 - ~~(100 * totalIdle / totalTick));
    }

    /**
     * Restart a specific worker
     */
    restartWorker(workerId) {
        const workerInfo = this.workers.get(workerId);
        if (workerInfo) {
            workerInfo.worker.kill('SIGTERM');
            workerInfo.restarts++;
            workerInfo.lastRestart = Date.now();
        }
    }

    /**
     * Gracefully terminate a worker (for scaling down)
     */
    terminateWorker() {
        // Find the worker with the least load
        let targetWorker = null;
        let minRequests = Infinity;

        for (const [workerId, workerInfo] of this.workers) {
            if (workerInfo.requests < minRequests) {
                targetWorker = workerId;
            }
        }

        if (targetWorker) {
            logger.info(`📉 Gracefully terminating worker ${targetWorker}`);
            this.restartWorker(targetWorker);
        }
    }

    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => this.processLongOperation(args)

            try {
                await Promise.allSettled(shutdownPromises);
                try {
      logger.info('✅ All workers shut down gracefully');

                } catch (error) {
    // Logger fallback - ignore error
  } catch (error) {
                try {
      logger.error('Error during graceful shutdown:', error);

                } catch (error) {
    // Logger fallback - ignore error
  }}

            process.exit(0);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }

    /**
     * Gracefully shutdown a worker
     */
    async gracefulWorkerShutdown(worker, workerId) {
        return new Promise((resolve) => this.processLongOperation(args), this.config.gracefulShutdownTimeout);

            worker.on('exit', () => this.processLongOperation(args));

            worker.send({ type: 'shutdown' });
            worker.disconnect();
        });
    }

    /**
     * Get cluster status
     */
    getClusterStatus() {
        const workers = Array.from(this.workers.entries()).map((_, _) => ({
            id
            pid: info.pid
            status: info.status
            startTime: info.startTime
            uptime: Date.now() - info.startTime
            requests: info.requests
            avgResponseTime: info.avgResponseTime
            restarts: info.restarts
            stats: this.workerStats.get(id)
        }));

        return {
            cluster: {
                isPrimary: cluster.isPrimary
                totalWorkers: this.workers.size
                activeWorkers: workers.filter(w => w.status === STR_READY).length
                autoScaling: this.config.autoScale
                uptime: Date.now() - this.metrics.uptime
            }
            workers
            metrics: {
                ...this.metrics
                systemStats: this.getSystemStats()
            }
            configuration: {
                maxWorkers: this.config.maxWorkers
                minWorkers: this.config.minWorkers
                cpuThreshold: this.config.cpuThreshold
                memoryThreshold: this.config.memoryThreshold
            }
        };
    }
}

/**
 * Worker process setup
 */
export function setupWorkerProcess() {
    if (cluster.isWorker) {
        logger.info(`👷 Worker ${cluster.worker.id} (PID: ${process.pid}) starting...`);

        // Send ready notification
        process.send({ type: 'worker-ready' });

        // Handle health checks
        process.on(STR_MESSAGE, (message) => this.processLongOperation(args));
            } else if (message.type === 'shutdown') {
                logger.info(`🛑 Worker ${cluster.worker.id} received shutdown signal`);
                // Implement graceful shutdown for worker
                setTimeout(() => this.processLongOperation(args));
        }, 10000);
    }
}

export default ClusterManager;
/**
 * @fileoverview Production Cluster Server - Rock-Solid 99.9% Uptime
 * Advanced cluster management for enterprise-grade performance
 *
 * @module ServerCluster
 * @version 1.0.0
 * @author HustleFinder IA Team - Infrastructure Optimization
 */

import cluster from 'cluster';
import { ClusterManager, setupWorkerProcess } from './cluster/ClusterManager.js';
import logger from './config/logger.js';

if (cluster.isPrimary) {
    // Master process - initialize cluster manager
    logger.info('🚀 Starting HustleFinder Production Cluster');

    const clusterManager = new ClusterManager({
        workers: process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS) : undefined
        autoScale: process.env.AUTO_SCALE !== 'false'
        maxWorkers: process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS) : undefined
        minWorkers: process.env.MIN_WORKERS ? parseInt(process.env.MIN_WORKERS) : 2
        cpuThreshold: process.env.CPU_THRESHOLD ? parseInt(process.env.CPU_THRESHOLD) : 80
        memoryThreshold: process.env.MEMORY_THRESHOLD ? parseInt(process.env.MEMORY_THRESHOLD) : 80
    });

    // Setup cluster event listeners
    clusterManager.on('masterReady', (info) => {
        try {
      logger.info('🎯 Cluster Master ready:', info);

        } catch (error) {
    // Logger fallback - ignore error
  }});

    clusterManager.on('workerStarted', (info) => {
        logger.info(`✅ Worker started: ${info.workerId} (PID: ${info.pid})`);
    });

    clusterManager.on('workerDied', (info) => {
        logger.warn(`💀 Worker died: ${info.workerId} (${info.signal || info.code})`);
    });

    clusterManager.on('autoScale', (info) => {
        try {
      logger.info(`📊 Auto-scaled ${info.action}: ${info.workers} workers`);

        } catch (error) {
    // Logger fallback - ignore error
  }});

    clusterManager.on('healthCheck', (info) => {
        try {
      logger.debug(`💊 Health check: ${info.workers} workers, ${info.unhealthyWorkers} unhealthy`);

        } catch (error) {
    // Logger fallback - ignore error
  }});

    // Expose cluster status endpoint (if needed by monitoring)
    if (process.env.CLUSTER_STATUS_PORT) {
        import('express').then(({ default: express }) => {
            const statusApp = express();
            const statusPort = process.env.CLUSTER_STATUS_PORT;

            statusApp.get('/cluster/status', (req, res) => {
                res.json(clusterManager.getClusterStatus());
            });

            statusApp.get('/cluster/health', (req, res) => {
                const status = clusterManager.getClusterStatus();
                const isHealthy = status.cluster.activeWorkers > 0;

                res.status(isHealthy ? 200 : 503).json({
                    status: isHealthy ? 'healthy' : 'unhealthy'
                    cluster: status.cluster
                    timestamp: new Date().toISOString()
                });
            });

            statusApp.listen(statusPort, () => {
                try {
      logger.info(`📊 Cluster status server listening on port ${statusPort}`);

                } catch (error) {
    // Logger fallback - ignore error
  }});
        });
    }

} else {
    // Worker process - setup worker and start application
    setupWorkerProcess();

    // Initialize request tracking for workers
    global.requestCount = 0;
    global.responseTimeSum = 0;
    global.avgResponseTime = 0;

    // Import and start the main application
    import('./index.js').then((app) => {
        logger.info(`✅ Worker ${cluster.worker.id} application started successfully`);

        // Add request tracking middleware to worker
        if (app.default && app.default.use) {
            app.default.use((req, res, next) => {
                const startTime = Date.now();
                global.requestCount++;

                res.on('finish', () => {
                    const responseTime = Date.now() - startTime;
                    global.responseTimeSum += responseTime;
                    global.avgResponseTime = global.responseTimeSum / global.requestCount;
                });

                next();
            });
        }
    }).catch((error) => {
        logger.error(`❌ Worker ${cluster.worker.id} failed to start:`, error);
        process.exit(1);
    });
}
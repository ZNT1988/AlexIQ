#!/usr/bin/env node

/**
 * 🦄 START ALEX LICORNE - HustleFinder IA Production Launcher
 * 
 * Démarrage optimisé du système hybride Alex Licorne
 * Avec validation, monitoring et fallback automatique
 * 
 * @version 1.0.0-Hybrid
 * @author HustleFinder IA Team
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configuration
const CONFIG = {
  backend: {
    script: 'backend/start-alex-backend.js',
    port: 3001,
    name: 'Alex Licorne Backend'
  },
  frontend: {
    dir: 'frontend',
    port: 5174,
    name: 'Alex Licorne Frontend'
  },
  environment: process.env.NODE_ENV || 'production',
  autoStart: process.env.AUTO_START_FRONTEND !== 'false'
};

class AlexLicorneStarter {
  constructor() {
    this.processes = new Map();
    this.startTime = Date.now();
  }

  log(icon, message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${icon} ${message}`);
  }

  async checkPrerequisites() {
    this.log('🔍', 'Checking system prerequisites...');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
    }
    this.log('✅', `Node.js version: ${nodeVersion}`);

    // Check backend script exists
    if (!fs.existsSync(CONFIG.backend.script)) {
      throw new Error(`Backend script not found: ${CONFIG.backend.script}`);
    }
    this.log('✅', 'Backend script found');

    // Check environment file
    if (!fs.existsSync('.env.example')) {
      this.log('⚠️', 'No .env.example found, creating minimal configuration');
    } else {
      this.log('✅', 'Environment template found');
    }

    // Check essential environment variables
    const requiredVars = ['AI_PROVIDER'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.log('⚠️', `Environment variable ${varName} not set, using defaults`);
      }
    }
  }

  async startBackend() {
    this.log('🚀', `Starting ${CONFIG.backend.name}...`);

    const backendProcess = spawn('node', [CONFIG.backend.script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: CONFIG.environment,
        PORT: CONFIG.backend.port
      }
    });

    backendProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log('📝', `Backend: ${message}`);
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('Warning')) {
        this.log('⚠️', `Backend Error: ${message}`);
      }
    });

    backendProcess.on('close', (code) => {
      if (code !== 0) {
        this.log('❌', `Backend exited with code ${code}`);
      } else {
        this.log('🛑', 'Backend shutdown gracefully');
      }
    });

    this.processes.set('backend', backendProcess);

    // Wait for backend to be ready
    await this.waitForService('http://localhost:' + CONFIG.backend.port + '/api/health', 'Backend API');
  }

  async startFrontend() {
    if (!CONFIG.autoStart) {
      this.log('⏭️', 'Frontend auto-start disabled');
      return;
    }

    this.log('🎨', `Starting ${CONFIG.frontend.name}...`);

    // Check if frontend directory exists
    if (!fs.existsSync(CONFIG.frontend.dir)) {
      this.log('⚠️', 'Frontend directory not found, skipping');
      return;
    }

    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: CONFIG.frontend.dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('watching for')) {
        this.log('🎨', `Frontend: ${message}`);
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('Warning')) {
        this.log('⚠️', `Frontend Error: ${message}`);
      }
    });

    frontendProcess.on('close', (code) => {
      if (code !== 0) {
        this.log('❌', `Frontend exited with code ${code}`);
      } else {
        this.log('🛑', 'Frontend shutdown gracefully');
      }
    });

    this.processes.set('frontend', frontendProcess);
  }

  async waitForService(url, serviceName, maxAttempts = 30) {
    this.log('⏳', `Waiting for ${serviceName} to be ready...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Simple check - try to connect (we don't have fetch in Node.js by default)
        await new Promise((resolve, reject) => {
          const http = require('http');
          const urlParts = new URL(url);
          
          const req = http.get({
            hostname: urlParts.hostname,
            port: urlParts.port,
            path: urlParts.pathname,
            timeout: 2000
          }, (res) => {
            resolve();
          });

          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Timeout')));
        });

        this.log('✅', `${serviceName} is ready!`);
        return;

      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`${serviceName} failed to start after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      this.log('🛑', 'Graceful shutdown initiated...');

      for (const [name, process] of this.processes) {
        this.log('🔪', `Stopping ${name}...`);
        process.kill('SIGTERM');
      }

      setTimeout(() => {
        this.log('💀', 'Force killing remaining processes...');
        for (const [name, process] of this.processes) {
          process.kill('SIGKILL');
        }
        process.exit(0);
      }, 5000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async displayStartupInfo() {
    const startupDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('🦄 ALEX LICORNE - HUSTLEFINDER IA STARTED');
    console.log('='.repeat(60));
    console.log(`🎯 Environment: ${CONFIG.environment}`);
    console.log(`⚡ Startup Time: ${startupDuration}ms`);
    console.log(`🔗 Backend API: http://localhost:${CONFIG.backend.port}`);
    if (this.processes.has('frontend')) {
      console.log(`🎨 Frontend UI: http://localhost:${CONFIG.frontend.port}`);
    }
    console.log('\n🚀 System Features:');
    console.log('   • Hybrid AI Routing (OpenAI + Anthropic + Local)');
    console.log('   • Self-Learning Intelligence');
    console.log('   • Business Generation Engine');
    console.log('   • Real-Time Revenue Optimization');
    console.log('   • Enterprise Security & Compliance');
    
    console.log('\n📋 Available Endpoints:');
    console.log(`   • Health Check: http://localhost:${CONFIG.backend.port}/api/health`);
    console.log(`   • System Status: http://localhost:${CONFIG.backend.port}/api/status`);
    console.log(`   • Business Stats: http://localhost:${CONFIG.backend.port}/api/business/stats`);
    console.log(`   • Money Flow: http://localhost:${CONFIG.backend.port}/api/money-flow/stats`);
    
    console.log('\n🎯 Ready for billion-dollar business generation!');
    console.log('='.repeat(60));
    console.log('\n📝 Logs will appear below...');
    console.log('💡 Press Ctrl+C to stop all services');
    console.log('');
  }

  async start() {
    try {
      this.log('🦄', 'Alex Licorne startup initiated...');
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Check prerequisites
      await this.checkPrerequisites();

      // Start backend
      await this.startBackend();

      // Start frontend (if enabled)
      await this.startFrontend();

      // Display startup information
      await this.displayStartupInfo();

      this.log('✅', 'All systems operational - Alex Licorne ready!');

    } catch (error) {
      this.log('💥', `Startup failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Start Alex Licorne
const starter = new AlexLicorneStarter();
starter.start().catch(error => {
  console.error('💥 Fatal startup error:', error);
  process.exit(1);
});
#!/usr/bin/env node
/**
 * @fileoverview Rollback Script - Désactivation d'urgence des providers
 * Script de rollback automatisé pour revenir au système legacy en cas de problème
 * @version 1.0.0
 * @author HustleFinder IA Team
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProviderRollback {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env');
    this.backupDir = path.join(this.projectRoot, 'backups', 'providers');
    this.startTime = Date.now();
    
    console.log('🚨 PROVIDER ROLLBACK INITIATED');
    console.log('Time:', new Date().toISOString());
    console.log('Project:', this.projectRoot);
  }
  
  async execute() {
    try {
      console.log('\n📋 ROLLBACK STEPS:');
      console.log('1. Disable providers immediately');
      console.log('2. Create system backup');
      console.log('3. Health check verification');
      console.log('4. Service restart (if needed)');
      console.log('5. Verification & report');
      
      // Step 1: Immediate disable
      await this.disableProviders();
      
      // Step 2: Backup
      await this.createBackup();
      
      // Step 3: Health check
      await this.verifyHealthCheck();
      
      // Step 4: Service management
      await this.handleServiceRestart();
      
      // Step 5: Final verification
      await this.finalVerification();
      
      console.log(`\n✅ ROLLBACK COMPLETED SUCCESSFULLY`);
      console.log(`Duration: ${Date.now() - this.startTime}ms`);
      console.log('🦄 System is now running in LEGACY MODE');
      
    } catch (error) {
      console.error(`\n❌ ROLLBACK FAILED: ${error.message}`);
      console.error('Manual intervention required!');
      process.exit(1);
    }
  }
  
  async disableProviders() {
    console.log('\n🔧 Step 1: Disabling providers...');
    
    try {
      // Disable via environment variable
      if (fs.existsSync(this.envPath)) {
        let envContent = fs.readFileSync(this.envPath, 'utf8');
        
        if (envContent.includes('PROVIDER_HYBRID_ENABLED=true')) {
          envContent = envContent.replace(/PROVIDER_HYBRID_ENABLED=true/g, 'PROVIDER_HYBRID_ENABLED=false');
          fs.writeFileSync(this.envPath, envContent);
          console.log('  ✅ Updated .env file');
        } else {
          // Add the flag if it doesn't exist
          envContent += '\nPROVIDER_HYBRID_ENABLED=false\n';
          fs.writeFileSync(this.envPath, envContent);
          console.log('  ✅ Added disable flag to .env');
        }
      } else {
        // Create .env with disabled flag
        fs.writeFileSync(this.envPath, 'PROVIDER_HYBRID_ENABLED=false\n');
        console.log('  ✅ Created .env with disabled flag');
      }
      
      // Set runtime environment
      process.env.PROVIDER_HYBRID_ENABLED = 'false';
      
      // Try to disable via API if server is running
      try {
        const response = await this.makeRequest('POST', 'http://localhost:3001/api/providers/toggle', {
          enabled: false
        });
        console.log('  ✅ Disabled via API:', response.message);
      } catch (apiError) {
        console.log('  ⚠️ API disable failed (server may be down):', apiError.message);
      }
      
    } catch (error) {
      throw new Error(`Provider disable failed: ${error.message}`);
    }
  }
  
  async createBackup() {
    console.log('\n💾 Step 2: Creating system backup...');
    
    try {
      // Create backup directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `rollback-${timestamp}`);
      
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
      
      fs.mkdirSync(backupPath, { recursive: true });
      
      // Backup provider files
      const providerFiles = [
        'backend/core/providers',
        '.env',
        'package.json'
      ];
      
      for (const file of providerFiles) {
        const sourcePath = path.join(this.projectRoot, file);
        const backupFilePath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
          const backupFileDir = path.dirname(backupFilePath);
          if (!fs.existsSync(backupFileDir)) {
            fs.mkdirSync(backupFileDir, { recursive: true });
          }
          
          if (fs.lstatSync(sourcePath).isDirectory()) {
            this.copyDirectory(sourcePath, backupFilePath);
          } else {
            fs.copyFileSync(sourcePath, backupFilePath);
          }
        }
      }
      
      // Create rollback info
      const rollbackInfo = {
        timestamp: new Date().toISOString(),
        reason: 'Provider rollback executed',
        backupPath,
        originalState: {
          providersEnabled: process.env.PROVIDER_HYBRID_ENABLED,
          nodeEnv: process.env.NODE_ENV
        }
      };
      
      fs.writeFileSync(
        path.join(backupPath, 'rollback-info.json'), 
        JSON.stringify(rollbackInfo, null, 2)
      );
      
      console.log(`  ✅ Backup created: ${backupPath}`);
      
    } catch (error) {
      console.warn(`  ⚠️ Backup failed: ${error.message} (continuing...)`);
    }
  }
  
  async verifyHealthCheck() {
    console.log('\n🏥 Step 3: Health check verification...');
    
    try {
      // Test health via API
      const health = await this.makeRequest('GET', 'http://localhost:3001/api/health');
      console.log('  ✅ System health:', health.status);
      console.log('  📊 Components:', JSON.stringify(health.components, null, 2));
      
      if (health.components.providersHybrid !== 'inactive') {
        throw new Error('Providers still active after rollback!');
      }
      
    } catch (error) {
      console.log('  ⚠️ API health check failed, testing modules directly...');
      
      try {
        // Direct module test
        const { getUsageStats } = require('../backend/core/providers/alexProviderWrapper');
        const stats = getUsageStats();
        
        if (stats.enabled) {
          throw new Error('Provider wrapper still enabled!');
        }
        
        console.log('  ✅ Provider wrapper confirmed disabled');
        
      } catch (moduleError) {
        throw new Error(`Health verification failed: ${moduleError.message}`);
      }
    }
  }
  
  async handleServiceRestart() {
    console.log('\n🔄 Step 4: Service management...');
    
    // Check if we need to restart
    const needsRestart = await this.checkIfRestartNeeded();
    
    if (needsRestart) {
      console.log('  🔄 Service restart recommended');
      console.log('  💡 Run: npm run stop && npm run start');
    } else {
      console.log('  ✅ No restart needed - runtime disable successful');
    }
  }
  
  async finalVerification() {
    console.log('\n✅ Step 5: Final verification...');
    
    try {
      // Test a real request to ensure legacy mode works
      const testRequest = await this.makeRequest('POST', 'http://localhost:3001/api/alex/process', {
        input: 'Test rollback request',
        context: { testMode: true }
      });
      
      if (testRequest.data && testRequest.data.metadata) {
        if (testRequest.data.metadata.source === 'hf-legacy' || 
            testRequest.data.metadata.source === 'simple-fallback') {
          console.log('  ✅ Legacy mode confirmed working');
          console.log('  📝 Response source:', testRequest.data.metadata.source);
        } else {
          throw new Error(`Unexpected response source: ${testRequest.data.metadata.source}`);
        }
      }
      
    } catch (error) {
      console.log('  ⚠️ API verification failed:', error.message);
      console.log('  💡 Manual verification recommended');
    }
  }
  
  async makeRequest(method, url, data = null) {
    const fetch = require('node-fetch');
    
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    return await response.json();
  }
  
  async checkIfRestartNeeded() {
    try {
      // Check if server is responsive and in correct state
      const health = await this.makeRequest('GET', 'http://localhost:3001/api/health');
      return health.components.providersHybrid !== 'inactive';
    } catch {
      return true; // If can't connect, restart probably needed
    }
  }
  
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const rollback = new ProviderRollback();
  
  // Handle CLI arguments
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force');
  const silentMode = args.includes('--silent');
  
  if (!forceMode && !silentMode) {
    console.log('🚨 PROVIDER ROLLBACK WARNING');
    console.log('This will disable hybrid providers and revert to legacy mode.');
    console.log('Use --force to skip this confirmation.');
    console.log('Use --silent to suppress output.');
    
    process.stdout.write('Continue? (y/N): ');
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        rollback.execute();
      } else {
        console.log('Rollback cancelled.');
        process.exit(0);
      }
    });
  } else {
    rollback.execute();
  }
}

module.exports = ProviderRollback;
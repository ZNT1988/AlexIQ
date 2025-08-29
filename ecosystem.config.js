/**
 * 🚀 PM2 ECOSYSTEM CONFIGURATION
 * Configuration de production pour PM2
 */

module.exports = {
  apps: [
    {
      name: 'alex-backend',
      script: './backend/server.js',
      cwd: './backend',
      instances: 1, // Augmenter selon les ressources disponibles
      exec_mode: 'fork', // ou 'cluster' pour scaling
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      
      // Environnement staging
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      
      // Restart policies
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Ressources
      max_memory_restart: '512M',
      
      // Logs
      log_file: '/var/log/alex/combined.log',
      out_file: '/var/log/alex/out.log',
      error_file: '/var/log/alex/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Monitoring
      monitor: false, // Activer PM2 Plus si nécessaire
      
      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health checks
      health_check_grace_period: 3000
    },
    
    // Worker pour tâches asynchrones (optionnel)
    {
      name: 'alex-worker',
      script: './backend/worker.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background'
      },
      
      restart_delay: 2000,
      max_restarts: 5,
      min_uptime: '30s',
      max_memory_restart: '256M',
      
      log_file: '/var/log/alex/worker.log',
      error_file: '/var/log/alex/worker-error.log'
    }
  ],
  
  // Scripts de déploiement
  deploy: {
    production: {
      user: 'alex',
      host: ['tour-a.local', 'tour-b.local'],
      ref: 'origin/main',
      repo: 'git@github.com:znt1988/alexiq.git',
      path: '/var/www/alex',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    
    staging: {
      user: 'alex',
      host: 'dell.local',
      ref: 'origin/develop',
      repo: 'git@github.com:znt1988/alexiq.git',
      path: '/var/www/alex-staging',
      'post-deploy': 'npm ci && node backend/run-all-smoke-tests.js && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
module.exports = {
  apps: [
    {
      name: 'financial-mgmt-backend',
      script: './src/server.js',
      instances: 1, // Use 1 instance for MySQL connection pooling, increase if using connection pooler
      exec_mode: 'fork', // Use 'fork' mode for better MySQL compatibility
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};


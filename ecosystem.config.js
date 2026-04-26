const path = require('path');

module.exports = {
  apps: [
    {
      name: 'minotion',
      script: path.join(__dirname, '.next/standalone/server.js'),
      cwd: __dirname,
      env_file: path.join(__dirname, '.env'),
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
        PROJECT_ROOT: __dirname,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: path.join(__dirname, 'logs/error.log'),
      out_file: path.join(__dirname, 'logs/out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

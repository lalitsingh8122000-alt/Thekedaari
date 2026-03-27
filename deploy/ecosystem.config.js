module.exports = {
  apps: [
    {
      name: 'thekedaar-backend',
      cwd: '/home/ubuntu/ThekeDaari/backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'thekedaar-frontend',
      cwd: '/home/ubuntu/ThekeDaari/frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
};

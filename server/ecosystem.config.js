module.exports = {
    apps: [{
        name: 'r4b-backend',
        script: 'index.js',
        cwd: '/var/www/app/server',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: '/var/log/pm2/r4b-backend-error.log',
        out_file: '/var/log/pm2/r4b-backend-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
};

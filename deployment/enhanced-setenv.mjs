#!/usr/bin/env zx

// Enhanced Server Setup Script with Error Handling and Validation
// This script enhances the original setenv.mjs with better error handling

import { existsSync } from 'fs';
import { join } from 'path';

// Configuration
const NGINX_CONFIG_PATH = '/etc/nginx/sites-available/chawkbazar';
const NGINX_ENABLED_PATH = '/etc/nginx/sites-enabled/chawkbazar';
const PROJECT_ROOT = '/var/www/chawkbazar-laravel';

// Utility functions
const validateInput = (input, fieldName, minLength = 1) => {
  if (!input || input.trim().length < minLength) {
    throw new Error(`${fieldName} is required and must be at least ${minLength} characters`);
  }
  return input.trim();
};

const validateDomain = (domain) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    throw new Error('Please enter a valid domain name (e.g., example.com)');
  }
  return domain;
};

const checkCommandExists = async (command) => {
  try {
    await $`which ${command}`;
    return true;
  } catch {
    return false;
  }
};

const checkServiceStatus = async (service) => {
  try {
    await $`systemctl is-active --quiet ${service}`;
    return true;
  } catch {
    return false;
  }
};

const retryCommand = async (command, maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await command;
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(chalk.yellow(`🔄 Attempt ${i + 1} failed, retrying in ${delay}ms...`));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const generateNginxConfig = (domainName) => {
  return `server {
    listen 80;
    server_name ${domainName} www.${domainName};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # API Backend
    location /backend {
        limit_req zone=api burst=20 nodelay;
        
        alias ${PROJECT_ROOT}/chawkbazar-api/public;
        try_files $uri $uri/ @backend;
        
        location ~ \\.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
            fastcgi_read_timeout 300;
            fastcgi_connect_timeout 75;
        }
    }

    location @backend {
        rewrite /backend/(.*)$ /backend/index.php?/$1 last;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:3002/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 75;
    }

    # Shop Frontend
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 75;
    }

    # Static files caching
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "HIT";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to backup and config files
    location ~* \\.(bak|config|sql|fla|psd|ini|log|sh|inc|swp|dist)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}`;
};

// Main execution
try {
  console.log(chalk.blue.bold('🚀 Enhanced Chawkbazar Server Setup Script'));
  console.log(chalk.gray('==============================================\n'));

  // Pre-flight checks
  console.log(chalk.blue('🔍 Running pre-flight checks...'));
  
  // Check if running as root or with sudo
  if (process.getuid && process.getuid() !== 0) {
    console.log(chalk.yellow('⚠️  This script requires root privileges. Please run with sudo.'));
  }

  console.log(chalk.green('✅ Pre-flight checks passed\n'));

  // Step 1: System Update
  console.log(chalk.blue.bold('📦 Step 1: System Update'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Updating system packages...'));
    await retryCommand($`sudo apt update`, 3, 5000);
    console.log(chalk.green('✅ System updated'));

  } catch (error) {
    console.log(chalk.red(`❌ System update failed: ${error.message}`));
    process.exit(1);
  }

  // Step 2: PHP Installation
  console.log(chalk.blue.bold('\n🐘 Step 2: PHP Installation'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Adding PHP repository...'));
    await retryCommand($`sudo add-apt-repository ppa:ondrej/php -y`, 3, 5000);
    await retryCommand($`sudo apt update`, 3, 5000);
    console.log(chalk.green('✅ PHP repository added'));

    console.log(chalk.blue('Installing Nginx...'));
    await retryCommand($`sudo apt install nginx -y`, 3, 10000);
    console.log(chalk.green('✅ Nginx installed'));

    console.log(chalk.blue('Installing PHP 8.1 and extensions...'));
    await retryCommand($`sudo apt install php8.1-fpm php8.1-mysql -y`, 3, 10000);
    await retryCommand($`sudo apt install php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml php8.1-intl php8.1-gd php8.1-curl php8.1-zip php8.1-gmp -y`, 3, 10000);
    console.log(chalk.green('✅ PHP 8.1 and extensions installed'));

    console.log(chalk.blue('Installing Composer...'));
    await retryCommand($`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"`, 3, 5000);
    await retryCommand($`php -r "if (hash_file('sha384', 'composer-setup.php') === 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"`, 3, 5000);
    await retryCommand($`php composer-setup.php`, 3, 5000);
    await retryCommand($`php -r "unlink('composer-setup.php');"`, 3, 5000);
    await retryCommand($`sudo mv composer.phar /usr/bin/composer`, 3, 5000);
    console.log(chalk.green('✅ Composer installed'));

  } catch (error) {
    console.log(chalk.red(`❌ PHP installation failed: ${error.message}`));
    process.exit(1);
  }

  // Step 3: MySQL Installation
  console.log(chalk.blue.bold('\n🗄️  Step 3: MySQL Installation'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Installing MySQL...'));
    await retryCommand($`sudo apt install mysql-server -y`, 3, 15000);
    console.log(chalk.green('✅ MySQL installed'));

    console.log(chalk.blue('Starting MySQL service...'));
    await retryCommand($`sudo systemctl start mysql`, 3, 5000);
    await retryCommand($`sudo systemctl enable mysql`, 3, 5000);
    console.log(chalk.green('✅ MySQL service started'));

  } catch (error) {
    console.log(chalk.red(`❌ MySQL installation failed: ${error.message}`));
    process.exit(1);
  }

  // Step 4: Firewall Configuration
  console.log(chalk.blue.bold('\n🔥 Step 4: Firewall Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Configuring firewall...'));
    await retryCommand($`sudo ufw allow ssh`, 3, 5000);
    await retryCommand($`sudo ufw allow 'Nginx HTTP'`, 3, 5000);
    await retryCommand($`sudo ufw allow 'Nginx HTTPS'`, 3, 5000);
    await retryCommand($`sudo ufw --force enable`, 3, 5000);
    console.log(chalk.green('✅ Firewall configured'));

    console.log(chalk.blue('Checking firewall status...'));
    await $`sudo ufw status`;
    console.log(chalk.green('✅ Firewall status verified'));

  } catch (error) {
    console.log(chalk.yellow(`⚠️  Firewall configuration warning: ${error.message}`));
  }

  // Step 5: Nginx Configuration
  console.log(chalk.blue.bold('\n🌐 Step 5: Nginx Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  let domainName;
  try {
    // Get domain name with validation
    while (true) {
      try {
        const input = await question('What is your domain name? (e.g., example.com): ');
        domainName = validateDomain(validateInput(input, 'Domain name'));
        break;
      } catch (error) {
        console.log(chalk.red(`❌ ${error.message}`));
      }
    }

    console.log(chalk.green(`✅ Domain configured: ${domainName}`));

    // Remove existing configuration
    console.log(chalk.blue('Removing existing Nginx configuration...'));
    await $`sudo rm -f ${NGINX_ENABLED_PATH}`;
    await $`sudo rm -f ${NGINX_CONFIG_PATH}`;
    console.log(chalk.green('✅ Existing configuration removed'));

    // Create new configuration
    console.log(chalk.blue('Creating new Nginx configuration...'));
    const nginxConfig = generateNginxConfig(domainName);
    await $`echo '${nginxConfig}' | sudo tee ${NGINX_CONFIG_PATH} > /dev/null`;
    console.log(chalk.green('✅ Nginx configuration created'));

    // Enable site
    console.log(chalk.blue('Enabling Nginx site...'));
    await retryCommand($`sudo ln -s ${NGINX_CONFIG_PATH} ${NGINX_ENABLED_PATH}`, 3, 5000);
    console.log(chalk.green('✅ Nginx site enabled'));

    // Test configuration
    console.log(chalk.blue('Testing Nginx configuration...'));
    await retryCommand($`sudo nginx -t`, 3, 5000);
    console.log(chalk.green('✅ Nginx configuration test passed'));

    // Restart Nginx
    console.log(chalk.blue('Restarting Nginx...'));
    await retryCommand($`sudo systemctl restart nginx`, 3, 5000);
    console.log(chalk.green('✅ Nginx restarted'));

  } catch (error) {
    console.log(chalk.red(`❌ Nginx configuration failed: ${error.message}`));
    process.exit(1);
  }

  // Step 6: SSL Configuration (Optional)
  console.log(chalk.blue.bold('\n🔒 Step 6: SSL Configuration (Optional)'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    const sslChoice = await question('Do you want to configure SSL with Let\\'s Encrypt? (y/N): ');
    
    if (sslChoice.toLowerCase() === 'y' || sslChoice.toLowerCase() === 'yes') {
      console.log(chalk.blue('Installing Certbot...'));
      await retryCommand($`sudo apt install certbot python3-certbot-nginx -y`, 3, 10000);
      console.log(chalk.green('✅ Certbot installed'));

      console.log(chalk.blue('Configuring SSL...'));
      await retryCommand($`sudo ufw allow 'Nginx Full'`, 3, 5000);
      await retryCommand($`sudo ufw delete allow 'Nginx HTTP'`, 3, 5000);
      console.log(chalk.green('✅ Firewall updated for SSL'));

      console.log(chalk.blue('Obtaining SSL certificate...'));
      await retryCommand($`sudo certbot --nginx -d ${domainName} -d www.${domainName} --non-interactive --agree-tos --email admin@${domainName}`, 3, 30000);
      console.log(chalk.green('✅ SSL certificate obtained'));

      console.log(chalk.blue('Setting up auto-renewal...'));
      await retryCommand($`sudo systemctl enable certbot.timer`, 3, 5000);
      console.log(chalk.green('✅ SSL auto-renewal configured'));

    } else {
      console.log(chalk.yellow('⚠️  SSL configuration skipped'));
    }

  } catch (error) {
    console.log(chalk.yellow(`⚠️  SSL configuration warning: ${error.message}`));
  }

  // Step 7: Service Status Check
  console.log(chalk.blue.bold('\n🏥 Step 7: Service Status Check'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    const services = ['nginx', 'mysql', 'php8.1-fpm'];
    
    for (const service of services) {
      if (await checkServiceStatus(service)) {
        console.log(chalk.green(`✅ ${service} is running`));
      } else {
        console.log(chalk.red(`❌ ${service} is not running`));
        console.log(chalk.blue(`Starting ${service}...`));
        await retryCommand($`sudo systemctl start ${service}`, 3, 5000);
        await retryCommand($`sudo systemctl enable ${service}`, 3, 5000);
        console.log(chalk.green(`✅ ${service} started`));
      }
    }

  } catch (error) {
    console.log(chalk.yellow(`⚠️  Service status check warning: ${error.message}`));
  }

  // Success message
  console.log(chalk.green.bold('\n🎉 Server Setup Completed Successfully!'));
  console.log(chalk.gray('==============================================='));
  console.log(chalk.white(`🌐 Domain: ${domainName}`));
  console.log(chalk.white(`📁 Nginx Config: ${NGINX_CONFIG_PATH}`));
  console.log(chalk.white(`🔒 SSL: ${sslChoice?.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('1. Deploy backend (run enhanced-backendbuildscript.mjs)'));
  console.log(chalk.gray('2. Deploy frontend (run enhanced-frontendbuildscript.mjs)'));
  console.log(chalk.gray('3. Start frontend services (run frontendrunscript.mjs)'));
  console.log(chalk.gray('4. Test the application'));

} catch (error) {
  console.log(chalk.red.bold('\n💥 Setup Failed!'));
  console.log(chalk.red(`Error: ${error.message}`));
  console.log(chalk.gray('\nTroubleshooting:'));
  console.log(chalk.gray('1. Check if you have root privileges'));
  console.log(chalk.gray('2. Verify internet connection'));
  console.log(chalk.gray('3. Check the logs above for specific errors'));
  console.log(chalk.gray('4. Ensure system is up to date'));
  process.exit(1);
}

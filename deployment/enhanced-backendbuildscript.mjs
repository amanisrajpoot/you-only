#!/usr/bin/env zx

// Enhanced Backend Build Script with Error Handling and Validation
// This script enhances the original backendbuildscript.mjs with better error handling

import { existsSync } from 'fs';
import { join } from 'path';

// Configuration
const PROJECT_ROOT = '/var/www/chawkbazar-laravel';
const API_PATH = join(PROJECT_ROOT, 'chawkbazar-api');

// Utility functions
const validateInput = (input, fieldName, minLength = 1) => {
  if (!input || input.trim().length < minLength) {
    throw new Error(`${fieldName} is required and must be at least ${minLength} characters`);
  }
  return input.trim();
};

const validateDatabaseName = (dbname) => {
  if (!/^[a-zA-Z0-9_]+$/.test(dbname)) {
    throw new Error('Database name can only contain letters, numbers, and underscores');
  }
  return dbname;
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
      console.log(chalk.yellow(`Attempt ${i + 1} failed, retrying in ${delay}ms...`));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Main execution
try {
  console.log(chalk.blue.bold('🚀 Enhanced Chawkbazar Backend Build Script'));
  console.log(chalk.gray('===============================================\n'));

  // Pre-flight checks
  console.log(chalk.blue('🔍 Running pre-flight checks...'));
  
  // Check if required commands exist
  const requiredCommands = ['mysql', 'composer', 'php', 'sudo'];
  for (const cmd of requiredCommands) {
    if (!(await checkCommandExists(cmd))) {
      throw new Error(`Required command '${cmd}' not found. Please install it first.`);
    }
  }

  // Check if services are running
  if (!(await checkServiceStatus('mysql'))) {
    throw new Error('MySQL service is not running. Please start it first.');
  }

  console.log(chalk.green('✅ Pre-flight checks passed\n'));

  // Step 1: Database Setup
  console.log(chalk.blue.bold('📊 Step 1: Database Setup'));
  console.log(chalk.gray('-----------------------------------'));

  let dbname, charset, username, userpass;

  try {
    // Get database name with validation
    while (true) {
      try {
        const input = await question('Please enter the database name (e.g., chawkbazar): ');
        dbname = validateDatabaseName(validateInput(input, 'Database name'));
        break;
      } catch (error) {
        console.log(chalk.red(`❌ ${error.message}`));
      }
    }

    // Get charset with validation
    while (true) {
      try {
        const input = await question('Please enter the MySQL charset (default: utf8mb4): ');
        charset = input.trim() || 'utf8mb4';
        if (!['utf8', 'utf8mb4', 'latin1'].includes(charset)) {
          throw new Error('Please enter a valid charset (utf8, utf8mb4, or latin1)');
        }
        break;
      } catch (error) {
        console.log(chalk.red(`❌ ${error.message}`));
      }
    }

    console.log(chalk.blue('Creating MySQL database...'));
    await retryCommand($`sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${dbname} CHARACTER SET ${charset} COLLATE ${charset}_unicode_ci;"`);
    console.log(chalk.green('✅ Database created successfully'));

    // Verify database creation
    console.log(chalk.blue('Verifying database creation...'));
    const dbCheck = await $`sudo mysql -e "SHOW DATABASES LIKE '${dbname}';"`;
    if (!dbCheck.stdout.includes(dbname)) {
      throw new Error('Database creation verification failed');
    }

    // Get database user credentials
    while (true) {
      try {
        const input = await question('Please enter the database username (e.g., chawkbazar_user): ');
        username = validateInput(input, 'Database username', 3);
        break;
      } catch (error) {
        console.log(chalk.red(`❌ ${error.message}`));
      }
    }

    while (true) {
      try {
        const input = await question('Please enter the database password (min 8 characters): ');
        userpass = validateInput(input, 'Database password', 8);
        break;
      } catch (error) {
        console.log(chalk.red(`❌ ${error.message}`));
      }
    }

    console.log(chalk.blue('Creating database user...'));
    await retryCommand($`sudo mysql -e "CREATE USER IF NOT EXISTS '${username}'@'localhost' IDENTIFIED BY '${userpass}';"`);
    await retryCommand($`sudo mysql -e "CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${userpass}';"`);
    
    console.log(chalk.blue('Granting privileges...'));
    await retryCommand($`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'localhost';"`);
    await retryCommand($`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'%';"`);
    await retryCommand($`sudo mysql -e "FLUSH PRIVILEGES;"`);
    
    console.log(chalk.green('✅ Database user created and privileges granted'));

  } catch (error) {
    console.log(chalk.red(`❌ Database setup failed: ${error.message}`));
    process.exit(1);
  }

  // Step 2: Project Setup
  console.log(chalk.blue.bold('\n📦 Step 2: Project Setup'));
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

    // Check if project directory exists
    if (!existsSync(API_PATH)) {
      throw new Error(`Project directory not found: ${API_PATH}`);
    }

    // Backup existing .env if it exists
    const envPath = join(API_PATH, '.env');
    if (existsSync(envPath)) {
      console.log(chalk.yellow('⚠️  Backing up existing .env file...'));
      await $`sudo cp ${envPath} ${envPath}.backup.$(date +%Y%m%d_%H%M%S)`;
    }

    // Create .env file
    console.log(chalk.blue('Creating .env file...'));
    await $`sudo rm -f ${envPath}`;
    await $`sudo cp ${join(API_PATH, '.env.example')} ${envPath}`;
    await $`sudo chmod 644 ${envPath}`;

    // Update .env file with configuration
    console.log(chalk.blue('Configuring .env file...'));
    await $`sudo sed -i 's|APP_URL=.*|APP_URL=https://${domainName}/backend|g' ${envPath}`;
    await $`sudo sed -i 's|DB_HOST=.*|DB_HOST=localhost|g' ${envPath}`;
    await $`sudo sed -i 's|DB_DATABASE=.*|DB_DATABASE=${dbname}|g' ${envPath}`;
    await $`sudo sed -i 's|DB_USERNAME=.*|DB_USERNAME=${username}|g' ${envPath}`;
    await $`sudo sed -i 's|DB_PASSWORD=.*|DB_PASSWORD=${userpass}|g' ${envPath}`;

    console.log(chalk.green('✅ .env file configured'));

  } catch (error) {
    console.log(chalk.red(`❌ Project setup failed: ${error.message}`));
    process.exit(1);
  }

  // Step 3: Dependencies Installation
  console.log(chalk.blue.bold('\n📚 Step 3: Installing Dependencies'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Installing PHP dependencies...'));
    await retryCommand($`composer install --no-dev --optimize-autoloader --working-dir ${API_PATH}`, 3, 5000);
    console.log(chalk.green('✅ PHP dependencies installed'));

  } catch (error) {
    console.log(chalk.red(`❌ Dependencies installation failed: ${error.message}`));
    process.exit(1);
  }

  // Step 4: Laravel Configuration
  console.log(chalk.blue.bold('\n⚙️  Step 4: Laravel Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Generating application key...'));
    await retryCommand($`php ${join(API_PATH, 'artisan')} key:generate --force`);
    console.log(chalk.green('✅ Application key generated'));

    console.log(chalk.blue('Installing Marvel packages...'));
    await retryCommand($`php ${join(API_PATH, 'artisan')} marvel:install --force`);
    console.log(chalk.green('✅ Marvel packages installed'));

    console.log(chalk.blue('Creating storage link...'));
    await retryCommand($`php ${join(API_PATH, 'artisan')} storage:link`);
    console.log(chalk.green('✅ Storage link created'));

    console.log(chalk.blue('Running database migrations...'));
    await retryCommand($`php ${join(API_PATH, 'artisan')} migrate --force`);
    console.log(chalk.green('✅ Database migrations completed'));

    console.log(chalk.blue('Clearing caches...'));
    await retryCommand($`php ${join(API_PATH, 'artisan')} config:cache`);
    await retryCommand($`php ${join(API_PATH, 'artisan')} route:cache`);
    await retryCommand($`php ${join(API_PATH, 'artisan')} view:cache`);
    console.log(chalk.green('✅ Caches cleared'));

  } catch (error) {
    console.log(chalk.red(`❌ Laravel configuration failed: ${error.message}`));
    process.exit(1);
  }

  // Step 5: Permissions
  console.log(chalk.blue.bold('\n🔐 Step 5: Setting Permissions'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Setting proper permissions...'));
    await $`sudo chown -R www-data:www-data ${join(API_PATH, 'storage')}`;
    await $`sudo chown -R www-data:www-data ${join(API_PATH, 'bootstrap', 'cache')}`;
    await $`sudo chmod -R 755 ${join(API_PATH, 'storage')}`;
    await $`sudo chmod -R 755 ${join(API_PATH, 'bootstrap', 'cache')}`;
    console.log(chalk.green('✅ Permissions set correctly'));

  } catch (error) {
    console.log(chalk.red(`❌ Permission setup failed: ${error.message}`));
    process.exit(1);
  }

  // Step 6: Health Check
  console.log(chalk.blue.bold('\n🏥 Step 6: Health Check'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Testing database connection...'));
    await $`php ${join(API_PATH, 'artisan')} tinker --execute="DB::connection()->getPdo(); echo 'Database connection successful';"`;
    console.log(chalk.green('✅ Database connection verified'));

    console.log(chalk.blue('Testing application...'));
    const response = await fetch(`https://${domainName}/backend/health`);
    if (response.ok) {
      console.log(chalk.green('✅ Application health check passed'));
    } else {
      console.log(chalk.yellow('⚠️  Application health check failed - this is normal if Nginx is not yet configured'));
    }

  } catch (error) {
    console.log(chalk.yellow(`⚠️  Health check warning: ${error.message}`));
  }

  // Success message
  console.log(chalk.green.bold('\n🎉 Backend Setup Completed Successfully!'));
  console.log(chalk.gray('==============================================='));
  console.log(chalk.white(`🌐 Application URL: https://${domainName}/backend`));
  console.log(chalk.white(`📊 Database: ${dbname}`));
  console.log(chalk.white(`👤 Database User: ${username}`));
  console.log(chalk.white(`📁 Project Path: ${API_PATH}`));
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('1. Configure Nginx (run setenv.mjs)'));
  console.log(chalk.gray('2. Build and deploy frontend (run frontendbuildscript.mjs)'));
  console.log(chalk.gray('3. Start frontend services (run frontendrunscript.mjs)'));

} catch (error) {
  console.log(chalk.red.bold('\n💥 Setup Failed!'));
  console.log(chalk.red(`Error: ${error.message}`));
  console.log(chalk.gray('\nTroubleshooting:'));
  console.log(chalk.gray('1. Check if all required services are running'));
  console.log(chalk.gray('2. Verify file permissions'));
  console.log(chalk.gray('3. Check the logs above for specific errors'));
  process.exit(1);
}

#!/usr/bin/env zx

// Enhanced Frontend Build Script with Error Handling and Validation
// This script enhances the original frontendbuildscript.mjs with better error handling

import { existsSync } from 'fs';
import { join } from 'path';

// Configuration
const PROJECT_ROOT = process.cwd();
const ADMIN_PATH = join(PROJECT_ROOT, 'admin', 'rest');
const SHOP_PATH = join(PROJECT_ROOT, 'shop');

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

const checkFileExists = (filePath) => {
  return existsSync(filePath);
};

const backupFile = async (filePath) => {
  if (checkFileExists(filePath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    await $`cp ${filePath} ${backupPath}`;
    console.log(chalk.yellow(`📁 Backed up: ${filePath} -> ${backupPath}`));
    return backupPath;
  }
  return null;
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

// Main execution
try {
  console.log(chalk.blue.bold('🚀 Enhanced Chawkbazar Frontend Build Script'));
  console.log(chalk.gray('================================================\n'));

  // Pre-flight checks
  console.log(chalk.blue('🔍 Running pre-flight checks...'));
  
  // Check if required commands exist
  const requiredCommands = ['yarn', 'node', 'zip'];
  for (const cmd of requiredCommands) {
    if (!(await checkCommandExists(cmd))) {
      throw new Error(`Required command '${cmd}' not found. Please install it first.`);
    }
  }

  // Check if project directories exist
  if (!checkFileExists(ADMIN_PATH)) {
    throw new Error(`Admin directory not found: ${ADMIN_PATH}`);
  }
  if (!checkFileExists(SHOP_PATH)) {
    throw new Error(`Shop directory not found: ${SHOP_PATH}`);
  }

  // Check if package.json files exist
  if (!checkFileExists(join(ADMIN_PATH, 'package.json'))) {
    throw new Error(`Admin package.json not found: ${join(ADMIN_PATH, 'package.json')}`);
  }
  if (!checkFileExists(join(SHOP_PATH, 'package.json'))) {
    throw new Error(`Shop package.json not found: ${join(SHOP_PATH, 'package.json')}`);
  }

  console.log(chalk.green('✅ Pre-flight checks passed\n'));

  // Step 1: Domain Configuration
  console.log(chalk.blue.bold('🌐 Step 1: Domain Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  let domainName;
  try {
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

  } catch (error) {
    console.log(chalk.red(`❌ Domain configuration failed: ${error.message}`));
    process.exit(1);
  }

  // Step 2: Admin Configuration
  console.log(chalk.blue.bold('\n⚙️  Step 2: Admin Panel Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Configuring admin panel for /admin subdirectory...'));
    
    // Backup original next.config.js
    const adminConfigPath = join(ADMIN_PATH, 'next.config.js');
    await backupFile(adminConfigPath);
    
    // Create temporary config with basePath
    await $`cp ${adminConfigPath} ${join(ADMIN_PATH, 'next.config.js.temp')}`;
    await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ${join(ADMIN_PATH, 'next.config.js.temp')} > ${adminConfigPath}`;
    await $`rm -f ${join(ADMIN_PATH, 'next.config.js.temp')}`;
    
    console.log(chalk.green('✅ Admin panel configured for /admin subdirectory'));

    // Configure admin .env
    console.log(chalk.blue('Configuring admin environment...'));
    const adminEnvPath = join(ADMIN_PATH, '.env');
    const adminEnvTemplate = join(ADMIN_PATH, '.env.template');
    
    if (checkFileExists(adminEnvTemplate)) {
      await backupFile(adminEnvPath);
      await $`cp ${adminEnvTemplate} ${adminEnvPath}`;
      await $`chmod 644 ${adminEnvPath}`;
      
      // Update environment variables
      await $`sed -i 's|NEXT_PUBLIC_REST_API_ENDPOINT=.*|NEXT_PUBLIC_REST_API_ENDPOINT="https://${domainName}/backend"|g' ${adminEnvPath}`;
      await $`sed -i 's|NEXT_PUBLIC_SHOP_URL=.*|NEXT_PUBLIC_SHOP_URL="https://${domainName}"|g' ${adminEnvPath}`;
      await $`sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL="https://${domainName}/admin"|g' ${adminEnvPath}`;
      
      console.log(chalk.green('✅ Admin environment configured'));
    } else {
      console.log(chalk.yellow('⚠️  Admin .env.template not found, skipping environment configuration'));
    }

    // Update admin next.config.js with domain
    console.log(chalk.blue('Updating admin image domains...'));
    await $`cp ${adminConfigPath} ${join(ADMIN_PATH, 'next.config.js.temp')}`;
    await $`awk '{sub(/domains: \\[/, "domains: [ \`${domainName}\`,"); print $0}' ${join(ADMIN_PATH, 'next.config.js.temp')} > ${adminConfigPath}`;
    await $`rm -f ${join(ADMIN_PATH, 'next.config.js.temp')}`;
    
    console.log(chalk.green('✅ Admin configuration completed'));

  } catch (error) {
    console.log(chalk.red(`❌ Admin configuration failed: ${error.message}`));
    process.exit(1);
  }

  // Step 3: Shop Configuration
  console.log(chalk.blue.bold('\n🛍️  Step 3: Shop Configuration'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Configuring shop environment...'));
    const shopEnvPath = join(SHOP_PATH, '.env');
    const shopEnvTemplate = join(SHOP_PATH, '.env.template');
    
    if (checkFileExists(shopEnvTemplate)) {
      await backupFile(shopEnvPath);
      await $`cp ${shopEnvTemplate} ${shopEnvPath}`;
      await $`chmod 644 ${shopEnvPath}`;
      
      // Update environment variables
      await $`sed -i 's|NEXT_PUBLIC_REST_API_ENDPOINT=.*|NEXT_PUBLIC_REST_API_ENDPOINT="https://${domainName}/backend"|g' ${shopEnvPath}`;
      await $`sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL="https://${domainName}"|g' ${shopEnvPath}`;
      
      console.log(chalk.green('✅ Shop environment configured'));
    } else {
      console.log(chalk.yellow('⚠️  Shop .env.template not found, skipping environment configuration'));
    }

    // Update shop next.config.js with domain
    console.log(chalk.blue('Updating shop image domains...'));
    const shopConfigPath = join(SHOP_PATH, 'next.config.js');
    await backupFile(shopConfigPath);
    await $`cp ${shopConfigPath} ${join(SHOP_PATH, 'next.config.js.temp')}`;
    await $`awk '{sub(/domains: \\[/, "domains: [ \`${domainName}\`,"); print $0}' ${join(SHOP_PATH, 'next.config.js.temp')} > ${shopConfigPath}`;
    await $`rm -f ${join(SHOP_PATH, 'next.config.js.temp')}`;
    
    console.log(chalk.green('✅ Shop configuration completed'));

  } catch (error) {
    console.log(chalk.red(`❌ Shop configuration failed: ${error.message}`));
    process.exit(1);
  }

  // Step 4: Dependencies Installation
  console.log(chalk.blue.bold('\n📚 Step 4: Installing Dependencies'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Installing root dependencies...'));
    await retryCommand($`yarn install --frozen-lockfile`, 3, 5000);
    console.log(chalk.green('✅ Root dependencies installed'));

    console.log(chalk.blue('Installing admin dependencies...'));
    await retryCommand($`yarn --cwd ${ADMIN_PATH} install --frozen-lockfile`, 3, 5000);
    console.log(chalk.green('✅ Admin dependencies installed'));

    console.log(chalk.blue('Installing shop dependencies...'));
    await retryCommand($`yarn --cwd ${SHOP_PATH} install --frozen-lockfile`, 3, 5000);
    console.log(chalk.green('✅ Shop dependencies installed'));

  } catch (error) {
    console.log(chalk.red(`❌ Dependencies installation failed: ${error.message}`));
    process.exit(1);
  }

  // Step 5: Building Applications
  console.log(chalk.blue.bold('\n🔨 Step 5: Building Applications'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Building admin panel...'));
    await retryCommand($`yarn build:admin-rest`, 3, 10000);
    console.log(chalk.green('✅ Admin panel built successfully'));

    console.log(chalk.blue('Building shop frontend...'));
    await retryCommand($`yarn build:shop-rest`, 3, 10000);
    console.log(chalk.green('✅ Shop frontend built successfully'));

  } catch (error) {
    console.log(chalk.red(`❌ Build process failed: ${error.message}`));
    process.exit(1);
  }

  // Step 6: Package for Deployment
  console.log(chalk.blue.bold('\n📦 Step 6: Packaging for Deployment'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    console.log(chalk.blue('Cleaning up node_modules...'));
    await $`rm -rf ${join(SHOP_PATH, 'node_modules')}`;
    await $`rm -rf ${join(ADMIN_PATH, 'node_modules')}`;
    await $`rm -rf ${join(PROJECT_ROOT, 'node_modules')}`;
    console.log(chalk.green('✅ Node modules cleaned up'));

    console.log(chalk.blue('Creating deployment package...'));
    const zipFileName = `chawkbazar-frontend-${domainName}-${new Date().toISOString().split('T')[0]}.zip`;
    await $`zip -r ${zipFileName} shop admin package.json babel.config.js yarn.lock -x "*.log" "*.tmp" "*.backup.*"`;
    console.log(chalk.green(`✅ Deployment package created: ${zipFileName}`));

  } catch (error) {
    console.log(chalk.red(`❌ Packaging failed: ${error.message}`));
    process.exit(1);
  }

  // Step 7: Server Upload (Optional)
  console.log(chalk.blue.bold('\n🚀 Step 7: Server Upload (Optional)'));
  console.log(chalk.gray('-----------------------------------'));

  try {
    const uploadChoice = await question('Do you want to upload to server now? (y/N): ');
    
    if (uploadChoice.toLowerCase() === 'y' || uploadChoice.toLowerCase() === 'yes') {
      const username = await question('Enter your server username (e.g., ubuntu): ');
      const ipAddress = await question('Enter server IP address (e.g., 192.168.1.100): ');
      
      if (username && ipAddress) {
        console.log(chalk.blue('Uploading to server...'));
        await $`scp ${zipFileName} ${username}@${ipAddress}:/var/www/chawkbazar-laravel/`;
        console.log(chalk.green('✅ Upload completed'));
        
        console.log(chalk.blue('Extracting on server...'));
        await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ipAddress} "cd /var/www/chawkbazar-laravel && unzip -o ${zipFileName} && rm ${zipFileName}"`;
        console.log(chalk.green('✅ Extraction completed'));
      }
    } else {
      console.log(chalk.yellow('⚠️  Skipping server upload'));
    }

  } catch (error) {
    console.log(chalk.yellow(`⚠️  Server upload failed: ${error.message}`));
  }

  // Success message
  console.log(chalk.green.bold('\n🎉 Frontend Build Completed Successfully!'));
  console.log(chalk.gray('==============================================='));
  console.log(chalk.white(`🌐 Domain: ${domainName}`));
  console.log(chalk.white(`📁 Admin Panel: /admin`));
  console.log(chalk.white(`🛍️  Shop Frontend: /`));
  console.log(chalk.white(`📦 Package: ${zipFileName}`));
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('1. Upload package to server (if not done already)'));
  console.log(chalk.gray('2. Start frontend services (run frontendrunscript.mjs)'));
  console.log(chalk.gray('3. Configure Nginx (run setenv.mjs)'));
  console.log(chalk.gray('4. Test the application'));

} catch (error) {
  console.log(chalk.red.bold('\n💥 Build Failed!'));
  console.log(chalk.red(`Error: ${error.message}`));
  console.log(chalk.gray('\nTroubleshooting:'));
  console.log(chalk.gray('1. Check if all required commands are installed'));
  console.log(chalk.gray('2. Verify file permissions'));
  console.log(chalk.gray('3. Check the logs above for specific errors'));
  console.log(chalk.gray('4. Ensure you have enough disk space'));
  process.exit(1);
}

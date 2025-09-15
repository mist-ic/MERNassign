#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Taskify...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Create .env files if they don't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
const clientEnvPath = path.join(__dirname, 'client', '.env');

if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server .env file...');
  fs.copyFileSync(
    path.join(__dirname, 'server', 'env.example'),
    serverEnvPath
  );
  console.log('✅ Server .env created. Please update with your MongoDB URI and JWT secret.');
}

if (!fs.existsSync(clientEnvPath)) {
  console.log('📝 Creating client .env file...');
  fs.copyFileSync(
    path.join(__dirname, 'client', 'env.example'),
    clientEnvPath
  );
  console.log('✅ Client .env created.');
}

// Install dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Server dependencies installed.');
} catch (error) {
  console.error('❌ Failed to install server dependencies:', error.message);
  process.exit(1);
}

console.log('\n📦 Installing client dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Client dependencies installed.');
} catch (error) {
  console.error('❌ Failed to install client dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your MongoDB URI and JWT secret');
console.log('2. Start the backend: cd server && npm run dev');
console.log('3. Start the frontend: cd client && npm run dev');
console.log('4. Open http://localhost:5173 in your browser');
console.log('\n📚 See README.md for detailed instructions.');

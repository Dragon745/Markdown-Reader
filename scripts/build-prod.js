#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...\n');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
    log(`\n${colors.cyan}▶ ${step}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    logStep('Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        logSuccess('Dependencies installed');
    } catch (error) {
        logError('Failed to install dependencies');
        process.exit(1);
    }
}

// Clean previous builds
logStep('Cleaning previous builds...');
try {
    if (fs.existsSync('dist')) {
        execSync('npm run clean', { stdio: 'inherit' });
        logSuccess('Previous builds cleaned');
    }
} catch (error) {
    logWarning('Failed to clean previous builds, continuing...');
}

// Build the application
logStep('Building application...');
try {
    const platform = process.argv[2] || 'all';

    switch (platform) {
        case 'win':
        case 'windows':
            log('Building for Windows...', 'blue');
            execSync('npm run build:win:prod', { stdio: 'inherit' });
            break;
        case 'mac':
        case 'macos':
            log('Building for macOS...', 'blue');
            execSync('npm run build:mac:prod', { stdio: 'inherit' });
            break;
        case 'linux':
            log('Building for Linux...', 'blue');
            execSync('npm run build:linux:prod', { stdio: 'inherit' });
            break;
        default:
            log('Building for all platforms...', 'blue');
            execSync('npm run build:prod', { stdio: 'inherit' });
    }

    logSuccess('Build completed successfully!');
} catch (error) {
    logError('Build failed');
    process.exit(1);
}

// Show build results
logStep('Build results:');
try {
    if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        files.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            log(`📦 ${file} (${size} MB)`, 'green');
        });
    }
} catch (error) {
    logWarning('Could not read build results');
}

log('\n🎉 Production build completed successfully!');
log('The built applications are available in the "dist" folder.', 'blue');


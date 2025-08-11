#!/bin/bash

echo "Starting Markdown Reader..."
echo ""
echo "If this is your first time running the app, dependencies will be installed automatically."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
npm install

# Start the application
npm start

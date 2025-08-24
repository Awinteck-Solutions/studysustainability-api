#!/bin/bash

# Setup script for Node.js version management
# This script ensures the correct Node.js version is used for this project

echo "🚀 Setting up Node.js environment for Study Sustainability Hub API..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if Node.js 20.19.0 is installed
if ! nvm list | grep -q "v20.19.0"; then
    echo "📦 Installing Node.js 20.19.0..."
    nvm install 20.19.0
fi

# Use Node.js 20.19.0
echo "🔄 Switching to Node.js 20.19.0..."
nvm use 20.19.0

# Set as default
echo "⚙️ Setting Node.js 20.19.0 as default..."
nvm alias default 20.19.0

# Verify version
echo "✅ Current Node.js version: $(node --version)"
echo "✅ Current npm version: $(npm --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎉 Setup complete! You can now run:"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Build the project"
echo "   npm start      # Start production server"

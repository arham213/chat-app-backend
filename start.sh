#!/bin/bash

echo "🚀 Chat System Backend - Quick Start Script"
echo "==========================================="
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "   Start it with: sudo systemctl start mongodb"
    echo "   Or use Docker: docker run -d -p 27017:27017 mongo"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB is running"
fi

echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, copying from .env.example"
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update JWT_SECRET in .env for production!"
else
    echo "✅ .env file exists"
fi

echo ""
echo "🎯 Starting server..."
echo "==========================================="
echo ""

npm run dev

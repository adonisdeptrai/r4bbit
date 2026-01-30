#!/bin/bash

# Deploy Helper Script for R4B App
# Usage: ./deploy.sh

echo "🚀 Starting Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Copying from .env.production..."
    cp .env.production .env
fi

# Pull latest changes (if using git)
# git pull origin main

# Determine Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Docker Compose not found. Please install it via aaPanel."
    exit 1
fi

# stop old containers
echo "🛑 Stopping old containers..."
$DOCKER_COMPOSE -f docker-compose.prod.yml down

# rebuild and start
echo "🏗️  Building and Starting..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

# Prune unused images to save space
docker image prune -f

echo "✅ Deployment Complete!"
echo "   - Frontend: http://localhost:8080 (Mapped via Nginx to https://mmopro.click)"
echo "   - Backend: http://localhost:5000"
echo "   - Mongo Express: http://localhost:8081"

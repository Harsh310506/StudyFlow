#!/bin/bash

# Build script for Render backend deployment

echo "🚀 Installing dependencies..."
npm ci

echo "🔨 Building backend only..."
npm run build:render

echo "✅ Backend build complete!"

echo "Build completed successfully!"
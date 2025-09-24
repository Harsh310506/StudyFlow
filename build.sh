#!/bin/bash

# Build script for Render backend deployment

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Build completed successfully!"
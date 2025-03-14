#!/bin/bash

# VowSwap Startup Script

echo "Starting VowSwap Development Server..."
echo "======================================="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please copy .env.example to .env and fill in your environment variables."
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the development server
echo "Starting Next.js development server..."
npm run dev

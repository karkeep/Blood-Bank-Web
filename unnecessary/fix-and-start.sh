#!/bin/bash

echo "🩸 LifeLink Blood Bank - Starting Application..."

# Check if node modules exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if client node modules exist
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Create missing directories if they don't exist
mkdir -p uploads
mkdir -p dist

# Set proper environment variables
export NODE_ENV=development
export USE_FIREBASE=true
export PORT=5173

echo "🔥 Starting Firebase development server..."

# Start the server with proper Firebase configuration
npm run dev:fb &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

echo "🌐 Starting client..."
npm run dev:client &
CLIENT_PID=$!

echo "✅ Application started!"
echo "📍 Client running on: http://localhost:3000"
echo "🔧 Server running on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait $SERVER_PID $CLIENT_PID

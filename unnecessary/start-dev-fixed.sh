#!/bin/bash

# Kill any existing Node or npm processes that might be hanging
echo "Cleaning up any existing processes..."
pkill -f node || true
pkill -f npm || true

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads/documents
mkdir -p uploads/profile
mkdir -p uploads/temp

# Set Firebase environment variables to enable mock mode for development
echo "Setting up environment variables..."
export USE_FIREBASE=true
export USE_MOCK_FIREBASE=true
export ALLOW_INVALID_TOKENS=true
export NODE_ENV=development

# Set file permissions
chmod -R 755 uploads

# Start the client and server in separate processes
echo "Starting the client..."
cd /Users/prabeshkarkee/Desktop/blood-bank/client
npm run dev &
CLIENT_PID=$!

echo "Starting the server..."
cd /Users/prabeshkarkee/Desktop/blood-bank
node --loader tsx server/index.ts &
SERVER_PID=$!

# Handle cleanup when the script is terminated
cleanup() {
  echo "Shutting down client and server..."
  kill $CLIENT_PID
  kill $SERVER_PID
  exit 0
}

trap cleanup INT TERM

echo "Both client and server are now running!"
echo "Client should be available at: http://localhost:3000"
echo "Server should be available at: http://localhost:5173"
echo "Press Ctrl+C to stop both processes"

# Wait for user to press Ctrl+C
wait

#!/bin/bash

# Clean up any existing processes
pkill -f node || true

# Create necessary directories
mkdir -p uploads/documents uploads/profile uploads/temp
chmod -R 755 uploads

# Set environment variables
export USE_FIREBASE=true
export NODE_ENV=development
export USE_MOCK_FIREBASE=true
export ALLOW_INVALID_TOKENS=true

# Start the server in the background
echo "Starting server..."
npm run dev &
SERVER_PID=$!

# Sleep to give server time to start
sleep 2

# Start the client in the background
echo "Starting client..."
npm run dev:client &
CLIENT_PID=$!

# Function to handle cleanup
cleanup() {
  echo "Shutting down processes..."
  kill $SERVER_PID
  kill $CLIENT_PID
  exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Print information
echo "Application is running!"
echo "Client: http://localhost:3000"
echo "Server: http://localhost:5173"
echo "Press Ctrl+C to stop"

# Wait for termination
wait

#!/bin/bash

echo "Stopping any running Node processes..."
pkill -f node || true
pkill -f npm || true

echo "Clearing CSS cache..."
rm -rf /Users/prabeshkarkee/Desktop/blood-bank/client/node_modules/.vite
rm -rf /Users/prabeshkarkee/Desktop/blood-bank/node_modules/.vite

echo "Creating necessary directories..."
mkdir -p uploads/documents uploads/profile uploads/temp
chmod -R 755 uploads

echo "Setting environment variables..."
export USE_FIREBASE=true
export NODE_ENV=development
export USE_MOCK_FIREBASE=true
export ALLOW_INVALID_TOKENS=true

echo "Rebuilding the app..."
cd /Users/prabeshkarkee/Desktop/blood-bank
npm run build

echo "Starting the server..."
cd /Users/prabeshkarkee/Desktop/blood-bank
npm run dev &
SERVER_PID=$!

# Sleep to give server time to start
sleep 2

echo "Starting the client..."
cd /Users/prabeshkarkee/Desktop/blood-bank
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

echo "Application is running!"
echo "Client: http://localhost:3000"
echo "Server: http://localhost:5173"
echo "Press Ctrl+C to stop"

# Wait for termination
wait

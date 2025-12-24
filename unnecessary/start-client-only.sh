#!/bin/bash

# Kill any existing processes
killall node 2>/dev/null || true
killall npm 2>/dev/null || true

echo "Starting client server on port 3000..."
cd /Users/prabeshkarkee/Desktop/blood-bank/client
NODE_ENV=development npx vite --port 3000

#!/bin/bash

# Initialize environment variables if .env file exists
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | xargs)
fi

# Check if the user wants to run in Firebase mode
USE_FIREBASE=${USE_FIREBASE:-true}

# Start the development process
echo "Starting development server with USE_FIREBASE=$USE_FIREBASE..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

if [ "$USE_FIREBASE" = "true" ]; then
  # Run with Firebase
  echo "Starting in Firebase mode..."
  npm run dev:firebase
else
  # Run without Firebase
  echo "Starting without Firebase..."
  npm run dev
fi

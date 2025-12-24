#!/bin/bash

# Check if Firebase credentials exist
if [ ! -f "firebase-credentials.json" ]; then
  echo "ERROR: Firebase credentials not found!"
  echo "Expected file: firebase-credentials.json"
  echo "Please download your service account JSON from Firebase Console:"
  echo "1. Go to Firebase Console > Project Settings > Service Accounts"
  echo "2. Click \"Generate New Private Key\""
  echo "3. Save the file as \"firebase-credentials.json\" in the project root"
  exit 1
fi

# Set environment variables
export USE_FIREBASE=true

# Check if --dev flag is present
if [[ $* == *--dev* ]]; then
  export NODE_ENV=development
  echo "Starting Firebase development server..."
  npx tsx server/index.ts
else
  export NODE_ENV=production
  echo "Starting Firebase production server..."
  node dist/index.js
fi

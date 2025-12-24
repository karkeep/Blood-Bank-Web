#!/bin/bash

echo "Testing Firebase connection..."
echo "Trying to initialize Firebase..."

cd /Users/prabeshkarkee/Desktop/blood-bank

# Run firebase init script to test connection
npm run firebase:init

if [ $? -eq 0 ]; then
  echo "Firebase connection successful!"
else
  echo "Firebase connection failed. Check your credentials and internet connection."
fi

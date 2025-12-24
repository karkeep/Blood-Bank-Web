#!/bin/bash

# This script finds and kills processes using port 5173

# Find the process ID using port 5173
pid=$(lsof -t -i:5173)

if [ -z "$pid" ]; then
  echo "No process found using port 5173"
else
  echo "Found process $pid using port 5173, killing it..."
  kill -9 $pid
  echo "Process killed"
fi

# Start the server with Firebase
npm run dev:fb

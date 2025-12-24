#!/bin/bash

# Script to create a volunteer account
# Usage: ./make-volunteer.sh email@example.com

if [ -z "$1" ]; then
  echo "Please provide an email address: ./make-volunteer.sh email@example.com"
  exit 1
fi

# Run the Node.js script
node make-volunteer.js "$1"

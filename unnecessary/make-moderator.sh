#!/bin/bash

# Script to create a moderator account
# Usage: ./make-moderator.sh email@example.com

if [ -z "$1" ]; then
  echo "Please provide an email address: ./make-moderator.sh email@example.com"
  exit 1
fi

# Run the Node.js script
node make-moderator.js "$1"

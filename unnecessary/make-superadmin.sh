#!/bin/bash

# Script to create a superadmin account
# Usage: ./make-superadmin.sh email@example.com

if [ -z "$1" ]; then
  echo "Please provide an email address: ./make-superadmin.sh email@example.com"
  exit 1
fi

# Run the Node.js script
node make-superadmin.js "$1"

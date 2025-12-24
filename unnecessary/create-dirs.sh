#!/bin/bash

# Make sure necessary directories exist
mkdir -p uploads/documents
mkdir -p uploads/profile
mkdir -p uploads/temp

# Set proper permissions
chmod -R 755 uploads

echo "Upload directories created and permissions set"

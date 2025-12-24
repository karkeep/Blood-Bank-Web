#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting admin creation script for Google account...${NC}"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to continue.${NC}"
    exit 1
fi

# Check if firebase-credentials.json exists
if [ ! -f firebase-credentials.json ]; then
    echo -e "${RED}Error: firebase-credentials.json not found in the current directory.${NC}"
    echo -e "${YELLOW}Please download your Firebase service account key and save it as firebase-credentials.json in this directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Setting Google account 'karkeep@gmail.com' as superadmin...${NC}"

# Run the Node.js script
node make-admin-by-email.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ User has been successfully set as a superadmin!${NC}"
    echo -e "${GREEN}✅ You can now access the admin dashboard at /admin after logging in${NC}"
else
    echo -e "${RED}❌ Failed to set user as superadmin. Check the error message above.${NC}"
    exit 1
fi

#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking admin status for Google account...${NC}"

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

echo -e "${YELLOW}Checking and updating admin status for 'karkeep@gmail.com'...${NC}"

# Run the Node.js script
node check-admin.js

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Admin status has been verified and updated!${NC}"
    echo -e "${YELLOW}IMPORTANT: To apply changes, please follow these steps:${NC}"
    echo -e "  1. Sign out of your application"
    echo -e "  2. Clear your browser cache for the site"
    echo -e "  3. Sign back in with karkeep@gmail.com"
    echo -e "  4. Navigate to /admin to access the admin dashboard"
else
    echo -e "${RED}❌ Failed to verify admin status. Check the error message above.${NC}"
    exit 1
fi

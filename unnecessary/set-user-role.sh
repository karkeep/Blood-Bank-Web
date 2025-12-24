#!/bin/bash
# set-user-role.sh - Set user role in Firebase

if [ $# -ne 2 ]; then
    echo "Usage: ./set-user-role.sh <email> <role>"
    echo "Example: ./set-user-role.sh admin@example.com admin"
    echo ""
    echo "Valid roles:"
    echo "  - superadmin (highest level access)"
    echo "  - admin (admin dashboard access)"
    echo "  - moderator (moderate content)"
    echo "  - volunteer (volunteer features)"
    echo "  - donor (default role)"
    echo "  - user (basic user)"
    exit 1
fi

EMAIL=$1
ROLE=$2

echo "🔧 Setting role '$ROLE' for user: $EMAIL"
node set-user-role.js "$EMAIL" "$ROLE"

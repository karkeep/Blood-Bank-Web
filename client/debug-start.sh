#!/bin/bash

echo "🩸 Jiwandan Blood Bank - Debug Startup Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in client directory. Please run this from /blood-bank/client/"
    exit 1
fi

echo "✅ In client directory"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file with your Firebase config..."
    cat > .env << 'EOF'
VITE_FIREBASE_API_KEY=AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8
VITE_FIREBASE_AUTH_DOMAIN=blood-bank-f759d.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=blood-bank-f759d
VITE_FIREBASE_STORAGE_BUCKET=blood-bank-f759d.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF
else
    echo "✅ Environment file exists"
fi

echo ""
echo "🚀 Starting development server..."
echo "📱 App will be available at: http://localhost:5173"
echo "🔧 If the app doesn't load, check browser console for errors"
echo ""

# Clear any existing processes on port 5173
echo "🧹 Clearing any existing processes on port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start the dev server
npm run dev
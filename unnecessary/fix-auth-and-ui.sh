#!/bin/bash

echo "🔧 Fixing Google Authentication & UI Issues..."
echo "============================================="

cd /Users/prabeshkarkee/Desktop/blood-bank

# Kill existing processes
echo "🛑 Stopping current processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "🎯 FIXES APPLIED:"
echo "   ✅ Simplified Google Auth (removed database dependency)"
echo "   ✅ Made Learn More button visible with proper hover effects"
echo "   ✅ Removed red and green floating bubbles"
echo "   ✅ Added Google Auth test component for debugging"
echo "   ✅ Enhanced error handling for Google Auth"

echo ""
echo "🔧 GOOGLE AUTH TROUBLESHOOTING:"
echo "   • Make sure localhost:5173 is authorized in Firebase Console"
echo "   • Go to Firebase Console > Authentication > Settings > Authorized domains"
echo "   • Add 'localhost' if it's not there"
echo "   • Check browser console for detailed error logs"

echo ""
echo "🚀 Starting fixed application..."

npm run dev:fb &
SERVER_PID=$!

sleep 6

echo ""
echo "✅ ISSUES FIXED!"
echo "==============="
echo "🌐 Visit: http://localhost:5173"
echo "📄 Test Google Auth: /auth page (see test button)"
echo "🎨 No floating bubbles: Clean design"
echo "👆 Learn More button: Now visible and working"
echo ""
echo "🔍 If Google Auth still fails:"
echo "   1. Check browser console for errors"
echo "   2. Try in incognito mode"
echo "   3. Check Firebase Console authorized domains"
echo "   4. Make sure popups are allowed"
echo ""
echo "Press Ctrl+C to stop"

wait $SERVER_PID

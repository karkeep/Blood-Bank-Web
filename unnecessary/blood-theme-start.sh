#!/bin/bash

echo "🩸 Applying Beautiful Blood Theme..."
echo "=================================="

cd /Users/prabeshkarkee/Desktop/blood-bank

# Stop current process
echo "🛑 Stopping current processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Clear cache for theme changes
echo "🧹 Clearing cache for theme updates..."
rm -rf client/node_modules/.vite 2>/dev/null || true

echo "🎨 Blood Theme Features Applied:"
echo "   ✅ Beautiful blood red gradients"
echo "   ✅ Professional medical colors"
echo "   ✅ Animated blood pulse effects"
echo "   ✅ Heartbeat animations"
echo "   ✅ Glass morphism effects"
echo "   ✅ Enhanced shadows and borders"
echo "   ✅ Optimized color palette"

echo ""
echo "🚀 Starting with Beautiful Blood Theme..."

npm run dev:firebase &
SERVER_PID=$!

sleep 6

echo ""
echo "✨ BLOOD THEME NOW ACTIVE!"
echo "========================="
echo "🌐 Visit: http://localhost:5173"
echo "📄 Go to: /auth page to see the beautiful theme"
echo "🎨 Features:"
echo "   • Beautiful blood red gradients"
echo "   • Smooth pulse animations"
echo "   • Professional medical design"
echo "   • Glass morphism effects"
echo "   • Enhanced visual hierarchy"
echo ""
echo "🎯 Test Pages:"
echo "   • /auth - See the enhanced section"
echo "   • /demo-blood-theme - Full theme showcase"
echo ""
echo "Press Ctrl+C to stop"

wait $SERVER_PID

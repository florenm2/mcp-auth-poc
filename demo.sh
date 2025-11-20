#!/bin/bash
# MCP Authorization POC - Quick Demo Script
# This script demonstrates the complete OAuth + DCR + MCP flow

set -e  # Exit on error

echo "🎯 MCP Authorization POC - Demo"
echo "================================"
echo ""

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Server already running on port 3000"
    echo "   Kill it first with: lsof -ti:3000 | xargs kill"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install --silent

echo ""
echo "🔨 Step 2: Building packages..."
npm run build --silent

echo ""
echo "🚀 Step 3: Starting server..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
echo "   Waiting for server to be ready..."
sleep 3

echo ""
echo "✅ Server is running (PID: $SERVER_PID)"
echo ""
echo "📋 Step 4: Running client demo..."
echo "   (This will open your browser for OAuth authorization)"
echo ""
sleep 2

cd client
npm start

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Demo complete!"
echo ""
echo "📖 For more details, see:"
echo "   - README.md - Full documentation"
echo "   - DEMO.md - Step-by-step guide"
echo "   - TAKEAWAYS.md - Analysis and POV"

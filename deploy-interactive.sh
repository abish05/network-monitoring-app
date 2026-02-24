#!/bin/bash

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🚀 NETWORK MONITORING APP - INSTANT DEPLOY 🚀         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Preparing your app for deployment..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

echo "🎯 Choose your deployment platform:"
echo ""
echo "  1) Vercel (Recommended - Best for Next.js)"
echo "  2) Railway (Best for WebSocket support)"
echo "  3) Render (Good all-around option)"
echo "  4) Show me all options"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "You'll need to:"
        echo "  1. Login/Signup (free account)"
        echo "  2. Press Enter to accept defaults"
        echo "  3. Wait ~60 seconds"
        echo ""
        read -p "Press Enter to continue..."
        npx vercel --prod
        ;;
    2)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""
        npx @railway/cli login
        npx @railway/cli init
        npx @railway/cli up
        ;;
    3)
        echo ""
        echo "🎨 Deploying to Render..."
        echo ""
        echo "Please follow these steps:"
        echo "  1. Go to https://render.com"
        echo "  2. Sign up (free)"
        echo "  3. Click 'New +' → 'Web Service'"
        echo "  4. Connect your GitHub repo"
        echo "  5. Use these settings:"
        echo "     - Build: npm install && npm run build"
        echo "     - Start: npm start"
        echo "  6. Click 'Create Web Service'"
        echo ""
        read -p "Press Enter when done..."
        ;;
    4)
        echo ""
        echo "📚 All Deployment Options:"
        echo ""
        echo "FREE HOSTING PLATFORMS:"
        echo "  • Vercel: https://vercel.com (Best for Next.js)"
        echo "  • Railway: https://railway.app (Best for WebSocket)"
        echo "  • Render: https://render.com (Good all-around)"
        echo "  • Netlify: https://netlify.com (Good for static)"
        echo "  • Fly.io: https://fly.io (Good for Docker)"
        echo ""
        echo "FREE DOMAIN PROVIDERS:"
        echo "  • Freenom: https://freenom.com (.tk, .ml, .ga)"
        echo "  • No-IP: https://noip.com (Free subdomain)"
        echo "  • DuckDNS: https://duckdns.org (Free subdomain)"
        echo ""
        echo "See DEPLOYMENT.md for detailed guides!"
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              ✅ DEPLOYMENT COMPLETE! 🎉                    ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your app is now LIVE on the internet!"
echo ""
echo "📝 Next Steps:"
echo "  • Visit your live URL (shown above)"
echo "  • Share it with anyone!"
echo "  • To redeploy: just run this script again"
echo ""
echo "💡 Tips:"
echo "  • Add custom domain: See DEPLOYMENT.md"
echo "  • Monitor your app: Check platform dashboard"
echo "  • Update code: Push to git = auto deploy"
echo ""

#!/bin/bash

echo "🚀 Deploying Network Monitoring App to Vercel..."
echo ""
echo "This will:"
echo "  ✓ Deploy your app to Vercel's free tier"
echo "  ✓ Give you a free .vercel.app domain"
echo "  ✓ Enable automatic HTTPS"
echo ""

# Deploy using npx (no global install needed)
npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is now live! 🎉"
echo ""
echo "Next steps:"
echo "  1. Visit your live URL (shown above)"
echo "  2. To add a custom domain: vercel domains add yourdomain.com"
echo "  3. To redeploy: just run this script again!"

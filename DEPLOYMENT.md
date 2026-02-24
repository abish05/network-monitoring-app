# 🚀 Deploy Your Network Monitoring App - FREE

## Option 1: Vercel (RECOMMENDED - Easiest & Free)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd "/Users/abish/Desktop/GITHUB PROJECTS/network-monitoring-app 2"
vercel
```

Follow the prompts:
- Login/Signup (free account)
- Confirm project settings
- Deploy!

**You'll get:**
- Free domain: `your-project.vercel.app`
- Auto SSL certificate
- Global CDN
- Automatic deployments on git push

### Step 3: Get Custom Domain (Optional)
- Free domains: Use Freenom.com or get `.vercel.app` subdomain
- In Vercel dashboard: Settings → Domains → Add your domain

---

## Option 2: Railway.app (Good for WebSocket)

### Deploy:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Free tier:** 500 hours/month, custom domain included

---

## Option 3: Render.com (Full-Stack Friendly)

1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
6. Deploy!

**Free domain:** `your-app.onrender.com`

---

## Option 4: GitHub Pages + Backend on Render

### Frontend (GitHub Pages):
```bash
npm run build
npm i -g gh-pages
gh-pages -d out
```

### Backend (Render/Railway):
Deploy `server.js` separately on Render or Railway

---

## 🆓 Free Domain Providers

1. **Freenom.com** - Free .tk, .ml, .ga domains
2. **Dot.tk** - Free .tk domains
3. **InfinityFree** - Free hosting + subdomain
4. **000webhost** - Free hosting + subdomain

---

## Quick Start (Fastest Method)

Run this in your terminal:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd "/Users/abish/Desktop/GITHUB PROJECTS/network-monitoring-app 2"

# Deploy (one command!)
vercel --prod
```

**Done! Your app will be live in ~2 minutes!**

Your free URL: `https://network-monitoring-app.vercel.app` (or similar)

---

## Environment Variables (if needed)

In Vercel dashboard:
- Settings → Environment Variables
- Add: `PORT=5001` or any other vars

---

## Troubleshooting

**WebSocket issues on Vercel?**
- Vercel has limitations with WebSockets
- Use Railway or Render for full WebSocket support
- Or use Vercel for frontend + Railway for backend

**Build fails?**
```bash
# Test locally first
npm run build
npm start
```

---

## Need Help?

1. Vercel Docs: https://vercel.com/docs
2. Railway Docs: https://docs.railway.app
3. Render Docs: https://render.com/docs

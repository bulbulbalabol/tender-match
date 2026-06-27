#!/bin/bash
# TenderMatch KZ — DEPLOYMENT COMMANDS (Copy & Paste)
# Use these commands to deploy to production in <15 minutes

echo "🚀 TENDERMATCH KZ PRODUCTION DEPLOY"
echo "=================================="

# ─── STEP 1: Build Frontend ───────────────────────────────────────────────────
echo "Step 1: Building frontend..."
cd ~/Desktop/tender-match/frontend
npm run build
# Expected: "dist/" folder created, ✓ ready for upload

# ─── STEP 2: Deploy Frontend to Vercel ────────────────────────────────────────
echo "Step 2: Deploying frontend to Vercel..."
vercel deploy --prod

# WAIT for URL like: https://tendermatch.vercel.app
# Copy this URL and save it

FRONTEND_URL="https://tendermatch.vercel.app"
echo "✓ Frontend deployed to: $FRONTEND_URL"

# ─── STEP 3: Get Backend API URL ──────────────────────────────────────────────
echo "Step 3: Backend status..."
echo "→ Go to Railway dashboard"
echo "→ Copy your API URL (should look like: https://api-prod-xxx.railway.app)"
echo "→ Paste it below:"
read -p "Enter Railway API URL: " API_URL
echo "✓ API URL: $API_URL"

# ─── STEP 4: Update Frontend Environment ──────────────────────────────────────
echo "Step 4: Updating frontend environment variables..."
echo "→ Go to Vercel Dashboard"
echo "→ Settings → Environment Variables"
echo "→ Set VITE_API_URL=$API_URL"
echo "→ Redeploy frontend (click 'Redeploy')"
read -p "Press ENTER when done..."

# ─── STEP 5: Update Backend Environment ───────────────────────────────────────
echo "Step 5: Updating backend environment..."
echo "→ Go to Railway Dashboard"
echo "→ Variables tab"
echo "→ Add/Update these variables:"
echo ""
echo "  ANTHROPIC_API_KEY=sk-ant-YOUR_KEY"
echo "  STRIPE_SECRET_KEY=sk_live_YOUR_KEY"
echo "  RESEND_API_KEY=re_YOUR_KEY"
echo "  DB_PATH=production.db"
echo "  FRONTEND_URL=$FRONTEND_URL"
echo ""
read -p "Press ENTER when done..."

# ─── STEP 6: Test Live ─────────────────────────────────────────────────────────
echo "Step 6: Testing live deployment..."
echo ""
echo "📝 Test Checklist:"
echo "  [ ] Visit $FRONTEND_URL"
echo "  [ ] Sign up new vendor"
echo "  [ ] Verify tenders loading"
echo "  [ ] Click tender → see match score"
echo "  [ ] Click 'Generate Proposal' → see loading spinner"
echo "  [ ] Verify Claude proposal generates"
echo "  [ ] Go to /pricing → test Stripe payment"
echo ""
read -p "Are all tests passing? (y/n): " test_result

if [ "$test_result" = "y" ]; then
  echo "✅ DEPLOYMENT SUCCESSFUL!"
  echo ""
  echo "Live URL: $FRONTEND_URL"
  echo "API URL: $API_URL"
  echo ""
  echo "Next steps:"
  echo "1. Buy domain tendermatch.kz"
  echo "2. Point DNS to Vercel"
  echo "3. Add custom domain in Vercel settings"
  echo "4. Send invites to first 50 users"
  echo ""
  echo "💰 Revenue started at: $(date)"
else
  echo "❌ Tests failed. Debug and try again."
  echo "Check backend logs: Railway Dashboard → Logs tab"
  echo "Check frontend console: Browser DevTools → Console tab"
  exit 1
fi

echo ""
echo "🎉 LET'S GOOOO!"

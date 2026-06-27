# TenderMatch KZ — 7-Day Beast Mode Launch Plan

**Goal:** Ship live, get first 50 paying users, prove product-market fit

**Timeline:** Jun 21 (Friday) → Jun 28 (Friday)

---

## 📅 DAY 1 (Friday Jun 21) — Deploy & Go Live

### Morning (4 hours)
- [ ] **Deploy Frontend** (Vercel)
  ```bash
  cd ~/Desktop/tender-match/frontend
  npm run build
  vercel deploy --prod
  ```
  → Get URL like `https://tendermatch.vercel.app`

- [ ] **Deploy Backend** (Railway)
  ```bash
  cd ~/Desktop/tender-match/backend
  git add .
  git commit -m "Production deployment"
  git push origin main
  ```
  → Railway auto-deploys, get API URL like `https://api-prod-xxx.railway.app`

- [ ] **Connect endpoints** — Update Vercel env:
  - Go to Vercel dashboard → Settings → Environment Variables
  - Add: `VITE_API_URL=https://api-prod-xxx.railway.app`
  - Redeploy frontend

- [ ] **Verify working**
  - Visit https://tendermatch.vercel.app/dashboard
  - Register test vendor
  - Click tender → "Generate Proposal" → verify Claude works
  - ✅ Screenshot for proof

### Afternoon (3 hours)
- [ ] **Set up custom domain**
  - Buy domain: tendermatch.kz (Namecheap, GoDaddy)
  - Add to Vercel custom domains
  - Point DNS (wait up to 24 hrs for propagation)
  - Meanwhile, use vercel.app URL for beta launch

- [ ] **Add payment method to Railway**
  - Railway dashboard → Account → Payment
  - Add credit card
  - Set spending limit to $100/week (safety)

- [ ] **Stripe test mode → Live mode**
  - Go to https://stripe.com
  - Switch from Test to Live mode
  - Update `.env` in Railway:
    ```
    STRIPE_SECRET_KEY=sk_live_xxxxx (from Stripe Live keys)
    STRIPE_PRICE_STARTER=price_xxxxx (create 3 products in Stripe)
    STRIPE_PRICE_PRO=price_xxxxx
    STRIPE_PRICE_ENTERPRISE=price_xxxxx
    ```
  - Test payment with real card (refund immediately)

### Evening (2 hours)
- [ ] **Create 5-slide pitch deck** (for investor/partner calls)
  - Slide 1: Problem (Tenderbot sucks)
  - Slide 2: Solution (TenderMatch: AI matching)
  - Slide 3: 3 killer features (matching, bid intel, proposals)
  - Slide 4: TAM (50K SME contractors in KZ)
  - Slide 5: Traction (beta launch Day 1)

- [ ] **Post to social media** (LinkedIn, Telegram, WhatsApp)
  - Message: "🚀 TenderMatch KZ is LIVE. AI-powered tender matching for SME contractors. Beat Tenderbot with AI proposals. Join 50-person beta: [link]"
  - Post to 3 Kazakhstan startup groups on Telegram

---

## 📅 DAY 2 (Saturday Jun 22) — Acquire Beta Users

### Morning (4 hours)
- [ ] **Create lead list** (50 target contractors)
  - LinkedIn: Search "construction contractor Kazakhstan" + "Almaty" + "Astana"
  - Export 50 profiles (find email/phone from profiles)
  - Create CSV: name, email, company, category (construction/IT/etc)
  - Save to: `/Desktop/tender-match/beta_users.csv`

- [ ] **Send first wave of invites** (20 emails)
  - Subject: "Try TenderMatch KZ for free (AI-powered tender matching)"
  - Body:
    ```
    Hi [Name],

    You bid on government tenders, right?

    We built TenderMatch KZ — an AI platform that automatically matches YOU with winning tenders and generates full proposals in 2 minutes.

    No more manual searching. No more copy-paste proposals.

    Free beta: https://tendermatch.vercel.app/onboarding
    (No credit card required for 30 days)

    Your categories: [construction/IT/etc]
    Your regions: [Almaty/Astana/etc]

    Go test it out. 2-minute setup.

    — Moloko & Co
    hello@tendermatch.kz
    ```

### Afternoon (3 hours)
- [ ] **Instagram reels/TikTok** (record 3 short videos)
  - Video 1: "Stop wasting 5 hours searching for tenders"
  - Video 2: "AI writes your tender proposal in 60 seconds"
  - Video 3: Demo of matching algorithm
  - Post to: Instagram, TikTok, YouTube Shorts
  - Hashtags: #Kazakhstan #Tenders #SmallBusiness #AI

- [ ] **Call 5 contractors directly**
  - Use LinkedIn to find phone numbers
  - 5-min pitch: "We're beta-testing TenderMatch. Can I demo it?"
  - Get them to sign up + test live on call
  - Record their reactions (testimonials)

### Evening (2 hours)
- [ ] **Set up analytics**
  - Add Google Analytics to frontend:
    ```bash
    npm install @react-google-analytics
    ```
  - Vercel automatic speed analytics → Vercel Analytics dashboard
  - Track: signups, proposal generations, match views
  - Set alert: if users > 50, notify you

- [ ] **Create Telegram bot for support**
  - BotFather → create new bot
  - Get token
  - Post bot link in all messages: "Join our beta support channel"
  - Use for instant feedback loop

---

## 📅 DAY 3 (Sunday Jun 23) — Product Polish & Iterate

### Morning (4 hours)
- [ ] **Review user feedback** from Day 2
  - Read emails, Telegram messages, social comments
  - List top 5 bugs/UX issues
  - Prioritize by: (frequency × impact)

- [ ] **Hot-fix top 3 bugs**
  - E.g., if proposal generation fails, add retry button
  - If matching shows wrong scores, debug calculate_match()
  - Deploy hot-fix immediately to production
  ```bash
  git commit -am "Fix: [issue name]"
  git push origin main
  # Auto-deploys to Vercel + Railway
  ```

- [ ] **Add testimonials section to Landing page**
  - Screenshot 2-3 beta user reactions
  - Add quotes: "Saved me 10 hours per week" 
  - Update Landing.tsx with testimonials
  - Deploy

### Afternoon (3 hours)
- [ ] **Send second wave of invites** (30 emails)
  - Same template as Day 2
  - Target: construction companies, IT contractors, food suppliers
  - Goal: 50 total beta signups by end of day

- [ ] **Partner outreach** (5 calls)
  - Call chambers of commerce (Almaty, Astana)
  - "We're helping SME contractors win more tenders. Want to promote?"
  - Goal: Get listed in 1-2 chamber newsletters
  - Pitch: "Free for your members, we'll give you 20% affiliate commission"

### Evening (2 hours)
- [ ] **Create FAQ/Help docs**
  - Common questions:
    - "How does matching work?"
    - "Can I edit the proposal?"
    - "Is data secure?"
    - "How do I cancel?"
  - Add to: `/frontend/src/pages/Help.tsx`
  - Link from all pages

---

## 📅 DAY 4 (Monday Jun 24) — Payment + First Revenue

### Morning (4 hours)
- [ ] **Verify Stripe payments work**
  - Test card: 4242 4242 4242 4242 (exp: 12/25, CVC: 123)
  - Go to /pricing page
  - Click "Start Pro" (₸70,000/month)
  - Complete checkout
  - Verify:
    - Payment succeeds
    - Confirmation email sent
    - User upgraded on dashboard
  - Refund test payment

- [ ] **Set up email receipts** (Resend)
  - Verify RESEND_API_KEY is set in Railway
  - Test: Purchase subscription → check email
  - If broken, debug backend email sending

- [ ] **Create paywall on key features**
  - Match scores: Free (5/day) + Pro (unlimited) ✅
  - Bid Intel: Free (basic) + Pro (advanced) ✅
  - Proposals: Free (1/mo) + Pro (5/mo) ✅
  - Should already be in code from Pricing page

### Afternoon (3 hours)
- [ ] **Reach out to first 10 premium prospects**
  - Target: larger construction companies (100+ employees)
  - Email: "TenderMatch Pro — Free month trial? Let's talk."
  - Goal: Get 3-5 sign-ups at ₸70K/month = ₸210K-350K MRR 💰
  - Use Stripe affiliate tracking to measure

- [ ] **Record demo video** (YouTube)
  - 2-minute walkthrough: register → view matches → generate proposal
  - Upload to YouTube (TenderMatch KZ channel)
  - Embed on Landing page
  - Share on WhatsApp/Telegram: "Here's how it works"

### Evening (2 hours)
- [ ] **Analyze Day 4 metrics**
  - Check Google Analytics: total signups, active users
  - Check Stripe: total revenue (goal: ₸100K+)
  - Check Vercel: page load time, error rate
  - Screenshot dashboard for your co-founder

---

## 📅 DAY 5 (Tuesday Jun 25) — Scale Acquisition

### Morning (4 hours)
- [ ] **Paid ads launch** (Facebook + LinkedIn)
  - Budget: ₸50K (split 50/50)
  - Audience: Construction managers, age 30-55, Almaty/Astana
  - Ad copy: "AI writes your tender proposals in 60 seconds"
  - Landing: tendermatch.vercel.app/onboarding
  - Goal: 100 clicks → 20 signups (20% conversion)

- [ ] **Influencer outreach** (3 calls)
  - Find: YouTube channels about SME business in Kazakhstan
  - Pitch: "We'll sponsor your next video (₸30K) if you demo TenderMatch"
  - Goal: 1-2 sponsors by EOD

- [ ] **Press release** (optional but high impact)
  - Send to: Forbes.kz, Tengrinews.kz, Atameken.kz
  - Subject: "TenderMatch KZ Launches AI-Powered Tender Matching Platform"
  - Goal: Get 1 article published

### Afternoon (3 hours)
- [ ] **Third wave of direct outreach** (20 calls)
  - Phone (not just email) — higher conversion
  - Script: "Hi [Name], 60-second demo of our tender AI?"
  - If interested: share screen, show live matching/proposal gen
  - Close: "Try for free, link in your email. Let me know if questions."
  - Goal: 15% of calls = 3 sign-ups

- [ ] **Referral program launch**
  - Update Dashboard sidebar:
    ```
    "Refer a friend → Get ₸10,000 credit per signup"
    Referral link: https://tendermatch.vercel.app/?ref=[user_id]
    ```
  - Incentivize: Every 5 referrals = 1 month free

### Evening (2 hours)
- [ ] **Day 5 standup with co-founder**
  - Metrics: Total signups, revenue, active users, feedback
  - What's working? → Double down
  - What's not? → Kill it, pivot
  - Plan for Days 6-7

---

## 📅 DAY 6 (Wednesday Jun 26) — Optimization

### Morning (4 hours)
- [ ] **A/B test Landing page**
  - Variant A: "AI Tender Matching" (current)
  - Variant B: "Stop Wasting 5 Hours on Tenders" (emotional hook)
  - Run on 50% of traffic each
  - Measure: signups/click
  - Winner → deploy to 100%

- [ ] **Optimize onboarding flow**
  - Measure: How many users drop at each step?
  - If <20% reach "View Matches" step: simplify flow
  - Add progress bar, reduce form fields, auto-fill categories
  - Deploy changes

- [ ] **Performance audit**
  - Lighthouse score → target 90+
  - Bundle size → target <500KB JS
  - API response time → target <500ms
  - If slow: optimize, cache, compress

### Afternoon (3 hours)
- [ ] **Customer success calls** (5 calls with active users)
  - Ask: "What's the #1 thing you'd change?"
  - Listen for: pain points, feature requests
  - Note: Screenshot/record call
  - Goal: Understand what drives retention

- [ ] **Prepare for Day 7 launch event**
  - If domain ready (tendermatch.kz): move everything to live domain
  - Test all links, payments, emails one more time
  - Create "launch day" social media posts (schedule for Day 7)
  - Record launch announcement video (30 sec)

### Evening (2 hours)
- [ ] **Revenue forecast model**
  - Current: ? signups × ? conversion × ₸70K = ? MRR
  - Project: If 100 signups/week × 15% Pro → 15 users × ₸70K = ₸1.05M MRR
  - Calculate: Breakeven point (when revenue > costs)
  - Share with potential investors

---

## 📅 DAY 7 (Thursday Jun 27) — LAUNCH DAY 🚀

### Morning (6 hours)
- [ ] **Final QA checklist**
  - [ ] Register vendor → matches showing? ✓
  - [ ] Bid intelligence displaying? ✓
  - [ ] Proposal generation works (EN + RU)? ✓
  - [ ] Payment processing works? ✓
  - [ ] Emails sending? ✓
  - [ ] No console errors? ✓
  - [ ] Mobile responsive? ✓

- [ ] **"Go live" event**
  - Post on all channels simultaneously (10:00 AM KZ time):
    - LinkedIn: "🚀 TenderMatch KZ is officially LIVE"
    - Instagram: Launch announcement video (30 sec reel)
    - Telegram: Group message to beta users + broader Kazakhstan groups
    - WhatsApp: Personal messages to top 50 prospects
    - Email: Newsletter to all signups + waitlist
  - Subject: "TenderMatch KZ is LIVE — 50% off Pro for early users (48 hrs only)"
  - CTA: tendermatch.kz (or tendermatch.vercel.app if domain not ready)

- [ ] **Live social media monitoring**
  - Check comments/DMs every 30 min
  - Respond within 10 minutes to every question
  - Flag: If bugs reported → hot-fix immediately
  - Track: Signups/hour for first 6 hours

### Afternoon (4 hours)
- [ ] **Press & media blitz**
  - Post video to YouTube, TikTok, Instagram, LinkedIn
  - Share in 10+ Telegram/WhatsApp groups
  - Email 100 journalists/bloggers: "We built an AI platform that beats Tenderbot.kz"
  - Wait for coverage (usually 24-48 hrs)

- [ ] **Customer support surge**
  - Be available on Telegram bot (respond <5 min)
  - Have FAQ + video ready for common questions
  - Record 2-3 "how to" videos for common issues
  - Goal: 100% user satisfaction by EOD

### Evening (2 hours)
- [ ] **Day 7 metrics & celebration**
  - Total signups (goal: 100+)
  - Pro conversions (goal: 10+)
  - Total revenue (goal: ₸700K+)
  - Screenshot metrics, post "first week report" on LinkedIn
  - 🎉 Celebrate with co-founder (you earned it)

---

## 📅 BONUS: DAY 8+ (Weekend + Beyond)

- **If hitting goals** → Scale ads, hire first support person, plan mobile app
- **If missing goals** → Analyze why, iterate, pivot if needed
- **Always** → Watch Goszakup API approval email (highest priority!)

---

## 🎯 Week 1 Success Metrics

| Metric | Target | Stretch |
|--------|--------|---------|
| **Total Signups** | 50 | 100 |
| **Pro Subscribers** | 5 | 15 |
| **Proposals Generated** | 20 | 50 |
| **Monthly Revenue** | ₸350K | ₸1.05M |
| **Domain Live** | tendermatch.kz | ✓ |
| **Press Coverage** | 1 article | 3+ articles |
| **User Satisfaction** | 4.5/5 stars | 4.8/5 stars |

---

## 🔥 Beast Mode Rules

1. **Speed over perfection** — Ship broken, iterate fast
2. **Users > features** — If 10 users want feature X, build it TODAY
3. **Revenue > signups** — Focus on Pro conversions, not vanity metrics
4. **Sleep is optional** — You have 7 days to prove this works
5. **Respond to EVERY message** — User feedback = gold
6. **No vacation** — Full-time intensity, 6am-midnight grind

---

## 💪 You Got This

Day 1: Deployed
Day 2-3: 50 users
Day 4-5: First revenue
Day 6-7: VICTORY

**Let's go. 🚀**

---

*Last updated: June 21, 2026*
*Next sync: Monday Jun 24 (Day 4) standup*

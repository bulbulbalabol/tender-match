# TenderMatch KZ — Deployment Guide
## Live in ~15 minutes

---

## Step 1 — Push to GitHub

1. Create a new repo at github.com/new (name it `tender-match-kz`)
2. In your terminal:

```bash
cd tender-match          # this folder
git init
git add .
git commit -m "Initial TenderMatch KZ MVP"
git remote add origin https://github.com/YOUR_USERNAME/tender-match-kz.git
git push -u origin main
```

---

## Step 2 — Deploy Backend to Render (free)

1. Go to **render.com** → sign up with GitHub
2. Click **New → Web Service**
3. Connect your `tender-match-kz` repo
4. Set these settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Click **Deploy**
6. Wait ~2 minutes. Your backend URL will be:  
   `https://tender-match-api.onrender.com` (or similar)
7. Test it: open `https://YOUR-RENDER-URL/api/stats` in browser — you should see JSON with tender counts.

---

## Step 3 — Deploy Frontend to Vercel (free)

1. Go to **vercel.com** → sign up with GitHub
2. Click **Add New → Project**
3. Import your `tender-match-kz` repo
4. Set:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
5. Add **Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://YOUR-RENDER-URL/api`  
     *(the URL from Step 2 + `/api`)*
6. Click **Deploy**
7. Your live URL: `https://tender-match-kz.vercel.app`

---

## Step 4 — Test the full flow

1. Open your Vercel URL
2. Click **Create Profile** — fill in the 3-step form
3. You should land on the dashboard with matched tenders
4. Click any tender card to see the match analysis

---

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

The frontend proxies `/api/*` to `localhost:8000` automatically (configured in vite.config.ts).

---

## What's Built

| Feature | Status |
|---|---|
| Landing page (EN/RU) | ✅ |
| 3-step vendor onboarding | ✅ |
| 60+ realistic Kazakhstan tenders (seed data) | ✅ |
| Matching engine (category + region + amount) | ✅ |
| Match score % with explanations | ✅ |
| Filter by category, region, amount | ✅ |
| Search | ✅ |
| "Closing soon" alerts | ✅ |
| Tender detail modal | ✅ |
| Goszakup.gov.kz link | ✅ |
| EN/RU language toggle | ✅ |
| SQLite persistence (vendors saved across sessions) | ✅ |

---

## Next: Connect Real Goszakup Data

To pull live data instead of seed data:

1. Email **ows@goszakup.gov.kz** requesting an API token (it's free, takes 1-3 days)
2. Once you have the token, add to Render environment variables:
   ```
   GOSZAKUP_TOKEN=your_token_here
   ```
3. The GraphQL endpoint is `https://ows.goszakup.gov.kz/v2/graphql`
4. Example query to fetch active lots:
   ```graphql
   {
     Lot(filters: { ref_lot_status_id: [220] }, limit: 50) {
       id
       nameRu
       amount
       refSubjectType { nameRu }
       trdBuy {
         nameRu
         customer { nameRu bin }
         refRegion { nameRu }
         endDate
       }
     }
   }
   ```

---

## Pitch Talking Points

- **Market:** Kazakhstan public procurement = **$25B/year** (23% of GDP)
- **Problem:** 60,000+ tenders published/year, vendors manually browse and miss relevant ones
- **Solution:** Profile once → get matched automatically, scored by relevance
- **Competitors:** Tenderbot.kz, TenderPlus.kz — aggregators only, no matching, no grants
- **Moat:** Two-sided network (vendors + procurement officers), data intelligence layer
- **Revenue:** Vendor subscriptions (₸5,000–15,000/month), premium analytics, API for consultancies

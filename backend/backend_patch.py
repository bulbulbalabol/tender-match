"""
TenderMatch KZ — Backend Feature Patcher
Run this ONCE from ~/Desktop/tender-match/backend/:
    python backend_patch.py

Adds to main.py:
  1. Resend email on vendor registration
  2. /api/chat  (Claude Haiku AI chatbot)
  3. /api/create-checkout-session  (Stripe)
  4. /api/stripe-webhook  (Stripe)

Then install new packages:
    pip install resend anthropic stripe httpx --break-system-packages
"""

import re, sys, os

MAIN_PATH = os.path.join(os.path.dirname(__file__), "main.py")

with open(MAIN_PATH, "r") as f:
    src = f.read()

# ── Guard: don't patch twice ───────────────────────────────────────────────────
if "PATCHED_BY_BACKEND_PATCH" in src:
    print("✅ Already patched. Nothing to do.")
    sys.exit(0)

# ── 1. Add imports after first 'import' line ──────────────────────────────────
NEW_IMPORTS = '''
# PATCHED_BY_BACKEND_PATCH
import httpx
import stripe as stripe_lib
try:
    import anthropic as anthropic_lib
except ImportError:
    anthropic_lib = None
'''

# Insert after the last existing import block
last_import_pos = 0
for m in re.finditer(r'^(import |from )', src, re.MULTILINE):
    last_import_pos = m.end()
# Find end of that import line
end_of_line = src.find('\n', last_import_pos)
src = src[:end_of_line+1] + NEW_IMPORTS + src[end_of_line+1:]

# ── 2. Email helper + new endpoints (append before uvicorn block or at end) ───
NEW_CODE = '''

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE PATCH: Email, AI Chat, Stripe
# ═══════════════════════════════════════════════════════════════════════════════

# ── Email helper (Resend) ──────────────────────────────────────────────────────
async def send_email_resend(to: str, subject: str, html: str):
    """Send email via Resend API. Set RESEND_API_KEY in .env to activate."""
    key = os.environ.get("RESEND_API_KEY", "")
    if not key:
        print(f"[Email] RESEND_API_KEY not set — skipping email to {to}")
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "from": "TenderMatch KZ <hello@tendermatch.kz>",
                    "to": to,
                    "subject": subject,
                    "html": html,
                }
            )
            if r.status_code not in (200, 201):
                print(f"[Email] Resend error {r.status_code}: {r.text}")
            else:
                print(f"[Email] Sent to {to}: {subject}")
    except Exception as e:
        print(f"[Email] Exception: {e}")


def welcome_email_html(contact_name: str, company_name: str, lang: str = "en") -> str:
    if lang == "ru":
        return f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#2563eb;padding:16px 24px;border-radius:12px 12px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">TenderMatch KZ</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b">Добро пожаловать, {contact_name}!</h2>
    <p style="color:#475569">Аккаунт для <strong>{company_name}</strong> успешно создан.</p>
    <p style="color:#475569">Вы уже можете просматривать подходящие тендеры на вашем дашборде. Наш ИИ подобрал совпадения на основе ваших категорий и регионов.</p>
    <a href="http://localhost:5173/dashboard" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Перейти к тендерам →</a>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px">TenderMatch KZ · Алматы, Казахстан</p>
  </div>
</div>"""
    return f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#2563eb;padding:16px 24px;border-radius:12px 12px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">TenderMatch KZ</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b">Welcome, {contact_name}!</h2>
    <p style="color:#475569">Your account for <strong>{company_name}</strong> is ready.</p>
    <p style="color:#475569">Head to your dashboard to see AI-matched tenders. We've already found matches based on your categories and regions.</p>
    <a href="http://localhost:5173/dashboard" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">View my tenders →</a>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px">TenderMatch KZ · Almaty, Kazakhstan</p>
  </div>
</div>"""


# ── AI Chat endpoint ───────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    lang: str = "en"

CHAT_SYSTEM_EN = """You are a friendly, knowledgeable assistant for TenderMatch KZ — an AI platform that matches Kazakh companies with government tenders from goszakup.gov.kz.

Key facts you know:
- 3 paid plans: Starter ₸30,000/month, Pro ₸70,000/month, Enterprise ₸100,000/month
- Matching algorithm: category match (55 pts) + region match (30 pts) + budget range (15 pts) = 0-100 score
- Bid Intelligence shows: average number of bidders, historical win rate, competition level (low/medium/high)
- AI Proposal Generator: creates a pre-filled technical proposal document you can copy and submit
- Email & SMS alerts notify you of new high-match tenders and approaching deadlines
- Real tender data from goszakup.gov.kz (Kazakhstan's official public procurement portal)
- Users can filter by category, region, amount range
- To get started: click "Register" and complete the 3-step onboarding

Navigation actions you can suggest (include as JSON at end):
- Go to pricing: {"nav": "/pricing"}
- Go to register: {"nav": "/onboarding"}
- Go to dashboard: {"nav": "/dashboard"}
- Go to buyer page: {"nav": "/buyer"}

Be concise (2-3 sentences max per answer). If user asks to navigate, include the nav JSON."""

CHAT_SYSTEM_RU = """Ты дружелюбный помощник TenderMatch KZ — ИИ-платформы для подбора тендеров для казахстанских компаний.

Ключевые факты:
- 3 платных тарифа: Старт ₸30 000/мес, Про ₸70 000/мес, Корпоративный ₸100 000/мес
- Алгоритм подбора: совпадение категории (55 баллов) + регион (30 баллов) + диапазон бюджета (15 баллов) = 0-100
- Аналитика торгов: среднее число участников, исторический процент побед, уровень конкуренции
- ИИ-генератор предложений: создаёт готовое техническое предложение
- Email и SMS уведомления о новых тендерах и дедлайнах
- Данные с goszakup.gov.kz — официального портала госзакупок РК

Навигация (добавь JSON в конец ответа если нужно):
- Тарифы: {"nav": "/pricing"}
- Регистрация: {"nav": "/onboarding"}
- Дашборд: {"nav": "/dashboard"}

Отвечай кратко (2-3 предложения). Отвечай на русском."""

STATIC_FAQ_EN = {
    "price": "We have 3 plans: Starter ₸30,000/mo, Pro ₸70,000/mo, Enterprise ₸100,000/mo. No free tier — all plans include real tender matching.",
    "free": "We don't have a free plan — all plans are paid, starting at ₸30,000/month for Starter.",
    "how": "Register your company (2 min), pick your categories and regions, and our AI instantly scores all active tenders 0-100 for you.",
    "match": "Matching scores category fit (55 pts), region (30 pts), and budget range (15 pts). You see only relevant tenders.",
    "goszakup": "All tender data comes from goszakup.gov.kz, Kazakhstan's official government procurement portal.",
    "proposal": "Click 'Generate Proposal' on any tender to get a pre-filled technical bid document ready to submit.",
    "alert": "Enable email and SMS alerts in the sidebar to be notified when new matching tenders appear.",
    "stripe": "We accept card payments via Stripe. Go to Pricing to subscribe.",
    "refund": "We offer a 14-day money-back guarantee on all plans.",
    "contact": "Email us at hello@tendermatch.kz — we respond within 24 hours.",
}

STATIC_FAQ_RU = {
    "цена": "3 тарифа: Старт ₸30 000/мес, Про ₸70 000/мес, Корпоративный ₸100 000/мес.",
    "бесплат": "Бесплатного тарифа нет — минимальный план Старт от ₸30 000/месяц.",
    "как": "Зарегистрируйте компанию, выберите категории и регионы — ИИ мгновенно подберёт тендеры.",
    "совпад": "Алгоритм: категория (55 баллов) + регион (30 баллов) + бюджет (15 баллов).",
    "предложени": "Нажмите «Создать предложение» в карточке тендера — получите готовый документ.",
    "уведомл": "Включите email и SMS уведомления в боковой панели дашборда.",
    "возврат": "Возврат средств в течение 14 дней — без вопросов.",
    "контакт": "hello@tendermatch.kz — отвечаем в течение 24 часов.",
}

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    msg_lower = req.message.lower()

    # Try static FAQ first (fast, no API cost)
    faq = STATIC_FAQ_RU if req.lang == "ru" else STATIC_FAQ_EN
    for key, answer in faq.items():
        if key in msg_lower:
            return {"response": answer, "nav": None}

    # Try Claude API
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or anthropic_lib is None:
        return {
            "response": "I can help with questions about TenderMatch KZ — pricing, how matching works, proposals, and alerts. What would you like to know?" if req.lang == "en" else "Я помогу с вопросами о TenderMatch KZ — тарифы, подбор тендеров, предложения и уведомления.",
            "nav": None
        }

    try:
        client = anthropic_lib.Anthropic(api_key=api_key)
        system = CHAT_SYSTEM_RU if req.lang == "ru" else CHAT_SYSTEM_EN
        result = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=system,
            messages=[{"role": "user", "content": req.message}]
        )
        text = result.content[0].text

        # Extract nav action if present
        nav = None
        import json as _json
        nav_match = re.search(r'\\{\\s*"nav"\\s*:\\s*"([^"]+)"\\s*\\}', text)
        if nav_match:
            nav = nav_match.group(1)
            text = text[:nav_match.start()].strip()

        return {"response": text, "nav": nav}
    except Exception as e:
        return {"response": f"Something went wrong: {str(e)}", "nav": None}


# ── Stripe checkout ────────────────────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    plan: str
    vendor_id: Optional[str] = None

@app.post("/api/create-checkout-session")
async def create_checkout_session(req: CheckoutRequest):
    secret_key = os.environ.get("STRIPE_SECRET_KEY", "")
    if not secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured. Add STRIPE_SECRET_KEY to .env")

    price_map = {
        "starter": os.environ.get("STRIPE_PRICE_STARTER", ""),
        "pro":     os.environ.get("STRIPE_PRICE_PRO", ""),
        "enterprise": os.environ.get("STRIPE_PRICE_ENTERPRISE", ""),
    }
    price_id = price_map.get(req.plan, "")
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Price ID not set for plan '{req.plan}'. Add STRIPE_PRICE_{req.plan.upper()} to .env")

    stripe_lib.api_key = secret_key
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    try:
        session = stripe_lib.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{frontend_url}/dashboard?subscribed=true&plan={req.plan}",
            cancel_url=f"{frontend_url}/pricing",
            metadata={"vendor_id": req.vendor_id or "", "plan": req.plan},
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    stripe_lib.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

    try:
        if webhook_secret:
            event = stripe_lib.Webhook.construct_event(payload, sig, webhook_secret)
        else:
            import json as _json
            event = _json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event.get("type") == "checkout.session.completed":
        session_obj = event["data"]["object"]
        vendor_id = session_obj.get("metadata", {}).get("vendor_id", "unknown")
        plan = session_obj.get("metadata", {}).get("plan", "unknown")
        customer_email = session_obj.get("customer_details", {}).get("email", "")
        print(f"[Stripe] ✅ Payment: vendor={vendor_id}, plan={plan}, email={customer_email}")

        # Send confirmation email
        if customer_email:
            import asyncio
            plan_label = {"starter": "Starter", "pro": "Pro", "enterprise": "Enterprise"}.get(plan, plan)
            await send_email_resend(
                to=customer_email,
                subject=f"TenderMatch KZ — {plan_label} plan activated!",
                html=f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#2563eb;padding:16px 24px;border-radius:12px 12px 0 0">
    <h1 style="color:white;margin:0">TenderMatch KZ</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b">✅ Your {plan_label} plan is active!</h2>
    <p style="color:#475569">Thank you for subscribing. Your account now has full access to all {plan_label} features.</p>
    <a href="http://localhost:5173/dashboard" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Go to Dashboard →</a>
  </div>
</div>"""
            )

    return {"received": True}

# ═══════════════════════════════════════════════════════════════════════════════
# END FEATURE PATCH
# ═══════════════════════════════════════════════════════════════════════════════
'''

# Find insertion point — before `if __name__` or at end
insert_pos = src.rfind('\nif __name__')
if insert_pos == -1:
    src = src + NEW_CODE
else:
    src = src[:insert_pos] + NEW_CODE + src[insert_pos:]

# ── 3. Patch create_vendor to send welcome email ───────────────────────────────
# Find the return statement in create_vendor and add email call before it
VENDOR_PATCH_TARGET = 'return {"id": vendor_id, "message":'
VENDOR_PATCH_REPLACEMENT = '''# Send welcome email (non-blocking)
    import asyncio
    lang = getattr(vendor, "lang", "en") if hasattr(vendor, "lang") else "en"
    asyncio.create_task(send_email_resend(
        to=vendor.email,
        subject="Welcome to TenderMatch KZ — your account is ready!",
        html=welcome_email_html(vendor.contact_name, vendor.company_name, lang)
    ))
    return {"id": vendor_id, "message":'''

if VENDOR_PATCH_TARGET in src:
    src = src.replace(VENDOR_PATCH_TARGET, VENDOR_PATCH_REPLACEMENT, 1)
    print("✅ Patched create_vendor to send welcome email")
else:
    print("⚠️  Could not find create_vendor return — skipping email patch. You may need to add it manually.")

# ── 4. Write patched file ──────────────────────────────────────────────────────
with open(MAIN_PATH, "w") as f:
    f.write(src)

print(f"""
╔══════════════════════════════════════════════════════════════╗
║  ✅  main.py patched successfully!                           ║
╠══════════════════════════════════════════════════════════════╣
║  Now run:                                                    ║
║  pip install resend anthropic stripe httpx --break-system-packages
║                                                              ║
║  Then add to ~/Desktop/tender-match/backend/.env:            ║
║  RESEND_API_KEY=re_xxxx                                      ║
║  ANTHROPIC_API_KEY=sk-ant-xxxx                               ║
║  STRIPE_SECRET_KEY=sk_test_xxxx                              ║
║  STRIPE_PRICE_STARTER=price_xxxx                             ║
║  STRIPE_PRICE_PRO=price_xxxx                                 ║
║  STRIPE_PRICE_ENTERPRISE=price_xxxx                          ║
║  STRIPE_WEBHOOK_SECRET=whsec_xxxx                            ║
║  FRONTEND_URL=http://localhost:5173                          ║
╚══════════════════════════════════════════════════════════════╝
""")

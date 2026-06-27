# TenderMatch KZ — Интеграция с Goszakup.gov.kz API V2

**Инструкция для замены seed данных на реальные тендеры**

---

## 📋 Требования

- ✅ Токен авторизации от Goszakup (запросить у АО "Центр Электронных Финансов")
- ✅ Доступ к REST API V2: `https://ows.goszakup.gov.kz/v2/`
- ✅ GraphQL доступ: `https://ows.goszakup.gov.kz/help/v3/schema/`

---

## 🔑 Получение токена

**Шаг 1:** Отправьте письмо в АО "Центр Электронных Финансов"
- Email: support@goszakup.gov.kz или api@goszakup.gov.kz
- Используйте шаблон из `EMAIL_TO_CEF.txt`

**Шаг 2:** Получите токен в течение 1-2 недель

**Шаг 3:** Токен выдается на 1 год. В конце года нужно перевыпустить в профиле участника

---

## 🔌 REST API Endpoints

### Получение списка закупок (тендеров)

```
GET https://ows.goszakup.gov.kz/v2/trd-buy
Authorization: Bearer {YOUR_TOKEN}

Параметры:
- offset: страница (default: 0)
- limit: количество на странице (default: 50, max: 100)
- created_from: дата начала (формат: YYYY-MM-DD)
- created_to: дата конца
- status: статус закупки (active, completed, paused, cancelled)
```

**Пример ответа:**
```json
{
  "total": 4523,
  "next_page": "https://ows.goszakup.gov.kz/v2/trd-buy?offset=50",
  "limit": 50,
  "system_id": 3,
  "data": [
    {
      "id": "123456",
      "name_ru": "Строительство автодороги",
      "name_en": "Road construction",
      "customer": "Акимат г. Астана",
      "amount": 4500000000,
      "currency": "KZT",
      "deadline": "2026-07-15",
      "category": "construction",
      "region": "astana_city",
      "type": "open_tender",
      "description_ru": "...",
      "status": "active",
      "created_at": "2026-06-20"
    }
  ]
}
```

---

## 💾 Backend интеграция (Python/FastAPI)

### Шаг 1: Установите httpx

```bash
pip install httpx --break-system-packages
```

### Шаг 2: Добавьте в backend/main.py

```python
import httpx
import asyncio
from datetime import datetime, timedelta

# Goszakup API configuration
GOSZAKUP_API_URL = "https://ows.goszakup.gov.kz/v2"
GOSZAKUP_API_TOKEN = os.environ.get("GOSZAKUP_API_TOKEN", "")

async def sync_tenders_from_goszakup():
    """Синхронизирует тендеры с Goszakup API каждый час"""
    if not GOSZAKUP_API_TOKEN:
        print("[Goszakup] Токен не настроен — используем seed данные")
        return

    try:
        headers = {
            "Authorization": f"Bearer {GOSZAKUP_API_TOKEN}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30) as client:
            # Получить тендеры за последний час
            created_from = (datetime.now() - timedelta(hours=1)).strftime("%Y-%m-%d")
            created_to = datetime.now().strftime("%Y-%m-%d")

            response = await client.get(
                f"{GOSZAKUP_API_URL}/trd-buy",
                params={
                    "created_from": created_from,
                    "created_to": created_to,
                    "status": "active",
                    "limit": 100
                },
                headers=headers
            )

            if response.status_code != 200:
                print(f"[Goszakup] Error: {response.status_code} - {response.text}")
                return

            data = response.json()
            tenders = data.get("data", [])
            total_count = data.get("total", 0)

            conn = get_db()
            c = conn.cursor()

            inserted = 0
            for tender in tenders:
                # Проверить дубликаты
                exists = c.execute(
                    "SELECT id FROM tenders WHERE id = ?", 
                    [tender["id"]]
                ).fetchone()

                if exists:
                    continue

                try:
                    # Вставить новый тендер
                    c.execute("""
                        INSERT INTO tenders (
                            id, name_ru, name_en, customer_ru, customer_en,
                            amount, region, category, type, status, deadline,
                            created_at, description_ru, description_en
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        tender.get("id"),
                        tender.get("name_ru", ""),
                        tender.get("name_en", ""),
                        tender.get("customer_ru", tender.get("customer", "")),
                        tender.get("customer_en", ""),
                        tender.get("amount", 0),
                        tender.get("region", ""),
                        tender.get("category", ""),
                        tender.get("type", "open"),
                        "active",
                        tender.get("deadline", ""),
                        datetime.now().isoformat(),
                        tender.get("description_ru", ""),
                        tender.get("description_en", "")
                    ))
                    inserted += 1
                except Exception as e:
                    print(f"[Goszakup] Error inserting tender {tender['id']}: {e}")
                    continue

            conn.commit()
            conn.close()

            print(f"[Goszakup] ✅ Синхронизировано: {inserted}/{total_count} новых тендеров")

    except Exception as e:
        print(f"[Goszakup] Exception during sync: {e}")
        import traceback
        traceback.print_exc()

# Запустить синхронизацию при старте приложения
@app.on_event("startup")
async def startup():
    init_db()
    # Запустить фоновую задачу синхронизации
    asyncio.create_task(periodic_goszakup_sync())

async def periodic_goszakup_sync():
    """Запускает синхронизацию каждый час"""
    while True:
        try:
            await sync_tenders_from_goszakup()
        except Exception as e:
            print(f"[Goszakup] Sync error: {e}")
        
        # Жди 1 час до следующей синхронизации
        await asyncio.sleep(3600)
```

### Шаг 3: Добавьте переменную окружения в Railway

```
GOSZAKUP_API_TOKEN=your_token_from_cef
```

### Шаг 4: Перезагрузитесь

```bash
# Redeploy to Railway
git add .
git commit -m "Integrate Goszakup API V2"
git push origin main
```

---

## 📊 Ожидаемые результаты

**До интеграции:**
- 60 seed тендеров (статичные)
- Вручную обновляемые данные

**После интеграции:**
- 4,000+ реальных тендеров из Goszakup
- Автоматическое обновление каждый час
- Real-time данные для AI matching

---

## 🔍 Тестирование интеграции

### Локально (перед деплоем)

```bash
# 1. Установите токен в .env
echo "GOSZAKUP_API_TOKEN=your_token" >> .env

# 2. Запустите backend
python -m uvicorn main:app --reload

# 3. Проверьте логи
# Должно увидеть:
# [Goszakup] ✅ Синхронизировано: 50/4523 новых тендеров
```

### В production (Railway)

```bash
# 1. Откройте Railway Dashboard → Logs
# 2. Ищите:
#    [Goszakup] ✅ Синхронизировано: 50/4523 новых тендеров

# 3. Проверьте Frontend
#    Dashboard должен показывать реальные тендеры
```

---

## 📈 Метрики для отслеживания

После интеграции отслеживайте:

```
✅ Количество синхронизированных тендеров за день
✅ Скорость синхронизации (минуты на 100 тендеров)
✅ Количество ошибок подключения
✅ Улучшение качества AI matching (с real vs seed данных)
✅ Рост конверсии от matching (больше реальных тендеров = больше покупок Pro)
```

---

## ⚠️ Обработка ошибок

### Ошибка: "Unauthorized" (401)

```
Причина: Неверный токен или истек срок действия
Решение: 
1. Проверить GOSZAKUP_API_TOKEN в .env
2. Если истек (1 год) — перевыпустить на портале Goszakup
3. Перезагрузить backend
```

### Ошибка: "Too many requests" (429)

```
Причина: Превышен лимит запросов
Решение:
1. Увеличить интервал синхронизации (с 1 часа на 3 часа)
2. Уменьшить limit параметр (со 100 на 50)
3. Связаться с поддержкой Goszakup для увеличения квоты
```

### Ошибка: "Not found" (404)

```
Причина: Endpoint изменился или региональное ограничение
Решение:
1. Проверить актуальность документации: https://ows.goszakup.gov.kz/help/v3/schema/
2. Убедиться что используется V2 API (не V3)
3. Связаться с поддержкой
```

---

## 📚 Дополнительные ресурсы

- **GraphQL Schema:** https://ows.goszakup.gov.kz/help/v3/schema/
- **REST API Docs:** https://ows.goszakup.gov.kz/v2/
- **Portal:** https://goszakup.gov.kz
- **Support:** support@goszakup.gov.kz

---

## 🚀 Следующие шаги после интеграции

1. ✅ Синхронизация тендеров работает
2. → Тестирование AI matching на реальных данных
3. → Оптимизация bid intelligence алгоритма
4. → Масштабирование на 10K+ пользователей
5. → Интеграция других API (аналитика, платежи)

---

**Успешной интеграции!** 🎉

Если возникнут вопросы — напишите в hello@tendermatch.kz

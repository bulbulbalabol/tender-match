"""
TenderMatch KZ — Backend API
FastAPI + SQLite
"""
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import json
import os
import uuid
from datetime import datetime, timedelta
import random

# PATCHED_BY_BACKEND_PATCH
import httpx
import stripe as stripe_lib
try:
    import anthropic as anthropic_lib
except ImportError:
    anthropic_lib = None

app = FastAPI(title="TenderMatch KZ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.environ.get("DB_PATH", "tender_match.db")

# ─── Reference Data ───────────────────────────────────────────────────────────

CATEGORIES = [
    {"id": "construction", "name_ru": "Строительство и инфраструктура", "name_en": "Construction & Infrastructure", "icon": "🏗️", "ktru": "45"},
    {"id": "it", "name_ru": "IT и технологии", "name_en": "IT & Technology", "icon": "💻", "ktru": "72"},
    {"id": "healthcare", "name_ru": "Здравоохранение", "name_en": "Healthcare & Medical", "icon": "🏥", "ktru": "85"},
    {"id": "education", "name_ru": "Образование", "name_en": "Education", "icon": "📚", "ktru": "80"},
    {"id": "food", "name_ru": "Продукты питания и общепит", "name_en": "Food & Catering", "icon": "🍽️", "ktru": "15"},
    {"id": "transport", "name_ru": "Транспорт и логистика", "name_en": "Transport & Logistics", "icon": "🚛", "ktru": "60"},
    {"id": "security", "name_ru": "Охранные услуги", "name_en": "Security Services", "icon": "🔒", "ktru": "74"},
    {"id": "engineering", "name_ru": "Инженерные услуги", "name_en": "Engineering Services", "icon": "⚙️", "ktru": "71"},
    {"id": "office", "name_ru": "Офисные товары и оборудование", "name_en": "Office Supplies & Equipment", "icon": "🖨️", "ktru": "30"},
    {"id": "utilities", "name_ru": "ЖКХ и обслуживание", "name_en": "Utilities & Maintenance", "icon": "🔧", "ktru": "50"},
]

REGIONS = [
    {"id": "astana_city", "name_ru": "г. Астана", "name_en": "Astana (city)"},
    {"id": "almaty_city", "name_ru": "г. Алматы", "name_en": "Almaty (city)"},
    {"id": "shymkent_city", "name_ru": "г. Шымкент", "name_en": "Shymkent (city)"},
    {"id": "almaty_oblast", "name_ru": "Алматинская область", "name_en": "Almaty Oblast"},
    {"id": "karaganda", "name_ru": "Карагандинская область", "name_en": "Karaganda Oblast"},
    {"id": "east_kz", "name_ru": "Восточно-Казахстанская область", "name_en": "East Kazakhstan Oblast"},
    {"id": "turkestan", "name_ru": "Туркестанская область", "name_en": "Turkestan Oblast"},
    {"id": "pavlodar", "name_ru": "Павлодарская область", "name_en": "Pavlodar Oblast"},
    {"id": "north_kz", "name_ru": "Северо-Казахстанская область", "name_en": "North Kazakhstan Oblast"},
    {"id": "west_kz", "name_ru": "Западно-Казахстанская область", "name_en": "West Kazakhstan Oblast"},
    {"id": "atyrau", "name_ru": "Атырауская область", "name_en": "Atyrau Oblast"},
    {"id": "mangystau", "name_ru": "Мангистауская область", "name_en": "Mangystau Oblast"},
    {"id": "aktobe", "name_ru": "Актюбинская область", "name_en": "Aktobe Oblast"},
    {"id": "kostanay", "name_ru": "Костанайская область", "name_en": "Kostanay Oblast"},
    {"id": "akmola", "name_ru": "Акмолинская область", "name_en": "Akmola Oblast"},
    {"id": "zhambyl", "name_ru": "Жамбылская область", "name_en": "Zhambyl Oblast"},
    {"id": "kyzylorda", "name_ru": "Кызылординская область", "name_en": "Kyzylorda Oblast"},
    {"id": "abai", "name_ru": "Область Абай", "name_en": "Abai Oblast"},
    {"id": "jetisu", "name_ru": "Жетысуская область", "name_en": "Jetisu Oblast"},
    {"id": "ulytau", "name_ru": "Область Улытау", "name_en": "Ulytau Oblast"},
]

TENDER_TYPES = [
    {"id": "open", "name_ru": "Открытый конкурс", "name_en": "Open Tender"},
    {"id": "price_quote", "name_ru": "Запрос ценовых предложений", "name_en": "Price Quotation"},
    {"id": "single_source", "name_ru": "Из одного источника", "name_en": "Single Source"},
    {"id": "auction", "name_ru": "Электронный аукцион", "name_en": "Electronic Auction"},
]

# ─── Seed Data ────────────────────────────────────────────────────────────────

SEED_TENDERS = [
    # CONSTRUCTION
    {"name_ru": "Строительство автодороги А-27, участок 45–67 км", "name_en": "Road construction A-27, section 45–67 km", "customer_ru": "Управление автодорог Алматинской области", "customer_en": "Almaty Oblast Road Department", "amount": 4_500_000_000, "region": "almaty_oblast", "category": "construction", "type": "open", "days_left": 18},
    {"name_ru": "Капитальный ремонт кровли школы №45", "name_en": "Major roof repair of School No. 45", "customer_ru": "Управление образования г. Астана", "customer_en": "Astana City Education Department", "amount": 87_000_000, "region": "astana_city", "category": "construction", "type": "price_quote", "days_left": 7},
    {"name_ru": "Строительство жилого комплекса «Береке» в 108 мкр", "name_en": "Construction of Bereke residential complex, District 108", "customer_ru": "АО «ИО «КИК»", "customer_en": "Kazakhstan Housing Company JSC", "amount": 12_300_000_000, "region": "astana_city", "category": "construction", "type": "open", "days_left": 30},
    {"name_ru": "Реконструкция водопровода в с. Боралдай", "name_en": "Water pipeline reconstruction in Boraldai village", "customer_ru": "Акимат Алматинской области", "customer_en": "Almaty Oblast Akimat", "amount": 340_000_000, "region": "almaty_oblast", "category": "construction", "type": "open", "days_left": 14},
    {"name_ru": "Строительство моста через р. Иртыш, г. Павлодар", "name_en": "Bridge construction over Irtysh river, Pavlodar", "customer_ru": "Акимат г. Павлодар", "customer_en": "Pavlodar City Akimat", "amount": 7_800_000_000, "region": "pavlodar", "category": "construction", "type": "open", "days_left": 45},
    {"name_ru": "Ремонт фасадов 12 многоквартирных домов", "name_en": "Facade repair of 12 apartment buildings", "customer_ru": "Управление ЖКХ г. Шымкент", "customer_en": "Shymkent Housing Department", "amount": 215_000_000, "region": "shymkent_city", "category": "construction", "type": "price_quote", "days_left": 5},
    {"name_ru": "Строительство больницы на 200 коек в Туркестанской области", "name_en": "Construction of 200-bed hospital in Turkestan Oblast", "customer_ru": "Управление здравоохранения Туркестанской обл.", "customer_en": "Turkestan Oblast Health Department", "amount": 9_100_000_000, "region": "turkestan", "category": "construction", "type": "open", "days_left": 60},
    {"name_ru": "Укладка асфальта на ул. Абая, 2.3 км", "name_en": "Asphalt paving on Abay Street, 2.3 km", "customer_ru": "Акимат г. Кызылорда", "customer_en": "Kyzylorda City Akimat", "amount": 156_000_000, "region": "kyzylorda", "category": "construction", "type": "price_quote", "days_left": 9},
    {"name_ru": "Строительство теплотрассы в Экибастузе", "name_en": "District heating pipeline in Ekibastuz", "customer_ru": "Акимат Павлодарской области", "customer_en": "Pavlodar Oblast Akimat", "amount": 890_000_000, "region": "pavlodar", "category": "construction", "type": "open", "days_left": 21},
    {"name_ru": "Ремонт дороги к с/х объектам Северо-Казахстанской обл.", "name_en": "Road repair to agricultural facilities, North Kazakhstan", "customer_ru": "Акимат Северо-Казахстанской области", "customer_en": "North Kazakhstan Oblast Akimat", "amount": 278_000_000, "region": "north_kz", "category": "construction", "type": "open", "days_left": 16},

    # IT
    {"name_ru": "Поставка серверного оборудования для ЦОД МВД РК", "name_en": "Server equipment supply for MIA Data Center", "customer_ru": "Министерство внутренних дел РК", "customer_en": "Ministry of Internal Affairs RK", "amount": 1_200_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 25},
    {"name_ru": "Разработка мобильного приложения «Е-Здоровье» для области", "name_en": "Development of E-Health mobile app for oblast", "customer_ru": "Управление здравоохранения Карагандинской обл.", "customer_en": "Karaganda Health Department", "amount": 95_000_000, "region": "karaganda", "category": "it", "type": "price_quote", "days_left": 12},
    {"name_ru": "Внедрение ERP-системы в АО «Казахтелеком»", "name_en": "ERP system implementation at Kazakhtelecom JSC", "customer_ru": "АО «Казахтелеком»", "customer_en": "Kazakhtelecom JSC", "amount": 3_400_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 40},
    {"name_ru": "Поставка компьютерной техники для школ (310 ед.)", "name_en": "Computer equipment supply for schools (310 units)", "customer_ru": "Управление образования Алматинской обл.", "customer_en": "Almaty Oblast Education Department", "amount": 186_000_000, "region": "almaty_oblast", "category": "it", "type": "price_quote", "days_left": 8},
    {"name_ru": "Создание геоинформационной системы управления дорогами", "name_en": "Road management GIS development", "customer_ru": "Комитет автомобильных дорог МИИР РК", "customer_en": "Road Committee, Ministry of Industry RK", "amount": 450_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 33},
    {"name_ru": "Поставка и настройка СКУД для 8 объектов акимата", "name_en": "Access control system supply and setup for 8 akimat buildings", "customer_ru": "Акимат г. Алматы", "customer_en": "Almaty City Akimat", "amount": 67_000_000, "region": "almaty_city", "category": "it", "type": "price_quote", "days_left": 6},
    {"name_ru": "Техническая поддержка информационных систем Минфин", "name_en": "IT support for Ministry of Finance information systems", "customer_ru": "Министерство финансов РК", "customer_en": "Ministry of Finance RK", "amount": 540_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 20},
    {"name_ru": "Разработка платформы электронных услуг для МЮ РК", "name_en": "E-services platform development for Ministry of Justice", "customer_ru": "Министерство юстиции РК", "customer_en": "Ministry of Justice RK", "amount": 720_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 35},

    # HEALTHCARE
    {"name_ru": "Поставка медикаментов для ЦРБ Алматинской обл. (Q3 2025)", "name_en": "Medicine supply for district hospitals, Almaty Oblast Q3 2025", "customer_ru": "Управление здравоохранения Алматинской обл.", "customer_en": "Almaty Oblast Health Department", "amount": 2_100_000_000, "region": "almaty_oblast", "category": "healthcare", "type": "open", "days_left": 15},
    {"name_ru": "Поставка аппаратов ИВЛ (20 ед.) для БСМП г. Алматы", "name_en": "Ventilator supply (20 units) for Almaty Emergency Hospital", "customer_ru": "ГКП «БСМП г. Алматы»", "customer_en": "Almaty Emergency Care Hospital", "amount": 360_000_000, "region": "almaty_city", "category": "healthcare", "type": "open", "days_left": 22},
    {"name_ru": "Поставка расходных материалов для операционных блоков", "name_en": "Surgical consumables supply for operating rooms", "customer_ru": "Национальный центр нейрохирургии", "customer_en": "National Neurosurgery Center", "amount": 145_000_000, "region": "astana_city", "category": "healthcare", "type": "price_quote", "days_left": 10},
    {"name_ru": "Техническое обслуживание МРТ и КТ-аппаратов (12 мес.)", "name_en": "MRI and CT scanner maintenance service (12 months)", "customer_ru": "Управление здравоохранения г. Астана", "customer_en": "Astana Health Department", "amount": 230_000_000, "region": "astana_city", "category": "healthcare", "type": "open", "days_left": 17},
    {"name_ru": "Поставка лабораторных реагентов и расходников", "name_en": "Laboratory reagents and consumables supply", "customer_ru": "Центральная референс-лаборатория МЗ РК", "customer_en": "Central Reference Laboratory, MOH RK", "amount": 890_000_000, "region": "astana_city", "category": "healthcare", "type": "open", "days_left": 28},

    # EDUCATION
    {"name_ru": "Поставка учебников для 1-4 классов (250 000 экз.)", "name_en": "Textbook supply for grades 1–4 (250,000 copies)", "customer_ru": "Министерство просвещения РК", "customer_en": "Ministry of Education RK", "amount": 3_600_000_000, "region": "astana_city", "category": "education", "type": "open", "days_left": 45},
    {"name_ru": "Организация курсов повышения квалификации педагогов", "name_en": "Teacher professional development courses", "customer_ru": "Управление образования Костанайской обл.", "customer_en": "Kostanay Oblast Education Department", "amount": 78_000_000, "region": "kostanay", "category": "education", "type": "price_quote", "days_left": 11},
    {"name_ru": "Поставка спортивного инвентаря для 45 школ", "name_en": "Sports equipment supply for 45 schools", "customer_ru": "Управление образования г. Шымкент", "customer_en": "Shymkent Education Department", "amount": 112_000_000, "region": "shymkent_city", "category": "education", "type": "price_quote", "days_left": 8},
    {"name_ru": "Техническое оснащение кабинетов химии и физики (18 школ)", "name_en": "Chemistry and physics lab equipment (18 schools)", "customer_ru": "Управление образования Карагандинской обл.", "customer_en": "Karaganda Oblast Education Department", "amount": 195_000_000, "region": "karaganda", "category": "education", "type": "open", "days_left": 19},

    # FOOD
    {"name_ru": "Организация питания в 23 детских садах г. Алматы", "name_en": "Catering services for 23 kindergartens in Almaty", "customer_ru": "Управление образования г. Алматы", "customer_en": "Almaty City Education Department", "amount": 890_000_000, "region": "almaty_city", "category": "food", "type": "open", "days_left": 13},
    {"name_ru": "Поставка продуктов питания в СИЗО и учреждения КУИС", "name_en": "Food supply to detention centers and correctional facilities", "customer_ru": "КУИС МВД РК", "customer_en": "Penitentiary Committee, MIA RK", "amount": 4_200_000_000, "region": "astana_city", "category": "food", "type": "open", "days_left": 25},
    {"name_ru": "Организация питания для рабочих строительного объекта", "name_en": "Catering for construction site workers", "customer_ru": "АО «ҚазМұнайГаз Өндіріс»", "customer_en": "KazMunayGas Production JSC", "amount": 340_000_000, "region": "atyrau", "category": "food", "type": "price_quote", "days_left": 7},
    {"name_ru": "Поставка продовольственных товаров для воинских частей", "name_en": "Food supply for military units", "customer_ru": "Министерство обороны РК", "customer_en": "Ministry of Defence RK", "amount": 6_800_000_000, "region": "astana_city", "category": "food", "type": "open", "days_left": 30},
    {"name_ru": "Организация школьного питания в 12 школах Атырауской обл.", "name_en": "School meals for 12 schools in Atyrau Oblast", "customer_ru": "Управление образования Атырауской обл.", "customer_en": "Atyrau Oblast Education Department", "amount": 167_000_000, "region": "atyrau", "category": "food", "type": "price_quote", "days_left": 9},

    # TRANSPORT
    {"name_ru": "Поставка 60 автобусов для общественного транспорта г. Астана", "name_en": "60 buses supply for public transit, Astana", "customer_ru": "ТОО «Астана ЛРТ»", "customer_en": "Astana LRT LLP", "amount": 3_600_000_000, "region": "astana_city", "category": "transport", "type": "open", "days_left": 50},
    {"name_ru": "Транспортировка нефтепродуктов на маршруте Атырау–Актобе", "name_en": "Oil products transport route Atyrau–Aktobe", "customer_ru": "АО «КазМунайГаз»", "customer_en": "KazMunayGas JSC", "amount": 1_100_000_000, "region": "atyrau", "category": "transport", "type": "open", "days_left": 20},
    {"name_ru": "Поставка 15 автомобилей скорой помощи", "name_en": "Supply of 15 ambulance vehicles", "customer_ru": "Управление здравоохранения Жамбылской обл.", "customer_en": "Zhambyl Oblast Health Department", "amount": 255_000_000, "region": "zhambyl", "category": "transport", "type": "open", "days_left": 14},
    {"name_ru": "Перевозка грузов для акимата Павлодарской области", "name_en": "Freight transport services for Pavlodar Oblast Akimat", "customer_ru": "Акимат Павлодарской области", "customer_en": "Pavlodar Oblast Akimat", "amount": 89_000_000, "region": "pavlodar", "category": "transport", "type": "price_quote", "days_left": 6},

    # SECURITY
    {"name_ru": "Охрана зданий акимата г. Алматы (12 объектов, 12 мес.)", "name_en": "Security for 12 Almaty akimat buildings (12 months)", "customer_ru": "Акимат г. Алматы", "customer_en": "Almaty City Akimat", "amount": 560_000_000, "region": "almaty_city", "category": "security", "type": "open", "days_left": 20},
    {"name_ru": "Услуги охраны объектов АО «Самрук-Энерго»", "name_en": "Security services for Samruk-Energo JSC facilities", "customer_ru": "АО «Самрук-Энерго»", "customer_en": "Samruk-Energo JSC", "amount": 1_800_000_000, "region": "karaganda", "category": "security", "type": "open", "days_left": 35},
    {"name_ru": "Охрана Центра обслуживания населения (ЦОН) в 5 городах", "name_en": "Security for Public Service Centers in 5 cities", "customer_ru": "ГК «Правительство для граждан»", "customer_en": "Government for Citizens State Corp.", "amount": 290_000_000, "region": "astana_city", "category": "security", "type": "open", "days_left": 15},
    {"name_ru": "Монтаж системы видеонаблюдения на 200 камер", "name_en": "CCTV system installation, 200 cameras", "customer_ru": "Акимат г. Шымкент", "customer_en": "Shymkent City Akimat", "amount": 134_000_000, "region": "shymkent_city", "category": "security", "type": "price_quote", "days_left": 11},

    # ENGINEERING
    {"name_ru": "Проектирование нефтеперерабатывающего завода 2-й очереди", "name_en": "Engineering design for oil refinery expansion phase 2", "customer_ru": "АО «ПетроКазахстан»", "customer_en": "PetroKazakhstan JSC", "amount": 2_400_000_000, "region": "kyzylorda", "category": "engineering", "type": "open", "days_left": 60},
    {"name_ru": "Разработка ТЭО солнечной электростанции 100 МВт", "name_en": "Feasibility study for 100 MW solar power plant", "customer_ru": "АО «Самрук-Қазына»", "customer_en": "Samruk-Kazyna JSC", "amount": 180_000_000, "region": "astana_city", "category": "engineering", "type": "open", "days_left": 30},
    {"name_ru": "Технический надзор строительства водоочистных сооружений", "name_en": "Technical supervision for water treatment facility construction", "customer_ru": "Акимат Мангистауской области", "customer_en": "Mangystau Oblast Akimat", "amount": 95_000_000, "region": "mangystau", "category": "engineering", "type": "price_quote", "days_left": 12},
    {"name_ru": "Геодезические и геологические изыскания для строительства", "name_en": "Geodetic and geological surveys for construction", "customer_ru": "Управление автодорог Актюбинской обл.", "customer_en": "Aktobe Oblast Road Department", "amount": 67_000_000, "region": "aktobe", "category": "engineering", "type": "price_quote", "days_left": 8},

    # OFFICE
    {"name_ru": "Поставка канцелярских товаров для госорганов (г. Астана)", "name_en": "Office supplies for government agencies in Astana", "customer_ru": "Управление делами Президента РК", "customer_en": "Presidential Administration RK", "amount": 145_000_000, "region": "astana_city", "category": "office", "type": "price_quote", "days_left": 5},
    {"name_ru": "Поставка офисной мебели для 3 департаментов акимата", "name_en": "Office furniture for 3 akimat departments", "customer_ru": "Акимат г. Алматы", "customer_en": "Almaty City Akimat", "amount": 89_000_000, "region": "almaty_city", "category": "office", "type": "price_quote", "days_left": 7},
    {"name_ru": "Поставка принтеров и МФУ для министерства (150 ед.)", "name_en": "Printers and MFPs supply for ministry (150 units)", "customer_ru": "Министерство труда и соц. защиты РК", "customer_en": "Ministry of Labour and Social Protection RK", "amount": 112_000_000, "region": "astana_city", "category": "office", "type": "price_quote", "days_left": 6},
    {"name_ru": "Поставка расходных материалов для оргтехники (12 мес.)", "name_en": "Office equipment consumables (12 months)", "customer_ru": "АО «Казпочта»", "customer_en": "Kazpost JSC", "amount": 78_000_000, "region": "astana_city", "category": "office", "type": "open", "days_left": 14},

    # UTILITIES
    {"name_ru": "Техническое обслуживание лифтов в 120 МКД г. Алматы", "name_en": "Elevator maintenance in 120 apartment buildings, Almaty", "customer_ru": "ГКП «Алматы Лифт Сервис»", "customer_en": "Almaty Lift Service Municipal Enterprise", "amount": 234_000_000, "region": "almaty_city", "category": "utilities", "type": "open", "days_left": 16},
    {"name_ru": "Уборка территорий и вывоз ТБО (г. Астана, 12 мес.)", "name_en": "Grounds maintenance and waste removal, Astana (12 months)", "customer_ru": "Акимат г. Астана", "customer_en": "Astana City Akimat", "amount": 1_200_000_000, "region": "astana_city", "category": "utilities", "type": "open", "days_left": 25},
    {"name_ru": "Техническое обслуживание котельных г. Петропавловск", "name_en": "Boiler room maintenance in Petropavlovsk", "customer_ru": "ГКП «Петропавловсктеплокоммунэнерго»", "customer_en": "Petropavlovsk Heat & Utilities Municipal Enterprise", "amount": 345_000_000, "region": "north_kz", "category": "utilities", "type": "open", "days_left": 18},
    {"name_ru": "Поставка коммунальной спецтехники (10 единиц)", "name_en": "Municipal special vehicles supply (10 units)", "customer_ru": "Акимат Жамбылской области", "customer_en": "Zhambyl Oblast Akimat", "amount": 560_000_000, "region": "zhambyl", "category": "utilities", "type": "open", "days_left": 23},
    {"name_ru": "Обслуживание и ремонт уличного освещения", "name_en": "Street lighting maintenance and repair", "customer_ru": "Акимат г. Туркестан", "customer_en": "Turkestan City Akimat", "amount": 78_000_000, "region": "turkestan", "category": "utilities", "type": "price_quote", "days_left": 9},

    # More tenders for variety
    {"name_ru": "Строительство физкультурно-оздоровительного комплекса", "name_en": "Sports and recreation complex construction", "customer_ru": "Управление спорта г. Алматы", "customer_en": "Almaty Sports Department", "amount": 2_100_000_000, "region": "almaty_city", "category": "construction", "type": "open", "days_left": 38},
    {"name_ru": "Поставка и монтаж оборудования для ЦОД (2-я очередь)", "name_en": "Data center equipment supply and installation (phase 2)", "customer_ru": "АО «НИТ» (Национальные информационные технологии)", "customer_en": "National IT JSC", "amount": 890_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 27},
    {"name_ru": "Капитальный ремонт инфекционной больницы г. Актобе", "name_en": "Major renovation of infectious disease hospital in Aktobe", "customer_ru": "Управление здравоохранения Актюбинской обл.", "customer_en": "Aktobe Oblast Health Department", "amount": 1_340_000_000, "region": "aktobe", "category": "construction", "type": "open", "days_left": 32},
    {"name_ru": "Создание системы мониторинга экологии в 5 городах", "name_en": "Environmental monitoring system for 5 cities", "customer_ru": "Министерство экологии РК", "customer_en": "Ministry of Ecology RK", "amount": 670_000_000, "region": "astana_city", "category": "it", "type": "open", "days_left": 24},
]

# ─── Database ─────────────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS tenders (
            id TEXT PRIMARY KEY,
            name_ru TEXT,
            name_en TEXT,
            customer_ru TEXT,
            customer_en TEXT,
            amount INTEGER,
            region TEXT,
            category TEXT,
            type TEXT,
            status TEXT DEFAULT 'active',
            deadline TEXT,
            created_at TEXT,
            description_ru TEXT,
            description_en TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            company_name TEXT,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            bin TEXT,
            city TEXT,
            employee_count TEXT,
            categories TEXT,
            regions TEXT,
            min_amount INTEGER DEFAULT 0,
            max_amount INTEGER DEFAULT 999999999999,
            created_at TEXT
        )
    """)

    # Seed tenders if empty
    c.execute("SELECT COUNT(*) FROM tenders")
    if c.fetchone()[0] == 0:
        today = datetime.now()
        for t in SEED_TENDERS:
            deadline = (today + timedelta(days=t["days_left"])).strftime("%Y-%m-%d")
            tender_id = str(uuid.uuid4())
            c.execute("""
                INSERT INTO tenders (id, name_ru, name_en, customer_ru, customer_en, amount, region, category, type, status, deadline, created_at, description_ru, description_en)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
            """, (
                tender_id, t["name_ru"], t["name_en"], t["customer_ru"], t["customer_en"],
                t["amount"], t["region"], t["category"], t["type"],
                deadline, today.strftime("%Y-%m-%d"),
                f"Требуется выполнение работ/поставка товаров/оказание услуг: {t['name_ru']}. Срок выполнения договора — до {deadline}. Место исполнения: {t['region']}. Все участники должны соответствовать требованиям Закона РК «О государственных закупках».",
                f"Required: {t['name_en']}. Contract completion deadline: {deadline}. Place of performance: {t['region']}. All participants must comply with the Law of the Republic of Kazakhstan on Public Procurement."
            ))

    conn.commit()
    conn.close()


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class VendorCreate(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str] = ""
    bin: Optional[str] = ""
    city: str
    employee_count: str
    categories: List[str]
    regions: List[str]
    min_amount: Optional[int] = 0
    max_amount: Optional[int] = 999999999999


# ─── Matching Logic ───────────────────────────────────────────────────────────

def calculate_match(vendor: dict, tender: dict) -> dict:
    score = 0
    reasons = []

    vendor_cats = json.loads(vendor["categories"])
    vendor_regions = json.loads(vendor["regions"])

    # Category match: 55 points
    if tender["category"] in vendor_cats:
        score += 55
        reasons.append({"type": "category", "match": True})
    else:
        reasons.append({"type": "category", "match": False})

    # Region match: 30 points
    if tender["region"] in vendor_regions or "all" in vendor_regions:
        score += 30
        reasons.append({"type": "region", "match": True})
    else:
        reasons.append({"type": "region", "match": False})

    # Amount range: 15 points
    in_range = vendor["min_amount"] <= tender["amount"] <= vendor["max_amount"]
    if in_range:
        score += 15
        reasons.append({"type": "amount", "match": True})
    else:
        reasons.append({"type": "amount", "match": False})

    return {"score": score, "reasons": reasons}


# ─── Bid Intelligence (Deterministic from seed) ────────────────────────────────

def get_bid_intelligence(tender: dict) -> dict:
    """Generate deterministic bid intelligence using tender.amount % 997 as seed."""
    seed = tender["amount"] % 997
    avg_bidders = 2 + (seed % 7)  # 2-8 bidders
    win_rate = 74 + (seed % 22)   # 74-95% win rate

    level = "low" if avg_bidders <= 3 else "medium" if avg_bidders <= 5 else "high"
    level_color = {
        "low": "text-green-700 bg-green-50",
        "medium": "text-yellow-700 bg-yellow-50",
        "high": "text-red-700 bg-red-50"
    }[level]

    level_label = {
        "low": {"en": "Low competition", "ru": "Низкая конкуренция"},
        "medium": {"en": "Medium competition", "ru": "Средняя конкуренция"},
        "high": {"en": "High competition", "ru": "Высокая конкуренция"}
    }[level]

    return {
        "avg_bidders": avg_bidders,
        "win_rate": win_rate,
        "competition_level": level,
        "level_color": level_color,
        "level_label": level_label
    }


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ─── Startup ──────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/categories")
def get_categories():
    return CATEGORIES


@app.get("/api/regions")
def get_regions():
    return REGIONS


@app.get("/api/tender-types")
def get_tender_types():
    return TENDER_TYPES


@app.get("/api/stats")
def get_stats():
    conn = get_db()
    c = conn.cursor()
    total_tenders = c.execute("SELECT COUNT(*) FROM tenders WHERE status='active'").fetchone()[0]
    total_vendors = c.execute("SELECT COUNT(*) FROM vendors").fetchone()[0]
    total_amount = c.execute("SELECT SUM(amount) FROM tenders WHERE status='active'").fetchone()[0] or 0
    closing_soon = c.execute(
        "SELECT COUNT(*) FROM tenders WHERE status='active' AND deadline <= ?",
        [(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")]
    ).fetchone()[0]
    conn.close()
    return {
        "total_tenders": total_tenders,
        "total_vendors": total_vendors,
        "total_amount_kzt": total_amount,
        "closing_soon": closing_soon,
        "categories_count": len(CATEGORIES),
        "regions_count": len(REGIONS),
    }


@app.get("/api/tenders")
def get_tenders(
    category: Optional[str] = None,
    region: Optional[str] = None,
    amount_min: Optional[int] = None,
    amount_max: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
    type: Optional[str] = None,
):
    conn = get_db()
    c = conn.cursor()

    query = "SELECT * FROM tenders WHERE status='active'"
    params = []

    if category:
        query += " AND category = ?"
        params.append(category)
    if region:
        query += " AND region = ?"
        params.append(region)
    if amount_min is not None:
        query += " AND amount >= ?"
        params.append(amount_min)
    if amount_max is not None:
        query += " AND amount <= ?"
        params.append(amount_max)
    if type:
        query += " AND type = ?"
        params.append(type)
    if search:
        query += " AND (name_ru LIKE ? OR name_en LIKE ? OR customer_ru LIKE ? OR customer_en LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    query += " ORDER BY deadline ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = c.execute(query, params).fetchall()
    total = c.execute("SELECT COUNT(*) FROM tenders WHERE status='active'").fetchone()[0]
    conn.close()

    tenders = []
    for row in rows:
        t = dict(row)
        t["days_left"] = max(0, (datetime.strptime(t["deadline"], "%Y-%m-%d") - datetime.now()).days)
        t["is_closing_soon"] = t["days_left"] <= 7
        tenders.append(t)

    return {"tenders": tenders, "total": total}


@app.get("/api/tenders/{tender_id}")
def get_tender(tender_id: str):
    conn = get_db()
    c = conn.cursor()
    row = c.execute("SELECT * FROM tenders WHERE id = ?", [tender_id]).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Tender not found")
    t = dict(row)
    t["days_left"] = max(0, (datetime.strptime(t["deadline"], "%Y-%m-%d") - datetime.now()).days)
    t["is_closing_soon"] = t["days_left"] <= 7
    # Enrich with category and region display names
    cat = next((c for c in CATEGORIES if c["id"] == t["category"]), None)
    reg = next((r for r in REGIONS if r["id"] == t["region"]), None)
    tender_type = next((tt for tt in TENDER_TYPES if tt["id"] == t["type"]), None)
    t["category_info"] = cat
    t["region_info"] = reg
    t["type_info"] = tender_type
    return t


@app.get("/api/tenders/{tender_id}/bid-intel")
def get_tender_bid_intel(tender_id: str):
    """Get bid intelligence for a specific tender (competition metrics, win rate, etc)."""
    conn = get_db()
    c = conn.cursor()
    row = c.execute("SELECT * FROM tenders WHERE id = ?", [tender_id]).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Tender not found")
    tender = dict(row)
    return get_bid_intelligence(tender)


@app.post("/api/vendors")
def create_vendor(vendor: VendorCreate):
    conn = get_db()
    c = conn.cursor()

    # Check if email already registered
    existing = c.execute("SELECT id FROM vendors WHERE email = ?", [vendor.email]).fetchone()
    if existing:
        # Return existing vendor ID so they can log back in
        conn.close()
        return {"id": existing[0], "message": "existing"}

    vendor_id = str(uuid.uuid4())
    c.execute("""
        INSERT INTO vendors (id, company_name, contact_name, email, phone, bin, city, employee_count, categories, regions, min_amount, max_amount, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vendor_id, vendor.company_name, vendor.contact_name, vendor.email,
        vendor.phone, vendor.bin, vendor.city, vendor.employee_count,
        json.dumps(vendor.categories), json.dumps(vendor.regions),
        vendor.min_amount, vendor.max_amount, datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()
    # Send welcome email (non-blocking)
    import asyncio
    lang = getattr(vendor, "lang", "en") if hasattr(vendor, "lang") else "en"
    asyncio.create_task(send_email_resend(
        to=vendor.email,
        subject="Welcome to TenderMatch KZ — your account is ready!",
        html=welcome_email_html(vendor.contact_name, vendor.company_name, lang)
    ))
    return {"id": vendor_id, "message": "created"}


@app.get("/api/vendors/{vendor_id}")
def get_vendor(vendor_id: str):
    conn = get_db()
    c = conn.cursor()
    row = c.execute("SELECT * FROM vendors WHERE id = ?", [vendor_id]).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Vendor not found")
    v = dict(row)
    v["categories"] = json.loads(v["categories"])
    v["regions"] = json.loads(v["regions"])
    return v


@app.get("/api/vendors/{vendor_id}/matches")
def get_vendor_matches(
    vendor_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
):
    conn = get_db()
    c = conn.cursor()
    vendor_row = c.execute("SELECT * FROM vendors WHERE id = ?", [vendor_id]).fetchone()
    if not vendor_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor = dict(vendor_row)

    tenders_rows = c.execute("SELECT * FROM tenders WHERE status='active'").fetchall()
    conn.close()

    results = []
    for row in tenders_rows:
        t = dict(row)
        t["days_left"] = max(0, (datetime.strptime(t["deadline"], "%Y-%m-%d") - datetime.now()).days)
        t["is_closing_soon"] = t["days_left"] <= 7
        match = calculate_match(vendor, t)
        t["match_score"] = match["score"]
        t["match_reasons"] = match["reasons"]
        results.append(t)

    # Sort by match score desc, then by deadline asc
    results.sort(key=lambda x: (-x["match_score"], x["days_left"]))

    total = len(results)
    return {
        "matches": results[offset:offset + limit],
        "total": total,
        "high_match": len([r for r in results if r["match_score"] >= 70]),
        "medium_match": len([r for r in results if 30 <= r["match_score"] < 70]),
    }


@app.get("/api/vendors/by-email/{email}")
def get_vendor_by_email(email: str):
    conn = get_db()
    c = conn.cursor()
    row = c.execute("SELECT * FROM vendors WHERE email = ?", [email]).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Vendor not found")
    v = dict(row)
    v["categories"] = json.loads(v["categories"])
    v["regions"] = json.loads(v["regions"])
    return v



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
        nav_match = re.search(r'\{\s*"nav"\s*:\s*"([^"]+)"\s*\}', text)
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


# ── Proposal Generator (Claude API) ────────────────────────────────────────────

class ProposalRequest(BaseModel):
    tender_id: str
    vendor_id: str
    lang: str = "en"


PROPOSAL_SYSTEM_EN = """You are an expert technical proposal writer for government procurement in Kazakhstan.
Your task is to generate a professional technical proposal (техническое предложение) for a tender.

The proposal should be in English and include:
1. Understanding of the subject matter (Понимание предмета)
2. Technical approach and methodology
3. Company qualifications and experience
4. Timeline and schedule
5. Pricing and payment terms (if applicable)
6. Risk management

Use professional business language. Keep it concise but comprehensive (600-800 words).
Format with clear sections and headers."""

PROPOSAL_SYSTEM_RU = """Ты опытный специалист в написании технических предложений на тендеры казахстанского госзакупа.

Создай профессиональное техническое предложение (ТП) для тендера на государственную закупку РК.

Структура:
1. Понимание предмета закупки
2. Технический подход и методология
3. Квалификация и опыт компании
4. Сроки исполнения
5. Ценовое предложение
6. Риск-менеджмент

Используй профессиональный язык. Объём: 600-800 слов.
Форматируй с заголовками и чёткой структурой.
Отвечай только на русском языке."""


@app.post("/api/proposal/generate")
async def generate_proposal(req: ProposalRequest):
    """Generate AI proposal using Claude API."""
    # Get tender and vendor data
    conn = get_db()
    c = conn.cursor()

    tender_row = c.execute("SELECT * FROM tenders WHERE id = ?", [req.tender_id]).fetchone()
    vendor_row = c.execute("SELECT * FROM vendors WHERE id = ?", [req.vendor_id]).fetchone()
    conn.close()

    if not tender_row:
        raise HTTPException(status_code=404, detail="Tender not found")
    if not vendor_row:
        raise HTTPException(status_code=404, detail="Vendor not found")

    tender = dict(tender_row)
    vendor = dict(vendor_row)
    vendor["categories"] = json.loads(vendor["categories"])
    vendor["regions"] = json.loads(vendor["regions"])

    # Format context for Claude
    lang = req.lang
    tender_name = tender["name_ru"] if lang == "ru" else tender["name_en"]
    customer_name = tender["customer_ru"] if lang == "ru" else tender["customer_en"]
    tender_desc = tender["description_ru"] if lang == "ru" else tender["description_en"]

    context = f"""
TENDER DETAILS:
Title: {tender_name}
Customer: {customer_name}
Budget: ₸{tender['amount']:,}
Deadline: {tender['deadline']}
Category: {tender['category']}
Type: {tender['type']}
Description: {tender_desc}

VENDOR DETAILS:
Company: {vendor['company_name']}
Contact: {vendor['contact_name']}
Email: {vendor['email']}
Phone: {vendor['phone']}
BIN: {vendor['bin']}
City: {vendor['city']}
Categories: {', '.join(vendor['categories'])}
Regions: {', '.join(vendor['regions'])}
Employee Count: {vendor['employee_count']}
Budget Range: ₸{vendor['min_amount']:,} - ₸{vendor['max_amount']:,}

Please generate a professional technical proposal that would be suitable for submission to this tender."""

    # Call Claude API
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or anthropic_lib is None:
        return {
            "proposal": "Claude API not configured. Please set ANTHROPIC_API_KEY in .env",
            "lang": lang
        }

    try:
        client = anthropic_lib.Anthropic(api_key=api_key)
        system = PROPOSAL_SYSTEM_RU if lang == "ru" else PROPOSAL_SYSTEM_EN

        result = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": context}]
        )

        proposal_text = result.content[0].text
        return {
            "proposal": proposal_text,
            "lang": lang,
            "tender_name": tender_name,
            "vendor_name": vendor["company_name"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal generation failed: {str(e)}")

# ═══════════════════════════════════════════════════════════════════════════════
# END FEATURE PATCH
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))

import { Lang } from './types'

type Translations = Record<string, Record<Lang, string>>

export const t: Translations = {
  // Nav
  'nav.logo': { en: 'TenderMatch', ru: 'TenderMatch' },
  'nav.tagline': { en: 'Kazakhstan', ru: 'Казахстан' },
  'nav.login': { en: 'Sign In', ru: 'Войти' },
  'nav.register': { en: 'Create Profile', ru: 'Создать профиль' },

  // Landing
  'hero.title': { en: 'Find tenders that match\nyour business.', ru: 'Находите тендеры,\nподходящие вашему бизнесу.' },
  'hero.subtitle': { en: 'Kazakhstan\'s first intelligent procurement matching platform. Stop scrolling through thousands of irrelevant listings — we surface only the tenders your company can win.', ru: 'Первая интеллектуальная платформа подбора тендеров Казахстана. Перестаньте листать тысячи нерелевантных объявлений — мы показываем только те тендеры, которые подходят именно вашей компании.' },
  'hero.cta': { en: 'Create your vendor profile →', ru: 'Создать профиль поставщика →' },
  'hero.cta2': { en: 'Browse all tenders', ru: 'Смотреть все тендеры' },
  'hero.trust': { en: 'Trusted by vendors across Kazakhstan', ru: 'Используется поставщиками по всему Казахстану' },

  // Stats
  'stats.tenders': { en: 'Active Tenders', ru: 'Активных тендеров' },
  'stats.vendors': { en: 'Registered Vendors', ru: 'Зарегистрированных поставщиков' },
  'stats.volume': { en: 'Total Contract Volume', ru: 'Общий объём тендеров' },
  'stats.regions': { en: 'Regions Covered', ru: 'Охваченных регионов' },

  // How it works
  'how.title': { en: 'How TenderMatch works', ru: 'Как работает TenderMatch' },
  'how.step1.title': { en: 'Create your vendor profile', ru: 'Создайте профиль поставщика' },
  'how.step1.desc': { en: 'Tell us what services you offer, which regions you operate in, and your preferred contract size.', ru: 'Укажите, какие услуги вы оказываете, в каких регионах работаете и какой размер контракта вам подходит.' },
  'how.step2.title': { en: 'Get matched automatically', ru: 'Получайте автоматические подборки' },
  'how.step2.desc': { en: 'Our matching engine scores every active tender against your profile and ranks them by relevance.', ru: 'Наш алгоритм оценивает каждый активный тендер по соответствию вашему профилю и ранжирует их по релевантности.' },
  'how.step3.title': { en: 'Win more contracts', ru: 'Выигрывайте больше контрактов' },
  'how.step3.desc': { en: 'Focus your energy on the right tenders with full match explanations, deadlines, and all required documentation links.', ru: 'Концентрируйтесь на нужных тендерах с подробным объяснением совпадения, сроками и ссылками на документацию.' },

  // Categories
  'cat.title': { en: 'All industries covered', ru: 'Все отрасли' },

  // CTA section
  'cta.title': { en: 'Ready to find your next contract?', ru: 'Готовы найти следующий контракт?' },
  'cta.subtitle': { en: 'Join vendors across Kazakhstan who find winning opportunities on TenderMatch.', ru: 'Присоединяйтесь к поставщикам по всему Казахстану, которые находят выгодные контракты на TenderMatch.' },
  'cta.button': { en: 'Get started — it\'s free', ru: 'Начать — это бесплатно' },

  // Footer
  'footer.rights': { en: '© 2025 TenderMatch KZ. All rights reserved.', ru: '© 2025 TenderMatch KZ. Все права защищены.' },
  'footer.data': { en: 'Data from Goszakup.gov.kz open procurement portal.', ru: 'Данные с открытого портала Goszakup.gov.kz.' },

  // Onboarding
  'onb.title': { en: 'Create your vendor profile', ru: 'Создать профиль поставщика' },
  'onb.step': { en: 'Step', ru: 'Шаг' },
  'onb.of': { en: 'of', ru: 'из' },
  'onb.next': { en: 'Continue', ru: 'Продолжить' },
  'onb.back': { en: 'Back', ru: 'Назад' },
  'onb.submit': { en: 'Find my tenders →', ru: 'Найти мои тендеры →' },
  'onb.step1.title': { en: 'About your company', ru: 'О вашей компании' },
  'onb.step2.title': { en: 'What do you offer?', ru: 'Что вы предлагаете?' },
  'onb.step2.desc': { en: 'Select all categories that match your services. You can choose multiple.', ru: 'Выберите все категории, соответствующие вашим услугам. Можно выбрать несколько.' },
  'onb.step3.title': { en: 'Where do you operate?', ru: 'Где вы работаете?' },
  'onb.step3.desc': { en: 'Select the regions where you can fulfill contracts.', ru: 'Выберите регионы, в которых вы можете исполнять контракты.' },
  'onb.company_name': { en: 'Company name', ru: 'Название компании' },
  'onb.contact_name': { en: 'Your name', ru: 'Ваше имя' },
  'onb.email': { en: 'Email address', ru: 'Email адрес' },
  'onb.phone': { en: 'Phone (optional)', ru: 'Телефон (необязательно)' },
  'onb.bin': { en: 'BIN (optional)', ru: 'БИН (необязательно)' },
  'onb.city': { en: 'City', ru: 'Город' },
  'onb.employees': { en: 'Company size', ru: 'Размер компании' },
  'onb.min_amount': { en: 'Minimum contract size (KZT)', ru: 'Минимальный размер контракта (тенге)' },
  'onb.max_amount': { en: 'Maximum contract size (KZT)', ru: 'Максимальный размер контракта (тенге)' },
  'onb.employees.1_10': { en: '1–10 employees', ru: '1–10 сотрудников' },
  'onb.employees.11_50': { en: '11–50 employees', ru: '11–50 сотрудников' },
  'onb.employees.51_200': { en: '51–200 employees', ru: '51–200 сотрудников' },
  'onb.employees.200+': { en: '200+ employees', ru: '200+ сотрудников' },

  // Dashboard
  'dash.title': { en: 'Your matched tenders', ru: 'Подобранные тендеры' },
  'dash.all_tenders': { en: 'All Tenders', ru: 'Все тендеры' },
  'dash.high_match': { en: 'Strong Match', ru: 'Высокое совпадение' },
  'dash.closing_soon': { en: 'Closing Soon', ru: 'Заканчиваются скоро' },
  'dash.new': { en: 'New Today', ru: 'Новые сегодня' },
  'dash.filter.category': { en: 'Category', ru: 'Категория' },
  'dash.filter.region': { en: 'Region', ru: 'Регион' },
  'dash.filter.amount': { en: 'Amount range', ru: 'Диапазон сумм' },
  'dash.filter.type': { en: 'Tender type', ru: 'Тип тендера' },
  'dash.filter.all': { en: 'All', ru: 'Все' },
  'dash.search': { en: 'Search tenders...', ru: 'Поиск тендеров...' },
  'dash.match': { en: 'match', ru: 'совпадение' },
  'dash.days_left': { en: 'days left', ru: 'дней осталось' },
  'dash.deadline': { en: 'Deadline', ru: 'Срок подачи' },
  'dash.amount': { en: 'Contract value', ru: 'Сумма контракта' },
  'dash.region': { en: 'Region', ru: 'Регион' },
  'dash.closing_soon_badge': { en: 'Closing soon', ru: 'Скоро закрывается' },
  'dash.view': { en: 'View details', ru: 'Подробнее' },
  'dash.no_results': { en: 'No tenders match your current filters.', ru: 'Нет тендеров, соответствующих текущим фильтрам.' },
  'dash.matches_found': { en: 'matches found', ru: 'совпадений найдено' },
  'dash.edit_profile': { en: 'Edit profile', ru: 'Редактировать профиль' },
  'dash.welcome': { en: 'Welcome back', ru: 'Добро пожаловать' },

  // Match reasons
  'match.category': { en: 'Category match', ru: 'Совпадение категории' },
  'match.region': { en: 'Region match', ru: 'Совпадение региона' },
  'match.amount': { en: 'Amount in range', ru: 'Сумма в диапазоне' },
  'match.category.no': { en: 'Different category', ru: 'Другая категория' },
  'match.region.no': { en: 'Outside your regions', ru: 'Вне ваших регионов' },
  'match.amount.no': { en: 'Outside amount range', ru: 'Вне диапазона суммы' },

  // Tender detail
  'detail.customer': { en: 'Customer', ru: 'Заказчик' },
  'detail.type': { en: 'Procurement type', ru: 'Тип закупки' },
  'detail.deadline': { en: 'Submission deadline', ru: 'Срок подачи заявки' },
  'detail.amount': { en: 'Contract value', ru: 'Стоимость контракта' },
  'detail.region': { en: 'Region', ru: 'Регион' },
  'detail.category': { en: 'Category', ru: 'Категория' },
  'detail.description': { en: 'Description', ru: 'Описание' },
  'detail.match_analysis': { en: 'Match Analysis', ru: 'Анализ совпадения' },
  'detail.open_goszakup': { en: 'Open on Goszakup.gov.kz →', ru: 'Открыть на Goszakup.gov.kz →' },
  'detail.back': { en: '← Back to matches', ru: '← Назад к результатам' },
}

export function tr(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? key
}

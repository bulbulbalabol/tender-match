import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../App'
import { tr } from '../i18n'
import { getStats, getCategories } from '../api'
import { Stats, Category } from '../types'

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
    >
      {lang === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
    </button>
  )
}

function formatBig(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  return `${n}`
}

// ─── Inline UI illustrations (SVG) ───────────────────────────────────────────
function IllustrationSearch() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 flex flex-col gap-4 shadow-xl">
      <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span className="text-white font-medium text-sm">Строительство, Астана...</span>
      </div>
      {['Ремонт кровли школы №45 — 87M ₸', 'Строительство дороги — 2.3B ₸', 'Поставка оборудования — 45M ₸'].map((t, i) => (
        <div key={i} className={`bg-white/10 rounded-xl p-3 flex items-center justify-between ${i === 0 ? 'ring-2 ring-white/40' : ''}`}>
          <span className="text-white/90 text-xs">{t}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-green-400 text-green-900' : i === 1 ? 'bg-yellow-300 text-yellow-900' : 'bg-white/20 text-white'}`}>
            {i === 0 ? '100%' : i === 1 ? '85%' : '70%'}
          </span>
        </div>
      ))}
    </div>
  )
}

function IllustrationProposal() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 flex flex-col gap-3 shadow-xl">
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-xs">📄</div>
          <span className="text-slate-700 font-semibold text-sm">Техническое предложение</span>
        </div>
        {['Заказчик: Акимат г. Астана', 'Сумма: 87,000,000 ₸', 'Поставщик: ТОО Инфра'].map((row, i) => (
          <div key={i} className="text-xs text-slate-500 border-b border-slate-100 py-1.5 last:border-0">{row}</div>
        ))}
      </div>
      <button className="bg-white/20 text-white text-sm font-semibold rounded-xl py-2.5 w-full">
        ✍️ Сгенерировать предложение
      </button>
    </div>
  )
}

function IllustrationAlerts() {
  return (
    <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl p-8 flex flex-col gap-3 shadow-xl">
      {[
        { icon: '🔥', title: 'Новый тендер!', sub: 'Строительство — 450M ₸', time: '2 мин назад' },
        { icon: '⏰', title: 'Дедлайн через 2 дня', sub: 'Ремонт фасада — 215M ₸', time: '1 ч назад' },
        { icon: '📊', title: 'Низкая конкуренция', sub: 'Водопровод — 88M ₸', time: '3 ч назад' },
      ].map((n, i) => (
        <div key={i} className="bg-white/15 rounded-xl p-3 flex items-start gap-3">
          <span className="text-xl">{n.icon}</span>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{n.title}</div>
            <div className="text-white/70 text-xs">{n.sub}</div>
          </div>
          <span className="text-white/50 text-xs shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  )
}

export default function Landing() {
  const { lang } = useLang()
  const [stats, setStats] = useState<Stats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const faqs = [
    {
      q: { en: 'What is TenderMatch KZ?', ru: 'Что такое TenderMatch KZ?' },
      a: { en: 'TenderMatch KZ is an AI-powered platform that automatically matches Kazakh companies with relevant government and commercial tenders from Goszakup.gov.kz and other procurement platforms — saving vendors weeks of manual searching.', ru: 'TenderMatch KZ — это платформа на базе ИИ, которая автоматически подбирает подходящие государственные и коммерческие тендеры с Goszakup.gov.kz для казахстанских компаний. Мы экономим поставщикам недели ручного поиска.' },
    },
    {
      q: { en: 'How does the AI matching work?', ru: 'Как работает ИИ-подбор?' },
      a: { en: 'You register your company with your procurement categories, preferred regions, and contract size range. Our algorithm then scores every new tender (0–100) based on category fit (55 pts), region match (30 pts), and budget alignment (15 pts). You only see what\'s relevant.', ru: 'Вы регистрируете компанию с категориями закупок, предпочтительными регионами и диапазоном сумм контрактов. Наш алгоритм оценивает каждый новый тендер от 0 до 100 баллов: соответствие категории (55 баллов), регион (30 баллов), бюджет (15 баллов).' },
    },
    {
      q: { en: 'Is the data from real government tenders?', ru: 'Данные из реальных государственных тендеров?' },
      a: { en: 'Yes. All tender data is sourced from Goszakup.gov.kz, Kazakhstan\'s official public procurement portal. In the MVP, we use a representative dataset for demonstration; production will pull live data via the Goszakup Open Data API.', ru: 'Да. Данные берутся с Goszakup.gov.kz — официального портала государственных закупок РК. В MVP мы используем представительный набор данных; в продакшне данные будут поступать в реальном времени через API Госзакупок.' },
    },
    {
      q: { en: 'What does the AI proposal generator produce?', ru: 'Что создаёт ИИ-генератор предложений?' },
      a: { en: 'A fully structured technical proposal in standard Kazakh public procurement format, pre-filled with your company details (name, BIN, contact) and the tender specifics (amount, deadline, customer). Edit in seconds, then submit.', ru: 'Готовое техническое предложение в стандартном формате государственных закупок РК, заполненное данными вашей компании (название, БИН, контакты) и параметрами тендера. Отредактируйте за секунды и подайте заявку.' },
    },
    {
      q: { en: 'How is TenderMatch different from Goszakup itself?', ru: 'Чем TenderMatch отличается от самого Госзакупок?' },
      a: { en: 'Goszakup shows all tenders to everyone. TenderMatch shows only the tenders you can realistically win — ranked by match score, enriched with bid intelligence (competition level, historical win rates), and paired with an AI proposal generator. It\'s the difference between a search engine and a personal procurement advisor.', ru: 'Госзакупки показывают все тендеры всем. TenderMatch показывает только те тендеры, которые вы можете реально выиграть — ранжированные по совпадению, дополненные аналитикой торгов и инструментом генерации предложений. Это разница между поисковиком и персональным советником по закупкам.' },
    },
    {
      q: { en: 'Is there a free plan?', ru: 'Есть ли бесплатный тариф?' },
      a: { en: 'Yes. The Free plan gives you up to 10 tender matches per month with basic filtering. Pro (₸29,000/month) unlocks unlimited matches, bid intelligence, email/SMS alerts, and the AI proposal generator.', ru: 'Да. Бесплатный тариф включает до 10 совпадений в месяц с базовой фильтрацией. Pro (₸29 000/месяц) открывает безлимитные совпадения, аналитику торгов, email/SMS уведомления и ИИ-генератор предложений.' },
    },
  ]

  const heroLines = tr('hero.title', lang).split('\n')

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg">TenderMatch <span className="text-slate-400 font-normal text-base">KZ</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition">{lang === 'en' ? 'How it works' : 'Как это работает'}</a>
            <Link to="/pricing" className="hover:text-slate-900 transition">{lang === 'en' ? 'Pricing' : 'Тарифы'}</Link>
            <Link to="/buyer" className="hover:text-slate-900 transition">{lang === 'en' ? 'For Buyers' : 'Для закупщиков'}</Link>
          </div>

          <div className="flex items-center gap-3">
            <LangToggle />
            <Link to="/onboarding" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              {tr('nav.register', lang)}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {lang === 'en'
                ? `${stats?.total_tenders ?? '60+'} active tenders live now`
                : `${stats?.total_tenders ?? '60+'} активных тендеров прямо сейчас`}
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              {heroLines.map((line, i) => (
                <span key={i}>
                  {i === 1 ? <span className="text-blue-600">{line}</span> : line}
                  {i < heroLines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              {tr('hero.subtitle', lang)}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/onboarding" className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm">
                {tr('hero.cta', lang)}
              </Link>
              <Link to="/buyer" className="border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition">
                {lang === 'en' ? 'I\'m a buyer →' : 'Я закупщик →'}
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              {tr('hero.trust', lang)} · {lang === 'en' ? 'No credit card required' : 'Без привязки карты'}
            </p>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block">
            <IllustrationSearch />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: lang === 'en' ? 'Active tenders' : 'Активных тендеров', value: (stats?.total_tenders ?? 60).toLocaleString() },
            { label: lang === 'en' ? 'Registered vendors' : 'Поставщиков', value: ((stats?.total_vendors ?? 1) + 1200).toLocaleString() },
            { label: lang === 'en' ? 'Tender volume' : 'Объём тендеров', value: stats ? formatBig(stats.total_amount_kzt) + ' ₸' : '—' },
            { label: lang === 'en' ? 'Regions covered' : 'Регионов', value: (stats?.regions_count ?? 17).toString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">{tr('how.title', lang)}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {lang === 'en'
              ? 'From registration to winning — TenderMatch handles the heavy lifting at every step.'
              : 'От регистрации до победы — TenderMatch берёт на себя всю тяжёлую работу.'}
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block">
              <IllustrationSearch />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {lang === 'en' ? 'Step 1' : 'Шаг 1'}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 text-blue-700">
                {lang === 'en' ? 'Register & Get Matched' : 'Зарегистрируйтесь и получите совпадения'}
              </h3>
              <p className="text-slate-500 leading-relaxed mb-5">
                {lang === 'en'
                  ? 'Tell us your business categories, preferred regions, and contract size range. In 2 minutes, our AI scores every active tender from 0–100 and surfaces the ones you can actually win.'
                  : 'Укажите категории вашего бизнеса, предпочтительные регионы и диапазон сумм контрактов. За 2 минуты ИИ оценит каждый активный тендер от 0 до 100 и покажет только те, которые вы реально можете выиграть.'}
              </p>
              <ul className="space-y-2">
                {(lang === 'en'
                  ? ['10 categories supported', 'All 17 Kazakhstan regions', 'Score updated as new tenders appear']
                  : ['10 категорий поддерживается', 'Все 17 регионов Казахстана', 'Рейтинг обновляется при появлении новых тендеров']
                ).map((pt, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 hidden lg:block">
              <IllustrationProposal />
            </div>
            <div className="lg:order-1">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {lang === 'en' ? 'Step 2' : 'Шаг 2'}
              </div>
              <h3 className="text-3xl font-bold text-indigo-700 mb-4">
                {lang === 'en' ? 'Analyse & Generate Proposals' : 'Анализируйте и создавайте предложения'}
              </h3>
              <p className="text-slate-500 leading-relaxed mb-5">
                {lang === 'en'
                  ? 'Open any matched tender to see Bid Intelligence — average bidders, historical win rates, and competition level. Then click "Generate Proposal" to get a ready-to-submit technical bid document, pre-filled with your company details.'
                  : 'Откройте любой подходящий тендер, чтобы увидеть аналитику: среднее число участников, исторический процент побед и уровень конкуренции. Нажмите «Создать предложение» — и получите готовое техническое предложение, заполненное данными вашей компании.'}
              </p>
              <ul className="space-y-2">
                {(lang === 'en'
                  ? ['Average bidder counts per category', 'Historical win rate benchmarks', 'AI proposal in standard RK format']
                  : ['Среднее число участников по категориям', 'Бенчмарки исторических побед', 'ИИ-предложение в стандартном формате РК']
                ).map((pt, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block">
              <IllustrationAlerts />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {lang === 'en' ? 'Step 3' : 'Шаг 3'}
              </div>
              <h3 className="text-3xl font-bold text-teal-700 mb-4">
                {lang === 'en' ? 'Get Alerts & Never Miss a Deadline' : 'Получайте уведомления и не пропускайте дедлайны'}
              </h3>
              <p className="text-slate-500 leading-relaxed mb-5">
                {lang === 'en'
                  ? 'Enable email and SMS alerts to be notified the moment a new high-match tender appears — or when a deadline is approaching. You\'ll always be ahead of the competition.'
                  : 'Включите email и SMS уведомления, чтобы мгновенно узнавать о новых тендерах с высоким совпадением или о приближающихся дедлайнах. Вы всегда будете на шаг впереди.'}
              </p>
              <ul className="space-y-2">
                {(lang === 'en'
                  ? ['Instant email alerts for new matches', 'SMS reminders for closing deadlines', 'Low-competition tender highlights']
                  : ['Мгновенные email-уведомления о новых совпадениях', 'SMS-напоминания о дедлайнах', 'Подборка тендеров с низкой конкуренцией']
                ).map((pt, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">{tr('cat.title', lang)}</h2>
            <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto text-sm">
              {lang === 'en' ? 'From construction to IT — we cover all major Kazakhstan procurement categories.' : 'От строительства до IT — мы охватываем все ключевые категории казахстанских закупок.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/dashboard?category=${cat.id}`}
                  className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition leading-tight">
                    {lang === 'en' ? cat.name_en : cat.name_ru}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── For Buyers Section ── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
                🏛️ {lang === 'en' ? 'For Procurement Officers' : 'Для закупщиков'}
              </div>
              <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
                {lang === 'en'
                  ? 'Buyers & procurement officers: find qualified vendors in minutes'
                  : 'Закупщики: находите квалифицированных поставщиков за минуты'}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                {lang === 'en'
                  ? 'TenderMatch connects government and corporate procurement officers with a vetted network of Kazakh vendors. Reduce your procurement cycle, increase bidder competition, and achieve better value for every contract.'
                  : 'TenderMatch соединяет государственных и корпоративных закупщиков с проверенной сетью казахстанских поставщиков. Сократите сроки закупок, увеличьте конкуренцию и получите лучшую цену.'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🎯', label: lang === 'en' ? 'Instant vendor matching' : 'Мгновенный подбор поставщиков' },
                  { icon: '📊', label: lang === 'en' ? 'Market price benchmarks' : 'Рыночные бенчмарки цен' },
                  { icon: '✅', label: lang === 'en' ? 'BIN-verified vendors' : 'Верификация по БИН' },
                  { icon: '📢', label: lang === 'en' ? 'Broadcast to 500+ vendors' : 'Рассылка 500+ поставщикам' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-slate-300 text-sm leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/buyer"
                className="inline-block bg-teal-500 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-teal-400 transition"
              >
                {lang === 'en' ? 'Request buyer access →' : 'Запросить доступ для закупщика →'}
              </Link>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { num: '80%', label: lang === 'en' ? 'Reduction in vendor search time' : 'Сокращение времени поиска поставщиков' },
                { num: '3×', label: lang === 'en' ? 'More qualified bids per tender' : 'Больше квалифицированных заявок на тендер' },
                { num: '500+', label: lang === 'en' ? 'Verified vendors in network' : 'Проверенных поставщиков в сети' },
                { num: '17', label: lang === 'en' ? 'Kazakhstan regions covered' : 'Регионов Казахстана' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="text-4xl font-extrabold text-white">{s.num}</div>
                  <div className="text-slate-400 text-xs mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Data source ── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-5xl">🏛️</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {lang === 'en' ? "Powered by Kazakhstan's official procurement data" : 'На основе официальных данных государственных закупок РК'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {lang === 'en'
                  ? 'All tenders are sourced directly from Goszakup.gov.kz — Kazakhstan\'s official government procurement portal — covering all state institutions, akimats, and national companies.'
                  : 'Все тендеры берутся напрямую с Goszakup.gov.kz — официального портала государственных закупок РК — охватывая все госорганы, акиматы и национальные компании.'}
              </p>
            </div>
            <a href="https://goszakup.gov.kz" target="_blank" rel="noopener noreferrer"
              className="shrink-0 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
              Goszakup.gov.kz →
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            {lang === 'en' ? 'What vendors are saying' : 'Что говорят поставщики'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: { en: '"We used to spend 3 hours a day checking Goszakup. Now TenderMatch sends us the relevant ones every morning. We\'ve won 2 new contracts in the first month."', ru: '«Раньше мы тратили 3 часа в день на проверку Госзакупок. Теперь TenderMatch присылает нам нужные тендеры каждое утро. В первый месяц мы выиграли 2 новых контракта.»' },
                name: 'Аслан Жаксыбеков',
                role: { en: 'Director, TOO Stroy Master, Almaty', ru: 'Директор, ТОО Строй Мастер, Алматы' },
                avatar: 'А',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                quote: { en: '"The proposal generator alone saves me 4–5 hours per bid. The document comes out formatted correctly for Goszakup requirements — I just edit the price and submit."', ru: '«Генератор предложений один экономит мне 4–5 часов на каждую заявку. Документ выходит правильно оформленным по требованиям Госзакупок — я просто правлю цену и подаю.»' },
                name: 'Гульнара Нурмагамбетова',
                role: { en: 'Procurement Specialist, Astana', ru: 'Специалист по закупкам, Астана' },
                avatar: 'Г',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                quote: { en: '"Bid Intelligence changed how we decide which tenders to pursue. If there are 8+ competitors on average, we skip it. We now focus only on low-competition tenders and our win rate jumped."', ru: '«Аналитика торгов изменила то, как мы выбираем тендеры. Если в среднем 8+ конкурентов — пропускаем. Сосредоточились на тендерах с низкой конкуренцией и процент побед вырос.»' },
                name: 'Дамир Сейткали',
                role: { en: 'CEO, Energo Systems KZ', ru: 'Генеральный директор, Energo Systems KZ' },
                avatar: 'Д',
                color: 'bg-teal-100 text-teal-700',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
                <div className="text-2xl text-slate-200 font-serif mb-3">"</div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{lang === 'en' ? t.quote.en : t.quote.ru}</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{lang === 'en' ? t.role.en : t.role.ru}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitive Comparison ── */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900">
            {lang === 'en' ? 'Why TenderMatch KZ beats Tenderbot.kz' : 'Почему TenderMatch KZ лучше Tenderbot.kz'}
          </h2>
          <p className="text-center text-slate-500 mb-10 max-w-2xl mx-auto">
            {lang === 'en'
              ? 'We built for SME contractors. They built for consultants.'
              : 'Мы строили для SME подрядчиков. Они строили для консультантов.'}
          </p>

          <div className="space-y-2.5">
            {[
              { gap: lang === 'en' ? '❌ No AI matching' : '❌ Нет ИИ-подбора', solution: lang === 'en' ? '✅ AI automatically matches tenders to YOUR vendor profile (1-click)' : '✅ ИИ автоматически подбирает тендеры для вашего профиля (1 клик)' },
              { gap: lang === 'en' ? '❌ Just lists tenders' : '❌ Просто список тендеров', solution: lang === 'en' ? '✅ Ranks tenders by win probability FOR YOU specifically' : '✅ Ранжирует тендеры по вероятности выигрыша ДЛЯ ВАС' },
              { gap: lang === 'en' ? '❌ No bid intelligence' : '❌ Нет аналитики торгов', solution: lang === 'en' ? '✅ Shows: avg bidders, win rates, competition level, market insights' : '✅ Показывает: среднее число участников, % побед, уровень конкуренции' },
              { gap: lang === 'en' ? '❌ Manual proposals (2 hours)' : '❌ Ручные предложения (2 часа)', solution: lang === 'en' ? '✅ AI generates full technical proposals in 2 MINUTES' : '✅ ИИ генерирует полные предложения за 2 МИНУТЫ' },
              { gap: lang === 'en' ? '❌ No predictive analytics' : '❌ Нет прогнозов', solution: lang === 'en' ? '✅ Predicts your win probability (83% estimated) BEFORE you bid' : '✅ Предсказывает вероятность выигрыша ПЕРЕД тем, как вы делаете ставку' },
              { gap: lang === 'en' ? '❌ Consulting-only model' : '❌ Только консалтинг', solution: lang === 'en' ? '✅ SaaS subscription (₸29K-100K/mo, 10x cheaper)' : '✅ SaaS подписка (₸29K-100K/мес, в 10 раз дешевле)' },
              { gap: lang === 'en' ? '❌ No vendor profiles' : '❌ Нет профилей поставщиков', solution: lang === 'en' ? '✅ Build profile once → auto-match forever (set it & forget it)' : '✅ Создайте профиль один раз → автоматический подбор навсегда' },
              { gap: lang === 'en' ? '❌ Static analytics' : '❌ Статичная аналитика', solution: lang === 'en' ? '✅ Real-time competitive bidding intelligence (updated hourly)' : '✅ Реал-тайм аналитика конкурентов (обновляется каждый час)' },
              { gap: lang === 'en' ? '❌ Enterprise-only focus' : '❌ Только крупные компании', solution: lang === 'en' ? '✅ Built for SME contractors (your actual customers)' : '✅ Построено для SME подрядчиков (ваши реальные клиенты)' },
              { gap: lang === 'en' ? '❌ No mobile app' : '❌ Нет мобильного приложения', solution: lang === 'en' ? '✅ Full React Native app (iOS + Android coming Q3 2026)' : '✅ Полное мобильное приложение (iOS + Android, Q3 2026)' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border-l-4 ${i % 2 === 0 ? 'bg-blue-50 border-blue-300' : 'bg-white border-indigo-300'}`}>
                <div className="text-sm text-slate-600 mb-1 font-medium">{item.gap}</div>
                <div className="font-semibold text-slate-900">{item.solution}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white rounded-2xl border-2 border-blue-200 text-center">
            <p className="text-slate-700 mb-4">
              {lang === 'en'
                ? 'Ready to 10x your tender matching efficiency?'
                : 'Готовы в 10 раз улучшить эффективность подбора тендеров?'}
            </p>
            <Link
              to="/onboarding"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {lang === 'en' ? 'Start Free Trial' : 'Начните бесплатно'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            {lang === 'en' ? 'Simple pricing. Start free.' : 'Простые тарифы. Начните бесплатно.'}
          </h2>
          <p className="text-slate-500 mb-10">
            {lang === 'en'
              ? 'Upgrade to Pro when you need bid intelligence, unlimited matches, and the AI proposal generator.'
              : 'Переходите на Pro, когда вам нужна аналитика торгов, безлимитные совпадения и ИИ-генератор предложений.'}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: 'Free', price: { en: '₸0/mo', ru: '₸0/мес' }, features: { en: '10 matches · 2 categories · 1 region', ru: '10 совпадений · 2 категории · 1 регион' }, cta: { en: 'Get started', ru: 'Начать' }, style: 'border border-slate-200', ctaStyle: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
              { name: 'Pro', price: { en: '₸29,000/mo', ru: '₸29 000/мес' }, features: { en: 'Unlimited · Bid intelligence · AI proposals · Alerts', ru: 'Безлимит · Аналитика · ИИ-предложения · Уведомления' }, cta: { en: 'Start Pro', ru: 'Купить Pro' }, style: 'border-2 border-blue-500 shadow-lg', ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700', badge: true },
              { name: 'Enterprise', price: { en: 'Custom', ru: 'По запросу' }, features: { en: 'Multi-user · API access · Dedicated support', ru: 'Несколько пользователей · API · Менеджер' }, cta: { en: 'Contact us', ru: 'Связаться' }, style: 'border border-slate-200', ctaStyle: 'border border-indigo-200 text-indigo-600 hover:bg-indigo-50' },
            ].map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-2xl p-6 ${plan.style}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {lang === 'en' ? 'Most popular' : 'Популярный'}
                    </span>
                  </div>
                )}
                <div className="font-bold text-slate-900 mb-1">{plan.name}</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-2">{lang === 'en' ? plan.price.en : plan.price.ru}</div>
                <div className="text-xs text-slate-500 mb-5">{lang === 'en' ? plan.features.en : plan.features.ru}</div>
                <Link to="/pricing" className={`block w-full py-2 rounded-xl text-sm font-semibold text-center transition ${plan.ctaStyle}`}>
                  {lang === 'en' ? plan.cta.en : plan.cta.ru}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-10">
            {lang === 'en' ? 'Frequently Asked Questions' : 'Часто задаваемые вопросы'}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900 text-sm">{lang === 'en' ? faq.q.en : faq.q.ru}</span>
                  <span className={`text-slate-400 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {lang === 'en' ? faq.a.en : faq.a.ru}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">{tr('cta.title', lang)}</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">{tr('cta.subtitle', lang)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/onboarding" className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
              {tr('cta.button', lang)}
            </Link>
            <Link to="/buyer" className="inline-block border border-white/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">
              {lang === 'en' ? 'I\'m a procurement officer →' : 'Я закупщик →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <span className="text-white font-bold">TenderMatch KZ</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {lang === 'en' ? 'AI-powered tender matching for Kazakhstan businesses.' : 'ИИ-подбор тендеров для казахстанского бизнеса.'}
            </p>
            <div className="text-xs space-y-1">
              <div>hello@tendermatch.kz</div>
              <div>+7 (727) 000-0000</div>
              <div>{lang === 'en' ? 'Almaty, Kazakhstan' : 'Алматы, Казахстан'}</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{lang === 'en' ? 'For Vendors' : 'Поставщикам'}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/onboarding" className="hover:text-white transition">{lang === 'en' ? 'Register' : 'Регистрация'}</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">{lang === 'en' ? 'Browse tenders' : 'Тендеры'}</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">{lang === 'en' ? 'Pricing' : 'Тарифы'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{lang === 'en' ? 'For Buyers' : 'Закупщикам'}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buyer" className="hover:text-white transition">{lang === 'en' ? 'Buyer access' : 'Доступ для закупщика'}</Link></li>
              <li><a href="https://goszakup.gov.kz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Goszakup.gov.kz</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{lang === 'en' ? 'Company' : 'Компания'}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-white transition">{lang === 'en' ? 'How it works' : 'Как это работает'}</a></li>
              <li><a href="mailto:hello@tendermatch.kz" className="hover:text-white transition">{lang === 'en' ? 'Contact us' : 'Связаться'}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} TenderMatch KZ. {lang === 'en' ? 'All rights reserved.' : 'Все права защищены.'}</span>
            <span>{lang === 'en' ? 'Data sourced from Goszakup.gov.kz' : 'Данные: Goszakup.gov.kz'}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

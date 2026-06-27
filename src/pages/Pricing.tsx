import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang, useVendor } from '../App'

async function startCheckout(plan: string, vendorId: string | null): Promise<void> {
  const r = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, vendor_id: vendorId }),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${r.status}`)
  }
  const { url } = await r.json()
  window.location.href = url
}

export default function Pricing() {
  const { lang, setLang } = useLang()
  const { vendorId } = useVendor()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'enterprise') {
      window.open('mailto:hello@tendermatch.kz?subject=Enterprise Plan Inquiry', '_blank')
      return
    }
    if (!vendorId) { navigate('/onboarding'); return }
    setError('')
    setLoadingPlan(planKey)
    try {
      await startCheckout(planKey, vendorId)
    } catch (e: any) {
      setError(e.message || 'Payment setup failed. Please try again.')
      setLoadingPlan(null)
    }
  }

  const plans = [
    {
      key: 'starter',
      name: { en: 'Starter', ru: 'Старт' },
      price: { en: '₸30,000', ru: '₸30 000' },
      period: { en: '/month', ru: '/месяц' },
      desc: { en: 'For small vendors entering government procurement', ru: 'Для малого бизнеса, начинающего участие в госзакупках' },
      cta: { en: 'Get Starter', ru: 'Купить Старт' },
      ctaStyle: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      features: [
        { en: 'Up to 30 tender matches/month', ru: 'До 30 совпадений в месяц' },
        { en: '3 procurement categories', ru: '3 категории закупок' },
        { en: '3 regions', ru: '3 региона' },
        { en: 'AI match scoring (0–100)', ru: 'ИИ-рейтинг совпадений' },
        { en: 'Basic bid intelligence', ru: 'Базовая аналитика торгов' },
        { en: 'Email alerts', ru: 'Email уведомления' },
        { en: 'AI proposal generator (5/month)', ru: 'ИИ-предложения (5/месяц)' },
      ],
      unavailable: [
        { en: 'SMS alerts', ru: 'SMS уведомления' },
        { en: 'Unlimited proposals', ru: 'Безлимитные предложения' },
        { en: 'API access', ru: 'Доступ к API' },
      ],
    },
    {
      key: 'pro',
      name: { en: 'Pro', ru: 'Про' },
      price: { en: '₸70,000', ru: '₸70 000' },
      period: { en: '/month', ru: '/месяц' },
      desc: { en: 'For active vendors who compete regularly and want to win more', ru: 'Для активных участников тендеров, стремящихся выигрывать больше' },
      cta: { en: 'Get Pro', ru: 'Купить Pro' },
      ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
      badge: { en: 'Most popular', ru: 'Популярный' },
      features: [
        { en: 'Unlimited tender matches', ru: 'Безлимитные совпадения' },
        { en: 'All 10 categories', ru: 'Все 10 категорий' },
        { en: 'All 17 Kazakhstan regions', ru: 'Все 17 регионов РК' },
        { en: 'Full bid intelligence (win rate, competition)', ru: 'Полная аналитика торгов' },
        { en: 'Email + SMS alerts', ru: 'Email + SMS уведомления' },
        { en: 'Unlimited AI proposal generator', ru: 'Безлимитный ИИ-генератор предложений' },
        { en: 'Closing-soon deadline alerts', ru: 'Уведомления о дедлайнах' },
        { en: 'Priority support (24h response)', ru: 'Приоритетная поддержка (24ч)' },
      ],
      unavailable: [],
    },
    {
      key: 'enterprise',
      name: { en: 'Enterprise', ru: 'Корпоративный' },
      price: { en: '₸100,000+', ru: 'от ₸100 000' },
      period: { en: '/month', ru: '/месяц' },
      desc: { en: 'For large companies, consortiums, and procurement teams', ru: 'Для крупных компаний, консорциумов и отделов закупок' },
      cta: { en: 'Contact sales', ru: 'Связаться' },
      ctaStyle: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50',
      features: [
        { en: 'Everything in Pro', ru: 'Всё из Pro' },
        { en: 'Multi-user accounts (up to 10 seats)', ru: 'Несколько пользователей (до 10 мест)' },
        { en: 'REST API access', ru: 'Доступ к REST API' },
        { en: 'Dedicated account manager', ru: 'Персональный менеджер' },
        { en: 'Custom category integrations', ru: 'Кастомные интеграции категорий' },
        { en: 'SLA & compliance reports', ru: 'SLA и отчёты о соответствии' },
        { en: 'On-premise deployment option', ru: 'Возможность on-premise развёртывания' },
        { en: '4h response SLA', ru: 'SLA — ответ за 4 часа' },
      ],
      unavailable: [],
    },
  ]

  const faqs = [
    {
      q: { en: 'Can I cancel anytime?', ru: 'Можно ли отменить подписку?' },
      a: { en: 'Yes. Cancel from your account settings — no questions asked. Your access continues until the end of the billing period.', ru: 'Да. Отмените в настройках аккаунта без объяснения причин. Доступ сохраняется до конца оплаченного периода.' },
    },
    {
      q: { en: 'Is there a refund policy?', ru: 'Есть ли политика возврата средств?' },
      a: { en: '14-day money-back guarantee on all plans. If you\'re not satisfied within the first 14 days, we\'ll refund you in full.', ru: '14-дневная гарантия возврата средств на всех тарифах. Если вы не удовлетворены в первые 14 дней — полный возврат.' },
    },
    {
      q: { en: 'What payment methods do you accept?', ru: 'Какие методы оплаты принимаете?' },
      a: { en: 'All major credit and debit cards via Stripe. Kaspi Pay and bank transfer available for Enterprise clients — contact us.', ru: 'Все основные кредитные и дебетовые карты через Stripe. Kaspi Pay и банковский перевод доступны для корпоративных клиентов.' },
    },
    {
      q: { en: 'Is the tender data real?', ru: 'Данные тендеров реальные?' },
      a: { en: 'All data comes from goszakup.gov.kz, Kazakhstan\'s official procurement portal. In MVP mode we use representative seed data; live API integration launches upon receiving the Goszakup Open Data token.', ru: 'Все данные берутся с goszakup.gov.kz. В режиме MVP используется демо-набор данных; живая интеграция API запускается после получения токена Госзакупок.' },
    },
    {
      q: { en: 'Can I upgrade or downgrade?', ru: 'Можно ли сменить тариф?' },
      a: { en: 'Yes. Upgrade takes effect immediately (prorated). Downgrade takes effect at the next billing cycle.', ru: 'Да. Повышение тарифа вступает в силу немедленно (пропорционально). Понижение — с нового расчётного периода.' },
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="border-b border-slate-100 sticky top-0 bg-white z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="font-bold text-slate-900">TenderMatch KZ</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-100 rounded transition"
            >
              {lang === 'en' ? 'RU' : 'EN'}
            </button>
            {vendorId
              ? <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 font-medium hover:underline">
                  {lang === 'en' ? '← Dashboard' : '← Дашборд'}
                </button>
              : <Link to="/onboarding" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  {lang === 'en' ? 'Get started' : 'Начать'}
                </Link>
            }
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          💳 {lang === 'en' ? 'Secure payment via Stripe' : 'Безопасная оплата через Stripe'}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3">
          {lang === 'en' ? 'Invest in winning more tenders' : 'Инвестируйте в победу на тендерах'}
        </h1>
        <p className="text-lg text-slate-500">
          {lang === 'en'
            ? 'Every plan includes AI matching, bid intelligence, and proposal generation. Pick the scale that fits your team.'
            : 'Каждый тариф включает ИИ-подбор, аналитику торгов и генератор предложений. Выберите масштаб для вашей команды.'}
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl text-center">{error}</div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`relative rounded-2xl p-7 border flex flex-col ${
                plan.key === 'pro'
                  ? 'border-blue-500 shadow-2xl shadow-blue-100'
                  : 'border-slate-200'
              } bg-white`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {lang === 'en' ? plan.badge.en : plan.badge.ru}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">{lang === 'en' ? plan.name.en : plan.name.ru}</h2>
                <div className="flex items-end gap-1 mt-2 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">{lang === 'en' ? plan.price.en : plan.price.ru}</span>
                  <span className="text-slate-400 text-sm mb-1">{lang === 'en' ? plan.period.en : plan.period.ru}</span>
                </div>
                <p className="text-sm text-slate-500 leading-snug">{lang === 'en' ? plan.desc.en : plan.desc.ru}</p>
              </div>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loadingPlan === plan.key}
                className={`w-full py-3 rounded-xl font-bold text-sm transition mb-6 ${plan.ctaStyle} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.key
                  ? (lang === 'en' ? 'Redirecting to payment…' : 'Переход к оплате…')
                  : (lang === 'en' ? plan.cta.en : plan.cta.ru)}
              </button>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5 shrink-0 font-bold">✓</span>
                    {lang === 'en' ? f.en : f.ru}
                  </li>
                ))}
                {plan.unavailable.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-0.5 shrink-0">—</span>
                    {lang === 'en' ? f.en : f.ru}
                  </li>
                ))}
              </ul>

              {plan.key === 'pro' && (
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? '14-day money-back guarantee' : '14 дней — гарантия возврата средств'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {[
            { icon: '🔒', text: lang === 'en' ? 'Secured by Stripe' : 'Защита Stripe' },
            { icon: '↩️', text: lang === 'en' ? '14-day refund' : '14 дней возврат' },
            { icon: '❌', text: lang === 'en' ? 'Cancel anytime' : 'Отмена в любой момент' },
            { icon: '📊', text: lang === 'en' ? 'Real Goszakup data' : 'Реальные данные Госзакупок' },
          ].map(t => (
            <span key={t.text} className="flex items-center gap-1.5">{t.icon} {t.text}</span>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-14 bg-slate-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: '500+', label: { en: 'Vendors', ru: 'Поставщиков' } },
              { num: '₸12B', label: { en: 'Tender volume matched', ru: 'Объём тендеров' } },
              { num: '68%', label: { en: 'Avg win rate (Pro)', ru: 'Побед (Pro)' } },
              { num: '4.9★', label: { en: 'User rating', ru: 'Рейтинг' } },
            ].map(s => (
              <div key={s.num}>
                <div className="text-2xl font-extrabold text-slate-900">{s.num}</div>
                <div className="text-xs text-slate-500 mt-0.5">{lang === 'en' ? s.label.en : s.label.ru}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compare table */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            {lang === 'en' ? 'Full plan comparison' : 'Полное сравнение тарифов'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 pr-4 text-slate-500 font-medium">{lang === 'en' ? 'Feature' : 'Функция'}</th>
                  {plans.map(p => (
                    <th key={p.key} className={`text-center py-3 px-4 font-bold ${p.key === 'pro' ? 'text-blue-600' : 'text-slate-900'}`}>
                      {lang === 'en' ? p.name.en : p.name.ru}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: { en: 'Monthly matches', ru: 'Совпадений в месяц' }, vals: ['30', '∞', '∞'] },
                  { label: { en: 'Categories', ru: 'Категорий' }, vals: ['3', '10', '10+'] },
                  { label: { en: 'Regions', ru: 'Регионов' }, vals: ['3', '17', '17'] },
                  { label: { en: 'Bid intelligence', ru: 'Аналитика торгов' }, vals: ['Basic', 'Full', 'Full'] },
                  { label: { en: 'AI proposals', ru: 'ИИ-предложения' }, vals: ['5/mo', '∞', '∞'] },
                  { label: { en: 'Email alerts', ru: 'Email уведомления' }, vals: ['✓', '✓', '✓'] },
                  { label: { en: 'SMS alerts', ru: 'SMS уведомления' }, vals: ['—', '✓', '✓'] },
                  { label: { en: 'Multi-user', ru: 'Несколько пользователей' }, vals: ['—', '—', '✓'] },
                  { label: { en: 'API access', ru: 'API доступ' }, vals: ['—', '—', '✓'] },
                  { label: { en: 'Account manager', ru: 'Менеджер' }, vals: ['—', '—', '✓'] },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                    <td className="py-3 pr-4 text-slate-600">{lang === 'en' ? row.label.en : row.label.ru}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className={`text-center py-3 px-4 font-medium ${
                        v === '✓' ? 'text-green-600' : v === '—' ? 'text-slate-300' : j === 1 ? 'text-blue-600' : 'text-slate-700'
                      }`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            {lang === 'en' ? 'Frequently asked questions' : 'Часто задаваемые вопросы'}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{lang === 'en' ? faq.q.en : faq.q.ru}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{lang === 'en' ? faq.a.en : faq.a.ru}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-blue-600 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {lang === 'en' ? 'Still not sure which plan?' : 'Не уверены, какой тариф выбрать?'}
          </h2>
          <p className="text-blue-200 mb-6 text-sm">
            {lang === 'en' ? 'Talk to our team — we\'ll help you pick the right plan for your business.' : 'Свяжитесь с нашей командой — поможем выбрать подходящий тариф.'}
          </p>
          <a
            href="mailto:hello@tendermatch.kz?subject=Pricing Question"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            {lang === 'en' ? 'Talk to sales →' : 'Написать нам →'}
          </a>
        </div>
      </div>
    </div>
  )
}

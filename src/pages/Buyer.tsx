import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../App'

export default function Buyer() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    org_name: '',
    contact_name: '',
    email: '',
    phone: '',
    bin: '',
    city: '',
    role: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  const features = [
    {
      icon: '🎯',
      title: { en: 'Find qualified vendors instantly', ru: 'Находите квалифицированных поставщиков' },
      desc: { en: 'Our AI matches your procurement needs with verified companies, reducing search time from weeks to minutes.', ru: 'ИИ подбирает поставщиков под ваши потребности за минуты.' },
    },
    {
      icon: '📊',
      title: { en: 'Market intelligence & price benchmarks', ru: 'Рыночная аналитика и бенчмарки' },
      desc: { en: 'See average bids, competition levels, and market pricing for any procurement category before you publish.', ru: 'Узнайте средние цены и уровень конкуренции до публикации тендера.' },
    },
    {
      icon: '✅',
      title: { en: 'Vendor verification dashboard', ru: 'Верификация поставщиков' },
      desc: { en: 'Pre-screened vendors with BIN verification, experience history, and win/performance records.', ru: 'Проверенные поставщики с историей побед и показателями исполнения.' },
    },
    {
      icon: '📢',
      title: { en: 'Broadcast your tender to 500+ vendors', ru: 'Разошлите тендер 500+ поставщикам' },
      desc: { en: 'Publish your requirements and let qualified vendors come to you — higher competition means better pricing for you.', ru: 'Публикуйте требования и получайте заявки от квалифицированных поставщиков.' },
    },
  ]

  const roles = [
    { value: 'procurement_officer', label: { en: 'Procurement officer', ru: 'Специалист по закупкам' } },
    { value: 'finance_director', label: { en: 'Finance director', ru: 'Финансовый директор' } },
    { value: 'state_official', label: { en: 'Government official', ru: 'Государственный служащий' } },
    { value: 'other', label: { en: 'Other', ru: 'Другое' } },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="border-b border-slate-100">
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
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              {lang === 'en' ? 'For vendors →' : 'Для поставщиков →'}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: value prop */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              🏛️ {lang === 'en' ? 'For Procurement Officers & Buyers' : 'Для закупщиков и государственных органов'}
            </div>

            <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
              {lang === 'en'
                ? 'Find the right vendor for every tender — fast.'
                : 'Найдите нужного поставщика для каждого тендера — быстро.'}
            </h1>

            <p className="text-lg text-slate-500 mb-10 leading-relaxed">
              {lang === 'en'
                ? 'TenderMatch KZ connects procurement officers with a curated network of qualified Kazakh vendors. Reduce procurement cycle time, increase competition, and get better value for public funds.'
                : 'TenderMatch KZ соединяет специалистов по закупкам с сетью квалифицированных казахстанских поставщиков. Сокращайте сроки закупок и получайте лучшие условия.'}
            </p>

            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-0.5">{lang === 'en' ? f.title.en : f.title.ru}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{lang === 'en' ? f.desc.en : f.desc.ru}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-slate-50 rounded-2xl p-6">
              <p className="text-sm text-slate-500 italic">
                {lang === 'en'
                  ? '"TenderMatch cut our vendor search time by 80%. We now receive 3x more qualified bids on every tender."'
                  : '«TenderMatch сократил время поиска поставщиков на 80%. Мы получаем в 3 раза больше квалифицированных предложений.»'}
              </p>
              <p className="text-sm font-semibold text-slate-700 mt-2">
                {lang === 'en' ? '— Ainur Bekova, Procurement Dept, Almaty City Akimat' : '— Айнур Бекова, Отдел закупок, Акимат г. Алматы'}
              </p>
            </div>
          </div>

          {/* Right: signup form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {lang === 'en' ? "You're on the list!" : 'Вы в списке!'}
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  {lang === 'en'
                    ? "We'll reach out within 24 hours to set up your buyer account."
                    : 'Мы свяжемся с вами в течение 24 часов для настройки аккаунта.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
                >
                  {lang === 'en' ? 'Back to home' : 'На главную'}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {lang === 'en' ? 'Request buyer access' : 'Запросить доступ для закупщика'}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  {lang === 'en' ? 'Free for government procurement officers.' : 'Бесплатно для государственных закупщиков.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {lang === 'en' ? 'Organization name' : 'Название организации'} *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.org_name}
                      onChange={e => setForm(f => ({ ...f, org_name: e.target.value }))}
                      placeholder={lang === 'en' ? 'Almaty City Akimat' : 'Акимат г. Алматы'}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'en' ? 'Your name' : 'Ваше имя'} *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.contact_name}
                        onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                        placeholder={lang === 'en' ? 'Aizat Nurmagambetova' : 'Айзат Нурмагамбетова'}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {lang === 'en' ? 'City' : 'Город'} *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder={lang === 'en' ? 'Astana' : 'Астана'}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="procurement@akimat.gov.kz"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {lang === 'en' ? 'Your role' : 'Ваша роль'} *
                    </label>
                    <select
                      required
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    >
                      <option value="">{lang === 'en' ? 'Select role...' : 'Выберите роль...'}</option>
                      {roles.map(r => (
                        <option key={r.value} value={r.value}>{lang === 'en' ? r.label.en : r.label.ru}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">BIN</label>
                    <input
                      type="text"
                      value={form.bin}
                      onChange={e => setForm(f => ({ ...f, bin: e.target.value }))}
                      placeholder="123456789012"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !form.org_name || !form.contact_name || !form.email || !form.role || !form.city}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    {loading
                      ? (lang === 'en' ? 'Submitting...' : 'Отправляем...')
                      : (lang === 'en' ? 'Request access →' : 'Запросить доступ →')}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    {lang === 'en' ? 'Free for government & public sector buyers.' : 'Бесплатно для государственных органов.'}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

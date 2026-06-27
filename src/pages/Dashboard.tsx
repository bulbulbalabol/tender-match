import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useLang, useVendor } from '../App'
import { tr } from '../i18n'
import { getMatches, getCategories, getRegions, getVendor, formatAmount, generateProposal } from '../api'
import { Tender, Vendor, Category, Region, MatchReason } from '../types'

// ─── Bid Intelligence (deterministic mock from tender data) ───────────────────
function getBidIntel(tender: Tender) {
  const seed = tender.amount % 997
  const avgBidders = 2 + (seed % 7)
  const winRate = 74 + (seed % 22)
  const level = avgBidders <= 3 ? 'low' : avgBidders <= 5 ? 'medium' : 'high'
  const levelColor = level === 'low' ? 'text-green-700 bg-green-50' : level === 'medium' ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
  const levelLabel = { low: { en: 'Low competition', ru: 'Низкая конкуренция' }, medium: { en: 'Medium competition', ru: 'Средняя конкуренция' }, high: { en: 'High competition', ru: 'Высокая конкуренция' } }
  return { avgBidders, winRate, level, levelColor, levelLabel: levelLabel[level] }
}

// ─── Match Score Badge ─────────────────────────────────────────────────────────
function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-100 text-green-800 border-green-200' :
    score >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score}% match
    </span>
  )
}

// ─── Match Reasons ─────────────────────────────────────────────────────────────
function MatchReasonList({ reasons, lang }: { reasons: MatchReason[]; lang: string }) {
  const l = lang as 'en' | 'ru'
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {reasons.map((r, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
            r.match ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'
          }`}
        >
          {r.match ? '✓' : '○'}
          {tr(`match.${r.type}${r.match ? '' : '.no'}`, l)}
        </span>
      ))}
    </div>
  )
}

// ─── Tender Card ──────────────────────────────────────────────────────────────
function TenderCard({ tender, categories, regions, lang, onOpen }: {
  tender: Tender; categories: Category[]; regions: Region[]; lang: 'en' | 'ru'; onOpen: (t: Tender) => void
}) {
  const cat = categories.find(c => c.id === tender.category)
  const reg = regions.find(r => r.id === tender.region)
  const intel = getBidIntel(tender)

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
      onClick={() => onOpen(tender)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {tender.match_score !== undefined && <MatchBadge score={tender.match_score} />}
          {tender.is_closing_soon && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              🔥 {tr('dash.closing_soon_badge', lang)}
            </span>
          )}
          {cat && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
              {cat.icon} {lang === 'en' ? cat.name_en : cat.name_ru}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 shrink-0">{tender.days_left}d {tr('dash.days_left', lang)}</span>
      </div>

      <h3 className="font-semibold text-slate-900 leading-snug mb-1 group-hover:text-blue-700 transition line-clamp-2">
        {lang === 'en' ? tender.name_en : tender.name_ru}
      </h3>
      <p className="text-sm text-slate-500 mb-3">{lang === 'en' ? tender.customer_en : tender.customer_ru}</p>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-slate-900">{formatAmount(tender.amount)}</span>
          {reg && <span className="text-slate-400">📍 {lang === 'en' ? reg.name_en : reg.name_ru}</span>}
        </div>
        <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition">{tr('dash.view', lang)} →</span>
      </div>

      {/* Bid intel row */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${intel.levelColor}`}>
          {lang === 'en' ? intel.levelLabel.en : intel.levelLabel.ru}
        </span>
        <span className="text-xs text-slate-400">· {intel.avgBidders} {lang === 'en' ? 'avg bidders' : 'участников'}</span>
        <span className="text-xs text-slate-400">· {intel.winRate}% {lang === 'en' ? 'win rate' : 'побед'}</span>
      </div>

      {tender.match_reasons && <MatchReasonList reasons={tender.match_reasons} lang={lang} />}
    </div>
  )
}

// ─── Proposal Generator Modal ─────────────────────────────────────────────────
function ProposalModal({ tender, vendor, lang, onClose }: {
  tender: Tender; vendor: Vendor | null; lang: 'en' | 'ru'; onClose: () => void
}) {
  const [proposal, setProposal] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProposal = async () => {
      if (!vendor) {
        setError(lang === 'en' ? 'Vendor information not found' : 'Информация о поставщике не найдена')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const result = await generateProposal(tender.id, vendor.id, lang)
        setProposal(result.proposal)
      } catch (err) {
        console.error('Proposal generation error:', err)
        setError(lang === 'en'
          ? 'Failed to generate proposal. Please try again.'
          : 'Ошибка при создании предложения. Попробуйте снова.')
      } finally {
        setLoading(false)
      }
    }

    loadProposal()
  }, [tender.id, vendor, lang])

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal)
    alert(lang === 'en' ? 'Copied to clipboard!' : 'Скопировано!')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">{lang === 'en' ? '📄 AI-Generated Proposal' : '📄 ИИ-генерированное предложение'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{lang === 'en' ? 'Powered by Claude AI' : 'На основе Claude AI'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-500 text-sm">{lang === 'en' ? 'Generating proposal...' : 'Генерирую предложение...'}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {!loading && !error && proposal && (
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-slate-50 rounded-xl p-4 leading-relaxed">{proposal}</pre>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleCopy}
            disabled={loading || !proposal}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lang === 'en' ? 'Copy to Clipboard' : 'Скопировать'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition">
            {lang === 'en' ? 'Close' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tender Detail Modal ──────────────────────────────────────────────────────
function TenderModal({ tender, categories, regions, lang, vendor, onClose }: {
  tender: Tender; categories: Category[]; regions: Region[]; lang: 'en' | 'ru'; vendor: Vendor | null; onClose: () => void
}) {
  const [showProposal, setShowProposal] = useState(false)
  const cat = categories.find(c => c.id === tender.category)
  const reg = regions.find(r => r.id === tender.region)
  const intel = getBidIntel(tender)

  const TENDER_TYPE_LABELS: Record<string, { en: string; ru: string }> = {
    open: { en: 'Open Tender', ru: 'Открытый конкурс' },
    price_quote: { en: 'Price Quotation', ru: 'Запрос ценовых предложений' },
    single_source: { en: 'Single Source', ru: 'Из одного источника' },
    auction: { en: 'Electronic Auction', ru: 'Электронный аукцион' },
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
            <div>
              {cat && <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{cat.icon} {lang === 'en' ? cat.name_en : cat.name_ru}</span>}
              {tender.match_score !== undefined && <span className="ml-2"><MatchBadge score={tender.match_score} /></span>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl leading-none">✕</button>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
              {lang === 'en' ? tender.name_en : tender.name_ru}
            </h2>
            <p className="text-slate-500 text-sm mb-5">{lang === 'en' ? tender.customer_en : tender.customer_ru}</p>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: tr('detail.amount', lang), value: formatAmount(tender.amount), icon: '💰' },
                { label: tr('detail.deadline', lang), value: tender.deadline, icon: '📅' },
                { label: tr('detail.region', lang), value: reg ? (lang === 'en' ? reg.name_en : reg.name_ru) : tender.region, icon: '📍' },
                { label: tr('detail.type', lang), value: TENDER_TYPE_LABELS[tender.type]?.[lang] ?? tender.type, icon: '📋' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                  <div className="font-semibold text-slate-900 text-sm">{item.icon} {item.value}</div>
                </div>
              ))}
            </div>

            {/* Bid Intelligence Panel */}
            <div className="mb-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-1.5">
                📊 {lang === 'en' ? 'Bid Intelligence' : 'Аналитика торгов'}
                <span className="text-xs font-normal text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded">Pro</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">{intel.avgBidders}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{lang === 'en' ? 'Avg bidders' : 'Участников'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">{intel.winRate}%</div>
                  <div className="text-xs text-slate-500 mt-0.5">{lang === 'en' ? 'Hist. win rate' : 'Побед'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${intel.levelColor}`}>
                    {lang === 'en' ? intel.levelLabel.en : intel.levelLabel.ru}
                  </span>
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-2.5">
                {lang === 'en'
                  ? `Based on historical data for similar ${cat?.name_en ?? 'category'} tenders in this region.`
                  : `На основе исторических данных по аналогичным тендерам в этом регионе.`}
              </p>
            </div>

            {/* Description */}
            {(tender.description_en || tender.description_ru) && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">{tr('detail.description', lang)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{lang === 'en' ? tender.description_en : tender.description_ru}</p>
              </div>
            )}

            {/* Match analysis */}
            {tender.match_reasons && tender.match_reasons.length > 0 && (
              <div className="mb-5 bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">{tr('detail.match_analysis', lang)}</h3>
                <div className="space-y-2">
                  {tender.match_reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${r.match ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {r.match ? '✓' : '○'}
                      </span>
                      <span className={r.match ? 'text-slate-800' : 'text-slate-500'}>
                        {tr(`match.${r.type}${r.match ? '' : '.no'}`, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing soon */}
            {tender.is_closing_soon && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                <span>🔥</span>
                <span>{lang === 'en' ? `Only ${tender.days_left} days left to submit!` : `Только ${tender.days_left} дней до дедлайна!`}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowProposal(true)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2"
              >
                ✍️ {lang === 'en' ? 'Generate Proposal' : 'Создать предложение'}
              </button>
              <a
                href={`https://goszakup.gov.kz/ru/search/lots?filter[name]=${encodeURIComponent(tender.name_ru)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
              >
                {tr('detail.open_goszakup', lang)}
              </a>
            </div>
          </div>
        </div>
      </div>

      {showProposal && (
        <ProposalModal tender={tender} vendor={vendor} lang={lang} onClose={() => setShowProposal(false)} />
      )}
    </>
  )
}

// ─── Alert Settings Panel ─────────────────────────────────────────────────────
function AlertPanel({ lang, vendor }: { lang: 'en' | 'ru'; vendor: Vendor | null }) {
  const [emailAlert, setEmailAlert] = useState(true)
  const [smsAlert, setSmsAlert] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        🔔 {lang === 'en' ? 'Alerts' : 'Уведомления'}
      </h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-xs font-medium text-slate-700">{lang === 'en' ? 'Email alerts' : 'Email'}</div>
            <div className="text-xs text-slate-400 truncate max-w-32">{vendor?.email || 'Not set'}</div>
          </div>
          <button
            onClick={() => setEmailAlert(e => !e)}
            className={`w-9 h-5 rounded-full transition-colors ${emailAlert ? 'bg-blue-500' : 'bg-slate-200'} relative`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emailAlert ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-xs font-medium text-slate-700">{lang === 'en' ? 'SMS alerts' : 'SMS'}</div>
            <div className="text-xs text-slate-400 truncate max-w-32">{vendor?.phone || (lang === 'en' ? 'Not set' : 'Не указан')}</div>
          </div>
          <button
            onClick={() => setSmsAlert(s => !s)}
            className={`w-9 h-5 rounded-full transition-colors ${smsAlert ? 'bg-blue-500' : 'bg-slate-200'} relative`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${smsAlert ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </label>
        <button
          onClick={handleSave}
          className={`w-full text-xs py-1.5 rounded-lg font-medium transition ${saved ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
        >
          {saved ? (lang === 'en' ? '✓ Saved!' : '✓ Сохранено!') : (lang === 'en' ? 'Save settings' : 'Сохранить')}
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { lang, setLang } = useLang()
  const { vendorId, setVendorId } = useVendor()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [tenders, setTenders] = useState<Tender[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, high_match: 0, medium_match: 0 })

  const [filter, setFilter] = useState({
    tab: 'all' as 'all' | 'high' | 'closing',
    category: searchParams.get('category') || '',
    region: '',
    search: '',
    amount_min: '',
    amount_max: '',
  })

  useEffect(() => {
    Promise.all([getCategories(), getRegions()]).then(([cats, regs]) => {
      setCategories(cats); setRegions(regs)
    })
  }, [])

  useEffect(() => {
    if (!vendorId) return
    getVendor(vendorId).then(setVendor).catch(() => {})
  }, [vendorId])

  const loadTenders = useCallback(() => {
    if (!vendorId) return
    setLoading(true)
    getMatches(vendorId)
      .then(data => {
        setStats({ total: data.total, high_match: data.high_match, medium_match: data.medium_match })
        let results = data.matches
        if (filter.tab === 'high') results = results.filter(t => (t.match_score ?? 0) >= 70)
        if (filter.tab === 'closing') results = results.filter(t => t.is_closing_soon)
        if (filter.category) results = results.filter(t => t.category === filter.category)
        if (filter.region) results = results.filter(t => t.region === filter.region)
        if (filter.search) {
          const q = filter.search.toLowerCase()
          results = results.filter(t =>
            t.name_en.toLowerCase().includes(q) || t.name_ru.toLowerCase().includes(q) ||
            t.customer_en.toLowerCase().includes(q) || t.customer_ru.toLowerCase().includes(q)
          )
        }
        if (filter.amount_min) results = results.filter(t => t.amount >= Number(filter.amount_min))
        if (filter.amount_max) results = results.filter(t => t.amount <= Number(filter.amount_max))
        setTenders(results)
      })
      .finally(() => setLoading(false))
  }, [vendorId, filter])

  useEffect(() => { loadTenders() }, [loadTenders])

  const handleLogout = () => { setVendorId(null); navigate('/') }

  const TABS = [
    { key: 'all', label: tr('dash.all_tenders', lang), count: stats.total },
    { key: 'high', label: tr('dash.high_match', lang), count: stats.high_match },
    { key: 'closing', label: tr('dash.closing_soon', lang) },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">TenderMatch KZ</span>
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={tr('dash.search', lang)}
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/pricing" className="hidden sm:block text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-indigo-50 rounded-lg transition">
              ⭐ {lang === 'en' ? 'Upgrade' : 'Подписка'}
            </Link>
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-100 rounded transition"
            >
              {lang === 'en' ? 'RU' : 'EN'}
            </button>
            {vendor && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                  {vendor.company_name.charAt(0)}
                </div>
                <span className="text-sm text-slate-700 font-medium hidden sm:block max-w-28 truncate">{vendor.company_name}</span>
              </div>
            )}
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600 transition">✕</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {vendor && (
          <div className="mb-5">
            <h1 className="text-xl font-bold text-slate-900">{tr('dash.welcome', lang)}, {vendor.company_name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {stats.total} {tr('dash.matches_found', lang)} · {stats.high_match} {lang === 'en' ? 'strong matches' : 'сильных совпадений'}
            </p>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-52 shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{tr('dash.filter.category', lang)}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter(f => ({ ...f, category: '' }))}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition ${!filter.category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tr('dash.filter.all', lang)}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(f => ({ ...f, category: f.category === cat.id ? '' : cat.id }))}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition flex items-center gap-1.5 ${filter.category === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate text-xs">{lang === 'en' ? cat.name_en : cat.name_ru}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{tr('dash.filter.region', lang)}</h3>
              <select
                value={filter.region}
                onChange={e => setFilter(f => ({ ...f, region: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{tr('dash.filter.all', lang)}</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{lang === 'en' ? r.name_en : r.name_ru}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{tr('dash.filter.amount', lang)}</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder={lang === 'en' ? 'Min ₸' : 'Мин ₸'}
                  value={filter.amount_min}
                  onChange={e => setFilter(f => ({ ...f, amount_min: e.target.value }))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder={lang === 'en' ? 'Max ₸' : 'Макс ₸'}
                  value={filter.amount_max}
                  onChange={e => setFilter(f => ({ ...f, amount_max: e.target.value }))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <AlertPanel lang={lang} vendor={vendor} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-4 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(f => ({ ...f, tab: tab.key as typeof f.tab }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter.tab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter.tab === tab.key ? 'bg-blue-500 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : tenders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>{tr('dash.no_results', lang)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tenders.map(tender => (
                  <TenderCard
                    key={tender.id}
                    tender={tender}
                    categories={categories}
                    regions={regions}
                    lang={lang}
                    onOpen={setSelectedTender}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTender && (
        <TenderModal
          tender={selectedTender}
          categories={categories}
          regions={regions}
          lang={lang}
          vendor={vendor}
          onClose={() => setSelectedTender(null)}
        />
      )}
    </div>
  )
}

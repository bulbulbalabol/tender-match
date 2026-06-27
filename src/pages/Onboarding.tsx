import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, useVendor } from '../App'
import { tr } from '../i18n'
import { getCategories, getRegions, createVendor } from '../api'
import { Category, Region } from '../types'

const EMPLOYEE_OPTIONS = ['1_10', '11_50', '51_200', '200+']

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { lang } = useLang()
  const { setVendorId } = useVendor()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    bin: '',
    city: '',
    employee_count: '',
    categories: [] as string[],
    regions: [] as string[],
    min_amount: 0,
    max_amount: 10_000_000_000,
  })

  useEffect(() => {
    getCategories().then(setCategories)
    getRegions().then(setRegions)
  }, [])

  const toggleItem = (field: 'categories' | 'regions', id: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id)
        ? f[field].filter(x => x !== id)
        : [...f[field], id],
    }))
  }

  const canNext = () => {
    if (step === 1) return form.company_name && form.contact_name && form.email && form.city && form.employee_count
    if (step === 2) return form.categories.length > 0
    if (step === 3) return form.regions.length > 0
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await createVendor(form)
      setVendorId(result.id)
      navigate('/dashboard')
    } catch (e: any) {
      setError(lang === 'en' ? 'Something went wrong. Please try again.' : 'Ошибка. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="font-bold">TenderMatch KZ</span>
          </button>
          <span className="text-sm text-slate-400">
            {tr('onb.step', lang)} {step} {tr('onb.of', lang)} 3
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <ProgressBar step={step} total={3} />

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{tr('onb.step1.title', lang)}</h1>
              <p className="text-slate-500 mb-6 text-sm">
                {lang === 'en' ? 'Takes about 2 minutes.' : 'Займёт около 2 минут.'}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.company_name', lang)} *</label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                    placeholder={lang === 'en' ? 'ТОО "Строй Мастер"' : 'ТОО «Строй Мастер»'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.contact_name', lang)} *</label>
                    <input
                      type="text"
                      value={form.contact_name}
                      onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                      placeholder={lang === 'en' ? 'Aibek Dzhaksybekov' : 'Айбек Джаксыбеков'}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.city', lang)} *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder={lang === 'en' ? 'Almaty' : 'Алматы'}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.email', lang)} *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="info@company.kz"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.phone', lang)}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+7 700 000 0000"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{tr('onb.bin', lang)}</label>
                    <input
                      type="text"
                      value={form.bin}
                      onChange={e => setForm(f => ({ ...f, bin: e.target.value }))}
                      placeholder="123456789012"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{tr('onb.employees', lang)} *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {EMPLOYEE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, employee_count: opt }))}
                        className={`py-3 rounded-xl text-sm font-medium border transition ${
                          form.employee_count === opt
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {tr(`onb.employees.${opt}`, lang).split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  {form.employee_count && (
                    <p className="text-xs text-slate-400 mt-1">
                      {tr(`onb.employees.${form.employee_count}`, lang)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{tr('onb.step2.title', lang)}</h1>
              <p className="text-slate-500 mb-6 text-sm">{tr('onb.step2.desc', lang)}</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const selected = form.categories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleItem('categories', cat.id)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        selected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className={`text-sm font-medium leading-tight ${selected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {lang === 'en' ? cat.name_en : cat.name_ru}
                      </div>
                      {selected && (
                        <div className="text-blue-500 text-xs mt-1">✓ {lang === 'en' ? 'Selected' : 'Выбрано'}</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {form.categories.length > 0 && (
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  {form.categories.length} {lang === 'en' ? 'selected' : 'выбрано'}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Regions + Amount */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{tr('onb.step3.title', lang)}</h1>
              <p className="text-slate-500 mb-4 text-sm">{tr('onb.step3.desc', lang)}</p>

              <div className="bg-white border border-slate-200 rounded-xl p-1 mb-6 max-h-64 overflow-y-auto">
                {regions.map(region => {
                  const selected = form.regions.includes(region.id)
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => toggleItem('regions', region.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition ${
                        selected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang === 'en' ? region.name_en : region.name_ru}</span>
                      {selected && <span className="text-blue-500 font-bold">✓</span>}
                    </button>
                  )
                })}
              </div>

              {form.regions.length > 0 && (
                <p className="text-sm text-blue-600 mb-5 font-medium">
                  {form.regions.length} {lang === 'en' ? 'regions selected' : 'регионов выбрано'}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {tr('onb.min_amount', lang)}
                  </label>
                  <input
                    type="number"
                    value={form.min_amount}
                    onChange={e => setForm(f => ({ ...f, min_amount: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {tr('onb.max_amount', lang)}
                  </label>
                  <input
                    type="number"
                    value={form.max_amount}
                    onChange={e => setForm(f => ({ ...f, max_amount: Number(e.target.value) }))}
                    placeholder="10000000000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {tr('onb.back', lang)}
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) setStep(s => s + 1)
                else handleSubmit()
              }}
              disabled={!canNext() || loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? (lang === 'en' ? 'Setting up...' : 'Настройка...')
                : step < 3
                ? tr('onb.next', lang)
                : tr('onb.submit', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

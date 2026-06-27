import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Lang } from './types'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Buyer from './pages/Buyer'
import ChatWidget from './components/ChatWidget'

// ─── Language Context ─────────────────────────────────────────────────────────
interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
export const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} })
export const useLang = () => useContext(LangContext)

// ─── Vendor Context ───────────────────────────────────────────────────────────
interface VendorCtx { vendorId: string | null; setVendorId: (id: string | null) => void }
export const VendorContext = createContext<VendorCtx>({ vendorId: null, setVendorId: () => {} })
export const useVendor = () => useContext(VendorContext)

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('tm_lang')
    return (stored === 'ru' || stored === 'en') ? stored : 'en'
  })

  const [vendorId, setVendorIdState] = useState<string | null>(() =>
    localStorage.getItem('tm_vendor_id')
  )

  const setLangPersist = (l: Lang) => {
    setLang(l)
    localStorage.setItem('tm_lang', l)
  }

  const setVendorId = (id: string | null) => {
    setVendorIdState(id)
    if (id) localStorage.setItem('tm_vendor_id', id)
    else localStorage.removeItem('tm_vendor_id')
  }

  return (
    <LangContext.Provider value={{ lang, setLang: setLangPersist }}>
      <VendorContext.Provider value={{ vendorId, setVendorId }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/dashboard"
              element={vendorId ? <Dashboard /> : <Navigate to="/onboarding" replace />}
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/buyer" element={<Buyer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* AI chat widget — visible on every page */}
          <ChatWidget />
        </BrowserRouter>
      </VendorContext.Provider>
    </LangContext.Provider>
  )
}

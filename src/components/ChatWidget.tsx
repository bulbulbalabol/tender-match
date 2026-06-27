import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../App'

interface Message {
  role: 'user' | 'assistant'
  text: string
  nav?: string | null
}

const QUICK_PROMPTS_EN = [
  'How does matching work?',
  'What are your pricing plans?',
  'How do I generate a proposal?',
  'What is Bid Intelligence?',
]

const QUICK_PROMPTS_RU = [
  'Как работает подбор?',
  'Какие у вас тарифы?',
  'Как создать предложение?',
  'Что такое аналитика торгов?',
]

async function sendChat(message: string, lang: string): Promise<{ response: string; nav?: string | null }> {
  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lang }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } catch {
    return {
      response: lang === 'ru'
        ? 'Извините, произошла ошибка. Попробуйте снова.'
        : 'Sorry, something went wrong. Please try again.',
      nav: null,
    }
  }
}

export default function ChatWidget() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: lang === 'ru'
          ? 'Привет! Я ИИ-ассистент TenderMatch KZ 👋 Чем могу помочь? Спросите о тарифах, подборе тендеров, предложениях или любых других вопросах.'
          : 'Hi! I\'m TenderMatch KZ\'s AI assistant 👋 Ask me anything — pricing, how matching works, proposals, alerts, or navigating the platform.',
        nav: null,
      }])
    }
    if (open) {
      setUnread(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const { response, nav } = await sendChat(userMsg, lang)
    setMessages(prev => [...prev, { role: 'assistant', text: response, nav }])
    setLoading(false)

    // Auto-navigate if assistant suggests it
    if (nav) {
      setTimeout(() => navigate(nav), 800)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const quickPrompts = lang === 'ru' ? QUICK_PROMPTS_RU : QUICK_PROMPTS_EN

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center group"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unread && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>
            <div>
              <div className="text-white font-semibold text-sm">TenderMatch AI</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-blue-200 text-xs">{lang === 'ru' ? 'Онлайн' : 'Online'}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5 shrink-0">T</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.text}
                  {msg.nav && (
                    <button
                      onClick={() => navigate(msg.nav!)}
                      className="mt-1.5 block text-xs text-blue-500 hover:underline"
                    >
                      {lang === 'ru' ? '→ Перейти' : '→ Go there'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5 shrink-0">T</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick prompts (show after greeting, before any user message) */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 text-center">{lang === 'ru' ? 'Быстрые вопросы:' : 'Quick questions:'}</p>
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => send(p)}
                    className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={lang === 'ru' ? 'Задайте вопрос...' : 'Ask a question...'}
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-slate-300 mt-2">Powered by Claude AI</p>
          </div>
        </div>
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Coffee } from 'lucide-react'
import CoffeeLog from './CoffeeLog'
import Auth from './Auth'
import SettingsModal from './SettingsModal'
import { supabase } from './supabase'
import { ICON_MAP } from './icons'

const DEFAULT_CATEGORIES = [
  { name: 'V60',         icon_name: 'Droplets', position: 0, has_brew_time: false, ratio_coffee: 1, ratio_water: 15 },
  { name: 'Moccamaster', icon_name: 'Coffee',   position: 1, has_brew_time: false, ratio_coffee: 1, ratio_water: 15 },
  { name: 'Espresso',    icon_name: 'Zap',      position: 2, has_brew_time: true,  ratio_coffee: 1, ratio_water: 2  },
]

const INPUT_CLASS = "w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
const LABEL_CLASS = "block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5"

function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      onDone()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brew-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/icon-512.svg" alt="" className="w-16 h-16 mx-auto mb-5 rounded-2xl shadow-warm" />
          <h1 className="font-display text-5xl tracking-wide text-brew-900">Set New Password</h1>
        </div>
        <div className="bg-brew-900 border border-brew-700 rounded-2xl overflow-hidden shadow-warm">
          <div className="h-1 bg-tan-500" />
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" className={INPUT_CLASS} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-brew-950 text-brew-900 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-brew-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? '…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
      else if (event === 'USER_UPDATED') setRecoveryMode(false)
      setSession(session)
      if (!session) {
        setCategories([])
        setCategoriesLoaded(false)
        setActiveCategory(null)
        setRecoveryMode(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || recoveryMode) return
    loadCategories()
  }, [session, recoveryMode])

  async function loadCategories() {
    const { data } = await supabase.from('brew_categories').select('*').order('position')
    if (!data || data.length === 0) {
      const { data: seeded } = await supabase.from('brew_categories').insert(DEFAULT_CATEGORIES).select()
      const cats = seeded || []
      setCategories(cats)
      setActiveCategory(cats[0] || null)
    } else {
      setCategories(data)
      const savedId = localStorage.getItem('lastActiveCategoryId')
      const restored = (savedId && data.find((c) => c.id === savedId)) || data[0]
      setActiveCategory(restored)
    }
    setCategoriesLoaded(true)
  }

  function handleCategoriesChange(newCategories) {
    setCategories(newCategories)
    if (activeCategory && !newCategories.find((c) => c.id === activeCategory.id)) {
      setActiveCategory(newCategories[0] || null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brew-950 flex items-center justify-center">
        <p className="text-brew-900 text-xs uppercase tracking-[0.25em] animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!session) return <Auth />

  if (recoveryMode) return <ResetPasswordScreen onDone={() => setRecoveryMode(false)} />

  if (!categoriesLoaded) {
    return (
      <div className="min-h-screen bg-brew-950 flex items-center justify-center">
        <p className="text-brew-900 text-xs uppercase tracking-[0.25em] animate-pulse">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brew-950 pb-32">
      <header
        className="sticky top-0 z-40 bg-brew-900 text-tan-50 px-6 pb-0"
        style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', boxShadow: '0 4px 20px rgba(90, 63, 42, 0.35)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-tan-500 text-xs tracking-[0.35em] uppercase mb-2">Cool Beans</p>
              <h1 className="font-display text-6xl tracking-wide">Coffee Log</h1>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-brew-400 bg-brew-800 border border-brew-700 hover:text-tan-50 hover:border-brew-500 uppercase tracking-wider transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
          <div className="mt-5 h-1 bg-brew-700" />
          <p className="text-brew-600 text-xs tracking-[0.2em] uppercase mt-3 pb-5">Version 1.2.1</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeCategory && (
          <div key={activeCategory.id ?? activeCategory.name}>
            <CoffeeLog category={activeCategory} />
          </div>
        )}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-brew-900 border-t border-brew-700/40 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto flex gap-2 px-3 py-3 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon_name] || Coffee
            return (
              <button
                key={cat.id ?? cat.name}
                onClick={() => { setActiveCategory(cat); localStorage.setItem('lastActiveCategoryId', cat.id) }}
                className={`shrink-0 flex-1 min-w-[3.5rem] py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 flex flex-col items-center ${
                  activeCategory?.id === cat.id || activeCategory?.name === cat.name
                    ? 'bg-brew-950 text-brew-900'
                    : 'text-brew-400 hover:text-tan-50 bg-brew-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-[5rem]">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
        onSignOut={() => supabase.auth.signOut()}
      />
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import CoffeeLog from './CoffeeLog'
import Auth from './Auth'
import SettingsModal from './SettingsModal'
import { supabase } from './supabase'
import { ICON_MAP } from './icons'
import { Coffee } from 'lucide-react'

const DEFAULT_CATEGORIES = [
  { name: 'V60',         icon_name: 'Droplets', position: 0, has_brew_time: false, ratio_coffee: 1, ratio_water: 15 },
  { name: 'Moccamaster', icon_name: 'Coffee',   position: 1, has_brew_time: false, ratio_coffee: 1, ratio_water: 15 },
  { name: 'Espresso',    icon_name: 'Zap',      position: 2, has_brew_time: true,  ratio_coffee: 1, ratio_water: 2  },
]

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setCategories([])
        setCategoriesLoaded(false)
        setActiveCategory(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    loadCategories()
  }, [session])

  async function loadCategories() {
    const { data } = await supabase.from('brew_categories').select('*').order('position')

    if (!data || data.length === 0) {
      const { data: seeded } = await supabase.from('brew_categories').insert(DEFAULT_CATEGORIES).select()
      const cats = seeded || []
      setCategories(cats)
      setActiveCategory(cats[0] || null)
    } else {
      setCategories(data)
      setActiveCategory(data[0])
    }
    setCategoriesLoaded(true)
  }

  function handleCategoriesChange(newCategories) {
    setCategories(newCategories)
    if (activeCategory && !newCategories.find((c) => c.id === activeCategory.id)) {
      setActiveCategory(newCategories[0] || null)
    }
  }

  const appLoading = authLoading || (!!session && !categoriesLoaded)

  if (appLoading) {
    return (
      <div className="min-h-screen bg-brew-950 flex items-center justify-center">
        <p className="text-brew-900 text-xs uppercase tracking-[0.25em] animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!session) return <Auth />

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
          <p className="text-brew-600 text-xs tracking-[0.2em] uppercase mt-3 pb-5">Version 1.2.0</p>
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
                onClick={() => setActiveCategory(cat)}
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

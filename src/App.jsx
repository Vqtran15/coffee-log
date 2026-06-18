import { useState, useEffect } from 'react'
import { Droplets, Coffee, Zap, LogOut } from 'lucide-react'
import CoffeeLog from './CoffeeLog'
import Auth from './Auth'
import { supabase } from './supabase'

const TABS = [
  { label: 'V60', method: 'V60', icon: Droplets },
  { label: 'Mocca', method: 'Moccamaster', icon: Coffee },
  { label: 'Espresso', method: 'Espresso', icon: Zap },
]

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-600 text-xs uppercase tracking-[0.25em] animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <div className="min-h-screen bg-stone-950 pb-32">
      <header className="bg-stone-900 text-amber-50 px-6 pt-8 pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-500 text-xs tracking-[0.35em] uppercase mb-2">Cool Beans</p>
              <h1 className="text-5xl font-black tracking-tight uppercase">Coffee Log</h1>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-stone-400 bg-stone-800 border border-stone-700 hover:text-amber-50 hover:border-stone-500 uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
          <div className="mt-5 h-1 bg-stone-700" />
          <p className="text-stone-600 text-xs tracking-[0.2em] uppercase mt-3 pb-5">Version 1.0.8</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div key={activeTab.method}>
          <CoffeeLog method={activeTab.method} />
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto flex gap-2 px-3 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.method}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                activeTab.method === tab.method
                  ? 'bg-amber-500 text-stone-900'
                  : 'text-stone-400 hover:text-amber-50 bg-stone-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App

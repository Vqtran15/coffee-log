import { useState } from 'react'
import { Droplets, Coffee, Zap } from 'lucide-react'
import CoffeeLog from './CoffeeLog'

const TABS = [
  { label: 'V60', method: 'V60', icon: Droplets },
  { label: 'Mocca', method: 'Moccamaster', icon: Coffee },
  { label: 'Espresso', method: 'Espresso', icon: Zap },
]

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <div className="min-h-screen bg-stone-950 pb-32">
      <header className="bg-stone-900 text-amber-50 px-6 pt-8 pb-0">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-500 text-xs tracking-[0.35em] uppercase mb-2">Cool Beans</p>
          <h1 className="text-5xl font-black tracking-tight uppercase">Coffee Log</h1>
          <div className="mt-5 h-1 bg-stone-700" />
          <p className="text-stone-600 text-xs tracking-[0.2em] uppercase mt-3 pb-5">Version 1.0.3</p>
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

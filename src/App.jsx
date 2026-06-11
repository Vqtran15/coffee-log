import { useState } from 'react'
import CoffeeLog from './CoffeeLog'

const TABS = ['V60', 'Moccamaster', 'Espresso']

function App() {
  const [activeTab, setActiveTab] = useState('V60')

  return (
    <div className="min-h-screen bg-stone-950 pb-32">
      <header className="bg-stone-900 text-amber-50 px-6 pt-8 pb-0">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-500 text-xs tracking-[0.35em] uppercase mb-2">Your daily brew journal</p>
          <h1 className="text-5xl font-black tracking-tight uppercase">Coffee Log</h1>
          <div className="mt-5 flex gap-0">
            <div className="h-1 w-10 bg-amber-500" />
            <div className="h-1 flex-1 bg-stone-700" />
          </div>
          <p className="text-stone-600 text-xs tracking-[0.2em] uppercase mt-3 pb-5">Version 1.0.2</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div key={activeTab} className="tab-enter">
          <CoffeeLog method={activeTab} />
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto flex gap-2 px-4 py-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-amber-500 text-stone-900'
                  : 'text-stone-400 hover:text-amber-50 bg-stone-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App

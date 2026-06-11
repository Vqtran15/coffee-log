import { useState } from 'react'
import CoffeeLog from './CoffeeLog'

const TABS = ['V60', 'Moccamaster', 'Espresso']

function App() {
  const [activeTab, setActiveTab] = useState('V60')

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="bg-stone-900 text-amber-50 px-6 pt-8 pb-0">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-500 text-xs tracking-[0.35em] uppercase mb-2">Your daily brew journal</p>
          <h1 className="text-5xl font-black tracking-tight uppercase">Coffee Log</h1>
          <div className="mt-5 flex gap-0">
            <div className="h-1 w-10 bg-amber-500" />
            <div className="h-1 flex-1 bg-stone-700" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-10">
        <div className="flex bg-stone-800 border border-stone-700 rounded-xl p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-amber-500 text-stone-900'
                  : 'text-stone-400 hover:text-amber-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div key={activeTab} className="tab-enter">
          <CoffeeLog method={activeTab} />
        </div>
      </div>

      <footer className="bg-stone-900 text-amber-50 py-5 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-700" />
          <p className="text-amber-500 text-xs tracking-[0.3em] uppercase">Version 1.0.1</p>
          <div className="h-px flex-1 bg-stone-700" />
        </div>
      </footer>
    </div>
  )
}

export default App

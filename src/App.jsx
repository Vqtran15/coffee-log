import { useState } from 'react'
import CoffeeLog from './CoffeeLog'

const TABS = ['V60', 'Moccamaster', 'Espresso']

function App() {
  const [activeTab, setActiveTab] = useState('V60')

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-900 text-amber-50 py-6 px-4 shadow-md">
        <h1 className="text-3xl font-bold text-center tracking-tight">Coffee Log</h1>
        <p className="text-center text-amber-200 mt-1 text-sm">Track your brews</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-10">
        <div className="flex bg-amber-100 rounded-xl p-1 mb-6 shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-amber-900 text-amber-50 shadow'
                  : 'text-amber-800 hover:bg-amber-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <CoffeeLog method={activeTab} />
      </div>

      <footer className="bg-amber-900 text-amber-50 py-6 px-4 text-center shadow-inner">
        <p className="text-5xl">☕</p>
        <p className="text-amber-200 text-sm mt-1">Happy brewing</p>
      </footer>
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'

const EMPTY_FORM = {
  brand: '',
  dose: '',
  grindSize: '',
  waterOrYield: '',
  notes: '',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Field({ label, id, type = 'text', value, onChange, placeholder, unit }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-amber-900 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CoffeeLog({ method }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('coffee-log-entries')) ?? []
    } catch {
      return []
    }
  })
  const [expandedId, setExpandedId] = useState(null)
  const [formOpen, setFormOpen] = useState(true)
  const [ratiosOpen, setRatiosOpen] = useState(true)

  useEffect(() => {
    localStorage.setItem('coffee-log-entries', JSON.stringify(entries))
  }, [entries])

  const isEspresso = method === 'Espresso'

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const entry = { ...form, id: Date.now(), method, createdAt: new Date().toISOString() }
    setEntries((prev) => [entry, ...prev])
    setForm(EMPTY_FORM)
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const methodEntries = entries.filter((e) => e.method === method)

  return (
    <div className="space-y-6">
      {method === 'V60' && (
        <div className="bg-amber-100 rounded-2xl border border-amber-200 overflow-hidden">
          <button
            onClick={() => setRatiosOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-200/50 transition-colors"
          >
            <h2 className="text-base font-semibold text-amber-900">Recommended Ratios</h2>
            <svg className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${ratiosOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${ratiosOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { coffee: '15g', water: '240–255g' },
                    { coffee: '30g', water: '480g' },
                  ].map(({ coffee, water }) => (
                    <div key={coffee} className="bg-white rounded-xl px-4 py-3 border border-amber-200">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Coffee → Water</p>
                      <p className="text-sm font-semibold text-amber-900">{coffee} → {water}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === 'Espresso' && (
        <div className="bg-amber-100 rounded-2xl border border-amber-200 overflow-hidden">
          <button
            onClick={() => setRatiosOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-200/50 transition-colors"
          >
            <h2 className="text-base font-semibold text-amber-900">Recommended Ratios</h2>
            <svg className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${ratiosOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${ratiosOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="bg-white rounded-xl px-4 py-3 border border-amber-200 mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Coffee → Yield</p>
                  <p className="text-sm font-semibold text-amber-900">18g → 36g</p>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Brew Time by Roast</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { roast: 'Light', time: '30–35s' },
                    { roast: 'Medium', time: '25–30s' },
                    { roast: 'Dark', time: '20–25s' },
                  ].map(({ roast, time }) => (
                    <div key={roast} className="bg-white rounded-xl px-4 py-3 border border-amber-200">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{roast}</p>
                      <p className="text-sm font-semibold text-amber-900">{time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === 'Moccamaster' && (
        <div className="bg-amber-100 rounded-2xl border border-amber-200 overflow-hidden">
          <button
            onClick={() => setRatiosOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-200/50 transition-colors"
          >
            <h2 className="text-base font-semibold text-amber-900">Recommended Ratios</h2>
            <svg className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${ratiosOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${ratiosOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { coffee: '45g', water: '720g' },
                    { coffee: '30g', water: '480g' },
                    { coffee: '20g', water: '340g' },
                  ].map(({ coffee, water }) => (
                    <div key={coffee} className="bg-white rounded-xl px-4 py-3 border border-amber-200">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Coffee → Water</p>
                      <p className="text-sm font-semibold text-amber-900">{coffee} → {water}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <button
          onClick={() => setFormOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-amber-900">New {method} Brew</h2>
          <svg
            className={`w-5 h-5 text-amber-600 transition-transform ${formOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${formOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
        <div className="px-5 pb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Coffee Brand / Type"
            id="brand"
            value={form.brand}
            onChange={set('brand')}
            placeholder="e.g. Onyx, Light roast Ethiopia"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Coffee Dose"
              id="dose"
              value={form.dose}
              onChange={set('dose')}
              placeholder="20"
              unit="g"
            />
            <Field
              label="Grind Size"
              id="grindSize"
              value={form.grindSize}
              onChange={set('grindSize')}
              placeholder={isEspresso ? '18" (fine)" ' : '25 (medium)'}
            />
          </div>
          <Field
            label={isEspresso ? 'Yield' : 'Water Dose'}
            id="waterOrYield"
            value={form.waterOrYield}
            onChange={set('waterOrYield')}
            placeholder={isEspresso ? '40' : '300'}
            unit="g"
          />
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-amber-900 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Tasting notes, adjustments, observations..."
              rows={3}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-900 text-amber-50 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-800 active:bg-amber-950 transition-colors"
          >
            Save Brew
          </button>
        </form>
        </div>
        </div>
        </div>
      </div>

      {methodEntries.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-amber-900 mb-3">
            {method} History ({methodEntries.length})
          </h2>
          <div className="space-y-2">
            {methodEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {entry.brand || 'Unnamed brew'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                      {entry.dose}g coffee
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedId === entry.id && (
                  <div className="px-4 pb-4 border-t border-amber-50">
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide">Coffee Dose</dt>
                        <dd className="mt-0.5 font-medium text-gray-700">{entry.dose || '—'} g</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide">Grind Size</dt>
                        <dd className="mt-0.5 font-medium text-gray-700">{entry.grindSize || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide">
                          {isEspresso ? 'Yield' : 'Water Dose'}
                        </dt>
                        <dd className="mt-0.5 font-medium text-gray-700">
                          {entry.waterOrYield || '—'} g
                        </dd>
                      </div>
                    </dl>
                    {entry.notes && (
                      <div className="mt-3">
                        <dt className="text-xs text-gray-400 uppercase tracking-wide">Notes</dt>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{entry.notes}</p>
                      </div>
                    )}
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="mt-4 text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete entry
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {methodEntries.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">☕</p>
          <p className="text-sm">No {method} brews logged yet.</p>
        </div>
      )}
    </div>
  )
}

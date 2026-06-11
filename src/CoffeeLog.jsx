import { useState, useEffect } from 'react'
import { Scale, SlidersHorizontal, Droplets, Calendar, FileText, Star, Plus, BarChart2, Pencil, Copy, Trash2, Coffee } from 'lucide-react'

const emptyForm = () => ({
  brand: '',
  dose: '',
  grindSize: '',
  waterOrYield: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
  rating: 0,
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Field({ label, id, type = 'text', value, onChange, placeholder, unit, icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-md border border-stone-600 bg-stone-700 px-3 py-2 text-sm text-amber-50 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-xl'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star === value ? 0 : star)}
          className={`${sizeClass} leading-none transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= value ? 'text-amber-500' : readonly ? 'text-stone-700' : 'text-stone-600 hover:text-amber-400'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.25em]">{children}</span>
      <div className="flex-1 h-px bg-stone-700" />
    </div>
  )
}

function CollapsibleCard({ title, open, onToggle, accent, icon: Icon, children }) {
  return (
    <div className={`rounded-xl overflow-hidden bg-stone-800 border border-stone-700 ${accent ? 'border-l-4 border-l-amber-500' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-700/50 transition-colors"
      >
        <h2 className={`flex items-center gap-2 font-bold uppercase tracking-wider ${accent ? 'text-xs text-amber-500' : 'text-sm text-amber-50'}`}>
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </h2>
        <Chevron open={open} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function RatioCard({ label, value }) {
  return (
    <div className="bg-stone-900 rounded-lg px-4 py-3 border border-stone-700">
      <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold text-amber-50">{value}</p>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest' },
  { value: 'date-asc', label: 'Oldest' },
  { value: 'brand', label: 'Brand A–Z' },
  { value: 'rating', label: 'Top Rated' },
]

export default function CoffeeLog({ method }) {
  const [form, setForm] = useState(emptyForm)
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('coffee-log-entries')) ?? []
    } catch {
      return []
    }
  })
  const [expandedId, setExpandedId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [ratiosOpen, setRatiosOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem('coffee-log-entries', JSON.stringify(entries))
  }, [entries])

  const isEspresso = method === 'Espresso'

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) => (entry.id === editingId ? { ...entry, ...form, method } : entry))
      )
      setEditingId(null)
      setFormOpen(false)
    } else {
      const newId = Date.now()
      setEntries((prev) => [{ ...form, id: newId, method }, ...prev])
      setFormOpen(false)
      setExpandedId(newId)
    }
    setForm(emptyForm())
  }

  function handleEdit(entry) {
    setForm({
      brand: entry.brand || '',
      dose: entry.dose || '',
      grindSize: entry.grindSize || '',
      waterOrYield: entry.waterOrYield || '',
      notes: entry.notes || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      rating: entry.rating || 0,
    })
    setEditingId(entry.id)
    setFormOpen(true)
    setExpandedId(null)
  }

  function handleDuplicate(entry) {
    setForm({
      brand: entry.brand || '',
      dose: entry.dose || '',
      grindSize: entry.grindSize || '',
      waterOrYield: entry.waterOrYield || '',
      notes: entry.notes || '',
      date: new Date().toISOString().split('T')[0],
      rating: 0,
    })
    setEditingId(null)
    setFormOpen(true)
    setExpandedId(null)
  }

  function cancelEdit() {
    setForm(emptyForm())
    setEditingId(null)
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) cancelEdit()
  }

  const allMethodEntries = entries.filter((e) => e.method === method)

  const methodEntries = allMethodEntries
    .filter((e) => !searchQuery || (e.brand || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
      if (sortBy === 'date-asc') return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0)
      if (sortBy === 'brand') return (a.brand || '').localeCompare(b.brand || '')
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return 0
    })

  return (
    <div className="space-y-4">
      {method === 'V60' && (
        <CollapsibleCard title="Recommended Ratios" open={ratiosOpen} onToggle={() => setRatiosOpen((o) => !o)} accent icon={BarChart2}>
          <div className="grid grid-cols-2 gap-3">
            <RatioCard label="Coffee → Water" value="15g → 240–255g" />
            <RatioCard label="Coffee → Water" value="30g → 480g" />
          </div>
        </CollapsibleCard>
      )}

      {method === 'Espresso' && (
        <CollapsibleCard title="Recommended Ratios" open={ratiosOpen} onToggle={() => setRatiosOpen((o) => !o)} accent icon={BarChart2}>
          <RatioCard label="Coffee → Yield" value="18g → 36g" />
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-4 mb-2">Brew Time by Roast</p>
          <div className="grid grid-cols-3 gap-3">
            <RatioCard label="Light" value="30–35s" />
            <RatioCard label="Medium" value="25–30s" />
            <RatioCard label="Dark" value="20–25s" />
          </div>
        </CollapsibleCard>
      )}

      {method === 'Moccamaster' && (
        <CollapsibleCard title="Recommended Ratios" open={ratiosOpen} onToggle={() => setRatiosOpen((o) => !o)} accent icon={BarChart2}>
          <div className="grid grid-cols-3 gap-3">
            <RatioCard label="Coffee → Water" value="45g → 720g" />
            <RatioCard label="Coffee → Water" value="30g → 480g" />
            <RatioCard label="Coffee → Water" value="20g → 340g" />
          </div>
        </CollapsibleCard>
      )}

      <CollapsibleCard
        title={editingId ? 'Edit Brew' : `New ${method} Brew`}
        open={formOpen}
        onToggle={() => { setFormOpen((o) => !o); if (editingId) cancelEdit() }}
        icon={editingId ? Pencil : Plus}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" id="date" type="date" value={form.date} onChange={set('date')} icon={Calendar} />
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1.5"><Star className="w-3.5 h-3.5" />Rating</label>
              <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>
          </div>
          <Field label="Coffee Brand / Type" id="brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Onyx, Light roast Ethiopia" icon={Coffee} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Coffee Dose" id="dose" value={form.dose} onChange={set('dose')} placeholder="20" unit="g" icon={Scale} />
            <Field label="Grind Size" id="grindSize" value={form.grindSize} onChange={set('grindSize')} placeholder={isEspresso ? '18 (fine)' : '25 (medium)'} icon={SlidersHorizontal} />
          </div>
          <Field
            label={isEspresso ? 'Yield' : 'Water Dose'}
            id="waterOrYield"
            value={form.waterOrYield}
            onChange={set('waterOrYield')}
            placeholder={isEspresso ? '40' : '300'}
            unit="g"
            icon={Droplets}
          />
          <div>
            <label htmlFor="notes" className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1.5"><FileText className="w-3.5 h-3.5" />Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Tasting notes, adjustments, observations..."
              rows={3}
              className="w-full rounded-md border border-stone-600 bg-stone-700 px-3 py-2 text-sm text-amber-50 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 text-stone-900 py-2.5 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-amber-400 active:bg-amber-600 transition-colors"
            >
              {editingId ? 'Update Brew' : 'Save Brew'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2.5 rounded-md text-sm font-bold uppercase tracking-wider text-stone-400 border border-stone-600 hover:bg-stone-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </CollapsibleCard>

      {allMethodEntries.length > 0 && (
        <div>
          <SectionLabel>{method} History ({allMethodEntries.length})</SectionLabel>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand..."
              className="flex-1 rounded-md border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-amber-50 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-md border border-stone-600 bg-stone-800 pl-3 pr-8 py-2 text-sm text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {methodEntries.length === 0 && (
            <p className="text-center text-sm text-stone-500 py-4">No brews match your search.</p>
          )}

          <div className="space-y-2">
            {methodEntries.map((entry) => (
              <div key={entry.id} className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-700/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div>
                    <p className="font-bold text-amber-50 text-sm">{entry.brand || 'Unnamed brew'}</p>
                    <p className="text-xs text-stone-500 mt-0.5 uppercase tracking-wide">{formatDate(entry.date || entry.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.rating > 0 && <StarRating value={entry.rating} onChange={() => {}} readonly size="sm" />}
                    <span className="text-xs text-amber-500 font-bold bg-stone-700 px-2 py-0.5 rounded">
                      {entry.dose}g
                    </span>
                    <svg
                      className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${expandedId === entry.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedId === entry.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-stone-700">
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <dt className="text-xs text-stone-500 uppercase tracking-wider">Coffee Dose</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-amber-50">{entry.dose || '—'} g</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-stone-500 uppercase tracking-wider">Grind Size</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-amber-50">{entry.grindSize || '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-stone-500 uppercase tracking-wider">{isEspresso ? 'Yield' : 'Water Dose'}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-amber-50">{entry.waterOrYield || '—'} g</dd>
                        </div>
                        {entry.rating > 0 && (
                          <div>
                            <dt className="text-xs text-stone-500 uppercase tracking-wider">Rating</dt>
                            <dd className="mt-1"><StarRating value={entry.rating} onChange={() => {}} readonly /></dd>
                          </div>
                        )}
                      </dl>
                      {entry.notes && (
                        <div className="mt-3">
                          <p className="text-xs text-stone-500 uppercase tracking-wider">Notes</p>
                          <p className="mt-1 text-sm text-stone-300 whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-stone-700">
                        <button onClick={() => handleEdit(entry)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-300 hover:bg-stone-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />Edit
                        </button>
                        <button onClick={() => handleDuplicate(entry)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-300 hover:bg-stone-700 transition-colors">
                          <Copy className="w-3.5 h-3.5" />Duplicate
                        </button>
                        <button onClick={() => deleteEntry(entry.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:bg-stone-700 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allMethodEntries.length === 0 && (
        <div className="text-center py-12 text-stone-600">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-xs uppercase tracking-[0.25em]">No {method} brews logged yet</p>
        </div>
      )}
    </div>
  )
}

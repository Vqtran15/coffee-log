import { useState, useEffect } from 'react'
import { Scale, SlidersHorizontal, Droplets, Calendar, FileText, Star, Plus, BarChart2, Pencil, Copy, Trash2, Coffee, Bean, Timer } from 'lucide-react'
import { supabase } from './supabase'

function toEntry(row) {
  return {
    id: row.id,
    method: row.method,
    brand: row.brand ?? '',
    coffeeType: row.coffee_type ?? '',
    dose: row.dose ?? '',
    grindSize: row.grind_size ?? '',
    waterOrYield: row.water_or_yield ?? '',
    brewTime: row.brew_time ?? '',
    notes: row.notes ?? '',
    date: row.date ?? '',
    rating: row.rating ?? 0,
    createdAt: row.created_at,
  }
}

function toRow(form, method) {
  return {
    method,
    brand: form.brand,
    coffee_type: form.coffeeType,
    dose: form.dose,
    grind_size: form.grindSize,
    water_or_yield: form.waterOrYield,
    brew_time: form.brewTime || null,
    notes: form.notes,
    date: form.date || null,
    rating: form.rating,
  }
}

const emptyForm = () => ({
  brand: '',
  coffeeType: '',
  dose: '',
  grindSize: '',
  waterOrYield: '',
  brewTime: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
  rating: 0,
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today - entryDay) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}


function Field({ label, id, type = 'text', value, onChange, placeholder, unit, icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5">
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
          className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brew-700 pointer-events-none">
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
      {[1, 2, 3, 4, 5].map((star) =>
        readonly ? (
          <span
            key={star}
            className={`${sizeClass} leading-none ${star <= value ? 'text-tan-50' : 'text-brew-700'}`}
          >★</span>
        ) : (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            className={`${sizeClass} leading-none transition-colors cursor-pointer ${
              star <= value ? 'text-tan-50' : 'text-brew-600 hover:text-tan-400'
            }`}
          >★</button>
        )
      )}
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-brew-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold text-brew-900 uppercase tracking-[0.25em]">{children}</span>
      <div className="flex-1 h-px bg-brew-700" />
    </div>
  )
}

function CollapsibleCard({ title, open, onToggle, accent, icon: Icon, children }) {
  return (
    <div className={`rounded-xl overflow-hidden bg-brew-800 border border-brew-700/60 shadow-warm ${accent ? 'border-l-4 border-l-tan-500' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-brew-700/50 transition-colors"
      >
        <h2 className={`flex items-center gap-2 font-bold uppercase tracking-wider ${accent ? 'text-xs text-tan-50' : 'text-sm text-tan-50'}`}>
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

function DeleteModal({ entry, onConfirm, onCancel }) {
  const [isClosing, setIsClosing] = useState(false)
  function close() { setIsClosing(true); setTimeout(onCancel, 150) }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md ${isClosing ? 'backdrop-exit' : 'backdrop-enter'}`} onClick={close} />
      <div className={`relative bg-brew-800 border border-brew-700 rounded-2xl p-6 w-full max-w-sm shadow-xl ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-tan-50 font-bold text-center text-base uppercase tracking-wider mb-1">Delete Brew?</h3>
        <p className="text-brew-400 text-sm text-center mb-6">
          <span className="text-tan-300 font-semibold">{[entry.brand, entry.coffeeType].filter(Boolean).join(' · ') || 'Unnamed brew'}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wide text-tan-50 bg-brew-900 hover:bg-brew-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wide text-white bg-red-600 hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function BrewFormModal({ title, form, setForm, onSubmit, onCancel, hasBrewTime, editingId, isSaving, isDuplicate }) {
  const [isClosing, setIsClosing] = useState(false)
  function close() { setIsClosing(true); setTimeout(onCancel, 150) }
  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md ${isClosing ? 'backdrop-exit' : 'backdrop-enter'}`} onClick={close} />
      <div className={`relative bg-brew-800 border border-brew-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
        <div className="sticky top-0 bg-brew-800 border-b border-brew-700 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="flex items-center gap-2 text-sm font-bold text-tan-50 uppercase tracking-wider">
            {editingId ? <Pencil className="w-4 h-4 text-tan-50" /> : isDuplicate ? <Copy className="w-4 h-4 text-tan-50" /> : <Plus className="w-4 h-4 text-tan-50" />}
            {title}
          </h2>
          <button onClick={close} className="text-brew-400 hover:text-tan-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" id="modal-brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Onyx" icon={Coffee} />
            <Field label="Type" id="modal-coffeeType" value={form.coffeeType} onChange={set('coffeeType')} placeholder="e.g. Light Ethiopia" icon={Coffee} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" id="modal-date" type="date" value={form.date} onChange={set('date')} icon={Calendar} />
            <div className="flex flex-col">
              <label className="flex items-center gap-1.5 text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5"><Star className="w-3.5 h-3.5" />Rating</label>
              <div className="flex-1 flex items-center">
                <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Coffee Dose" id="modal-dose" value={form.dose} onChange={set('dose')} placeholder="20" icon={Scale} />
            <Field label="Grind Size" id="modal-grindSize" value={form.grindSize} onChange={set('grindSize')} placeholder={hasBrewTime ? '18 (fine)' : '25 (medium)'} icon={SlidersHorizontal} />
          </div>
          {hasBrewTime ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Yield" id="modal-waterOrYield" value={form.waterOrYield} onChange={set('waterOrYield')} placeholder="40" icon={Droplets} />
              <Field label="Time" id="modal-brewTime" value={form.brewTime} onChange={set('brewTime')} placeholder="28" icon={Timer} />
            </div>
          ) : (
            <Field label="Water Dose" id="modal-waterOrYield" value={form.waterOrYield} onChange={set('waterOrYield')} placeholder="300" icon={Droplets} />
          )}
          <div>
            <label htmlFor="modal-notes" className="flex items-center gap-1.5 text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5"><FileText className="w-3.5 h-3.5" />Notes</label>
            <textarea
              id="modal-notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Tasting notes, adjustments, observations..."
              rows={3}
              className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div className="flex gap-2 pb-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-brew-950 text-brew-900 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-brew-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : editingId ? 'Update Brew' : 'Save Brew'}
            </button>
            <button
              type="button"
              onClick={close}
              className="px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wider text-brew-400 border border-brew-600 hover:bg-brew-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RatioCard({ label, value }) {
  return (
    <div className="bg-brew-900 rounded-lg px-4 py-3 border border-brew-700">
      <p className="text-xs text-brew-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold text-tan-50">{value}</p>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest' },
  { value: 'date-asc', label: 'Oldest' },
  { value: 'brand', label: 'Brand A–Z' },
  { value: 'rating', label: 'Top Rated' },
]

export default function CoffeeLog({ category }) {
  const [form, setForm] = useState(emptyForm)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [animatingInitial, setAnimatingInitial] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [ratiosOpen, setRatiosOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [recentlyAddedId, setRecentlyAddedId] = useState(null)
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => {
    supabase.from('brews').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) console.error('Failed to load brews:', error)
      else setEntries((data ?? []).map(toEntry))
      setLoading(false)
      setAnimatingInitial(true)
      setTimeout(() => setAnimatingInitial(false), 1500)
    })
  }, [])

  const method = category.name
  const hasBrewTime = category.has_brew_time

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function doSave() {
    setIsSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from('brews').update(toRow(form, method)).eq('id', editingId)
        if (error) throw error
        setEntries((prev) =>
          prev.map((entry) => (entry.id === editingId ? { ...entry, ...form, method } : entry))
        )
        setExpandedId(editingId)
        setRecentlyUpdatedId(editingId)
        setTimeout(() => setRecentlyUpdatedId(null), 750)
        setEditingId(null)
        setModalOpen(false)
      } else {
        const { data, error } = await supabase.from('brews').insert(toRow(form, method)).select().single()
        if (error) throw error
        const newEntry = toEntry(data)
        setEntries((prev) => [newEntry, ...prev])
        setModalOpen(false)
        setExpandedId(newEntry.id)
        setRecentlyAddedId(newEntry.id)
        setTimeout(() => {
          setRecentlyAddedId(null)
          setRecentlyUpdatedId(newEntry.id)
          setTimeout(() => setRecentlyUpdatedId(null), 750)
        }, 350)
      }
      setForm(emptyForm())
    } catch (err) {
      console.error('Failed to save brew:', err)
    } finally {
      setIsSaving(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    doSave()
  }

  function handleEdit(entry) {
    setForm({
      brand: entry.brand || '',
      coffeeType: entry.coffeeType || '',
      dose: entry.dose || '',
      grindSize: entry.grindSize || '',
      waterOrYield: entry.waterOrYield || '',
      brewTime: entry.brewTime || '',
      notes: entry.notes || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      rating: entry.rating || 0,
    })
    setEditingId(entry.id)
    setModalOpen(true)
  }

  function handleDuplicate(entry) {
    setForm({
      brand: entry.brand || '',
      coffeeType: entry.coffeeType || '',
      dose: entry.dose || '',
      grindSize: entry.grindSize || '',
      waterOrYield: entry.waterOrYield || '',
      brewTime: entry.brewTime || '',
      notes: entry.notes || '',
      date: new Date().toISOString().split('T')[0],
      rating: 0,
    })
    setEditingId(null)
    setIsDuplicate(true)
    setModalOpen(true)
    setExpandedId(null)
  }

  function cancelEdit() {
    setForm(emptyForm())
    setEditingId(null)
    setIsDuplicate(false)
    setModalOpen(false)
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('brews').delete().eq('id', id)
    if (error) { console.error('Failed to delete brew:', error); return }
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) cancelEdit()
  }

  function startDelete(id) {
    setDeleteConfirmId(null)
    setDeletingId(id)
    setTimeout(() => {
      deleteEntry(id)
      setDeletingId(null)
    }, 220)
  }

  const allMethodEntries = entries.filter((e) => e.method === method)

  const methodEntries = allMethodEntries
    .filter((e) => !searchQuery || `${e.brand} ${e.coffeeType}`.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
      if (sortBy === 'date-asc') return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0)
      if (sortBy === 'brand') return (a.brand || '').localeCompare(b.brand || '')
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return 0
    })

  return (
    <>
    <div className="tab-enter space-y-4">
      <CollapsibleCard title="Recommended Ratios" open={ratiosOpen} onToggle={() => setRatiosOpen((o) => !o)} accent icon={BarChart2}>
        <div className="grid grid-cols-2 gap-3">
          <RatioCard label="Ratio" value={`1 : ${category.ratio_water}`} />
          <RatioCard
            label={hasBrewTime ? 'Coffee → Yield' : 'Coffee → Water'}
            value={`${category.ratio_coffee * 18}g → ${category.ratio_water * 18}g`}
          />
        </div>
        {hasBrewTime && (
          <>
            <p className="text-xs font-bold text-tan-50 uppercase tracking-wider mt-4 mb-2">Brew Time by Roast</p>
            <div className="grid grid-cols-3 gap-3">
              <RatioCard label="Light" value="30–35s" />
              <RatioCard label="Medium" value="25–30s" />
              <RatioCard label="Dark" value="20–25s" />
            </div>
          </>
        )}
      </CollapsibleCard>

      {allMethodEntries.length > 0 && (
        <div>
          <SectionLabel>{method} Log</SectionLabel>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand..."
              className="flex-1 rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
            />
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-md border border-brew-600 bg-brew-800 pl-3 pr-8 py-2 text-sm text-tan-50 focus:outline-none focus:ring-2 focus:ring-tan-500 transition"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brew-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {methodEntries.length === 0 && (
            <p className="text-center text-sm text-brew-900 py-4">No brews match your search.</p>
          )}

          <div className="space-y-2">
            {methodEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`bg-brew-800 rounded-xl border border-brew-700/60 shadow-warm overflow-hidden ${recentlyAddedId === entry.id ? 'entry-enter' : ''} ${deletingId === entry.id ? 'entry-exit' : ''} ${recentlyUpdatedId === entry.id ? 'entry-flash' : ''} ${animatingInitial ? 'log-entry-in' : ''}`}
                style={animatingInitial ? { animationDelay: `${index * 50}ms` } : {}}
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brew-700/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div>
                    <p className="font-bold text-tan-50 text-sm">{[entry.brand, entry.coffeeType].filter(Boolean).join(' · ') || 'Unnamed brew'}</p>
                    <p className="text-xs text-brew-500 mt-0.5 uppercase tracking-wide">{formatDate(entry.date || entry.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.rating > 0 && <StarRating value={entry.rating} onChange={() => {}} readonly size="sm" />}
                    <span className="flex items-center gap-1 text-xs text-brew-900 font-bold bg-brew-950 px-2 py-0.5 rounded">
                      <Bean className="w-3 h-3" />{entry.dose}
                    </span>
                    <svg
                      className={`w-4 h-4 text-brew-500 transition-transform duration-300 ${expandedId === entry.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedId === entry.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-brew-700">
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <dt className="text-xs text-brew-500 uppercase tracking-wider">Coffee Dose</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-tan-50">{entry.dose || '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-brew-500 uppercase tracking-wider">Grind Size</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-tan-50">{entry.grindSize || '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-brew-500 uppercase tracking-wider">{hasBrewTime ? 'Yield' : 'Water Dose'}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-tan-50">{entry.waterOrYield || '—'}</dd>
                        </div>
                        {hasBrewTime && (
                          <div>
                            <dt className="text-xs text-brew-500 uppercase tracking-wider">Brew Time</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-tan-50">{entry.brewTime || '—'}</dd>
                          </div>
                        )}
                        {entry.rating > 0 && (
                          <div>
                            <dt className="text-xs text-brew-500 uppercase tracking-wider">Rating</dt>
                            <dd className="mt-1"><StarRating value={entry.rating} onChange={() => {}} readonly /></dd>
                          </div>
                        )}
                      </dl>
                      {entry.notes && (
                        <div className="mt-3">
                          <p className="text-xs text-brew-500 uppercase tracking-wider">Notes</p>
                          <p className="mt-1 text-sm text-brew-300 whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-brew-700">
                        <button onClick={() => handleEdit(entry)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-tan-50 hover:text-brew-400 hover:bg-brew-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />Edit
                        </button>
                        <button onClick={() => handleDuplicate(entry)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-tan-50 hover:text-brew-400 hover:bg-brew-700 transition-colors">
                          <Copy className="w-3.5 h-3.5" />Duplicate
                        </button>
                        <button onClick={() => setDeleteConfirmId(entry.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:bg-brew-700 transition-colors">
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


      {loading && (
        <p className="text-center text-xs uppercase tracking-[0.25em] text-brew-900 py-12 animate-pulse">Brewing…</p>
      )}

      {!loading && allMethodEntries.length === 0 && (
        <div className="text-center py-12 text-brew-900">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-xs uppercase tracking-[0.25em]">No {method} brews in the log yet</p>
        </div>
      )}
    </div>

      <div
        className="fixed right-5 z-[55]"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}
      >
        <button
          onClick={() => { setForm(emptyForm()); setEditingId(null); setIsDuplicate(false); setModalOpen(true) }}
          className="fab-enter w-14 h-14 rounded-full bg-tan-500 text-brew-900 shadow-lg shadow-tan-500/30 flex items-center justify-center hover:bg-tan-400 active:scale-95 transition-all"
          aria-label="New brew"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {modalOpen && (
        <BrewFormModal
          title={editingId ? 'Edit Brew' : isDuplicate ? 'Duplicate Brew' : 'New Brew'}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          hasBrewTime={hasBrewTime}
          editingId={editingId}
          isSaving={isSaving}
          isDuplicate={isDuplicate}
        />
      )}

      {deleteConfirmId && (
        <DeleteModal
          entry={entries.find((e) => e.id === deleteConfirmId)}
          onConfirm={() => startDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

    </>
  )
}

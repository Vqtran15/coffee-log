import { useState } from 'react'
import { X, Plus, Trash2, ChevronUp, ChevronDown, LogOut, Settings, AlertTriangle } from 'lucide-react'
import { supabase } from './supabase'
import { ICON_OPTIONS } from './icons'

const emptyNew = () => ({
  name: '',
  icon_name: 'Coffee',
  has_brew_time: false,
  ratio_coffee: '1',
  ratio_water: '15',
})

export default function SettingsModal({ isOpen, onClose, categories, onCategoriesChange, onSignOut }) {
  const [addingNew, setAddingNew] = useState(false)
  const [newCat, setNewCat] = useState(emptyNew())
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  if (!isOpen) return null

  function setField(field) {
    return (e) => setNewCat((f) => ({ ...f, [field]: e.target ? e.target.value : e }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newCat.name.trim()) return
    setSaving(true)
    try {
      const { data, error } = await supabase.from('brew_categories').insert({
        name: newCat.name.trim(),
        icon_name: newCat.icon_name,
        has_brew_time: newCat.has_brew_time,
        ratio_coffee: parseFloat(newCat.ratio_coffee) || 1,
        ratio_water: parseFloat(newCat.ratio_water) || 15,
        position: categories.length,
      }).select().single()
      if (error) throw error
      onCategoriesChange([...categories, data])
      setNewCat(emptyNew())
      setAddingNew(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(id) {
    const updated = categories
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, position: i }))
    await Promise.all([
      supabase.from('brew_categories').delete().eq('id', id),
      ...updated.map((c) =>
        supabase.from('brew_categories').update({ position: c.position }).eq('id', c.id)
      ),
    ])
    onCategoriesChange(updated)
    setConfirmDeleteId(null)
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    try {
      const { error } = await supabase.rpc('delete_current_user')
      if (error) throw error
      onSignOut()
    } catch (err) {
      console.error('Failed to delete account:', err)
      setDeletingAccount(false)
    }
  }

  async function move(index, dir) {
    const next = [...categories]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    const withPos = next.map((c, i) => ({ ...c, position: i }))
    await Promise.all(
      withPos.map((c) =>
        supabase.from('brew_categories').update({ position: c.position }).eq('id', c.id)
      )
    )
    onCategoriesChange(withPos)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md backdrop-enter" onClick={onClose} />
      <div className="relative bg-brew-900 border border-brew-600 rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-xl max-h-[85vh] flex flex-col modal-enter">

        <div className="sticky top-0 bg-brew-900 border-b border-brew-600 px-5 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
          <h2 className="flex items-center gap-2 text-sm font-bold text-tan-50 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            Settings
          </h2>
          <button onClick={onClose} className="text-tan-50/60 hover:text-tan-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">

          {/* Brew Categories */}
          <section>
            <p className="text-xs font-bold text-tan-50 uppercase tracking-[0.2em] mb-3">Brew Categories</p>

            <div className="space-y-2">
              {categories.map((cat, index) => {
                const { Icon } = ICON_OPTIONS.find((o) => o.name === cat.icon_name) || ICON_OPTIONS[1]
                return (
                  <div key={cat.id} className="flex items-center gap-2 bg-brew-700/30 rounded-xl px-3 py-2.5 border border-brew-600">
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="text-tan-50/50 hover:text-tan-50 disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === categories.length - 1}
                        className="text-tan-50/50 hover:text-tan-50 disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Icon className="w-4 h-4 text-tan-50 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-tan-50 truncate">{cat.name}</p>
                      <p className="text-xs text-brew-400">
                        {cat.has_brew_time ? 'Espresso · yield + time' : `Ratio 1:${cat.ratio_water}`}
                      </p>
                    </div>

                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-xs font-bold text-red-400 uppercase tracking-wide hover:text-red-300 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs font-bold text-tan-50/60 uppercase tracking-wide hover:text-tan-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="text-tan-50/40 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {addingNew ? (
              <form onSubmit={handleCreate} className="mt-3 bg-brew-700/30 rounded-xl border border-brew-600 p-4 space-y-4">
                <p className="text-xs font-bold text-tan-50 uppercase tracking-wider">New Category</p>

                <div>
                  <label className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    value={newCat.name}
                    onChange={setField('name')}
                    placeholder="e.g. AeroPress"
                    required
                    className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-2">Icon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewCat((f) => ({ ...f, icon_name: name }))}
                        className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-colors ${
                          newCat.icon_name === name
                            ? 'bg-brew-950 border-tan-500 text-brew-900'
                            : 'border-brew-600 text-tan-50/50 hover:text-tan-50 hover:border-brew-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-wide">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-2">Style</label>
                  <div className="flex bg-brew-900 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setNewCat((f) => ({ ...f, has_brew_time: false }))}
                      className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                        !newCat.has_brew_time ? 'bg-brew-950 text-brew-900' : 'text-tan-50/50 hover:text-tan-50'
                      }`}
                    >
                      Pour-over
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCat((f) => ({ ...f, has_brew_time: true }))}
                      className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                        newCat.has_brew_time ? 'bg-brew-950 text-brew-900' : 'text-tan-50/50 hover:text-tan-50'
                      }`}
                    >
                      Espresso
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-2">
                    Recommended Ratio
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={newCat.ratio_coffee}
                      onChange={setField('ratio_coffee')}
                      min="0.1"
                      step="0.1"
                      className="w-16 text-center rounded-md border border-brew-600 bg-brew-950 px-2 py-2 text-sm text-brew-900 focus:outline-none focus:ring-2 focus:ring-tan-500 transition"
                    />
                    <span className="text-tan-50 font-bold text-lg">:</span>
                    <input
                      type="number"
                      value={newCat.ratio_water}
                      onChange={setField('ratio_water')}
                      min="0.1"
                      step="0.1"
                      className="w-16 text-center rounded-md border border-brew-600 bg-brew-950 px-2 py-2 text-sm text-brew-900 focus:outline-none focus:ring-2 focus:ring-tan-500 transition"
                    />
                    <span className="text-brew-400 text-xs">coffee : {newCat.has_brew_time ? 'yield' : 'water'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brew-950 text-brew-900 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-brew-300 transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingNew(false); setNewCat(emptyNew()) }}
                    className="px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-tan-50/60 border border-brew-600 hover:text-tan-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-tan-50/30 text-xs font-bold text-tan-50/50 uppercase tracking-wider hover:text-tan-50 hover:border-tan-50/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            )}
          </section>

          <div className="h-px bg-brew-600/40" />

          {/* Account */}
          <section>
            <p className="text-xs font-bold text-tan-50 uppercase tracking-[0.2em] mb-3">Account</p>

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-tan-50/70 border border-brew-600 hover:text-tan-50 hover:border-brew-400 uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <div className="mt-3 pt-3 border-t border-brew-600/40">
              {confirmDeleteAccount ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">This cannot be undone</p>
                  </div>
                  <p className="text-xs text-brew-400">All your brews, categories, and account data will be permanently deleted.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-colors disabled:opacity-60"
                    >
                      {deletingAccount ? 'Deleting…' : 'Yes, delete forever'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAccount(false)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide text-tan-50/60 border border-brew-600 hover:text-tan-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteAccount(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold text-red-400/60 border border-red-500/20 hover:text-red-400 hover:border-red-500/50 uppercase tracking-wider transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

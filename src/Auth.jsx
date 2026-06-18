import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function switchMode(next) {
    setMode(next)
    setError('')
    setMessage('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 40%, #EDD9B3 0%, #F0E6D3 55%, #C8AE8A 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/icon-512.svg" alt="" className="w-16 h-16 mx-auto mb-5 rounded-2xl shadow-warm" />
          <p className="text-brew-700 text-xs tracking-[0.35em] uppercase mb-1">Cool Beans</p>
          <h1 className="font-display text-7xl tracking-wide text-brew-900">Coffee Log</h1>
        </div>

        <div className="bg-brew-900 border border-brew-700 rounded-2xl overflow-hidden shadow-warm">
          <div className="h-1 bg-tan-500" />
          <div className="p-6">
          <div className="flex bg-brew-800 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'signin' ? 'bg-brew-950 text-brew-900' : 'text-brew-400 hover:text-tan-50'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'signup' ? 'bg-brew-950 text-brew-900' : 'text-brew-400 hover:text-tan-50'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-confirm" className="block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
                />
              </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {message && <p className="text-green-400 text-xs">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brew-950 text-brew-900 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-brew-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}

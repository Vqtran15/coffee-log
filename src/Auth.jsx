import { useState } from 'react'
import { supabase } from './supabase'

const INPUT_CLASS = "w-full rounded-md border border-brew-600 bg-brew-950 px-3 py-2 text-sm text-brew-900 placeholder-brew-700 focus:outline-none focus:ring-2 focus:ring-tan-500 focus:border-transparent transition"
const LABEL_CLASS = "block text-xs font-bold text-tan-50 uppercase tracking-wider mb-1.5"

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
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        if (password !== confirmPassword) { setError('Passwords do not match.'); return }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then sign in.')
        switchMode('signin')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setMessage('Password reset email sent. Check your inbox.')
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

            {mode !== 'forgot' && (
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
            )}

            {mode === 'forgot' && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-xs font-bold text-brew-400 hover:text-tan-50 uppercase tracking-wider transition-colors"
                >
                  ← Back to sign in
                </button>
                <p className="text-sm font-bold text-tan-50 mt-2">Reset Password</p>
                <p className="text-xs text-brew-400 mt-1">Enter your email and we'll send a reset link.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="auth-email" className={LABEL_CLASS}>Email</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="auth-password" className={LABEL_CLASS}>Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={INPUT_CLASS}
                  />
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="mt-1.5 text-xs text-brew-400 hover:text-tan-50 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-confirm" className={LABEL_CLASS}>Confirm Password</label>
                  <input
                    id="auth-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={INPUT_CLASS}
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
                {loading ? '…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

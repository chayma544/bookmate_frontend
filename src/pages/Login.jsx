import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ open, ...props }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.1 4.1M6.6 6.6C3.4 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.8 10.8 0 0 0 4.4-.9" />
      <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login({ email, password })
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#d8c5b3] bg-white py-3 pl-11 pr-4 text-ink placeholder:text-[#a8927c] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-shadow"

  return (
    <div className="min-h-screen bg-secondary lg:flex">

      {/* decorative panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1a1008] via-[#3a2517] to-[#7a3010] px-12 py-14 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,16,8,0.72),rgba(26,16,8,0.72)),repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_6px,rgba(255,255,255,0.02)_6px,rgba(255,255,255,0.02)_34px),repeating-linear-gradient(180deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_48px,transparent_48px,transparent_56px)]" />

        <div className="relative">
          <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-white">
            BookMate
          </Link>
        </div>

        <div className="relative max-w-md space-y-6">
          <span className="text-5xl leading-none text-[#f3e4d5]/60">&ldquo;</span>
          <p className="font-serif text-3xl italic leading-snug text-[#fdf4e7]">
            A reader lives a thousand lives before they die. The one who never reads lives only one.
          </p>
          <p className="text-sm uppercase tracking-[0.2em] text-[#f3e4d5]/70">George R. R. Martin</p>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-2xl font-bold">120+</p>
            <p className="text-xs text-[#f3e4d5]/80">books shared</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-2xl font-bold">48</p>
            <p className="text-xs text-[#f3e4d5]/80">active readers</p>
          </div>
        </div>
      </div>

      {/* form panel */}
      <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-2xl font-bold font-serif text-ink lg:hidden">
            BookMate
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-ink">Welcome back</h1>
            <p className="mt-2 text-sm text-[#6b5744]">Sign in to pick up right where you left off.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#efe0cf] bg-white p-7 shadow-soft">
            {error && (
              <div className="rounded-lg border border-[#f0c9b0] bg-[#fdf0e6] px-3 py-2 text-sm text-[#8b3a0f]">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8a7260]">Email</label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a8927c]" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8a7260]">Password</label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a8927c]" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8927c] hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 font-medium text-white shadow-soft transition-colors hover:bg-[#7a3010] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-[#6b5744]">
              New to BookMate?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

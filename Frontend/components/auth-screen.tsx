'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, MessageCircle, ShieldCheck } from 'lucide-react'

type AuthMode = 'sign-in' | 'sign-up'

interface AuthScreenProps {
  onContinue: () => void
}

export function AuthScreen({ onContinue }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isSignUp = mode === 'sign-up'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget as HTMLFormElement)
    const email = (form.get('email') as string) || ''
    const password = (form.get('password') as string) || ''

    const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

    try {
      if (isSignUp) {
        await fetch(`${apiBase}/auth/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            passwordConfirm: password,
            created_at: new Date().toISOString(),
          }),
        })

      }

      const res = await fetch(`${apiBase}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Authentication failed')
      }

      const data = await res.json()
      const token = data?.accessToken
      if (!token) throw new Error('No access token received')

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('accessToken', token)
      }

      setLoading(false)
      onContinue()
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'An error occurred')
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="auth-orbit" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Relay</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Secure workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Systems online
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="grid w-full max-w-5xl gap-14 lg:grid-cols-[1fr_420px] lg:items-center">
            <section className="hidden lg:block">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Relay / Identity protocol</p>
              <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.05em] text-foreground xl:text-7xl">
                Conversations that stay in sync.
              </h1>
              <p className="mt-7 max-w-md text-pretty text-base leading-7 text-muted-foreground">
                A focused space for fast-moving teams to keep every message, decision, and connection close at hand.
              </p>
              <div className="mt-10 flex flex-wrap gap-5 text-xs text-muted-foreground">
                {['Private by default', 'Real-time delivery', 'Built for teams'].map((item) => (
                  <span className="flex items-center gap-2" key={item}>
                    <Check className="h-3.5 w-3.5 text-primary" /> {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{isSignUp ? 'New identity' : 'Welcome back'}</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{isSignUp ? 'Create your account' : 'Sign in to Relay'}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignUp ? 'Set up your workspace access.' : 'Continue where your team left off.'}</p>
                </div>
                <ShieldCheck className="mt-1 h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mb-7 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Authentication mode">
                <button type="button" role="tab" aria-selected={!isSignUp} onClick={() => { setMode('sign-in'); setSubmitted(false) }} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${!isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Sign in</button>
                <button type="button" role="tab" aria-selected={isSignUp} onClick={() => { setMode('sign-up'); setSubmitted(false) }} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Sign up</button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && <label className="block"><span className="mb-2 block text-xs font-medium text-muted-foreground">Full name</span><input required name="name" autoComplete="name" placeholder="Alex Morgan" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></label>}
                <label className="block"><span className="mb-2 block text-xs font-medium text-muted-foreground">Email address</span><input required type="email" name="email" autoComplete="email" placeholder="you@company.com" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-muted-foreground">Password</span><span className="relative block"><input required minLength={8} type={showPassword ? 'text' : 'password'} name="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder="••••••••" className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
                {!isSignUp && <div className="flex justify-end"><button type="button" className="text-xs text-primary hover:underline">Forgot password?</button></div>}

                {error && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 border-t border-border pt-5 text-center">
                <p className="text-xs leading-5 text-muted-foreground">Your session token is stored locally in the browser after successful sign in.</p>
                <button type="button" onClick={onContinue} className="mt-3 text-xs font-medium text-primary hover:underline">Continue to chat demo</button>
              </div>
            </section>
          </div>
        </div>
        <footer className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground"><span>Relay / v0.1</span><span>Connection encrypted</span></footer>
      </div>
    </main>
  )
}

export default AuthScreen

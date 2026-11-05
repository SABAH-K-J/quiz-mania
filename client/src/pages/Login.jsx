import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Sparkles, Trophy, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert } from '../components/ui'

export default function Login() {
  useSEO('/login')

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await login({
      username: formData.username.trim(),
      password: formData.password,
    })

    if (result.success) {
      const next = location.state?.from
      navigate(next && next !== '/login' ? next : '/dashboard', { replace: true })
    } else {
      setError(typeof result.error === 'string' ? result.error : 'Login failed. Check your details and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="container-page animate-fade-in py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 shadow-card lg:grid-cols-[1fr_1.05fr]">
        {/* Story panel */}
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-primary-700/70 via-indigo-800/60 to-accent-pink/25 p-10 lg:flex">
          <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-secondary-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              <Zap size={14} aria-hidden="true" /> Quiz Mania
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Welcome back.
              <br />
              The scoreboard missed you.
            </h1>
            <p className="mt-4 max-w-sm text-primary-50/85">
              Pick up your drafts, publish a quiz, or jump into a game with a code.
            </p>
          </div>

          <ul className="relative mt-10 space-y-3 text-sm text-primary-50/90">
            <li className="flex items-center gap-3">
              <Sparkles size={18} className="text-secondary-300" aria-hidden="true" /> Build quizzes with three question types
            </li>
            <li className="flex items-center gap-3">
              <Trophy size={18} className="text-secondary-300" aria-hidden="true" /> Share one 8-character code
            </li>
          </ul>
        </aside>

        {/* Form panel */}
        <section className="bg-ink-900/80 p-6 sm:p-10" aria-labelledby="login-heading">
          <h2 id="login-heading" className="text-3xl font-extrabold">
            Log in
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No account yet?{' '}
            <Link to="/register" className="link">
              Create one free
            </Link>
            .
          </p>

          {error && (
            <Alert className="mt-6" tone="error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="input-field"
                placeholder="your-username"
                value={formData.username}
                onChange={handleChange}
                required
                aria-describedby="username-hint"
              />
              <p id="username-hint" className="hint">
                The username you signed up with.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-field pr-12"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              <LogIn size={19} aria-hidden="true" />
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Just here to play?{' '}
            <Link to="/quiz/join" className="link">
              Enter a quiz code
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}

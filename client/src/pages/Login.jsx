import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import AuthLayout from '../components/AuthLayout'
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
    <AuthLayout
      asideTitle="Returning host"
      code="08"
      title="Log in"
      intro="Pick up your drafts, publish a quiz, or jump into a game with a code."
      points={[
        'Build quizzes with three question types.',
        'Share one eight-character code.',
        'Every attempt lands in your dashboard.',
      ]}
    >
      <p className="mt-2 text-sm text-ink-600">
        No account yet?{' '}
        <Link to="/register" className="link">
          Create one free
        </Link>
        .
      </p>

      {error && (
        <Alert className="mt-5" tone="error">
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
              className="input-field pr-14"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border-2 border-transparent text-ink-600 transition hover:border-ink hover:bg-arena-100 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Logging in…' : 'Log in'}
          {!loading && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 border-t-2 border-ink/15 pt-4 text-sm text-ink-600">
        Just here to play?{' '}
        <Link to="/quiz/join" className="link">
          Enter a quiz code
        </Link>
        .
      </p>
    </AuthLayout>
  )
}

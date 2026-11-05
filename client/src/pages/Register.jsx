import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Trophy, UserPlus, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert } from '../components/ui'

function validate(values) {
  const errors = {}

  if (!values.username.trim()) errors.username = 'Pick a username.'
  else if (values.username.trim().length < 3) errors.username = 'Use at least 3 characters.'

  if (!values.email.trim()) errors.email = 'Add your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'That email looks incomplete.'

  if (!values.password) errors.password = 'Choose a password.'
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters.'

  if (values.password !== values.password2) errors.password2 = 'Passwords do not match.'

  return errors
}

function flattenServerErrors(data) {
  if (!data) return {}
  if (typeof data === 'string') return { non_field: data }
  if (Array.isArray(data)) return { non_field: data.join(' ') }

  const errors = {}
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) errors[key] = value.join(' ')
    else if (typeof value === 'string') errors[key] = value
  })
  return errors
}

export default function Register() {
  useSEO('/register')

  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined, non_field: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      password: formData.password,
      password2: formData.password2,
    })

    if (result.success) {
      navigate('/dashboard', { replace: true })
      return
    }

    const serverErrors = flattenServerErrors(result.error)
    setErrors(
      Object.keys(serverErrors).length > 0
        ? serverErrors
        : { non_field: 'We could not create your account. Please try again.' },
    )
    setLoading(false)
  }

  const fieldError = (name) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-rose-300">
        {errors[name]}
      </p>
    ) : null

  return (
    <main className="container-page animate-fade-in py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 shadow-card lg:grid-cols-[1fr_1.05fr]">
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-indigo-700/60 via-primary-700/60 to-accent-teal/20 p-10 lg:flex">
          <div className="absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-accent-teal/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              <Zap size={14} aria-hidden="true" /> Join free
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Your next quiz
              <br />
              starts here.
            </h1>
            <p className="mt-4 max-w-sm text-primary-50/85">
              One account for creating quizzes, playing with a code, and keeping every score in one place.
            </p>
          </div>

          <ul className="relative mt-10 space-y-3 text-sm text-primary-50/90">
            <li className="flex items-center gap-3">
              <Sparkles size={18} className="text-secondary-300" aria-hidden="true" /> Free forever — no card, no trial
            </li>
            <li className="flex items-center gap-3">
              <Trophy size={18} className="text-secondary-300" aria-hidden="true" /> Your results saved automatically
            </li>
          </ul>
        </aside>

        <section className="bg-ink-900/80 p-6 sm:p-10" aria-labelledby="register-heading">
          <h2 id="register-heading" className="text-3xl font-extrabold">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Already have one?{' '}
            <Link to="/login" className="link">
              Log in
            </Link>
            .
          </p>

          {errors.non_field && (
            <Alert className="mt-6" tone="error">
              {errors.non_field}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="label">
                  First name <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  className="input-field"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="label">
                  Last name <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  className="input-field"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                placeholder="quiz-hero"
                value={formData.username}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'username-error' : 'username-hint'}
              />
              {errors.username ? fieldError('username') : <p id="username-hint" className="hint">This is what other players see.</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {fieldError('email')}
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
                  autoComplete="new-password"
                  className="input-field pr-12"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
              {errors.password ? fieldError('password') : <p id="password-hint" className="hint">Use 8+ characters. Avoid common passwords.</p>}
            </div>

            <div>
              <label htmlFor="password2" className="label">
                Confirm password
              </label>
              <input
                id="password2"
                name="password2"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="input-field"
                placeholder="Type it again"
                value={formData.password2}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.password2)}
                aria-describedby={errors.password2 ? 'password2-error' : undefined}
              />
              {fieldError('password2')}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              <UserPlus size={19} aria-hidden="true" />
              {loading ? 'Creating your account…' : 'Create free account'}
            </button>

            <p className="text-xs leading-relaxed text-slate-500">
              By creating an account you agree to use Quiz Mania respectfully. Quizzes you publish are visible to
              anyone with the code.
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}

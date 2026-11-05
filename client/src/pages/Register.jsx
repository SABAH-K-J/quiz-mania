import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import AuthLayout from '../components/AuthLayout'
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
      <p id={`${name}-error`} className="mt-1.5 text-xs font-semibold text-signal-red-dark">
        {errors[name]}
      </p>
    ) : null

  return (
    <AuthLayout
      asideTitle="New host"
      code="01"
      title="Create account"
      intro="One account for creating quizzes, playing with a code, and keeping every score in one place."
      points={[
        'Free forever. No card, no trial.',
        'Your results saved automatically.',
        'Publish when the quiz is ready.',
      ]}
    >
      <p className="mt-2 text-sm text-ink-600">
        Already have one?{' '}
        <Link to="/login" className="link">
          Log in
        </Link>
        .
      </p>

      {errors.non_field && (
        <Alert className="mt-5" tone="error">
          {errors.non_field}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="label">
              First name <span className="font-body font-normal normal-case tracking-normal text-ink-500">(optional)</span>
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
              Last name <span className="font-body font-normal normal-case tracking-normal text-ink-500">(optional)</span>
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
          {errors.username ? (
            fieldError('username')
          ) : (
            <p id="username-hint" className="hint">
              This is what other players see.
            </p>
          )}
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
              className="input-field pr-14"
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
              className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border-2 border-transparent text-ink-600 transition hover:border-ink hover:bg-arena-100 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errors.password ? (
            fieldError('password')
          ) : (
            <p id="password-hint" className="hint">
              Use 8+ characters. Avoid common passwords.
            </p>
          )}
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

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Creating your account…' : 'Create free account'}
          {!loading && <ArrowRight size={18} aria-hidden="true" />}
        </button>

        <p className="border-t-2 border-ink/15 pt-4 text-xs leading-relaxed text-ink-600">
          By creating an account you agree to use Quiz Mania respectfully. Quizzes you publish are visible to
          anyone with the code.
        </p>
      </form>
    </AuthLayout>
  )
}

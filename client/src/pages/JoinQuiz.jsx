import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Gamepad2, KeyRound, Trophy, Zap } from 'lucide-react'
import useSEO from '../hooks/useSEO'
import { Alert } from '../components/ui'

const CODE_LENGTH = 8

export default function JoinQuiz() {
  useSEO('/quiz/join')

  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const cleaned = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH)
    setCode(cleaned)
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (code.length !== CODE_LENGTH) {
      setError(`Quiz codes are exactly ${CODE_LENGTH} characters. You entered ${code.length}.`)
      return
    }
    navigate(`/quiz/play/${code}`)
  }

  return (
    <main className="container-page animate-fade-in py-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="eyebrow">
            <Gamepad2 size={14} aria-hidden="true" /> Join a game
          </span>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Got a code?</h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Type the {CODE_LENGTH}-character code from your host and jump straight into the quiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface mt-9 p-6 sm:p-9" noValidate>
          <label htmlFor="quiz-code" className="label">
            Quiz code
          </label>

          <div className="relative">
            <KeyRound
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="quiz-code"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              className="input-field pl-12 text-center font-mono text-2xl font-bold uppercase tracking-[0.5em] sm:text-3xl"
              placeholder="ABCD1234"
              value={code}
              onChange={handleChange}
              maxLength={CODE_LENGTH}
              aria-describedby="code-help"
              aria-invalid={Boolean(error)}
              autoFocus
            />
          </div>

          <div id="code-help" className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Letters and numbers only. Not case sensitive.</span>
            <span className="font-mono">{code.length}/{CODE_LENGTH}</span>
          </div>

          {error && (
            <Alert className="mt-4" tone="error">
              {error}
            </Alert>
          )}

          <button
            type="submit"
            disabled={code.length !== CODE_LENGTH}
            className="btn-primary mt-6 w-full text-base"
          >
            <Zap size={19} aria-hidden="true" /> Let&apos;s play
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: KeyRound, title: 'Ask your host', body: 'The code appears when they publish the quiz.' },
            { icon: Trophy, title: 'Answer and submit', body: 'One attempt at a time, scored instantly.' },
            { icon: Zap, title: 'See your score', body: 'Your result is saved to your account.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-soft p-4">
              <Icon size={18} className="text-secondary-300" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Hosting instead?{' '}
          <Link to="/quiz/create" className="link">
            Create a quiz
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

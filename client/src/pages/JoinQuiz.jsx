import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import useSEO from '../hooks/useSEO'
import { Alert, CodeEntry } from '../components/ui'

const CODE_LENGTH = 8

const steps = [
  { title: 'Ask your host', body: 'The eight-character code appears when they publish the quiz.' },
  { title: 'Answer once', body: 'Work through the questions, then submit. Scoring is instant.' },
  { title: 'Read the board', body: 'Your score and accuracy are saved to your account history.' },
]

export default function JoinQuiz() {
  useSEO('/quiz/join')

  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (code.length !== CODE_LENGTH) {
      setError(`Quiz codes are exactly ${CODE_LENGTH} characters. You entered ${code.length}.`)
      return
    }
    navigate(`/quiz/play/${code}`)
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="border-2 border-ink bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
            <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
            Join a game
          </span>
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
            No account needed
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border-b-2 border-ink p-5 sm:p-8 lg:border-b-0 lg:border-r-2 lg:p-10">
            <h1 className="display-xl">
              Got a
              <br />
              code?
            </h1>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-700">
              Type the eight-character code from your host and jump straight into the quiz.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 border-2 border-ink bg-arena-50 p-4 sm:p-5" noValidate>
              <label htmlFor="quiz-code" className="label">
                Quiz code
              </label>

              <CodeEntry
                id="quiz-code"
                value={code}
                onChange={(next) => {
                  setCode(next)
                  setError('')
                }}
                length={CODE_LENGTH}
                size="lg"
                invalid={Boolean(error)}
                describedBy="code-help"
                autoFocus
              />

              <div id="code-help" className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-600">
                <span>Letters and numbers only. Not case sensitive.</span>
                <span className="font-display text-[12px] font-bold tabular-nums tracking-[0.12em]">
                  {code.length}/{CODE_LENGTH}
                </span>
              </div>

              {error && (
                <div className="mt-4">
                  <Alert tone="error">{error}</Alert>
                </div>
              )}

              <button type="submit" className="btn btn-primary mt-5 w-full">
                Let&apos;s play <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            <p className="mt-5 text-sm text-ink-600">
              Hosting instead?{' '}
              <Link to="/quiz/create" className="link">
                Create a quiz
              </Link>
              .
            </p>
          </section>

          <aside className="bg-ink p-5 text-white sm:p-8 lg:p-10">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-signal-yellow">
              Before you start
            </p>
            <ol className="mt-5 border-t-2 border-white/25">
              {steps.map((step, index) => (
                <li key={step.title} className="border-b-2 border-white/25 py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="num text-3xl text-signal-yellow" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-white">
                        {step.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-ink-200">{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs leading-relaxed text-ink-300">
              A code only opens the quiz it belongs to. Nothing is installed and no account is required to play.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}

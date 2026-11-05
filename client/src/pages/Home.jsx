import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import useSEO from '../hooks/useSEO'
import { Alert, CodeEntry, ScoreDigits, TimeRail } from '../components/ui'

const CODE_LENGTH = 8

const steps = [
  {
    title: 'Build',
    body: 'Add multiple-choice, true/false or multi-select questions. Set points, an optional timer and an explanation for every answer.',
  },
  {
    title: 'Share',
    body: 'Publish to get an eight-character code. Send it to a class, a group chat or one friend. No links to shorten.',
  },
  {
    title: 'Play',
    body: 'Players answer against the clock, submit once and see their score immediately. Every attempt lands in your dashboard.',
  },
]

const controls = [
  {
    title: 'Three question types',
    body: 'Multiple choice, true/false and multi-select, with 2-6 options and per-question points.',
  },
  {
    title: 'Optional timer',
    body: 'Add a countdown when speed matters, or leave it off for relaxed practice.',
  },
  {
    title: 'Explanations',
    body: 'Add a short note to any question so players learn from the answer, not just the score.',
  },
  {
    title: 'Draft, publish, retake',
    body: 'Save drafts while you build, publish when ready, and decide whether players can take it again.',
  },
  {
    title: 'Results you can use',
    body: 'See attempts, scores, accuracy and time taken. Personal history lives in My Results.',
  },
  {
    title: 'Two sides, one board',
    body: 'Creators get a builder and analytics. Players get a fast, focused play screen.',
  },
]

const categories = [
  { value: 'general', label: 'General knowledge' },
  { value: 'science', label: 'Science' },
  { value: 'math', label: 'Mathematics' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
]

const sampleOptions = [
  { label: 'Oxygen', correct: false },
  { label: 'Carbon dioxide', correct: true },
  { label: 'Nitrogen', correct: false },
  { label: 'Hydrogen', correct: false },
]

function SampleBoard() {
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState(40)
  const answered = answer !== null
  const correct = answered && sampleOptions[answer].correct

  const choose = (index) => {
    setAnswer(index)
    setScore(sampleOptions[index].correct ? 50 : 40)
  }

  const reset = () => {
    setAnswer(null)
    setScore(40)
  }

  return (
    <div className="flex h-full flex-col bg-white" aria-label="Sample quiz round">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em]">Sample round</span>
        <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-signal-yellow">
          <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" /> 10 points
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Clock</p>
            <p className={`num mt-1 text-5xl ${answered ? 'text-ink' : 'text-ink'}`}>00:24</p>
          </div>
          <div className="text-right">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Score</p>
            <div className="mt-1">
              <ScoreDigits value={String(score).padStart(4, '0')} size="sm" label={`Sample score ${score} points`} />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <TimeRail total={30} remaining={24} />
        </div>

        <div className="mt-5 border-t-2 border-ink pt-4">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Question 03 / 08</p>
          <h2 className="mt-1 font-display text-2xl font-bold leading-[1.02] text-ink sm:text-[1.7rem]">
            Which gas do plants absorb from the air?
          </h2>

          <div className="mt-3 space-y-2" role="group" aria-label="Sample answer options">
            {sampleOptions.map((option, index) => {
              const selected = answer === index
              const revealCorrect = answered && option.correct
              const revealWrong = selected && !option.correct
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => choose(index)}
                  aria-pressed={selected}
                  className={`lane py-2.5 ${revealCorrect ? 'lane-correct' : ''} ${
                    revealWrong ? 'lane-wrong' : ''
                  }`}
                >
                  <span className="lane-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[15px] font-medium">{option.label}</span>
                  {revealCorrect && <Check size={18} className="ml-auto shrink-0" aria-hidden="true" />}
                  {revealWrong && <X size={18} className="ml-auto shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </div>

          <div className="mt-3 min-h-[44px]" aria-live="polite">
            {answered ? (
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-semibold ${correct ? 'text-signal-green' : 'text-signal-red-dark'}`}>
                  {correct ? 'Correct. +10 points.' : 'Not quite. The answer is carbon dioxide.'}
                </p>
                <button type="button" onClick={reset} className="btn btn-ghost btn-sm shrink-0">
                  <RotateCcw size={14} aria-hidden="true" /> Reset
                </button>
              </div>
            ) : (
              <p className="text-xs text-ink-500">Click an answer to try the board.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-4 py-2.5">
        <span className="text-[11px] text-ink-600">Sample round. Not a live quiz.</span>
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Q 03 / 08</span>
      </div>
    </div>
  )
}

export default function Home() {
  useSEO('/')

  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (code.length !== CODE_LENGTH) {
      setError(`A quiz code is exactly ${CODE_LENGTH} characters. You entered ${code.length}.`)
      return
    }
    navigate(`/quiz/play/${code}`)
  }

  return (
    <main>
      <section className="container-page pt-6 sm:pt-8">
        <div className="border-2 border-ink bg-white">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
                <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" /> Board open
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.14em] text-ink-300 sm:inline">
                Free public quiz platform
              </span>
            </div>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
              No downloads / No fees
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b-2 border-ink p-5 sm:p-8 lg:border-b-0 lg:border-r-2 lg:p-10">
              <h1 className="display-xl text-ink">
                The board
                <br />
                is open.
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-700 sm:text-lg">
                Build a quiz in minutes. Share eight characters. Watch the scores land.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 border-2 border-ink bg-arena-50 p-4" noValidate>
                <label htmlFor="hero-code" className="label">
                  Have a code?
                </label>
                <div className="grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-stretch">
                  <CodeEntry
                    id="hero-code"
                    value={code}
                    onChange={(next) => {
                      setCode(next)
                      setError('')
                    }}
                    length={CODE_LENGTH}
                    size="md"
                    invalid={Boolean(error)}
                    describedBy="hero-code-help"
                    autoFocus={false}
                  />
                  <button type="submit" className="btn btn-primary sm:px-7">
                    Play <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
                <p id="hero-code-help" className="hint">
                  Eight letters or numbers. Not case sensitive.
                </p>
                {error && (
                  <div className="mt-3">
                    <Alert tone="error">{error}</Alert>
                  </div>
                )}
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-600">
                <Link to="/quiz/create" className="link">
                  Build a quiz
                </Link>
                <span aria-hidden="true">or</span>
                <Link to="/register" className="link">
                  create a free account
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-ink pt-4 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-600">
                <li>3 question types</li>
                <li>Optional timer</li>
                <li>Instant scoring</li>
              </ul>
            </div>

            <SampleBoard />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-2 border-ink bg-signal-yellow px-4 py-2.5 text-ink">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Free to play</span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Works on phone and desktop</span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Scores saved to your history</span>
          </div>
        </div>
      </section>

      <section className="mt-12 border-y-2 border-ink bg-ink py-12 text-white sm:py-16" aria-labelledby="how-heading">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="how-heading" className="display-lg max-w-xl text-white">
              From blank board to final score.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-ink-200">
              Three moves. No setup maze, no training required.
            </p>
          </div>

          <ol className="mt-9 grid border-2 border-white/25 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-b-2 border-white/25 p-6 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="num text-6xl text-signal-yellow" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="badge border-white/40 text-ink-200">Step</span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-200">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="btn btn-primary">
              Create a free account
            </Link>
            <Link to="/quiz/join" className="btn btn-ghost-light">
              I have a code
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="controls-heading">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <h2 id="controls-heading" className="display-lg max-w-md">
              Everything on the board.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-600">
              These are the controls you get today. No roadmap promises, no locked features, no paywall.
            </p>
            <Link to="/register" className="btn btn-secondary mt-6">
              Start free <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="border-2 border-ink bg-white">
            <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Control</span>
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Detail</span>
            </div>
            {controls.map((control, index) => (
              <div
                key={control.title}
                className="grid gap-1 border-b border-ink/20 px-4 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-5 sm:px-5"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[12px] font-bold tabular-nums text-ink-600" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-tight">{control.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-ink-700">{control.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="categories-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="categories-heading" className="display-lg">
              Pick your lane.
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-600">
              Every quiz gets a category so players know what they are walking into. Choose one when you build.
            </p>
          </div>
          <Link to="/quiz/create" className="btn btn-secondary shrink-0">
            Start a quiz <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="lane-grid mt-7">
          {categories.map((category, index) => (
            <Link
              key={category.value}
              to={`/quiz/create?category=${category.value}`}
              className="group flex min-h-[104px] flex-col justify-between p-4 transition hover:bg-signal-yellow sm:min-h-[124px] sm:p-5"
            >
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="mt-4 font-display text-xl font-bold uppercase leading-none tracking-tight sm:text-2xl">
                {category.label}
              </span>
              <span className="mt-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500 transition group-hover:text-ink">
                Build in this lane
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 border-y-2 border-ink bg-signal-yellow" aria-labelledby="turn-heading">
        <div className="container-page grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 id="turn-heading" className="display-xl text-ink">
              Your turn.
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-800">
              Make a quiz, publish the code, and let the room find out who actually knows their stuff.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Link to="/register" className="btn btn-primary">
                Create free account
              </Link>
              <Link to="/quiz/join" className="btn btn-secondary">
                I have a code
              </Link>
            </div>
          </div>
          <div className="flex items-end gap-3 lg:justify-end" aria-hidden="true">
            <span className="num text-[7rem] leading-[0.7] text-ink sm:text-[9rem]">08</span>
            <span className="max-w-[8rem] pb-1 font-display text-xs font-bold uppercase leading-tight tracking-[0.12em] text-ink-800">
              characters between you and the quiz
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

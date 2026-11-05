import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LogIn,
  Minus,
  RotateCcw,
  Send,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'
import { getErrorMessage, quizAPI, resultAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert, Meter, ScoreDigits, Spinner, TimeRail } from '../components/ui'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function formatClock(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const safe = Math.max(0, seconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function gradeFor(percentage) {
  if (percentage >= 90) return { label: 'Outstanding', tone: 'text-signal-green' }
  if (percentage >= 70) return { label: 'Great run', tone: 'text-signal-blue' }
  if (percentage >= 50) return { label: 'Solid effort', tone: 'text-signal-yellow-dark' }
  return { label: 'Keep practising', tone: 'text-signal-red-dark' }
}

export default function PlayQuiz() {
  useSEO('/quiz/play')

  const { code } = useParams()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  const [phase, setPhase] = useState('loading')
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [result, setResult] = useState(null)

  const startedAtRef = useRef(null)
  const deadlineRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setPhase('auth')
      return
    }

    let active = true
    async function load() {
      setPhase('loading')
      setError('')
      try {
        const response = await quizAPI.getByCode(code)
        if (!active) return
        setQuiz(response.data)
        setPhase('intro')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, 'We could not find a published quiz with that code.'))
        setPhase('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [code, isAuthenticated])

  const questions = quiz?.questions || []
  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]
  const answeredCount = useMemo(
    () => questions.filter((question) => (answers[question.id] || []).length > 0).length,
    [questions, answers],
  )

  const elapsedSeconds = () =>
    startedAtRef.current ? Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)) : null

  useEffect(() => {
    if (phase !== 'playing' || !quiz?.time_limit) return undefined

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      setTimeRemaining(left)
    }

    tick()
    const interval = window.setInterval(tick, 500)
    return () => window.clearInterval(interval)
  }, [phase, quiz])

  useEffect(() => {
    if (phase === 'playing' && timeRemaining === 0) {
      submitQuiz()
    }
    // submitQuiz is intentionally read from the current render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase])

  function startQuiz() {
    startedAtRef.current = Date.now()
    deadlineRef.current = quiz.time_limit ? Date.now() + quiz.time_limit * 1000 : null
    setTimeRemaining(quiz.time_limit || null)
    setAnswers({})
    setCurrentIndex(0)
    setResult(null)
    setError('')
    setPhase('playing')
  }

  function toggleOption(question, optionId) {
    setAnswers((current) => {
      const selected = current[question.id] || []
      if (question.question_type === 'multi_select') {
        const next = selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId]
        return { ...current, [question.id]: next }
      }
      return { ...current, [question.id]: [optionId] }
    })
  }

  async function submitQuiz() {
    if (phase === 'submitting' || phase === 'done') return

    const payloadAnswers = questions
      .filter((question) => (answers[question.id] || []).length > 0)
      .map((question) => ({
        question_id: question.id,
        selected_option_ids: answers[question.id],
      }))

    if (payloadAnswers.length === 0) {
      setError('Answer at least one question before submitting.')
      setPhase('review')
      return
    }

    setError('')
    setPhase('submitting')
    try {
      const response = await resultAPI.submit({
        quiz_code: quiz.code,
        answers: payloadAnswers,
        time_taken: elapsedSeconds(),
      })
      setResult(response.data)
      setPhase('done')
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'We could not submit your answers. Please try again.'))
      setPhase('review')
    }
  }

  if (phase === 'auth') {
    return (
      <main className="container-page py-8 sm:py-12">
        <div className="mx-auto max-w-2xl border-2 border-ink bg-white">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
            <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
              Sign-in required
            </span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
              Code {code}
            </span>
          </div>
          <div className="p-6 sm:p-9">
            <h1 className="display-md">Log in to play</h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
              Quiz <span className="font-display font-bold tracking-[0.12em] text-ink">{code}</span> opens once you
              sign in. Your score is saved to your account.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
                <LogIn size={18} aria-hidden="true" /> Log in
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create free account
              </Link>
            </div>
            <div className="mt-6 border-t-2 border-ink pt-4">
              <Link to="/quiz/join" className="link text-sm">
                Use a different code
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'loading') return <Spinner fullPage label="Loading the quiz…" />

  if (phase === 'error') {
    return (
      <main className="container-page py-8 sm:py-12">
        <div className="mx-auto max-w-2xl border-2 border-ink bg-white">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
            <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="h-2 w-2 bg-signal-red" aria-hidden="true" />
              No board found
            </span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
              Code {code}
            </span>
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex items-center gap-3">
              <ScoreDigits value="404" size="sm" label="Quiz not found" />
            </div>
            <h1 className="display-md mt-5">Quiz not found.</h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">{error}</p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link to="/quiz/join" className="btn btn-primary">
                Try another code <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/" className="btn btn-secondary">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="container-page py-8 sm:py-12">
        <div className="mx-auto max-w-2xl border-2 border-ink bg-white">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
            <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
              Ready to play
            </span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
              {quiz.category}
            </span>
          </div>

          <div className="p-5 sm:p-8">
            <h1 className="display-lg">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-700">{quiz.description}</p>
            )}
            <p className="mt-4 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
              Hosted by {quiz.host_username || 'a Quiz Mania creator'}
            </p>

            <div className="score-strip-3 mt-6">
              <div className="p-4">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Questions</p>
                <p className="num mt-1 text-4xl">{totalQuestions}</p>
              </div>
              <div className="p-4">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Time limit</p>
                <p className="num mt-1 text-4xl">{quiz.time_limit ? formatClock(quiz.time_limit) : 'None'}</p>
              </div>
              <div className="p-4">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Retakes</p>
                <p className="mt-2 font-display text-xl font-bold uppercase leading-none tracking-tight">
                  {quiz.allow_retake ? 'Allowed' : 'One attempt'}
                </p>
              </div>
            </div>

            <ul className="mt-6 border-t-2 border-ink">
              <li className="border-b border-ink/20 py-2.5 text-sm text-ink-700">
                Every question is scored by its points value.
              </li>
              <li className="border-b border-ink/20 py-2.5 text-sm text-ink-700">
                You can move between questions before submitting.
              </li>
              {quiz.time_limit && (
                <li className="py-2.5 text-sm text-ink-700">
                  The quiz submits automatically when the timer reaches zero.
                </li>
              )}
            </ul>

            <button
              type="button"
              onClick={startQuiz}
              disabled={totalQuestions === 0}
              className="btn btn-primary mt-6 w-full"
            >
              Start quiz <ArrowRight size={18} aria-hidden="true" />
            </button>

            {totalQuestions === 0 && (
              <div className="mt-4">
                <Alert tone="warning">This quiz has no questions yet. Ask the host to add some.</Alert>
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'done' && result) {
    const percentage = Math.round(Number(result.percentage ?? 0))
    const grade = gradeFor(percentage)
    const answerMap = new Map((result.answers || []).map((answer) => [answer.question, answer]))

    return (
      <main className="container-page py-8 sm:py-12">
        <div className="mx-auto max-w-3xl border-2 border-ink bg-white">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
            <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="h-2 w-2 animate-lamp bg-signal-yellow" aria-hidden="true" />
              Final score
            </span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
              {quiz.title}
            </span>
          </div>

          <div className="border-b-2 border-ink p-5 text-center sm:p-8">
            <div className="flex flex-wrap items-end justify-center gap-2">
              <ScoreDigits value={String(percentage)} size="lg" label={`Score ${percentage} percent`} />
              <span className="num pb-2 text-4xl">%</span>
            </div>
            <p className={`mt-3 font-display text-2xl font-bold uppercase tracking-[0.06em] ${grade.tone}`}>
              {grade.label}
            </p>
            <p className="mt-1 text-sm text-ink-600">
              {result.score} of {result.max_score} points. {result.correct_answers} of {result.total_questions}{' '}
              correct.
            </p>
          </div>

          <div className="score-strip-3">
            <div className="p-4 text-center">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Score</p>
              <p className="num mt-1 text-3xl">
                {result.score}/{result.max_score}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Correct</p>
              <p className="num mt-1 text-3xl">
                {result.correct_answers}/{result.total_questions}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Time</p>
              <p className="num mt-1 text-3xl">{formatClock(result.time_taken)}</p>
            </div>
          </div>

          {quiz.show_correct_answers && (
            <div className="border-t-2 border-ink p-4 sm:p-6">
              <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em]">Answer breakdown</h2>
              <ul className="mt-3 border-t-2 border-ink">
                {questions.map((question, index) => {
                  const answer = answerMap.get(question.id)
                  const correct = Boolean(answer?.is_correct)
                  const state = correct ? 'Correct' : answer ? 'Not quite' : 'Skipped'
                  const Icon = correct ? CheckCircle2 : answer ? XCircle : Minus
                  const tone = correct
                    ? 'border-signal-green bg-signal-green-soft'
                    : answer
                      ? 'border-signal-red bg-signal-red-soft'
                      : 'border-ink/40 bg-arena-50'
                  return (
                    <li
                      key={question.id}
                      className={`flex items-start gap-3 border-b-2 border-ink px-3 py-3 last:border-b-0 ${tone}`}
                    >
                      <Icon
                        size={18}
                        className={`mt-0.5 shrink-0 ${
                          correct ? 'text-signal-green' : answer ? 'text-signal-red-dark' : 'text-ink-600'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm leading-relaxed text-ink">
                          <span className="mr-1 font-display font-bold tabular-nums text-ink-600">{index + 1}.</span>
                          {question.text}
                        </p>
                        <p className="mt-0.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
                          {state}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t-2 border-ink p-4 sm:flex-row sm:justify-center sm:p-5">
            <Link to="/dashboard" className="btn btn-primary">
              <Trophy size={17} aria-hidden="true" /> Go to dashboard
            </Link>
            {quiz.allow_retake && (
              <button type="button" onClick={startQuiz} className="btn btn-secondary">
                <RotateCcw size={17} aria-hidden="true" /> Play again
              </button>
            )}
            <Link to="/quiz/join" className="btn btn-ghost">
              Join another quiz
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'submitting') return <Spinner fullPage label="Scoring your answers…" />

  // Playing or reviewing
  const isReview = phase === 'review'
  const selected = currentQuestion ? answers[currentQuestion.id] || [] : []
  const lowTime = timeRemaining !== null && timeRemaining <= 30

  return (
    <main className="container-page py-6 sm:py-10">
      <div className="mx-auto max-w-4xl border-2 border-ink bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
            <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
            Live round
          </span>
          <span className="max-w-[18rem] truncate font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-200">
            {quiz.title}
          </span>
        </div>

        <div className="grid border-b-2 border-ink sm:grid-cols-[1fr_auto]">
          <div className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Progress</p>
              <p className="font-display text-[12px] font-bold uppercase tracking-[0.12em]">
                <span className="num text-2xl">{answeredCount}</span> / {totalQuestions} answered
              </p>
            </div>
            <div className="mt-2.5">
              <Meter value={totalQuestions ? (answeredCount / totalQuestions) * 100 : 0} tone="blue" />
            </div>
          </div>

          <div className="border-t-2 border-ink p-4 sm:min-w-[16rem] sm:border-l-2 sm:border-t-0">
            {quiz.time_limit ? (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Clock</p>
                  <p
                    className={`num text-4xl ${lowTime ? 'text-signal-red-dark' : 'text-ink'}`}
                    role="timer"
                    aria-live={lowTime ? 'polite' : 'off'}
                  >
                    {formatClock(timeRemaining)}
                  </p>
                </div>
                <div className="mt-2.5">
                  <TimeRail total={quiz.time_limit} remaining={timeRemaining ?? quiz.time_limit} />
                </div>
              </>
            ) : (
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">Clock</p>
                <p className="font-display text-xl font-bold uppercase tracking-[0.08em]">Untimed</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="border-b-2 border-ink p-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {isReview ? (
          <section className="p-4 sm:p-6" aria-labelledby="review-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
              <div>
                <h1 id="review-heading" className="display-md">
                  Review before you submit.
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
                  You can go back and change any answer. Unanswered questions are marked skipped.
                </p>
              </div>
              <span className="badge status-quiet">{answeredCount} answered</span>
            </div>

            <ul className="mt-4 border-2 border-ink">
              {questions.map((question, index) => {
                const answered = (answers[question.id] || []).length > 0
                return (
                  <li key={question.id} className="border-b-2 border-ink last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(index)
                        setPhase('playing')
                      }}
                      className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:bg-arena-50"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink font-display text-sm font-bold tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate text-sm text-ink">{question.text}</span>
                      </span>
                      <span
                        className={`shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.14em] ${
                          answered ? 'text-signal-green' : 'text-ink-500'
                        }`}
                      >
                        {answered ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Check size={13} aria-hidden="true" /> Answered
                          </span>
                        ) : (
                          'Skipped'
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setPhase('playing')} className="btn btn-secondary">
                <ArrowLeft size={17} aria-hidden="true" /> Keep answering
              </button>
              <button type="button" onClick={() => submitQuiz()} className="btn btn-primary">
                <Send size={17} aria-hidden="true" /> Submit answers
              </button>
            </div>
          </section>
        ) : (
          currentQuestion && (
            <section className="p-4 sm:p-6" aria-labelledby="question-heading">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3">
                <span className="badge bg-ink text-white">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
                  <span className="num text-lg text-ink">{currentQuestion.points}</span>{' '}
                  point{currentQuestion.points === 1 ? '' : 's'}
                </span>
              </div>

              <h1 id="question-heading" className="mt-4 font-display text-3xl font-bold leading-[1.02] tracking-tight sm:text-4xl">
                {currentQuestion.text}
              </h1>
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt=""
                  className="mt-4 max-h-72 w-full border-2 border-ink object-cover"
                  loading="lazy"
                />
              )}
              <p className="mt-2 text-sm text-ink-600">
                {currentQuestion.question_type === 'multi_select'
                  ? 'Select every correct answer.'
                  : 'Select one answer.'}
              </p>

              <div className="mt-4 space-y-2" role="group" aria-label={`Answers for question ${currentIndex + 1}`}>
                {currentQuestion.options.map((option, optionIndex) => {
                  const active = selected.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(currentQuestion, option.id)}
                      aria-pressed={active}
                      className={`lane ${active ? 'lane-active' : ''}`}
                    >
                      <span className="lane-letter" aria-hidden="true">
                        {LETTERS[optionIndex] || optionIndex + 1}
                      </span>
                      <span className="text-[15px] font-medium sm:text-base">{option.text}</span>
                      {active && (
                        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em]">
                          <Check size={14} aria-hidden="true" /> Selected
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={17} aria-hidden="true" /> Previous
                </button>

                {currentIndex === totalQuestions - 1 ? (
                  <button type="button" onClick={() => setPhase('review')} className="btn btn-primary">
                    Review answers <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1))}
                    className="btn btn-primary"
                  >
                    Next question <ArrowRight size={17} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t-2 border-ink pt-4">
                <button type="button" onClick={() => setPhase('review')} className="link-quiet text-sm">
                  Jump to review
                </button>
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  Answers are not submitted yet
                </p>
              </div>
            </section>
          )
        )}
      </div>
    </main>
  )
}

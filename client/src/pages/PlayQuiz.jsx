import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gamepad2,
  ListChecks,
  LogIn,
  RotateCcw,
  Send,
  Timer,
  Trophy,
  User,
  XCircle,
  Zap,
} from 'lucide-react'
import { getErrorMessage, quizAPI, resultAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert, Spinner } from '../components/ui'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function formatClock(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const safe = Math.max(0, seconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function gradeFor(percentage) {
  if (percentage >= 90) return { label: 'Outstanding', tone: 'text-secondary-300' }
  if (percentage >= 70) return { label: 'Great run', tone: 'text-emerald-300' }
  if (percentage >= 50) return { label: 'Solid effort', tone: 'text-primary-300' }
  return { label: 'Keep practising', tone: 'text-slate-300' }
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
      <main className="container-page py-16">
        <div className="surface mx-auto max-w-lg p-7 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-500/15 text-primary-300">
            <LogIn size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Log in to play</h1>
          <p className="mt-2 text-slate-400">
            You can play quiz <span className="font-mono font-bold tracking-widest text-secondary-200">{code}</span> once
            you sign in. Your score is saved to your account.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/login" state={{ from: location.pathname }} className="btn-primary">
              <LogIn size={18} aria-hidden="true" /> Log in
            </Link>
            <Link to="/register" className="btn-secondary">
              Create free account
            </Link>
          </div>
          <Link to="/quiz/join" className="link mt-5 inline-block text-sm">
            Use a different code
          </Link>
        </div>
      </main>
    )
  }

  if (phase === 'loading') return <Spinner fullPage label="Loading the quiz…" />

  if (phase === 'error') {
    return (
      <main className="container-page py-16">
        <div className="surface mx-auto max-w-lg p-7 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
            <XCircle size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Quiz not found</h1>
          <p className="mt-2 text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/quiz/join" className="btn-primary">
              <Gamepad2 size={18} aria-hidden="true" /> Try another code
            </Link>
            <Link to="/" className="btn-secondary">
              Go home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="surface overflow-hidden">
            <div className="bg-gradient-to-br from-primary-700/60 via-indigo-800/40 to-accent-pink/20 p-6 sm:p-9">
              <span className="badge bg-white/10 text-white">
                <Zap size={13} aria-hidden="true" /> Ready to play
              </span>
              <h1 className="mt-4 text-3xl font-black sm:text-4xl">{quiz.title}</h1>
              {quiz.description && <p className="mt-3 text-primary-50/85">{quiz.description}</p>}
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-primary-50/80">
                <User size={15} aria-hidden="true" /> Hosted by {quiz.host_username || 'a Quiz Mania creator'}
              </p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-7">
              <div className="surface-soft p-4">
                <ListChecks size={18} className="text-primary-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Questions</p>
                <p className="text-xl font-bold text-white">{totalQuestions}</p>
              </div>
              <div className="surface-soft p-4">
                <Timer size={18} className="text-secondary-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Time limit</p>
                <p className="text-xl font-bold text-white">
                  {quiz.time_limit ? formatClock(quiz.time_limit) : 'None'}
                </p>
              </div>
              <div className="surface-soft p-4">
                <RotateCcw size={18} className="text-accent-teal" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Retakes</p>
                <p className="text-xl font-bold text-white">{quiz.allow_retake ? 'Allowed' : 'One attempt'}</p>
              </div>
            </div>

            <div className="border-t border-white/10 p-6 sm:p-7">
              <ul className="space-y-2 text-sm text-slate-400">
                <li>· Every question is scored by its points value.</li>
                <li>· You can move between questions before submitting.</li>
                {quiz.time_limit && <li>· The quiz submits automatically when the timer reaches zero.</li>}
              </ul>
              <button type="button" onClick={startQuiz} disabled={totalQuestions === 0} className="btn-primary mt-6 w-full text-base">
                <Zap size={20} aria-hidden="true" /> Start quiz
              </button>
              {totalQuestions === 0 && (
                <Alert className="mt-4" tone="warning">
                  This quiz has no questions yet. Ask the host to add some.
                </Alert>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'done' && result) {
    const percentage = result.percentage ?? 0
    const grade = gradeFor(percentage)
    const answerMap = new Map((result.answers || []).map((answer) => [answer.question, answer]))

    return (
      <main className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="surface overflow-hidden">
            <div className="bg-gradient-to-br from-primary-700/60 via-indigo-800/40 to-accent-pink/20 p-6 text-center sm:p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-secondary-300">
                <Trophy size={30} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-primary-100/80">{quiz.title}</p>
              <p className="mt-3 text-6xl font-black text-white">{percentage}%</p>
              <p className={`mt-1 text-lg font-bold ${grade.tone}`}>{grade.label}</p>
              <p className="mt-2 text-sm text-primary-50/80">
                {result.score} of {result.max_score} points · {result.correct_answers} of {result.total_questions} correct
              </p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-7">
              <div className="surface-soft p-4 text-center">
                <Trophy size={18} className="mx-auto text-secondary-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Score</p>
                <p className="text-xl font-bold text-white">
                  {result.score}/{result.max_score}
                </p>
              </div>
              <div className="surface-soft p-4 text-center">
                <CheckCircle2 size={18} className="mx-auto text-emerald-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Correct</p>
                <p className="text-xl font-bold text-white">
                  {result.correct_answers}/{result.total_questions}
                </p>
              </div>
              <div className="surface-soft p-4 text-center">
                <Clock3 size={18} className="mx-auto text-primary-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Time</p>
                <p className="text-xl font-bold text-white">{formatClock(result.time_taken)}</p>
              </div>
            </div>

            {quiz.show_correct_answers && (
              <div className="border-t border-white/10 p-6 sm:p-7">
                <h2 className="text-lg font-bold">Answer breakdown</h2>
                <ul className="mt-4 space-y-2">
                  {questions.map((question, index) => {
                    const answer = answerMap.get(question.id)
                    const correct = Boolean(answer?.is_correct)
                    return (
                      <li
                        key={question.id}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        {correct ? (
                          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                        ) : (
                          <XCircle size={18} className="mt-0.5 shrink-0 text-rose-300" aria-hidden="true" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-slate-200">
                            <span className="mr-1 text-slate-500">{index + 1}.</span>
                            {question.text}
                          </p>
                          <p className={`mt-0.5 text-xs font-semibold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {correct ? 'Correct' : answer ? 'Not quite' : 'Skipped'}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-white/10 p-6 sm:flex-row sm:justify-center sm:p-7">
              <Link to="/dashboard" className="btn-primary">
                <Trophy size={18} aria-hidden="true" /> Go to dashboard
              </Link>
              {quiz.allow_retake && (
                <button type="button" onClick={startQuiz} className="btn-secondary">
                  <RotateCcw size={18} aria-hidden="true" /> Play again
                </button>
              )}
              <Link to="/quiz/join" className="btn-ghost">
                Join another quiz
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'submitting') return <Spinner fullPage label="Scoring your answers…" />

  // Playing or reviewing
  const isReview = phase === 'review'
  const selected = currentQuestion ? answers[currentQuestion.id] || [] : []

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">{quiz.title}</p>
            <p className="text-xs text-slate-500">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          {quiz.time_limit && (
            <div
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-lg font-bold ${
                timeRemaining !== null && timeRemaining <= 30
                  ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                  : 'border-white/10 bg-white/[0.04] text-secondary-200'
              }`}
              role="timer"
              aria-live={timeRemaining !== null && timeRemaining <= 30 ? 'polite' : 'off'}
            >
              <Clock3 size={18} aria-hidden="true" /> {formatClock(timeRemaining)}
            </div>
          )}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-pink transition-all"
            style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
          />
        </div>

        {error && (
          <Alert className="mt-5" tone="error">
            {error}
          </Alert>
        )}

        {isReview ? (
          <section className="surface mt-6 p-6 sm:p-8" aria-labelledby="review-heading">
            <h1 id="review-heading" className="text-2xl font-extrabold">
              Review before you submit
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              You can go back and change any answer. Unanswered questions are marked skipped.
            </p>

            <ul className="mt-5 space-y-2">
              {questions.map((question, index) => {
                const answered = (answers[question.id] || []).length > 0
                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(index)
                        setPhase('playing')
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {answered ? (
                          <CheckCircle2 size={18} className="shrink-0 text-emerald-300" aria-hidden="true" />
                        ) : (
                          <ListChecks size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
                        )}
                        <span className="truncate text-sm text-slate-200">
                          {index + 1}. {question.text}
                        </span>
                      </span>
                      <span className={`shrink-0 text-xs font-semibold ${answered ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {answered ? 'Answered' : 'Skipped'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setPhase('playing')} className="btn-ghost">
                <ArrowLeft size={17} aria-hidden="true" /> Keep answering
              </button>
              <button type="button" onClick={() => submitQuiz()} className="btn-primary">
                <Send size={17} aria-hidden="true" /> Submit answers
              </button>
            </div>
          </section>
        ) : (
          currentQuestion && (
            <section className="surface mt-6 p-6 sm:p-8" aria-labelledby="question-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="badge border border-white/10 bg-white/[0.05] text-slate-300">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs font-semibold text-secondary-300">
                  {currentQuestion.points} point{currentQuestion.points === 1 ? '' : 's'}
                </span>
              </div>

              <h1 id="question-heading" className="mt-4 text-2xl font-extrabold leading-snug sm:text-3xl">
                {currentQuestion.text}
              </h1>
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt=""
                  className="mt-4 max-h-72 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              <p className="mt-2 text-xs text-slate-400">
                {currentQuestion.question_type === 'multi_select'
                  ? 'Select every correct answer.'
                  : 'Select one answer.'}
              </p>

              <div className="mt-5 space-y-2.5" role="group" aria-label={`Answers for question ${currentIndex + 1}`}>
                {currentQuestion.options.map((option, optionIndex) => {
                  const active = selected.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(currentQuestion, option.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                        active
                          ? 'border-primary-400/70 bg-primary-500/15 text-white shadow-glow'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-bold ${
                          active ? 'border-primary-300 bg-primary-400 text-ink-950' : 'border-slate-500 text-slate-400'
                        }`}
                        aria-hidden="true"
                      >
                        {LETTERS[optionIndex] || optionIndex + 1}
                      </span>
                      <span className="text-sm sm:text-base">{option.text}</span>
                      {active && <CheckCircle2 size={18} className="ml-auto shrink-0 text-primary-200" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  disabled={currentIndex === 0}
                  className="btn-ghost"
                >
                  <ArrowLeft size={17} aria-hidden="true" /> Previous
                </button>

                {currentIndex === totalQuestions - 1 ? (
                  <button type="button" onClick={() => setPhase('review')} className="btn-primary">
                    Review answers <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1))}
                    className="btn-primary"
                  >
                    Next question <ArrowRight size={17} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setPhase('review')} className="link text-sm">
                  Jump to review
                </button>
                <p className="text-xs text-slate-500">Your answers are not submitted yet.</p>
              </div>
            </section>
          )
        )}
      </div>
    </main>
  )
}

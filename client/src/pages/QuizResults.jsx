import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardCopy, Gamepad2, Pencil, Share2, Users } from 'lucide-react'
import { getErrorMessage, quizAPI } from '../services/api'
import useSEO from '../hooks/useSEO'
import { Alert, EmptyState, PageHeader, ScoreDigits, Spinner, StatStrip } from '../components/ui'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`
}

const SORTS = [
  { value: 'score', label: 'Highest score' },
  { value: 'date', label: 'Most recent' },
  { value: 'time', label: 'Fastest time' },
]

const PODIUM = [
  { order: 'order-1 sm:order-2', surface: 'bg-ink text-white', label: 'text-signal-yellow', min: 'sm:min-h-[196px]' },
  { order: 'order-2 sm:order-1', surface: 'bg-arena-50 text-ink', label: 'text-ink-400', min: 'sm:min-h-[160px]' },
  { order: 'order-3 sm:order-3', surface: 'bg-signal-yellow-soft text-ink', label: 'text-signal-yellow-dark', min: 'sm:min-h-[136px]' },
]

export default function QuizResults() {
  useSEO('/quiz/results')

  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [quizResponse, resultsResponse] = await Promise.all([quizAPI.get(id), quizAPI.getResults(id)])
        if (!active) return
        setQuiz(quizResponse.data)
        setResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : resultsResponse.data?.results || [])
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError, 'We could not load these results.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  const sorted = useMemo(() => {
    const copy = [...results]
    if (sortBy === 'score') {
      copy.sort((a, b) => Number(b.percentage || 0) - Number(a.percentage || 0) || Number(b.score) - Number(a.score))
    } else if (sortBy === 'date') {
      copy.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    } else {
      copy.sort((a, b) => {
        const aTime = a.time_taken ?? Number.MAX_SAFE_INTEGER
        const bTime = b.time_taken ?? Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })
    }
    return copy
  }, [results, sortBy])

  const stats = useMemo(() => {
    if (results.length === 0) return { attempts: 0, average: 0, best: 0 }
    return {
      attempts: results.length,
      average: Math.round(results.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / results.length),
      best: Math.max(...results.map((result) => Number(result.percentage || 0))),
    }
  }, [results])

  const copy = async (value, message) => {
    try {
      await navigator.clipboard.writeText(value)
      setNotice(message)
      window.setTimeout(() => setNotice(''), 3500)
    } catch {
      setNotice(value)
    }
  }

  if (loading) return <Spinner fullPage label="Loading results…" />

  if (error && !quiz) {
    return (
      <main className="container-page py-12">
        <div className="mx-auto max-w-lg border-2 border-ink bg-white p-6">
          <Alert tone="error">{error}</Alert>
          <Link to="/dashboard" className="btn btn-secondary mt-5">
            <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  if (!quiz) return null

  const podium = sorted.slice(0, 3)
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean)

  return (
    <main className="container-page py-8 sm:py-12">
      <PageHeader
        meta={
          <>
            <span className="badge status-quiet">Creator analytics</span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
              {quiz.category} / {quiz.status}
            </span>
          </>
        }
        title={quiz.title}
        description={quiz.description || 'Every attempt on this quiz, sorted however you need.'}
        actions={
          <>
            <Link to={`/quiz/edit/${quiz.id}`} className="btn btn-secondary">
              <Pencil size={16} aria-hidden="true" /> Edit quiz
            </Link>
            <button
              type="button"
              onClick={() => copy(`${window.location.origin}/quiz/play/${quiz.code}`, 'Share link copied.')}
              className="btn btn-primary"
            >
              <Share2 size={16} aria-hidden="true" /> Share quiz
            </button>
          </>
        }
      />

      {notice && (
        <div className="mb-6">
          <Alert tone="success">{notice}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <section className="border-2 border-ink bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em]">Quiz code</span>
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
            Share this to let people play
          </span>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <ScoreDigits value={quiz.code} size="sm" label={`Quiz code ${quiz.code}`} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(quiz.code, 'Quiz code copied.')}
              className="btn btn-secondary btn-sm"
            >
              <ClipboardCopy size={15} aria-hidden="true" /> Copy code
            </button>
            <Link to={`/quiz/play/${quiz.code}`} className="btn btn-secondary btn-sm">
              <Gamepad2 size={15} aria-hidden="true" /> Preview quiz
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <StatStrip
          items={[
            { label: 'Attempts', value: stats.attempts, note: 'Submitted plays' },
            { label: 'Average score', value: `${stats.average}%`, tone: 'text-signal-blue' },
            { label: 'Top score', value: `${stats.best}%`, tone: 'text-signal-green' },
            { label: 'Questions', value: quiz.question_count ?? quiz.questions?.length ?? 0 },
          ]}
        />
      </div>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Users}
            title="No attempts yet"
            description={`Share code ${quiz.code} so people can play. Results show up here the moment someone submits.`}
            action={
              <button type="button" onClick={() => copy(quiz.code, 'Quiz code copied.')} className="btn btn-primary">
                <ClipboardCopy size={18} aria-hidden="true" /> Copy the code
              </button>
            }
          />
        </div>
      ) : (
        <>
          {sortBy === 'score' && podium.length >= 3 && (
            <section className="mt-8 border-2 border-ink bg-white" aria-label="Top three players">
              <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em]">Top three</span>
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
                  Ranked by score
                </span>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-3 sm:items-end">
                {podiumOrder.map((result, index) => {
                  const rank = sorted.findIndex((item) => item.id === result.id) + 1
                  const style = PODIUM[rank - 1]
                  return (
                    <div
                      key={result.id}
                      className={`flex flex-col justify-between border-2 border-ink p-4 ${style.order} ${style.surface} ${style.min}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`num text-5xl leading-none ${style.label}`} aria-hidden="true">
                          {String(rank).padStart(2, '0')}
                        </span>
                        <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">
                          Rank {rank}
                        </span>
                      </div>
                      <div className="mt-6">
                        <p className="truncate font-display text-2xl font-bold uppercase leading-tight tracking-tight">
                          {result.user?.username || 'Player'}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            rank === 1 ? 'text-ink-200' : 'text-ink-600'
                          }`}
                        >
                          {result.score}/{result.max_score} points / {formatDuration(result.time_taken)}
                        </p>
                        <p className="num mt-2 text-3xl">{Math.round(Number(result.percentage || 0))}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <div className="mt-8 border-2 border-ink bg-white">
            <div className="flex flex-col gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em]">
                All attempts
                <span className="ml-2 border-2 border-white/40 px-1.5 py-0.5 text-[11px] tabular-nums text-signal-yellow">
                  {results.length}
                </span>
              </h2>
              <label className="flex items-center gap-2">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-200">
                  Sort
                </span>
                <select
                  className="input-field min-h-[40px] w-auto border-white bg-ink px-2 py-1 text-white focus:ring-offset-ink"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {SORTS.map((sort) => (
                    <option key={sort.value} value={sort.value} className="bg-white text-ink">
                      {sort.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="hidden sm:block">
              <table className="data-table">
                <caption className="sr-only">Attempts for {quiz.title}</caption>
                <thead>
                  <tr>
                    <th scope="col">Player</th>
                    <th scope="col">Score</th>
                    <th scope="col">Correct</th>
                    <th scope="col">Time</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((result) => (
                    <tr key={result.id}>
                      <td className="font-semibold text-ink">{result.user?.username || 'Player'}</td>
                      <td>
                        <span className="num text-xl">{Math.round(Number(result.percentage || 0))}%</span>
                        <span className="ml-2 text-xs text-ink-600">
                          {result.score}/{result.max_score}
                        </span>
                      </td>
                      <td className="tabular-nums">
                        {result.correct_answers}/{result.total_questions}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">{formatDuration(result.time_taken)}</td>
                      <td className="whitespace-nowrap text-ink-600">{formatDate(result.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="sm:hidden">
              {sorted.map((result) => (
                <li key={result.id} className="border-b border-ink/20 p-4 last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-display text-lg font-bold uppercase tracking-tight">
                      {result.user?.username || 'Player'}
                    </p>
                    <p className="num text-2xl">{Math.round(Number(result.percentage || 0))}%</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
                    <span>
                      {result.correct_answers}/{result.total_questions} correct
                    </span>
                    <span>{formatDuration(result.time_taken)}</span>
                    <span>{formatDate(result.completed_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  )
}

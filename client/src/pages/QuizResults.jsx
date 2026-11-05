import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ClipboardCopy,
  Clock3,
  Gamepad2,
  Medal,
  Pencil,
  Share2,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { getErrorMessage, quizAPI } from '../services/api'
import useSEO from '../hooks/useSEO'
import { Alert, EmptyState, PageHeader, Spinner, StatCard } from '../components/ui'

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
      <main className="container-page py-16">
        <div className="mx-auto max-w-lg">
          <Alert tone="error">{error}</Alert>
          <Link to="/dashboard" className="btn-secondary mt-5">
            <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  if (!quiz) return null

  return (
    <main className="container-page animate-fade-in py-10 sm:py-14">
      <PageHeader
        eyebrow="Creator analytics"
        title={quiz.title}
        description={quiz.description || 'Every attempt on this quiz, sorted however you need.'}
        actions={
          <>
            <Link to={`/quiz/edit/${quiz.id}`} className="btn-secondary">
              <Pencil size={17} aria-hidden="true" /> Edit quiz
            </Link>
            <button
              type="button"
              onClick={() => copy(`${window.location.origin}/quiz/play/${quiz.code}`, 'Share link copied.')}
              className="btn-primary"
            >
              <Share2 size={17} aria-hidden="true" /> Share quiz
            </button>
          </>
        }
      />

      {notice && (
        <Alert className="mb-6" tone="success">
          {notice}
        </Alert>
      )}
      {error && (
        <Alert className="mb-6" tone="error">
          {error}
        </Alert>
      )}

      <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Quiz code</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-secondary-200">{quiz.code}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copy(quiz.code, 'Quiz code copied.')} className="btn-secondary">
            <ClipboardCopy size={16} aria-hidden="true" /> Copy code
          </button>
          <Link to={`/quiz/play/${quiz.code}`} className="btn-secondary">
            <Gamepad2 size={16} aria-hidden="true" /> Preview quiz
          </Link>
        </div>
      </section>

      <section aria-label="Quiz stats" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Attempts" value={stats.attempts} />
        <StatCard icon={BarChart3} label="Average score" value={`${stats.average}%`} accent="text-accent-teal" />
        <StatCard icon={Trophy} label="Top score" value={`${stats.best}%`} accent="text-secondary-300" />
        <StatCard icon={Target} label="Questions" value={quiz.question_count ?? quiz.questions?.length ?? 0} />
      </section>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Users}
            title="No attempts yet"
            description={`Share code ${quiz.code} so people can play. Results show up here the moment someone submits.`}
            action={
              <button type="button" onClick={() => copy(quiz.code, 'Quiz code copied.')} className="btn-primary">
                <ClipboardCopy size={18} aria-hidden="true" /> Copy the code
              </button>
            }
          />
        </div>
      ) : (
        <>
          {sortBy === 'score' && sorted.length >= 3 && (
            <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Top three players">
              {sorted.slice(0, 3).map((result, index) => {
                const tones = ['text-secondary-300', 'text-slate-200', 'text-amber-500']
                return (
                  <div
                    key={result.id}
                    className={`surface p-5 ${
                      index === 0 ? 'border-secondary-400/30 bg-secondary-400/[0.06]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${tones[index]}`}>
                        <Medal size={17} aria-hidden="true" /> #{index + 1}
                      </span>
                      <span className="text-xs text-slate-500">
                        {Math.round(Number(result.percentage || 0))}%
                      </span>
                    </div>
                    <p className="mt-3 truncate text-lg font-bold text-white">
                      {result.user?.username || 'Player'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {result.score}/{result.max_score} points · {formatDuration(result.time_taken)}
                    </p>
                  </div>
                )
              })}
            </section>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold">All attempts</h2>
            <label className="inline-flex items-center gap-2 text-sm text-slate-400">
              <span>Sort</span>
              <select
                className="input-field min-h-[44px] w-auto py-2"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="surface mt-4 overflow-hidden">
            <table className="hidden w-full text-left text-sm sm:table">
              <caption className="sr-only">Attempts for {quiz.title}</caption>
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Player
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Score
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Correct
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((result) => (
                  <tr key={result.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-semibold text-white">{result.user?.username || 'Player'}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-secondary-200">{Math.round(Number(result.percentage || 0))}%</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {result.score}/{result.max_score}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {result.correct_answers}/{result.total_questions}
                    </td>
                    <td className="px-5 py-3 text-slate-300">{formatDuration(result.time_taken)}</td>
                    <td className="px-5 py-3 text-slate-400">{formatDate(result.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-white/5 sm:hidden">
              {sorted.map((result) => (
                <li key={result.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-white">{result.user?.username || 'Player'}</p>
                    <p className="font-bold text-secondary-200">{Math.round(Number(result.percentage || 0))}%</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Target size={12} aria-hidden="true" /> {result.correct_answers}/{result.total_questions}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} aria-hidden="true" /> {formatDuration(result.time_taken)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} aria-hidden="true" /> {formatDate(result.completed_at)}
                    </span>
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

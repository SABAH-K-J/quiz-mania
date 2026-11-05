import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Calendar, Clock3, Filter, ListChecks, Target, Trophy, TrendingUp } from 'lucide-react'
import { getErrorMessage, resultAPI } from '../services/api'
import useSEO from '../hooks/useSEO'
import { Alert, EmptyState, PageHeader, Spinner, StatCard } from '../components/ui'

function asList(data) {
  if (Array.isArray(data)) return data
  return data?.results || []
}

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

function scoreTone(percentage) {
  if (percentage >= 80) return 'bg-emerald-400'
  if (percentage >= 60) return 'bg-primary-400'
  if (percentage >= 40) return 'bg-secondary-400'
  return 'bg-rose-400'
}

export default function MyResults() {
  useSEO('/my-results')

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await resultAPI.list()
        if (active) setResults(asList(response.data))
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError, 'We could not load your results.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(results.map((result) => result.quiz?.category).filter(Boolean))],
    [results],
  )

  const filtered = useMemo(
    () => (category === 'all' ? results : results.filter((result) => result.quiz?.category === category)),
    [results, category],
  )

  const stats = useMemo(() => {
    if (results.length === 0) return { attempts: 0, average: 0, best: 0, quizzes: 0 }
    const average = Math.round(results.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / results.length)
    return {
      attempts: results.length,
      average,
      best: Math.max(...results.map((result) => Number(result.percentage || 0))),
      quizzes: new Set(results.map((result) => result.quiz?.id)).size,
    }
  }, [results])

  if (loading) return <Spinner fullPage label="Loading your results…" />

  return (
    <main className="container-page animate-fade-in py-10 sm:py-14">
      <PageHeader
        eyebrow="Your history"
        title="My results"
        description="Every quiz you have played, with scores, accuracy and time."
        actions={
          <Link to="/quiz/join" className="btn-primary">
            <Trophy size={18} aria-hidden="true" /> Play another quiz
          </Link>
        }
      />

      {error && (
        <Alert className="mb-6" tone="error">
          {error}
        </Alert>
      )}

      <section aria-label="Result stats" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Attempts" value={stats.attempts} />
        <StatCard icon={TrendingUp} label="Average score" value={`${stats.average}%`} accent="text-accent-teal" />
        <StatCard icon={Trophy} label="Best score" value={`${stats.best}%`} accent="text-secondary-300" />
        <StatCard icon={BarChart3} label="Unique quizzes" value={stats.quizzes} accent="text-primary-300" />
      </section>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Target}
            title="No results yet"
            description="Once you play a quiz, your score and answer breakdown will appear here."
            action={
              <Link to="/quiz/join" className="btn-primary">
                <Trophy size={18} aria-hidden="true" /> Join your first quiz
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing {filtered.length} of {results.length} attempts
            </p>

            <label className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Filter size={16} aria-hidden="true" />
              <span className="sr-only">Filter by category</span>
              <select
                className="input-field min-h-[44px] w-auto py-2"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All categories' : item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="mt-4 grid gap-3">
            {filtered.map((result) => {
              const percentage = Number(result.percentage || 0)
              return (
                <li key={result.id} className="surface p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-bold text-white">{result.quiz?.title || 'Quiz'}</h2>
                        <span className="badge border border-white/10 bg-white/5 text-slate-300">
                          {result.quiz?.category || 'general'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} aria-hidden="true" /> {formatDate(result.completed_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Target size={13} aria-hidden="true" /> {result.correct_answers}/{result.total_questions} correct
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} aria-hidden="true" /> {formatDuration(result.time_taken)}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">CODE {result.quiz?.code}</span>
                      </div>

                      <div className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${scoreTone(percentage)}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-2xl font-extrabold text-white">{percentage}%</p>
                        <p className="text-xs text-slate-500">
                          {result.score}/{result.max_score} points
                        </p>
                      </div>
                      <Link
                        to={`/quiz/play/${result.quiz?.code}`}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Play again
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {filtered.length === 0 && (
            <p className="mt-6 text-center text-sm text-slate-400">No attempts in this category yet.</p>
          )}
        </>
      )}
    </main>
  )
}

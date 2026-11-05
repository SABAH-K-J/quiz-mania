import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Filter, Target, Trophy } from 'lucide-react'
import { getErrorMessage, resultAPI } from '../services/api'
import useSEO from '../hooks/useSEO'
import { Alert, EmptyState, Meter, PageHeader, Spinner, StatStrip } from '../components/ui'

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
  if (percentage >= 80) return { meter: 'green', text: 'text-signal-green' }
  if (percentage >= 60) return { meter: 'blue', text: 'text-signal-blue' }
  if (percentage >= 40) return { meter: 'yellow', text: 'text-signal-yellow-dark' }
  return { meter: 'red', text: 'text-signal-red-dark' }
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
    <main className="container-page py-8 sm:py-12">
      <PageHeader
        meta={<span className="badge status-quiet">Your history</span>}
        title="Result history"
        description="Every quiz you have played, with scores, accuracy and time."
        actions={
          <Link to="/quiz/join" className="btn btn-primary">
            <Trophy size={17} aria-hidden="true" /> Play another quiz
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <StatStrip
        items={[
          { label: 'Attempts', value: stats.attempts, note: 'Every submitted play' },
          { label: 'Average score', value: `${stats.average}%`, tone: 'text-signal-blue' },
          { label: 'Best score', value: `${stats.best}%`, tone: 'text-signal-green' },
          { label: 'Unique quizzes', value: stats.quizzes, note: 'Different boards played' },
        ]}
      />

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Target}
            title="No results yet"
            description="Once you play a quiz, your score and answer breakdown will appear here."
            action={
              <Link to="/quiz/join" className="btn btn-primary">
                <Trophy size={18} aria-hidden="true" /> Join your first quiz
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 border-2 border-ink bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-ink-600">
              Showing <span className="text-ink">{filtered.length}</span> of {results.length} attempts
            </p>

            <label className="flex items-center gap-2">
              <Filter size={16} className="text-ink-600" aria-hidden="true" />
              <span className="font-display text-[12px] font-bold uppercase tracking-[0.12em]">Category</span>
              <select
                className="input-field min-h-[44px] w-auto py-1.5"
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
            {filtered.map((result, index) => {
              const percentage = Number(result.percentage || 0)
              const tone = scoreTone(percentage)
              return (
                <li key={result.id} className="border-2 border-ink bg-white">
                  <div className="grid sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[11px] font-bold tabular-nums text-ink-400" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="badge status-quiet">{result.quiz?.category || 'general'}</span>
                        <span className="text-xs text-ink-600">{formatDate(result.completed_at)}</span>
                      </div>

                      <h2 className="mt-2 font-display text-xl font-bold uppercase leading-tight tracking-tight">
                        {result.quiz?.title || 'Quiz'}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-600">
                        <span>
                          <span className="font-display font-bold tabular-nums text-ink">
                            {result.correct_answers}/{result.total_questions}
                          </span>{' '}
                          correct
                        </span>
                        <span>{formatDuration(result.time_taken)}</span>
                        <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em]">
                          Code {result.quiz?.code}
                        </span>
                      </div>

                      <div className="mt-3 max-w-md">
                        <Meter value={percentage} tone={tone.meter} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t-2 border-ink p-4 sm:min-w-[15rem] sm:flex-col sm:items-stretch sm:justify-center sm:border-l-2 sm:border-t-0 sm:p-5">
                      <div className="text-right sm:text-left">
                        <p className={`num text-4xl ${tone.text}`}>{percentage}%</p>
                        <p className="mt-1 text-xs text-ink-600">
                          {result.score}/{result.max_score} points
                        </p>
                      </div>
                      <Link
                        to={`/quiz/play/${result.quiz?.code}`}
                        className="btn btn-secondary btn-sm whitespace-nowrap"
                      >
                        Play again <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {filtered.length === 0 && (
            <p className="mt-6 border-2 border-ink bg-white px-4 py-6 text-center text-sm text-ink-600">
              No attempts in this category yet.
            </p>
          )}
        </>
      )}
    </main>
  )
}

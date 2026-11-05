import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Eye, Pencil, PlusCircle, Rocket, Trash2, Trophy } from 'lucide-react'
import { getErrorMessage, quizAPI, resultAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert, CopyCode, EmptyState, PageHeader, Spinner, StatStrip, StatusBadge } from '../components/ui'

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
  if (percentage >= 80) return 'text-signal-green'
  if (percentage >= 60) return 'text-signal-blue'
  if (percentage >= 40) return 'text-signal-yellow-dark'
  return 'text-signal-red-dark'
}

export default function Dashboard() {
  useSEO('/dashboard')

  const { user } = useAuthStore()
  const location = useLocation()
  const [quizzes, setQuizzes] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [busyId, setBusyId] = useState(null)
  const [tab, setTab] = useState('created')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [quizzesResponse, resultsResponse] = await Promise.all([quizAPI.myQuizzes(), resultAPI.list()])
        if (!active) return
        setQuizzes(asList(quizzesResponse.data))
        setResults(asList(resultsResponse.data))
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError, 'We could not load your dashboard. Please refresh.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const published = quizzes.filter((quiz) => quiz.status === 'published').length
    const attempts = results.length
    const average =
      attempts === 0 ? 0 : Math.round(results.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / attempts)
    const best = attempts === 0 ? 0 : Math.max(...results.map((result) => Number(result.percentage || 0)))
    return { published, attempts, average, best }
  }, [quizzes, results])

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setNotice(`Copied code ${code}. Share it with your players.`)
      window.setTimeout(() => setNotice(''), 3500)
    } catch {
      setNotice(`Quiz code: ${code}`)
    }
  }

  const handlePublish = async (quiz) => {
    setBusyId(quiz.id)
    setError('')
    setNotice('')
    try {
      await quizAPI.publish(quiz.id)
      setQuizzes((current) =>
        current.map((item) => (item.id === quiz.id ? { ...item, status: 'published' } : item)),
      )
      setNotice(`“${quiz.title}” is live. Share code ${quiz.code}.`)
    } catch (publishError) {
      setError(getErrorMessage(publishError, 'This quiz could not be published yet.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (quiz) => {
    const confirmed = window.confirm(`Delete “${quiz.title}”? This also removes its questions and results.`)
    if (!confirmed) return

    setBusyId(quiz.id)
    setError('')
    try {
      await quizAPI.delete(quiz.id)
      setQuizzes((current) => current.filter((item) => item.id !== quiz.id))
      setNotice(`“${quiz.title}” was deleted.`)
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'That quiz could not be deleted.'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner fullPage label="Loading your dashboard…" />

  return (
    <main className="container-page py-8 sm:py-12">
      <PageHeader
        meta={
          <>
            <span className="badge status-quiet">Control room</span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
              Signed in as {user?.username || 'player'}
            </span>
          </>
        }
        title="Your board"
        description="Create, publish and review everything from one place."
        actions={
          <>
            <Link to="/quiz/join" className="btn btn-secondary">
              <Trophy size={17} aria-hidden="true" /> Play a quiz
            </Link>
            <Link to="/quiz/create" className="btn btn-primary">
              <PlusCircle size={17} aria-hidden="true" /> New quiz
            </Link>
          </>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      {notice && (
        <div className="mb-6">
          <Alert tone="success">{notice}</Alert>
        </div>
      )}

      <StatStrip
        items={[
          { label: 'Quizzes created', value: quizzes.length, note: 'Across every status' },
          { label: 'Published', value: stats.published, note: 'Open to players', tone: 'text-signal-green' },
          { label: 'Attempts received', value: stats.attempts, note: 'On your quizzes and plays' },
          { label: 'Your best score', value: `${stats.best}%`, note: 'Across played quizzes', tone: 'text-signal-blue' },
        ]}
      />

      <div
        className="mt-8 grid border-2 border-ink bg-white sm:grid-cols-2"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {[
          { id: 'created', label: 'My quizzes', count: quizzes.length },
          { id: 'taken', label: 'Played quizzes', count: results.length },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex min-h-[56px] items-center justify-between gap-3 px-4 font-display text-[15px] font-bold uppercase tracking-[0.1em] transition ${
              tab === id ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-arena-100'
            } ${id === 'created' ? 'border-b-2 border-ink sm:border-b-0 sm:border-r-2' : ''}`}
          >
            <span>{label}</span>
            <span
              className={`min-w-9 border-2 px-1.5 py-0.5 text-center text-xs tabular-nums ${
                tab === id ? 'border-white/40 text-signal-yellow' : 'border-ink text-ink'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      <section className="mt-6" role="tabpanel" aria-label={tab === 'created' ? 'My quizzes' : 'Played quizzes'}>
        {tab === 'created' &&
          (quizzes.length === 0 ? (
            <EmptyState
              icon={PlusCircle}
              title="No quizzes yet"
              description="Your first quiz is a few minutes away. Give it a title, add a few questions and publish."
              action={
                <Link to="/quiz/create" className="btn btn-primary">
                  <PlusCircle size={18} aria-hidden="true" /> Create your first quiz
                </Link>
              }
            />
          ) : (
            <div className="border-2 border-ink bg-white">
              <div className="hidden grid-cols-[3.5rem_1fr_12rem] border-b-2 border-ink bg-ink text-white lg:grid">
                <span className="border-r-2 border-white/25 px-3 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.16em]">
                  No.
                </span>
                <span className="px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.16em]">Quiz</span>
                <span className="border-l-2 border-white/25 px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.16em]">
                  Actions
                </span>
              </div>

              <ul>
                {quizzes.map((quiz, index) => (
                  <li
                    key={quiz.id}
                    className="grid border-b-2 border-ink last:border-b-0 lg:grid-cols-[3.5rem_1fr_12rem]"
                  >
                    <div className="hidden place-items-start justify-center border-r-2 border-ink bg-arena-50 p-3 pt-5 lg:grid">
                      <span className="num text-2xl text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="min-w-0 border-b-2 border-ink p-4 sm:p-5 lg:border-b-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={quiz.status} />
                        <span className="badge status-quiet">{quiz.category}</span>
                        <span className="text-xs text-ink-600">{formatDate(quiz.created_at)}</span>
                      </div>

                      <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-tight">
                        {quiz.title}
                      </h2>
                      {quiz.description && (
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-ink-600">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-ink-600">
                        <span>
                          <span className="font-display font-bold tabular-nums text-ink">
                            {quiz.question_count ?? 0}
                          </span>{' '}
                          questions
                        </span>
                        <span>{quiz.time_limit ? `${Math.round(quiz.time_limit / 60)} min limit` : 'No time limit'}</span>
                        <span className="inline-flex items-center gap-2">
                          <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em]">Code</span>
                          <CopyCode code={quiz.code} onCopy={() => copyCode(quiz.code)} />
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap content-start gap-2 p-4 lg:flex-col lg:border-l-2 lg:border-ink/20">
                      {quiz.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(quiz)}
                          disabled={busyId === quiz.id}
                          className="btn btn-primary btn-sm w-full"
                        >
                          <Rocket size={15} aria-hidden="true" /> {busyId === quiz.id ? 'Publishing…' : 'Publish'}
                        </button>
                      )}
                      <Link to={`/quiz/edit/${quiz.id}`} className="btn btn-secondary btn-sm w-full">
                        <Pencil size={15} aria-hidden="true" /> Edit
                      </Link>
                      <Link to={`/quiz/results/${quiz.id}`} className="btn btn-secondary btn-sm w-full">
                        Results
                      </Link>
                      {quiz.status === 'published' && (
                        <Link to={`/quiz/play/${quiz.code}`} className="btn btn-secondary btn-sm w-full">
                          <Eye size={15} aria-hidden="true" /> Preview
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(quiz)}
                        disabled={busyId === quiz.id}
                        className="btn btn-danger btn-sm w-full"
                        aria-label={`Delete ${quiz.title}`}
                      >
                        <Trash2 size={15} aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {tab === 'taken' &&
          (results.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No played quizzes yet"
              description="Join a quiz with a code and your scores will appear here automatically."
              action={
                <Link to="/quiz/join" className="btn btn-primary">
                  <Trophy size={18} aria-hidden="true" /> Join a quiz
                </Link>
              }
            />
          ) : (
            <div className="border-2 border-ink bg-white">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">Played quizzes</span>
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
                  {stats.attempts} attempts / {stats.average}% average
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table min-w-[640px]">
                  <caption className="sr-only">Quizzes you have played, newest first</caption>
                  <thead>
                    <tr>
                      <th scope="col">Quiz</th>
                      <th scope="col">Completed</th>
                      <th scope="col">Correct</th>
                      <th scope="col">Time</th>
                      <th scope="col">Score</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td>
                          <span className="block font-semibold text-ink">{result.quiz?.title || 'Quiz'}</span>
                          <span className="text-xs text-ink-600">{result.quiz?.category}</span>
                        </td>
                        <td className="whitespace-nowrap text-ink-600">{formatDate(result.completed_at)}</td>
                        <td className="tabular-nums">
                          {result.correct_answers}/{result.total_questions}
                        </td>
                        <td className="whitespace-nowrap tabular-nums">{formatDuration(result.time_taken)}</td>
                        <td>
                          <span className={`num text-2xl ${scoreTone(result.percentage)}`}>{result.percentage}%</span>
                          <span className="block text-xs text-ink-600">
                            {result.score}/{result.max_score} pts
                          </span>
                        </td>
                        <td className="text-right">
                          <Link to={`/quiz/play/${result.quiz?.code}`} className="btn btn-secondary btn-sm">
                            Play again
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-ink px-4 py-3">
                <Link to="/my-results" className="link text-sm">
                  See full result history
                </Link>
              </div>
            </div>
          ))}
      </section>
    </main>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Eye,
  ListChecks,
  Pencil,
  PlusCircle,
  Rocket,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'
import { getErrorMessage, quizAPI, resultAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useSEO from '../hooks/useSEO'
import { Alert, EmptyState, PageHeader, Spinner, StatCard, StatusBadge } from '../components/ui'

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
    <main className="container-page animate-fade-in py-10 sm:py-14">
      <PageHeader
        eyebrow={`Hey, ${user?.username || 'player'}`}
        title="Your quiz control room"
        description="Create, publish and review everything from one place."
        actions={
          <>
            <Link to="/quiz/join" className="btn-secondary">
              <Trophy size={18} aria-hidden="true" /> Play a quiz
            </Link>
            <Link to="/quiz/create" className="btn-primary">
              <PlusCircle size={18} aria-hidden="true" /> New quiz
            </Link>
          </>
        }
      />

      {error && (
        <Alert className="mb-6" tone="error">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert className="mb-6" tone="success">
          {notice}
        </Alert>
      )}

      <section aria-label="Your stats" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Quizzes created" value={quizzes.length} />
        <StatCard icon={Rocket} label="Published" value={stats.published} accent="text-emerald-300" />
        <StatCard icon={Users} label="Attempts on your quizzes" value={stats.attempts} accent="text-accent-teal" />
        <StatCard icon={Trophy} label="Your best score" value={`${stats.best}%`} accent="text-secondary-300" />
      </section>

      <div className="mt-9 flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1" role="tablist" aria-label="Dashboard sections">
        {[
          { id: 'created', label: 'My quizzes', icon: ListChecks },
          { id: 'taken', label: 'Played quizzes', icon: Trophy },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              tab === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={17} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <section className="mt-6" role="tabpanel" aria-label={tab === 'created' ? 'My quizzes' : 'Played quizzes'}>
        {tab === 'created' &&
          (quizzes.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No quizzes yet"
              description="Your first quiz is a few minutes away. Give it a title, add a few questions and publish."
              action={
                <Link to="/quiz/create" className="btn-primary">
                  <PlusCircle size={18} aria-hidden="true" /> Create your first quiz
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-4">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="surface p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={quiz.status} />
                        <span className="badge border border-white/10 bg-white/5 text-slate-300">{quiz.category}</span>
                        <span className="text-xs text-slate-500">{formatDate(quiz.created_at)}</span>
                      </div>
                      <h2 className="mt-3 truncate text-xl font-bold text-white">{quiz.title}</h2>
                      {quiz.description && (
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-slate-400">{quiz.description}</p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <ListChecks size={15} aria-hidden="true" /> {quiz.question_count ?? 0} questions
                        </span>
                        {quiz.time_limit ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} aria-hidden="true" /> {Math.round(quiz.time_limit / 60)} min limit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} aria-hidden="true" /> No time limit
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
                          CODE
                          <button
                            type="button"
                            onClick={() => copyCode(quiz.code)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 font-semibold tracking-widest text-secondary-200 transition hover:bg-white/10"
                            aria-label={`Copy quiz code ${quiz.code}`}
                          >
                            {quiz.code}
                            <ClipboardCopy size={13} aria-hidden="true" />
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {quiz.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(quiz)}
                          disabled={busyId === quiz.id}
                          className="btn-primary"
                        >
                          <Rocket size={16} aria-hidden="true" /> {busyId === quiz.id ? 'Publishing…' : 'Publish'}
                        </button>
                      )}
                      <Link to={`/quiz/edit/${quiz.id}`} className="btn-secondary">
                        <Pencil size={16} aria-hidden="true" /> Edit
                      </Link>
                      <Link to={`/quiz/results/${quiz.id}`} className="btn-secondary">
                        <BarChart3 size={16} aria-hidden="true" /> Results
                      </Link>
                      {quiz.status === 'published' && (
                        <Link to={`/quiz/play/${quiz.code}`} className="btn-secondary">
                          <Eye size={16} aria-hidden="true" /> Preview
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(quiz)}
                        disabled={busyId === quiz.id}
                        className="btn-danger"
                        aria-label={`Delete ${quiz.title}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'taken' &&
          (results.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No played quizzes yet"
              description="Join a quiz with a code and your scores will appear here automatically."
              action={
                <Link to="/quiz/join" className="btn-primary">
                  <Trophy size={18} aria-hidden="true" /> Join a quiz
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4">
              <div className="surface-soft grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Attempts</p>
                  <p className="text-xl font-bold text-white">{stats.attempts}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Average score</p>
                  <p className="text-xl font-bold text-white">{stats.average}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Best score</p>
                  <p className="text-xl font-bold text-white">{stats.best}%</p>
                </div>
              </div>

              <ul className="grid gap-3">
                {results.map((result) => (
                  <li key={result.id} className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2
                          size={16}
                          className={result.percentage >= 60 ? 'text-emerald-300' : 'text-secondary-300'}
                          aria-hidden="true"
                        />
                        <h2 className="truncate font-semibold text-white">{result.quiz?.title || 'Quiz'}</h2>
                        <span className="badge border border-white/10 bg-white/5 text-slate-300">
                          {result.quiz?.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(result.completed_at)} · {result.correct_answers}/{result.total_questions} correct ·{' '}
                        {formatDuration(result.time_taken)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-white">{result.percentage}%</p>
                        <p className="text-xs text-slate-500">
                          {result.score}/{result.max_score} points
                        </p>
                      </div>
                      <Link to={`/quiz/play/${result.quiz?.code}`} className="btn-secondary">
                        Play again
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/my-results" className="link justify-self-start text-sm">
                See full result history →
              </Link>
            </div>
          ))}
      </section>
    </main>
  )
}

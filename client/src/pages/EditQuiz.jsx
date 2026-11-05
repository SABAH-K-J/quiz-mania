import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import QuizBuilder from '../components/QuizBuilder'
import { Alert, Spinner } from '../components/ui'
import { getErrorMessage, quizAPI } from '../services/api'
import useSEO from '../hooks/useSEO'

export default function EditQuiz() {
  useSEO('/quiz/create')

  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await quizAPI.get(id)
        const data = response.data

        // Owner payloads include a nested host object; public payloads use host_username.
        if (!data?.host) {
          setError('This quiz is not yours to edit, or it no longer exists.')
          return
        }
        if (!active) return

        setQuiz(data)
        setQuestions(data.questions || [])
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, 'We could not load this quiz.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Spinner fullPage label="Opening your quiz…" />

  if (error) {
    return (
      <main className="container-page py-16">
        <div className="mx-auto max-w-lg">
          <Alert tone="error">{error}</Alert>
          <div className="mt-5 flex gap-3">
            <Link to="/dashboard" className="btn-secondary">
              <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
            </Link>
            <button type="button" onClick={() => navigate(0)} className="btn-primary">
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container-page animate-fade-in py-10 sm:py-14">
      <div className="mb-8">
        <Link to="/dashboard" className="link inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft size={15} aria-hidden="true" /> Dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary-500/15 text-secondary-300">
              <Pencil size={22} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">Edit quiz</h1>
              <p className="mt-1 text-sm text-slate-400">
                Changes are saved to your quiz immediately. Players keep the same code.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
            <span className="text-slate-400">Code </span>
            <span className="font-mono font-bold tracking-widest text-secondary-200">{quiz.code}</span>
          </div>
        </div>
      </div>

      <QuizBuilder
        mode="edit"
        quizId={quiz.id}
        initialQuiz={quiz}
        initialQuestions={questions}
      />
    </main>
  )
}

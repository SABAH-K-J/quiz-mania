import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import QuizBuilder from '../components/QuizBuilder'
import { Alert, PageHeader, Spinner, StatusBadge } from '../components/ui'
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
      <main className="container-page py-12">
        <div className="mx-auto max-w-lg border-2 border-ink bg-white p-6">
          <Alert tone="error">{error}</Alert>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn btn-secondary">
              <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
            </Link>
            <button type="button" onClick={() => navigate(0)} className="btn btn-primary">
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <PageHeader
        meta={
          <>
            <StatusBadge status={quiz.status} />
            <span className="badge status-quiet">{quiz.category}</span>
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
              Code <span className="tabular-nums text-ink">{quiz.code}</span>
            </span>
          </>
        }
        title="Edit quiz"
        description="Changes are saved to your quiz. Players keep the same code."
        actions={
          <Link to="/dashboard" className="btn btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" /> Dashboard
          </Link>
        }
      />

      <QuizBuilder
        mode="edit"
        quizId={quiz.id}
        initialQuiz={quiz}
        initialQuestions={questions}
      />
    </main>
  )
}

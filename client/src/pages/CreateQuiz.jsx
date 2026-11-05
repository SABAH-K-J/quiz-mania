import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import QuizBuilder from '../components/QuizBuilder'
import useSEO from '../hooks/useSEO'
import { PageHeader } from '../components/ui'

const CATEGORY_VALUES = new Set([
  'general',
  'science',
  'math',
  'history',
  'geography',
  'technology',
  'sports',
  'entertainment',
  'other',
])

export default function CreateQuiz() {
  useSEO('/quiz/create')

  const [searchParams] = useSearchParams()
  const requested = searchParams.get('category')
  const initialCategory = requested && CATEGORY_VALUES.has(requested) ? requested : undefined

  return (
    <main className="container-page py-8 sm:py-12">
      <PageHeader
        meta={<span className="badge status-quiet">New board</span>}
        title="Create a quiz"
        description="Add your questions, save a draft, and publish when it feels right."
        actions={
          <Link to="/dashboard" className="btn btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" /> Dashboard
          </Link>
        }
      />

      <QuizBuilder mode="create" initialCategory={initialCategory} />
    </main>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import QuizBuilder from '../components/QuizBuilder'
import useSEO from '../hooks/useSEO'

export default function CreateQuiz() {
  useSEO('/quiz/create')

  return (
    <main className="container-page animate-fade-in py-10 sm:py-14">
      <div className="mb-8">
        <Link to="/dashboard" className="link inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft size={15} aria-hidden="true" /> Dashboard
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-500/15 text-primary-300">
            <PlusCircle size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Create a quiz</h1>
            <p className="mt-1 text-sm text-slate-400">
              Add your questions, save a draft, and publish when it feels right.
            </p>
          </div>
        </div>
      </div>

      <QuizBuilder mode="create" />
    </main>
  )
}

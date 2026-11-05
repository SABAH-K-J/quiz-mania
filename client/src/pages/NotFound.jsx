import { Link } from 'react-router-dom'
import { Gamepad2, Home, PlusCircle, SearchX } from 'lucide-react'
import useSEO from '../hooks/useSEO'

export default function NotFound() {
  useSEO({
    path: '/404',
    title: 'Page not found — Quiz Mania',
    description: 'That page does not exist. Head home or join a quiz with your code.',
  })

  return (
    <main className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="surface max-w-lg p-8 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary-500/15 text-secondary-300">
          <SearchX size={30} aria-hidden="true" />
        </span>
        <p className="mt-5 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Error 404</p>
        <h1 className="mt-2 text-4xl font-black">This one got away</h1>
        <p className="mt-3 text-slate-400">
          The page you are looking for does not exist, or it moved. The quiz game is still on.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className="btn-primary">
            <Home size={18} aria-hidden="true" /> Go home
          </Link>
          <Link to="/quiz/join" className="btn-secondary">
            <Gamepad2 size={18} aria-hidden="true" /> Join a quiz
          </Link>
        </div>
        <Link to="/quiz/create" className="link mt-5 inline-flex items-center gap-1.5 text-sm">
          <PlusCircle size={15} aria-hidden="true" /> Or create your own quiz
        </Link>
      </div>
    </main>
  )
}

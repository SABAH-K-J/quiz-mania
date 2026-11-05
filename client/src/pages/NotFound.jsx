import { Link } from 'react-router-dom'
import { ArrowRight, Home, PlusCircle } from 'lucide-react'
import useSEO from '../hooks/useSEO'
import { ScoreDigits } from '../components/ui'

export default function NotFound() {
  useSEO({
    path: '/404',
    title: 'Page not found — Quiz Mania',
    description: 'That page does not exist. Head home or join a quiz with your code.',
  })

  return (
    <main className="container-page py-8 sm:py-14">
      <div className="mx-auto max-w-3xl border-2 border-ink bg-white">
        <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
            <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
            Dead ball
          </span>
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow">
            Error 404
          </span>
        </div>

        <div className="p-6 text-center sm:p-10">
          <div className="flex justify-center">
            <ScoreDigits value="404" size="lg" label="Error 404" />
          </div>
          <h1 className="display-lg mt-6">This one got away.</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
            The page you are looking for does not exist, or it moved. The quiz game is still on.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link to="/" className="btn btn-primary">
              <Home size={17} aria-hidden="true" /> Go home
            </Link>
            <Link to="/quiz/join" className="btn btn-secondary">
              Join a quiz <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 border-t-2 border-ink pt-5">
            <Link to="/quiz/create" className="link inline-flex items-center gap-1.5 text-sm">
              <PlusCircle size={15} aria-hidden="true" /> Or create your own quiz
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

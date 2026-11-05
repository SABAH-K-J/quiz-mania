import { Link } from 'react-router-dom'
import { Github, Sparkles, Zap } from 'lucide-react'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/SABAH-K-J/quiz-mania'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-ink-950/60">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5" aria-label="Quiz Mania home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-secondary-400 to-accent-pink text-ink-950">
                <Zap size={20} strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                Quiz<span className="text-secondary-300">Mania</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              A free public quiz platform. Build a quiz, share an 8-character code, and let anyone play and get
              scored instantly.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} aria-hidden="true" /> No downloads. No fees. Just quizzes.
            </p>
          </div>

          <nav aria-label="Product links">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Product</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link className="hover:text-white" to="/quiz/join">
                  Join a quiz
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/quiz/create">
                  Create a quiz
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/my-results">
                  My results
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Account links">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Account</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link className="hover:text-white" to="/login">
                  Log in
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/register">
                  Create free account
                </Link>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href={GITHUB_URL} rel="noreferrer">
                  <Github size={15} aria-hidden="true" /> Source
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Quiz Mania. Free to use.</p>
          <p>Built for curious people, classrooms and friends.</p>
        </div>
      </div>
    </footer>
  )
}

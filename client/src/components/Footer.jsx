import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/SABAH-K-J/quiz-mania'

export default function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-ink text-white">
      <div className="h-2 bg-signal-red" aria-hidden="true" />
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-baseline gap-2.5" aria-label="Quiz Mania home">
              <span className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.02em] text-white sm:text-5xl">
                Quiz Mania
              </span>
              <span className="h-2.5 w-2.5 bg-signal-yellow" aria-hidden="true" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-200">
              A free public quiz platform. Build a quiz, share an eight-character code, and let anyone play and
              get scored instantly.
            </p>

            <div className="mt-6 inline-flex flex-col border-2 border-white/30 px-4 py-3">
              <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
                Board open
              </span>
              <span className="mt-1 text-xs text-ink-300">No downloads. No fees. No audience required.</span>
            </div>
          </div>

          <nav aria-label="Product links">
            <h2 className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-signal-yellow">Product</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-200">
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/quiz/join">
                  Play with a code
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/quiz/create">
                  Create a quiz
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/my-results">
                  My results
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Account links">
            <h2 className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-signal-yellow">Account</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-200">
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/login">
                  Log in
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4" to="/register">
                  Create a free account
                </Link>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 transition hover:text-white hover:underline hover:decoration-2 hover:underline-offset-4"
                  href={GITHUB_URL}
                  rel="noreferrer"
                >
                  <Github size={15} aria-hidden="true" /> Source
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t-2 border-white/20 pt-5 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Quiz Mania. Free to use.</p>
          <p>Built for classrooms, group chats and quiz nights.</p>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { ScoreDigits } from './ui'

export default function AuthLayout({ title, intro, points = [], code = '00', children, asideTitle }) {
  return (
    <main className="container-page py-8 sm:py-12">
      <div className="border-2 border-ink bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em]">
            <span className="h-2 w-2 animate-lamp bg-signal-red" aria-hidden="true" />
            Account desk
          </span>
          <Link
            to="/quiz/join"
            className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-yellow underline decoration-2 underline-offset-4 hover:text-white"
          >
            Just here to play? Enter a code
          </Link>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden flex-col justify-between border-ink bg-ink p-8 text-white lg:flex lg:border-r-2 lg:p-10">
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-signal-yellow">
                {asideTitle}
              </p>
              <p className="mt-6 num text-[5.5rem] leading-none text-white">{code}</p>
              <ul className="mt-8 border-t-2 border-white/25">
                {points.map((point, index) => (
                  <li key={point} className="flex items-start gap-3 border-b-2 border-white/25 py-3.5">
                    <span className="font-display text-[11px] font-bold tabular-nums leading-5 text-signal-yellow">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-200">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex items-end justify-between gap-4 border-t-2 border-white/25 pt-5">
              <span className="font-display text-[11px] font-bold uppercase leading-tight tracking-[0.16em] text-ink-300">
                Free to use
                <br />
                No card required
              </span>
              <ScoreDigits value="00" size="sm" tone="dark" label="Zero" />
            </div>
          </aside>

          <section className="p-6 sm:p-9 lg:p-10" aria-labelledby="auth-heading">
            <h1 id="auth-heading" className="display-md">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-600">{intro}</p>
            {children}
          </section>
        </div>
      </div>
    </main>
  )
}
